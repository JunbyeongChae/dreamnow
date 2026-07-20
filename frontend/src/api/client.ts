import { useAuthStore } from "../store/authStore";

export const API_BASE_URL = "http://localhost:8000";

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string };
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const body = (await response.json()) as ApiSuccessResponse<T> | ApiErrorResponse;

  if (!body.success) {
    throw new ApiError(body.error.code, body.error.message);
  }

  return body.data;
}
