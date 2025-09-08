"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
};

const base = "inline-flex items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed select-none";
const variants: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
  secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 focus-visible:ring-neutral-500",
  ghost: "bg-transparent text-neutral-900 hover:bg-neutral-100 focus-visible:ring-neutral-400",
  destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
};
const sizes: Record<Size, string> = {
  sm: "text-xs px-2.5 py-1.5",
  md: "text-sm px-3.5 py-2",
  lg: "text-base px-4.5 py-2.5",
};

export default function Button({ variant = "primary", size = "md", leftIcon, rightIcon, loading, children, className = "", ...props }: ButtonProps) {
  return (
    <button aria-busy={loading || undefined} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : leftIcon ? <span className="mr-2">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="ml-2">{rightIcon}</span> : null}
    </button>
  );
}


