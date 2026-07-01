import type { HealthStatus, Priority } from "@/types/models";
import { statusTone } from "@/utils/format";

export function StatusBadge({ value }: { value?: HealthStatus | Priority | "Normal" | "Warning" | "Critical" | null }) {
  const tone = statusTone(value);
  return (
    <span
      className="inline-flex items-center rounded-[10px] border px-2.5 py-1 text-[11px] font-bold"
      style={{ color: tone.color, background: tone.bg, borderColor: tone.border }}
    >
      {tone.label}
    </span>
  );
}
