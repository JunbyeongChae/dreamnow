import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

export function useRequireAuth() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return function requireAuth(): boolean {
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  };
}
