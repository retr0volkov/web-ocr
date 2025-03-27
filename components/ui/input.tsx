import { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`p-2 border rounded-md focus:ring-2 focus:ring-blue-400 ${className}`}
      {...props}
    />
  );
}
