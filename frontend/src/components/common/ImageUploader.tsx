import { useState } from "react";
import type { ChangeEvent } from "react";

import { uploadImage } from "../../api/uploads";
import { ApiError } from "../../api/client";
import ImageSlot from "./ImageSlot";
import Skeleton from "./Skeleton";

interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string) => void;
  label?: string;
}

function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const { imageUrl } = await uploadImage(file);
      onChange(imageUrl);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "업로드에 실패했습니다");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-bold text-primary">{label}</label>}
      {uploading ? (
        <Skeleton className="h-32 w-32" />
      ) : value ? (
        <ImageSlot src={value} alt={label ?? "업로드 이미지"} className="h-32 w-32" />
      ) : null}
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

export default ImageUploader;
