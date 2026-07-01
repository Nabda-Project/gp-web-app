"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { TextArea, TextInput } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { VitalCard } from "@/components/vitals/VitalCard";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/services/apiClient";
import { realtime } from "@/services/websocket";
import type { HealthMetric, PatientResponse } from "@/types/models";
import { ageFromDob, formatDateTime, toUtcIso } from "@/utils/date";
import { displayMetric } from "@/utils/format";

export default function PatientDetailPage() {
  const params = useParams<{ patientId: string }>();
  const patientId = Number(params.patientId);
  const { user } = useAuth();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [metric, setMetric] = useState<HealthMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  async function load() {
    if (!user || !patientId) return;
    setLoading(true);
    try {
      const [patients, latest] = await Promise.all([api.patients(user.id), api.latestMetric(patientId)]);
      setPatient(patients.find((item) => item.id === patientId) ?? null);
      setMetric(latest);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, patientId]);

  useEffect(() => {
    return realtime.onVitals((incoming) => {
      if (incoming.patientId === patientId) setMetric(incoming);
    });
  }, [patientId]);

  const bio = useMemo(
    () => [
      { icon: "wc_rounded", label: "Gender", value: patient?.gender ?? "N/A" },
      { icon: "cake_outlined", label: "Age", value: ageFromDob(patient?.dateOfBirth) },
      { icon: "height", label: "Height", value: patient?.height ? `${patient.height} cm` : "N/A" },
      { icon: "monitor_weight_outlined", label: "Weight", value: patient?.weight ? `${patient.weight} kg` : "N/A" }
    ],
    [patient]
  );

  async function remove() {
    if (!user || !patient) return;
    if (!window.confirm(`Remove ${patient.fullName} from your patients?`)) return;
    await api.removePatient(user.id, patient.id);
    router.push("/patients");
  }

  return (
    <ProtectedShell>
      <div className="decorated-bg min-h-[calc(100vh-4rem)] p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/patients" className="text-sm font-bold text-primary">
              Patients
            </Link>
            <h1 className="mt-1 text-3xl font-extrabold text-darkBlue">Patient Details</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" icon="calendar_month" onClick={() => setScheduleOpen(true)}>
              Schedule Appointment
            </Button>
            <Button icon="message" onClick={() => router.push(`/chats/${patientId}`)}>
              Send Message
            </Button>
            <Button variant="danger" icon="person_remove_rounded" onClick={remove}>
              Remove
            </Button>
          </div>
        </header>
        {loading ? <EmptyState icon="sync" title="Loading patient details" /> : null}
        {!loading && !patient ? <EmptyState icon="error_outline_rounded" title="Patient not found" description="Refresh the patient list and try again." /> : null}
        {patient ? (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-5">
                  <Avatar name={patient.fullName} imageUrl={patient.profileImageUrl} size={70} />
                  <div>
                    <h2 className="text-xl font-bold text-darkBlue">{patient.fullName}</h2>
                    <p className="text-sm text-grey">{patient.email}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-grey">
                      <Icon name="access_time" size={14} /> Last update: {formatDateTime(metric?.measuredAt)}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="border-l-4" style={{ borderLeftColor: "#407BFF" } as React.CSSProperties}>
                <p className="text-sm font-semibold text-grey">Current Health Status</p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge value={patient.healthStatus} />
                  <Icon name="check_circle" className="text-primary" size={30} />
                </div>
              </Card>
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-darkBlue">Vitals</h2>
                  <Button variant="secondary" icon="show_chart" onClick={() => router.push(`/patients/${patientId}/vitals`)}>
                    View Charts
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <VitalCard label="Heart Rate" value={displayMetric(metric?.heartRate)} unit="bpm" icon="favorite" color="#FF5252" />
                  <VitalCard label="Blood Oxygen" value={displayMetric(metric?.spo2)} unit="%" icon="water_drop" color="#03A9F4" />
                  <VitalCard label="Battery Level" value={displayMetric(metric?.batteryLevel)} unit="%" icon="battery_charging_full" color="#4CAF50" />
                  <VitalCard label="Next Follow Up" value="N/A" icon="calendar_today" color="#407BFF" />
                </div>
              </section>
              <Button className="w-full" icon="analytics_outlined" onClick={() => router.push(`/patients/${patientId}/reports`)}>
                View AI Assessment Reports
              </Button>
            </div>
            <Card>
              <h2 className="mb-4 text-xl font-extrabold text-darkBlue">Patient Bio</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {bio.map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 px-3 py-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon name={item.icon} size={16} />
                    </span>
                    <span>
                      <span className="block text-[11px] font-semibold text-grey">{item.label}</span>
                      <span className="text-sm font-bold text-darkBlue">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : null}
        {user && patient ? (
          <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} doctorId={user.id} patientId={patient.id} />
        ) : null}
      </div>
    </ProtectedShell>
  );
}

function ScheduleModal({ open, onClose, doctorId, patientId }: { open: boolean; onClose: () => void; doctorId: number; patientId: number }) {
  const { showToast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const target = new Date(`${date}T${time}:00`);
    if (!date || !time || target <= new Date()) {
      showToast({ type: "warning", title: "Cannot schedule appointments in the past." });
      return;
    }
    setLoading(true);
    try {
      await api.scheduleAppointment({
        doctorId,
        patientId,
        appointmentDate: toUtcIso(date, time),
        reason: reason.trim() || undefined
      });
      showToast({ type: "success", title: "Appointment scheduled" });
      onClose();
    } catch (error) {
      showToast({ type: "error", title: "Failed to schedule appointment", message: error instanceof Error ? error.message : undefined });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule Appointment">
      <form onSubmit={submit} className="space-y-4">
        <TextInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <TextInput label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        <TextArea label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <Button type="submit" loading={loading} className="w-full">
          Schedule
        </Button>
      </form>
    </Modal>
  );
}
