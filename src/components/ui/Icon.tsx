import clsx from "@/utils/clsx";

type IconPath = {
  variant?: "stroke" | "fill";
  viewBox?: string;
  paths: string[];
  circles?: Array<{ cx: number; cy: number; r: number }>;
  lines?: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  polylines?: string[];
  polygons?: string[];
  rects?: Array<{ x: number; y: number; width: number; height: number; rx?: number }>;
};

const iconMap: Record<string, IconPath> = {
  access_time: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: ["M12 7v5l3 2"]
  },
  analytics: {
    paths: ["M4 19V5", "M4 19h16", "M8 16V9", "M12 16V7", "M16 16v-4"]
  },
  article: {
    rects: [{ x: 5, y: 3, width: 14, height: 18, rx: 2 }],
    paths: ["M8 8h8", "M8 12h8", "M8 16h5"]
  },
  arrow_back: {
    paths: ["M19 12H5", "M12 5l-7 7 7 7"]
  },
  battery: {
    rects: [{ x: 3, y: 8, width: 16, height: 8, rx: 2 }],
    paths: ["M21 11v2", "M6 11h8v2H6z"]
  },
  cake: {
    paths: ["M7 21h10", "M6 13h12v8H6z", "M8 13V9", "M12 13V9", "M16 13V9", "M8 7h.01", "M12 7h.01", "M16 7h.01"]
  },
  calendar: {
    rects: [{ x: 4, y: 5, width: 16, height: 15, rx: 2 }],
    paths: ["M8 3v4", "M16 3v4", "M4 10h16"]
  },
  calendar_off: {
    rects: [{ x: 4, y: 5, width: 16, height: 15, rx: 2 }],
    paths: ["M8 3v4", "M16 3v4", "M4 10h16", "M9 14l6 4", "M15 14l-6 4"]
  },
  chart: {
    paths: ["M4 19V5", "M4 19h16", "M7 15l3-3 3 2 5-6"]
  },
  chat: {
    paths: ["M5 6h14v10H8l-3 3V6z", "M8 10h8", "M8 13h5"]
  },
  check: {
    paths: ["M20 6L9 17l-5-5"]
  },
  chevron_right: {
    paths: ["M9 18l6-6-6-6"]
  },
  close: {
    paths: ["M6 6l12 12", "M18 6L6 18"]
  },
  dashboard: {
    rects: [
      { x: 4, y: 4, width: 6, height: 6, rx: 1 },
      { x: 14, y: 4, width: 6, height: 6, rx: 1 },
      { x: 4, y: 14, width: 6, height: 6, rx: 1 },
      { x: 14, y: 14, width: 6, height: 6, rx: 1 }
    ],
    paths: []
  },
  delete: {
    paths: ["M5 7h14", "M10 11v6", "M14 11v6", "M8 7l1-3h6l1 3", "M7 7l1 14h8l1-14"]
  },
  delete_sweep: {
    paths: ["M4 7h10", "M8 11v6", "M12 11v6", "M7 7l1 14h6l1-14", "M8 7l1-3h4l1 3", "M17 9h4", "M18 13h3", "M19 17h2"]
  },
  description: {
    rects: [{ x: 5, y: 3, width: 14, height: 18, rx: 2 }],
    paths: ["M9 7h6", "M9 11h6", "M9 15h4"]
  },
  edit: {
    paths: ["M4 20h4l11-11-4-4L4 16v4z", "M13 7l4 4"]
  },
  email: {
    rects: [{ x: 4, y: 6, width: 16, height: 12, rx: 2 }],
    paths: ["M4 8l8 6 8-6"]
  },
  error: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: ["M12 7v6", "M12 17h.01"]
  },
  event_busy: {
    rects: [{ x: 4, y: 5, width: 16, height: 15, rx: 2 }],
    paths: ["M8 3v4", "M16 3v4", "M4 10h16", "M9 14l6 4", "M15 14l-6 4"]
  },
  favorite: {
    variant: "fill",
    paths: ["M12 21s-7-4.35-9.25-8.5C.9 9.1 2.7 5 6.6 5c2 0 3.35 1.05 4.1 2.1C11.45 6.05 12.8 5 14.8 5c3.9 0 5.7 4.1 3.85 7.5C16.4 16.65 12 21 12 21z"]
  },
  gender: {
    circles: [{ cx: 10, cy: 9, r: 4 }],
    paths: ["M14 5l5-5", "M15 1h4v4", "M10 13v8", "M7 18h6"]
  },
  group_off: {
    paths: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 0 0 0-8", "M17 11a3 3 0 0 0 0-6", "M22 21v-2a4 4 0 0 0-3-3.85", "M3 3l18 18"]
  },
  help: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: ["M9.5 9a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1.2-1.5 2.5", "M12 17h.01"]
  },
  height: {
    paths: ["M12 3v18", "M8 7l4-4 4 4", "M8 17l4 4 4-4", "M5 5h2", "M5 19h2"]
  },
  info: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: ["M12 10v6", "M12 7h.01"]
  },
  language: {
    circles: [{ cx: 12, cy: 12, r: 9 }],
    paths: ["M3 12h18", "M12 3a14 14 0 0 1 0 18", "M12 3a14 14 0 0 0 0 18"]
  },
  lock: {
    rects: [{ x: 5, y: 10, width: 14, height: 10, rx: 2 }],
    paths: ["M8 10V7a4 4 0 0 1 8 0v3", "M12 14v2"]
  },
  moon: {
    paths: ["M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5z"]
  },
  logout: {
    paths: ["M10 4H5v16h5", "M14 8l4 4-4 4", "M18 12H9"]
  },
  message: {
    paths: ["M5 6h14v10H8l-3 3V6z", "M8 10h8", "M8 13h5"]
  },
  monitor_weight: {
    rects: [{ x: 5, y: 5, width: 14, height: 14, rx: 3 }],
    paths: ["M9 10a3 3 0 0 1 6 0", "M12 10l2-2"]
  },
  notifications: {
    paths: ["M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2z", "M10 20a2 2 0 0 0 4 0"]
  },
  notifications_off: {
    paths: ["M18 16v-5a6 6 0 0 0-8.5-5.45", "M6 11v5l-2 2h14", "M10 20a2 2 0 0 0 4 0", "M3 3l18 18"]
  },
  patient_search: {
    paths: ["M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2", "M9.5 11a4 4 0 1 0 0-8", "M17 11l4 4", "M21 11l-4 4"]
  },
  people: {
    paths: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8", "M22 21v-2a4 4 0 0 0-3-3.85", "M16 3.13a4 4 0 0 1 0 7.75"]
  },
  person: {
    circles: [{ cx: 12, cy: 8, r: 4 }],
    paths: ["M4 21a8 8 0 0 1 16 0"]
  },
  person_add: {
    circles: [{ cx: 9, cy: 8, r: 4 }],
    paths: ["M2 21a7 7 0 0 1 14 0", "M19 8v6", "M16 11h6"]
  },
  person_remove: {
    circles: [{ cx: 9, cy: 8, r: 4 }],
    paths: ["M2 21a7 7 0 0 1 14 0", "M16 11h6"]
  },
  phone: {
    paths: ["M22 16.9v3a2 2 0 0 1-2.2 2 19 19 0 0 1-8.3-3 18.7 18.7 0 0 1-5.8-5.8 19 19 0 0 1-3-8.3A2 2 0 0 1 4.7 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.45 2.1L8.6 9.6a15 15 0 0 0 5.8 5.8l1.2-1.25a2 2 0 0 1 2.1-.45c.85.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"]
  },
  refresh: {
    paths: ["M21 12a9 9 0 0 1-15.5 6.2", "M3 12A9 9 0 0 1 18.5 5.8", "M18 2v4h-4", "M6 22v-4h4"]
  },
  search: {
    circles: [{ cx: 11, cy: 11, r: 7 }],
    paths: ["M20 20l-4-4"]
  },
  search_off: {
    circles: [{ cx: 11, cy: 11, r: 7 }],
    paths: ["M20 20l-4-4", "M3 3l18 18"]
  },
  send: {
    paths: ["M22 2L11 13", "M22 2l-7 20-4-9-9-4 20-7z"]
  },
  settings: {
    circles: [{ cx: 12, cy: 12, r: 3 }],
    paths: ["M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 .9-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6.9H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5.9z"]
  },
  sun: {
    circles: [{ cx: 12, cy: 12, r: 4 }],
    paths: ["M12 2v2", "M12 20v2", "M4.93 4.93l1.41 1.41", "M17.66 17.66l1.41 1.41", "M2 12h2", "M20 12h2", "M4.93 19.07l1.41-1.41", "M17.66 6.34l1.41-1.41"]
  },
  sync: {
    paths: ["M21 12a9 9 0 0 1-9 9 8.7 8.7 0 0 1-6-2.4", "M3 12a9 9 0 0 1 15-6.6", "M18 2v4h-4", "M6 22v-4h4"]
  },
  warning: {
    paths: ["M12 3l10 18H2L12 3z", "M12 9v5", "M12 17h.01"]
  },
  water_drop: {
    variant: "fill",
    paths: ["M12 2s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z"]
  }
};

