"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { PatientCard } from "@/components/patients/PatientCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/services/apiClient";
import { realtime } from "@/services/websocket";
import type { Appointment, ChatContact, HealthMetric, PatientResponse } from "@/types/models";
import { relativeDay } from "@/utils/date";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [liveVitals, setLiveVitals] = useState<Record<number, HealthMetric>>({});
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [nextPatients, nextAppointments, nextContacts, nextUnread] = await Promise.all([
        api.patients(user.id),
        api.appointments(user.id),
        api.conversations(user.id),
        api.unreadNotifications(user.id).catch(() => ({ count: 0 }))
      ]);
      setPatients(nextPatients);
      setAppointments(nextAppointments);
      setContacts(nextContacts);
      setUnreadNotif(nextUnread.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard";
      setError(message);
      showToast({ type: "error", title: "Failed to load dashboard", message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    return realtime.onVitals((metric) => {
      if (typeof metric.patientId === "number") {
        setLiveVitals((current) => ({ ...current, [metric.patientId as number]: metric }));
      }
    });
  }, []);

  const stats = useMemo(() => {
    const needAttention = patients.filter((patient) => patient.priority !== "LOW" && patient.priority !== "NORMAL").length;
    const critical = patients.filter((patient) => patient.priority === "CRITICAL" || patient.priority === "HIGH").length;
    const pending = contacts.filter((contact) => contact.unreadCount > 0).length;
    const today = appointments.filter((item) => item.status === "SCHEDULED" && relativeDay(item.appointmentDate) === "today").length;
    const missed = appointments.filter((item) => item.status === "SCHEDULED" && relativeDay(item.appointmentDate) === "missed").length;
    return { needAttention, critical, pending, today, missed };
  }, [appointments, contacts, patients]);

  return (
    <ProtectedShell>
      <div className="decorated-bg min-h-[calc(100vh-4rem)]">
        <section className="gradient-primary relative overflow-hidden px-6 py-8 text-white lg:px-8">
          <div className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-2">
            <p className="text-sm font-medium text-white/90">Hello</p>
            <h1 className="text-2xl font-bold">Dr. {user?.fullName}</h1>
            <p className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date())}
              {unreadNotif ? ` • ${unreadNotif} unread` : ""}
            </p>
          </div>
        </section>
        <div className="space-y-6 p-6 lg:p-8">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon="people" value={patients.length} label="Total Patients" color="#407BFF" onClick={() => router.push("/patients")} />
            <StatCard icon="warning_amber_rounded" value={stats.needAttention} label="Need Attention" color="#FF9800" onClick={() => router.push("/patients")} />
            <StatCard icon="message" value={stats.pending} label="Pending Messages" color="#00BFA5" onClick={() => router.push("/chats")} />
            <StatCard icon="calendar_today" value={stats.today} label="Today's Appointments" color="#9C27B0" onClick={() => router.push("/appointments?filter=today")} />
            <StatCard icon="event_busy" value={stats.missed} label="Missed Appointments" color="#E53935" wide onClick={() => router.push("/appointments?filter=missed")} />
          </section>
          {stats.critical > 0 ? <AlertCard count={stats.critical} onClick={() => router.push("/patients")} /> : null}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-darkBlue">Recent Patients</h2>
              <button className="rounded-lg px-2 py-1 text-sm font-bold text-primary transition hover:bg-primary/10" onClick={() => router.push("/patients")}>
                See All
              </button>
            </div>
            {loading ? <SkeletonList count={3} /> : null}
            {error && !loading ? <EmptyState icon="error_outline_rounded" title="Failed to load patients" description={error} actionText="Retry" onAction={load} /> : null}
            {!loading && !error && patients.length === 0 ? <EmptyState icon="people_outline" title="No patients assigned yet." /> : null}
            {!loading &&
              !error &&
              patients
                .slice(0, 3)
                .map((patient) => <PatientCard key={patient.id} patient={patient} heartRate={liveVitals[patient.id]?.heartRate} />)}
          </section>
        </div>
      </div>
    </ProtectedShell>
  );
}
