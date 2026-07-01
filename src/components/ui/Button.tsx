import type { ButtonHTMLAttributes } from "react";
import clsx from "@/utils/clsx";
import { Icon } from "@/components/ui/Icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  loading?: boolean;
  icon?: string;
}

export function Button({ className, variant = "primary", loading, icon, children, disabled, ...props }: ButtonProps) {
  const styles = {
    primary: "gradient-primary text-white shadow-button",
    secondary: "bg-primary/10 text-primary",
    danger: "bg-error text-white",
    ghost: "bg-transparent text-primary hover:bg-primary/5",
    outline: "border border-primary/30 bg-white text-primary dark:bg-surface"
  };
  return (
    <button
      className={clsx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
        styles[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {!loading && icon ? <Icon name={icon} size={18} /> : null}
      {children}
    </button>
  );
}
