import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getBanners } from "../../api/banners";
import { API_BASE_URL } from "../../api/client";
import Skeleton from "../common/Skeleton";
import Button from "../common/Button";

const AUTOPLAY_INTERVAL_MS = 5000;

function resolveImageUrl(src: string): string {
  return src.startsWith("/") ? `${API_BASE_URL}${src}` : src;
}

function BannerSlider() {
  const { data: banners, isLoading, isError } = useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
  });

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = banners?.length ?? 0;

  useEffect(() => {
    if (paused || count <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % count);
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, count]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full md:h-[320px] lg:h-[360px]" />;
  }

  if (isError || count === 0) {
    return null;
  }

  const banner = banners![current];
  const goTo = (index: number) => setCurrent((index + count) % count);

  return (
    <div
      className="relative h-[300px] w-full overflow-hidden md:h-[320px] lg:h-[360px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <img
        src={resolveImageUrl(banner.imageUrl)}
        alt="배너 이미지"
        className="h-full w-full object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,15,8,.15) 45%, rgba(20,15,8,.7) 100%)",
        }}
      />
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(20,15,8,.7) 0%, rgba(20,15,8,.15) 55%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-8 md:justify-center md:px-12 md:pb-0">
        <span className="mb-2 text-xs font-bold text-accent-soft">BAEIKGEORI BAKERY &amp; CAFE</span>
        <h1 className="mb-4 max-w-md font-display text-[32px] leading-tight text-white md:text-[38px]">
          정성을 담은 빵과 커피,
          <br />
          배익거리
        </h1>
        <Link to="/support" className="hidden lg:block">
          <Button variant="inverse">공지사항 보기</Button>
        </Link>
      </div>

      {count > 1 && (
        <>
          <button
            aria-label="이전 배너"
            onClick={() => goTo(current - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1 text-primary"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            aria-label="다음 배너"
            onClick={() => goTo(current + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1 text-primary"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners!.map((b, index) => (
              <button
                key={b.id}
                aria-label={`${index + 1}번 배너로 이동`}
                onClick={() => goTo(index)}
                className={`h-2 w-2 rounded-full ${index === current ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default BannerSlider;
