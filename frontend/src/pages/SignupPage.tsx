import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { signup } from "../api/auth";
import { ApiError } from "../api/client";
import Button from "../components/common/Button";
import FormInput from "../components/common/FormInput";

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => signup(username, password),
    onSuccess: () => {
      navigate("/login");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="flex justify-center bg-bg-warm px-4 py-12 md:py-20">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-4 px-6 py-10 md:w-[400px] md:border md:border-border-warm md:bg-white md:px-10 md:py-12"
      >
        <h1 className="mb-2 text-center font-display text-2xl text-primary">회원가입</h1>

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
          minLength={8}
          required
        />
        <p className="text-xs text-text-muted">비밀번호는 8자 이상이어야 합니다</p>

        {mutation.isError && (
          <p className="text-xs text-red-500">
            {mutation.error instanceof ApiError ? mutation.error.message : "회원가입에 실패했습니다"}
          </p>
        )}

        <Button type="submit" variant="accent" disabled={mutation.isPending} className="mt-2 w-full">
          {mutation.isPending ? "가입 중..." : "회원가입"}
        </Button>

        <Link to="/login" className="text-center text-sm font-bold text-accent">
          이미 계정이 있으신가요? 로그인
        </Link>
      </form>
    </div>
  );
}

export default SignupPage;
