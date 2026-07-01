import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Appointment, AppointmentStatus } from "@/types/models";
import { formatDateTime } from "@/utils/date";

export function AppointmentCard({
  appointment,
  onStatus
}: {
  appointment: Appointment;
  onStatus: (appointment: Appointment, status: AppointmentStatus) => void;
}) {
  const color =
    appointment.status === "COMPLETED"
      ? "#4CAF50"
      : appointment.status === "CANCELLED"
        ? "#F44336"
        : appointment.status === "CONFIRMED"
          ? "#00BFA5"
          : "#407BFF";
  const actionable = appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED";
  return (
    <article className="overflow-hidden rounded-[20px] bg-white shadow-[0_8px_15px_rgba(3,4,94,0.05)]">
      <div className="flex items-center gap-4 p-4" style={{ background: `${color}0D` }}>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft" style={{ color }}>
          <Icon name={appointment.status === "CANCELLED" ? "cancel" : "event_available"} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-darkBlue">{appointment.patientName}</h3>
          <p className="truncate text-sm text-grey">{appointment.reason || "No reason provided"}</p>
        </div>
        <span className="rounded-xl px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: color }}>
          {appointment.status}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <p className="flex items-center gap-3 text-sm font-semibold text-darkBlue">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-lightGrey/50 text-primary">
            <Icon name="calendar_month" size={16} />
          </span>
          {formatDateTime(appointment.appointmentDate)}
        </p>
        {actionable ? (
          <div className="flex flex-wrap gap-2 border-t border-lightGrey/60 pt-3">
            {appointment.status === "SCHEDULED" ? (
              <Button variant="secondary" onClick={() => onStatus(appointment, "CONFIRMED")}>
                Confirm
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => onStatus(appointment, "COMPLETED")}>
              Complete
            </Button>
            <Button variant="danger" onClick={() => onStatus(appointment, "CANCELLED")}>
              Cancel
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
