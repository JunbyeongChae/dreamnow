import type { AuthUser } from "../store/authStore";
import { apiRequest } from "./client";

interface SignupResponse {
  id: number;
  username: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export function signup(username: string, password: string) {
  return apiRequest<SignupResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
