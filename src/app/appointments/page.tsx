"use client";

import { useEffect, useMemo, useState } from "react";
import { AppointmentCard } from "@/components/appointments/AppointmentCard";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/services/apiClient";
import type { Appointment, AppointmentStatus } from "@/types/models";
import { relativeDay } from "@/utils/date";

const filters = ["today", "missed", "upcoming", "confirmed", "completed", "cancelled", "all"] as const;
type Filter = (typeof filters)[number];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setAppointments(await api.appointments(user.id));
      void api.markAppointmentNotificationsRead(user.id).catch(() => undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("filter") as Filter | null;
    if (requested && filters.includes(requested)) setFilter(requested);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const visible = useMemo(() => {
    return appointments.filter((appointment) => {
      if (filter === "all") return true;
      if (filter === "confirmed") return appointment.status === "CONFIRMED";
      if (filter === "completed") return appointment.status === "COMPLETED";
      if (filter === "cancelled") return appointment.status === "CANCELLED";
      return appointment.status === "SCHEDULED" && relativeDay(appointment.appointmentDate) === filter;
    });
  }, [appointments, filter]);

  async function updateStatus(appointment: Appointment, status: AppointmentStatus) {
    if (!appointment.id) return;
    const previous = appointments;
    setAppointments((items) => items.map((item) => (item.id === appointment.id ? { ...item, status } : item)));
    try {
      await api.updateAppointmentStatus(appointment.id, status);
      showToast({ type: "success", title: "Appointment updated" });
    } catch (err) {
      setAppointments(previous);
      showToast({ type: "error", title: "Failed to update appointment", message: err instanceof Error ? err.message : undefined });
    }
  }

  return (
    <ProtectedShell>
      <div className="decorated-bg min-h-[calc(100vh-4rem)] p-6 lg:p-8">
        <h1 className="text-3xl font-extrabold text-darkBlue">Appointments</h1>
        <div className="my-6 flex flex-wrap gap-2 rounded-[30px] bg-lightGrey/40 p-1">
          {filters.map((item) => (
            <button
              key={item}
              className={`rounded-[26px] px-4 py-3 text-xs font-bold capitalize transition ${
                filter === item ? "bg-white text-primary shadow-soft" : "text-grey"
              }`}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {loading ? <SkeletonList count={4} avatar={false} /> : null}
        {error && !loading ? <EmptyState icon="error_outline_rounded" title="Error loading" description={error} actionText="Retry" onAction={load} /> : null}
        {!loading && !error && visible.length === 0 ? <EmptyState icon="event_busy_rounded" title="No appointments found" /> : null}
        <div className="grid gap-5 xl:grid-cols-2">
          {visible.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} onStatus={updateStatus} />
          ))}
        </div>
      </div>
    </ProtectedShell>
  );
}
