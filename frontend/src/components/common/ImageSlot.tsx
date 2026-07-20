import { useState } from "react";

import { API_BASE_URL } from "../../api/client";
import Skeleton from "./Skeleton";

interface ImageSlotProps {
  src?: string | null;
  alt: string;
  className?: string;
}

function resolveImageUrl(src: string): string {
  return src.startsWith("/static/") ? `${API_BASE_URL}${src}` : src;
}

function ImageSlot({ src, alt, className = "" }: ImageSlotProps) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return <div className={`bg-border-warm ${className}`} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        src={resolveImageUrl(src)}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

export default ImageSlot;
