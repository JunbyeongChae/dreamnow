import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ label, error, className = "", ...rest }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-bold text-primary">{label}</label>}
    <input
      ref={ref}
      className={`rounded border border-input-border px-[14px] py-[13px] text-sm text-primary ${className}`}
      {...rest}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
));

FormInput.displayName = "FormInput";

export default FormInput;
