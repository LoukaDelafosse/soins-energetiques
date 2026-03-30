"use client";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-semibold text-mauve-900">
            {label}
            {props.required && <span className="text-rose-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-xl border-2 bg-white
            border-mauve-200 focus:border-mauve-400 focus:outline-none focus:ring-2 focus:ring-mauve-100
            text-mauve-900 placeholder:text-mauve-400
            transition-all duration-200
            ${error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}
            ${className}
          `}
          {...props}
        />
        {hint && !error && <p className="text-xs text-mauve-600">{hint}</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
