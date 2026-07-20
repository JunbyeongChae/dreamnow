import { useBreakpoint } from "../../hooks/useBreakpoint";

const ADDRESS = "서울특별시 종로구 배익로 12길 34";
const PHONE = "02-1234-5678";
const COPYRIGHT = "© 1976 배익거리(配益居里). All rights reserved.";

function Footer() {
  const breakpoint = useBreakpoint();

  if (breakpoint === "mobile") {
    return (
      <footer className="bg-primary px-4 py-6 text-[11px] leading-[1.7] text-white">
        <p>
          {ADDRESS}
          <br />
          {COPYRIGHT}
        </p>
      </footer>
    );
  }

  return (
    <footer className="bg-primary px-8 py-6 text-xs text-white">
      <p>
        {ADDRESS} · {PHONE} · {COPYRIGHT}
      </p>
    </footer>
  );
}

export default Footer;
