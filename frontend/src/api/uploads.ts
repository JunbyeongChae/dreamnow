import { apiRequest } from "./client";

export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<{ imageUrl: string }>("/api/uploads", {
    method: "POST",
    body: formData,
  });
}
