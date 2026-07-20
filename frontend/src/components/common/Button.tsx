import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "accent" | "outline" | "text-link" | "inverse";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white px-5 py-3 rounded",
  accent: "bg-accent text-white px-5 py-3 rounded",
  outline: "border border-primary text-primary bg-transparent px-5 py-3 rounded",
  "text-link": "text-accent font-bold bg-transparent p-0",
  inverse: "bg-white text-primary px-5 py-3 rounded",
};

function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`text-sm font-bold ${variantClasses[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export default Button;
