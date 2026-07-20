import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { login } from "../api/auth";
import { ApiError } from "../api/client";
import { useAuthStore } from "../store/authStore";
import Button from "../components/common/Button";
import FormInput from "../components/common/FormInput";

function LoginPage() {
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(username, password),
    onSuccess: (data) => {
      setLogin(data.token, data.user);
      navigate("/");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="flex justify-center px-4 py-12 md:py-20">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 border border-border-warm px-6 py-10 md:w-[400px] md:px-10 md:py-12"
      >
        <h1 className="mb-2 text-center font-display text-2xl text-primary">로그인</h1>

        <FormInput
          label="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FormInput
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mutation.isError && (
          <p className="text-xs text-red-500">
            {mutation.error instanceof ApiError ? mutation.error.message : "로그인에 실패했습니다"}
          </p>
        )}

        <Button type="submit" variant="accent" disabled={mutation.isPending} className="mt-2 w-full">
          {mutation.isPending ? "로그인 중..." : "로그인"}
        </Button>

        <Link to="/signup" className="text-center text-sm font-bold text-accent">
          계정이 없으신가요? 회원가입
        </Link>
      </form>
    </div>
  );
}

export default LoginPage;
