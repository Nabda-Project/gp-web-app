"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/Badge";
import type { PatientResponse } from "@/types/models";
import { displayMetric, priorityToStatus } from "@/utils/format";

export function PatientCard({
  patient,
  heartRate,
  onDelete,
  highlight
}: {
  patient: PatientResponse;
  heartRate?: number | null;
  onDelete?: (patient: PatientResponse) => void;
  highlight?: string;
}) {
  const router = useRouter();
  const status = priorityToStatus(patient.priority);
  return (
    <article
      className="group relative mb-4 cursor-pointer rounded-2xl border border-transparent bg-white p-4 shadow-[0_4px_12px_rgba(0,191,165,0.10)] transition hover:-translate-y-0.5 hover:shadow-lg data-[status=Critical]:border-error/30 dark:border-lightGrey/60 dark:bg-surface dark:shadow-[0_8px_24px_rgba(0,0,0,0.20)] data-[status=Critical]:border"
      data-status={status}
      onClick={() => router.push(`/patients/${patient.id}`)}
    >
      <div className="flex items-center gap-4">
        <span className="relative">
          <Avatar name={patient.fullName} imageUrl={patient.profileImageUrl} size={52} />
          <span
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-surface"
            style={{ background: status === "Critical" ? "#E53935" : status === "Warning" ? "#FF9800" : "#00BFA5" }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold text-darkBlue">
            {highlight ? highlighted(patient.fullName, highlight) : patient.fullName}
          </h3>
          <p className="truncate text-xs text-grey">{patient.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge value={patient.priority} />
            <span className="inline-flex items-center gap-1 rounded-full bg-error/10 px-2 py-1 text-[11px] font-semibold text-[#FF5252]">
              <Icon name="favorite" size={12} />
              {displayMetric(heartRate)} bpm
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-[10px] bg-primary/10 text-primary"
            onClick={(event) => {
              event.stopPropagation();
              router.push(`/chats/${patient.id}`);
            }}
            aria-label={`Message ${patient.fullName}`}
          >
            <Icon name="message" size={18} />
          </button>
          {onDelete ? (
            <button
              className="grid h-9 w-9 place-items-center rounded-[10px] bg-error/10 text-error"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(patient);
              }}
              aria-label={`Remove ${patient.fullName}`}
            >
              <Icon name="delete_rounded" size={18} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function highlighted(name: string, query: string) {
  const index = name.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return name;
  return (
    <>
      {name.slice(0, index)}
      <mark className="rounded bg-primary/20 font-extrabold text-primary">{name.slice(index, index + query.length)}</mark>
      {name.slice(index + query.length)}
    </>
  );
}
