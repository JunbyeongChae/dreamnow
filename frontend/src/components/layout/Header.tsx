import { useState } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useBreakpoint } from "../../hooks/useBreakpoint";
import { useAuthStore } from "../../store/authStore";
import Button from "../common/Button";

const NAV_ITEMS = [
  { to: "/about", label: "기업소개" },
  { to: "/menu", label: "메뉴소개" },
  { to: "/support", label: "고객센터" },
];

const HEIGHT_CLASS = { desktop: "h-[84px]", tablet: "h-[76px]", mobile: "h-16" };
const LOGO_HEIGHT_CLASS = { desktop: "h-12", tablet: "h-10", mobile: "h-8" };

function Header() {
  const breakpoint = useBreakpoint();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdminMode, logout, toggleAdminMode } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-bold ${isActive ? "text-accent" : "text-primary"}`;

  return (
    <header className="border-b border-border-neutral bg-white">
      <div className={`flex items-center justify-between px-4 md:px-8 ${HEIGHT_CLASS[breakpoint]}`}>
        <NavLink to="/">
          <img src="/img/BI.png" alt="배익거리" className={LOGO_HEIGHT_CLASS[breakpoint]} />
        </NavLink>

        {breakpoint !== "mobile" && (
          <nav className="flex gap-6">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        {breakpoint === "mobile" ? (
          <button onClick={() => setMobileOpen((open) => !open)} aria-label="메뉴 열기">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        ) : (
          !isAuthPage &&
          (user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-primary">{user.username}</span>
              <button onClick={logout} className="text-sm font-bold text-primary">
                로그아웃
              </button>
              {user.role === "admin" && (
                <button
                  onClick={toggleAdminMode}
                  aria-label="관리자 모드 토글"
                  aria-pressed={isAdminMode}
                >
                  <ShieldCheck size={20} className={isAdminMode ? "text-accent" : "text-primary"} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/login")}>
                로그인
              </Button>
              <Button variant="accent" onClick={() => navigate("/signup")}>
                회원가입
              </Button>
            </div>
          ))
        )}
      </div>

      {breakpoint === "mobile" && mobileOpen && (
        <nav className="flex flex-col border-t border-border-neutral">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-bold ${isActive ? "text-accent" : "text-primary"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header;
