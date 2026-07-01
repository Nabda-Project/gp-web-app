import { Icon } from "@/components/ui/Icon";
import type { NotificationItem } from "@/types/models";
import { formatDateTime } from "@/utils/date";

const typeColor = (type: string) => {
  if (type === "CHAT") return "#407BFF";
  if (type === "APPOINTMENT_SCHEDULED") return "#9C27B0";
  if (type === "APPOINTMENT_CONFIRMED") return "#00BFA5";
  if (type === "APPOINTMENT_CANCELLED") return "#E53935";
  if (type === "APPOINTMENT_COMPLETED") return "#4CAF50";
  return "#94A3B8";
};

const typeIcon = (type: string) => {
  if (type === "CHAT") return "chat_bubble_rounded";
  if (type.startsWith("APPOINTMENT")) return "calendar_today_rounded";
  if (type === "PATIENT_ASSIGNED") return "check_circle_rounded";
  return "notifications_rounded";
};

export function NotificationTile({
  item,
  onOpen,
  onDelete
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
  onDelete: (item: NotificationItem) => void;
}) {
  const color = typeColor(item.type);
  return (
    <article
      className="flex cursor-pointer items-start gap-4 rounded-2xl border p-4 shadow-soft"
      style={{
        background: item.read ? "#FFFFFF" : `${color}0F`,
        borderColor: item.read ? "transparent" : `${color}26`
      }}
      onClick={() => onOpen(item)}
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${color}${item.read ? "14" : "26"}`, color }}>
        <Icon name={typeIcon(item.type)} size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className={`truncate text-sm text-darkBlue ${item.read ? "font-medium" : "font-bold"}`}>{item.title}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] text-grey">{item.body}</p>
        <p className="mt-2 text-[11px] text-grey/70">{formatDateTime(item.createdAt)}</p>
      </div>
      <button
        className="grid h-9 w-9 place-items-center rounded-full text-grey/60 hover:bg-error/10 hover:text-error"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(item);
        }}
      >
        <Icon name="delete_outline_rounded" size={20} />
      </button>
    </article>
  );
}
