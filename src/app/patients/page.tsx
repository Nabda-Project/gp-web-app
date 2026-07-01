"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { AssignPatientModal } from "@/components/patients/AssignPatientModal";
import { PatientCard } from "@/components/patients/PatientCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextInput } from "@/components/ui/Input";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/services/apiClient";
import { realtime } from "@/services/websocket";
import type { HealthMetric, PatientResponse } from "@/types/models";

export default function PatientsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [liveVitals, setLiveVitals] = useState<Record<number, HealthMetric>>({});
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setPatients(await api.patients(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load patients");
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

  const filtered = useMemo(
    () => patients.filter((patient) => patient.fullName.toLowerCase().includes(query.trim().toLowerCase())),
    [patients, query]
  );

  async function remove(patient: PatientResponse) {
    if (!user) return;
    if (!window.confirm(`Remove ${patient.fullName} from your patients?`)) return;
    try {
      await api.removePatient(user.id, patient.id);
      setPatients((items) => items.filter((item) => item.id !== patient.id));
      showToast({ type: "success", title: "Patient removed" });
    } catch (err) {
      showToast({ type: "error", title: "Failed to remove patient", message: err instanceof Error ? err.message : undefined });
    }
  }

  return (
    <ProtectedShell>
      <div className="decorated-bg min-h-[calc(100vh-4rem)] p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-darkBlue">My Patients</h1>
            <p className="mt-1 text-sm text-grey">Assigned patients with live health-status context.</p>
          </div>
          <Button icon="person_add_rounded" onClick={() => setModalOpen(true)}>
            Assign Patient
          </Button>
        </header>
        <div className="mb-5 max-w-xl">
          <TextInput label="Search patients" icon="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        {loading ? <SkeletonList count={6} /> : null}
        {error && !loading ? <EmptyState icon="error_outline_rounded" title="Failed to load patients" description={error} actionText="Retry" onAction={load} /> : null}
        {!loading && !error && patients.length === 0 ? (
          <EmptyState icon="group_off_rounded" title="No patients assigned yet." description="Assign a new patient to start monitoring them." />
        ) : null}
        {!loading && !error && patients.length > 0 && filtered.length === 0 ? (
          <EmptyState icon="search_off_rounded" title="No patients found" description="Try modifying your search query." actionText="Clear Search" onAction={() => setQuery("")} />
        ) : null}
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((patient) => (
            <PatientCard key={patient.id} patient={patient} onDelete={remove} highlight={query} heartRate={liveVitals[patient.id]?.heartRate} />
          ))}
        </div>
        {user ? <AssignPatientModal open={modalOpen} doctorId={user.id} onClose={() => setModalOpen(false)} onAssigned={load} /> : null}
      </div>
    </ProtectedShell>
  );
}
