import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { Icon } from "@/components/ui/Icon";

interface FieldShellProps {
  label: string;
  error?: string;
  icon?: string;
  children?: React.ReactNode;
}

function FieldShell({ label, error, icon, children }: FieldShellProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-darkBlue">{label}</span>
      <span className="relative block">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary">
            <Icon name={icon} size={20} />
          </span>
        ) : null}
        {children}
      </span>
      {error ? (
        <span className="mt-1 block text-xs font-medium text-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function TextInput({ label, error, icon, className, ...props }: InputHTMLAttributes<HTMLInputElement> & FieldShellProps) {
  return (
    <FieldShell label={label} error={error} icon={icon}>
      <input
        className={`w-full rounded-xl border border-transparent bg-[#F5F7FA] px-4 py-3 text-[15px] text-darkBlue transition focus:border-primary disabled:opacity-60 dark:bg-surfaceMuted ${
          icon ? "pl-12" : ""
        } ${className ?? ""}`}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectInput({
  label,
  error,
  icon,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & FieldShellProps) {
  return (
    <FieldShell label={label} error={error} icon={icon}>
      <select
        className={`w-full rounded-xl border border-transparent bg-[#F5F7FA] px-4 py-3 text-[15px] text-darkBlue transition focus:border-primary dark:bg-surfaceMuted ${
          icon ? "pl-12" : ""
        } ${className ?? ""}`}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextArea({
  label,
  error,
  icon,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldShellProps) {
  return (
    <FieldShell label={label} error={error} icon={icon}>
      <textarea
        className={`min-h-28 w-full rounded-xl border border-transparent bg-[#F5F7FA] px-4 py-3 text-[15px] text-darkBlue transition focus:border-primary dark:bg-surfaceMuted ${
          icon ? "pl-12" : ""
        } ${className ?? ""}`}
        {...props}
      />
    </FieldShell>
  );
}
