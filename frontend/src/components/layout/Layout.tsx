import { Outlet, useLocation } from "react-router-dom";

import Footer from "./Footer";
import Header from "./Header";

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default Layout;