const aliases: Record<string, string> = {
  analytics_outlined: "analytics",
  article_outlined: "article",
  battery_charging_full: "battery",
  battery_full: "battery",
  cake_outlined: "cake",
  calendar_month: "calendar",
  calendar_today: "calendar",
  calendar_today_rounded: "calendar",
  chat_bubble_outline_rounded: "chat",
  chat_bubble_rounded: "chat",
  check_circle: "check",
  check_circle_rounded: "check",
  delete_outline_rounded: "delete",
  delete_rounded: "delete",
  delete_sweep_rounded: "delete_sweep",
  description_rounded: "description",
  dark_mode: "moon",
  done_all_rounded: "check",
  email_outlined: "email",
  error_outline: "error",
  error_outline_rounded: "error",
  error_rounded: "error",
  event_busy_rounded: "event_busy",
  group_off_rounded: "group_off",
  help_outline_rounded: "help",
  lock_reset_rounded: "lock",
  light_mode: "sun",
  logout_rounded: "logout",
  mark_chat_unread_rounded: "chat",
  monitor_weight_outlined: "monitor_weight",
  notifications_outlined: "notifications",
  notifications_rounded: "notifications",
  notifications_off_rounded: "notifications_off",
  people_outline: "people",
  person_add_rounded: "person_add",
  person_remove_rounded: "person_remove",
  person_search_rounded: "patient_search",
  phone_outlined: "phone",
  refresh_rounded: "refresh",
  remove_red_eye_rounded: "check",
  search_off_rounded: "search_off",
  send_rounded: "send",
  show_chart: "chart",
  warning_amber_rounded: "warning",
  warning_rounded: "warning",
  wc_rounded: "gender"
};

function resolveIcon(name: string) {
  return iconMap[aliases[name] ?? name] ?? iconMap.help;
}

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const icon = resolveIcon(name);
  const isFill = icon.variant === "fill";

  return (
    <svg
      aria-hidden="true"
      className={clsx("inline-block shrink-0", className)}
      fill={isFill ? "currentColor" : "none"}
      height={size}
      stroke={isFill ? "none" : "currentColor"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={isFill ? undefined : 2}
      viewBox={icon.viewBox ?? "0 0 24 24"}
      width={size}
    >
      {icon.rects?.map((rect, index) => <rect key={`rect-${index}`} {...rect} />)}
      {icon.circles?.map((circle, index) => <circle key={`circle-${index}`} {...circle} />)}
      {icon.lines?.map((line, index) => <line key={`line-${index}`} {...line} />)}
      {icon.polylines?.map((points, index) => <polyline key={`polyline-${index}`} points={points} />)}
      {icon.polygons?.map((points, index) => <polygon key={`polygon-${index}`} points={points} />)}
      {icon.paths.map((path, index) => <path key={`path-${index}`} d={path} />)}
    </svg>
  );
}
