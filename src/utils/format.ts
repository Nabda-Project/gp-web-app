import type { HealthStatus, Priority } from "@/types/models";

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function displayMetric(value?: number | null, fallback = "--"): string {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(0) : fallback;
}

export function priorityToStatus(priority?: Priority | null): "Normal" | "Warning" | "Critical" {
  if (priority === "CRITICAL" || priority === "HIGH") return "Critical";
  if (priority === "MEDIUM") return "Warning";
  return "Normal";
}

export function statusTone(status?: HealthStatus | Priority | "Normal" | "Warning" | "Critical" | null) {
  switch (status) {
    case "CRITICAL":
    case "HIGH":
    case "Critical":
      return {
        label: "Critical",
        color: "#E53935",
        bg: "rgba(229,57,53,0.08)",
        border: "rgba(229,57,53,0.25)",
        icon: "error_rounded"
      };
    case "WARNING":
    case "MEDIUM":
    case "Warning":
      return {
        label: "Warning",
        color: "#FF9800",
        bg: "rgba(255,152,0,0.10)",
        border: "rgba(255,152,0,0.28)",
        icon: "warning_rounded"
      };
    case "NORMAL":
    case "LOW":
    case "Normal":
      return {
        label: "Normal",
        color: "#00BFA5",
        bg: "rgba(0,191,165,0.10)",
        border: "rgba(0,191,165,0.24)",
        icon: "check_circle"
      };
    default:
      return {
        label: "Unknown",
        color: "#94A3B8",
        bg: "rgba(148,163,184,0.10)",
        border: "rgba(148,163,184,0.24)",
        icon: "help_outline_rounded"
      };
  }
}

export function isPhoneQuery(value: string): boolean {
  return /^[+\d][\d\s()+-]*$/.test(value.trim());
}
