"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { TextInput } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/services/apiClient";
import type { PatientSearchResult } from "@/types/models";
import { isPhoneQuery } from "@/utils/format";

export function AssignPatientModal({
  open,
  doctorId,
  onClose,
  onAssigned
}: {
  open: boolean;
  doctorId: number;
  onClose: () => void;
  onAssigned: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = isPhoneQuery(trimmed)
          ? await api.searchPatientsByPhone(doctorId, trimmed)
          : await api.searchPatientsByName(doctorId, trimmed);
        setResults(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to search patients");
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [doctorId, open, query]);

  async function assign(patientId: number) {
    setAssigningId(patientId);
    try {
      await api.assignPatient(doctorId, patientId);
      onAssigned();
      onClose();
    } finally {
      setAssigningId(null);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Assign Patient">
      <div className="space-y-5">
        <TextInput
          label="Search by name or phone"
          icon={isPhoneQuery(query) ? "phone" : "search"}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
        />
        {error ? (
          <div className="flex items-center gap-3 rounded-xl border border-error/20 bg-error/10 p-3 text-sm font-semibold text-error">
            <Icon name="error_outline" size={20} />
            <span className="flex-1">{error}</span>
          </div>
        ) : null}
        {query.trim().length < 2 ? <EmptyState icon="person_search_rounded" title="Type at least 2 characters to search" /> : null}
        {loading ? (
          <div className="grid min-h-32 place-items-center text-primary">
            <span className="flex items-center gap-3 text-sm font-semibold">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Searching
            </span>
          </div>
        ) : null}
        {!loading && query.trim().length >= 2 && results.length === 0 ? <EmptyState icon="search_off_rounded" title="No results" /> : null}
        <div className="space-y-3">
          {results.map((patient) => (
            <article key={patient.id} className="flex items-center gap-4 rounded-2xl border border-transparent bg-white p-4 shadow-soft transition-colors dark:border-lightGrey/60 dark:bg-surface">
              <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-gradient-to-br from-primary/15 to-secondary/10 text-lg font-bold text-primary">
                {patient.fullName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-bold text-darkBlue">{patient.fullName}</h3>
                <p className="truncate text-xs text-grey">{patient.email}</p>
                {patient.phoneNumber ? <p className="truncate text-xs text-grey">{patient.phoneNumber}</p> : null}
              </div>
              <Button loading={assigningId === patient.id} onClick={() => assign(patient.id)}>
                Assign
              </Button>
            </article>
          ))}
        </div>
      </div>
    </Modal>
  );
}
