"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Skeleton";
import { api } from "@/services/apiClient";
import type { AiConsultResponse } from "@/types/models";
import { formatDateTime } from "@/utils/date";
import clsx from "@/utils/clsx";

const MEDICAL_DISCLAIMER =
  "AI reports are advisory only and must be reviewed by qualified medical professionals.";

export default function ReportsPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const id = Number(patientId);
  const [reports, setReports] = useState<AiConsultResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = reports.find((report) => report.id === selectedId) ?? reports[0] ?? null;

  async function load() {
    if (!Number.isFinite(id)) {
      setError("Invalid patient id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await api.aiHistory(id);
      const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReports(sorted);
      setSelectedId((current) => (current && sorted.some((report) => report.id === current) ? current : sorted[0]?.id ?? null));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <ProtectedShell>
      <div className="min-h-[calc(100vh-4rem)] bg-aiBackground font-arabic text-[#1E293B] dark:bg-background dark:text-darkBlue" dir="rtl">
        <section className="gradient-primary relative overflow-hidden rounded-b-[28px] px-5 pb-6 pt-5 text-white shadow-[0_8px_20px_rgba(64,123,255,0.30)] lg:px-8">
          <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-4">
            <Link
              href={`/patients/${id}`}
              className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 transition hover:bg-white/30"
              aria-label="Back to patient details"
            >
              <Icon name="chevron_right" size={20} />
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-extrabold">التقارير السابقة</h1>
              <p className="mt-1 text-sm font-semibold text-white/75">سجل تقارير القلب</p>
            </div>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 transition hover:bg-white/30 disabled:opacity-60"
              onClick={load}
              disabled={loading}
              aria-label="Refresh reports"
              title="Refresh reports"
            >
              <Icon name="refresh_rounded" size={20} />
            </button>
          </div>
        </section>

        <div className="p-6 lg:p-8">
          {loading ? <Spinner label="Loading reports..." /> : null}
          {error && !loading ? (
            <EmptyState icon="error_outline_rounded" title="Failed to load reports" description={error} actionText="Retry" onAction={load} />
          ) : null}
          {!loading && !error && reports.length === 0 ? (
            <EmptyState icon="article_outlined" title="لا توجد تقارير لهذا المريض حتى الآن" />
          ) : null}
          {!loading && !error && reports.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <aside className="space-y-4">
                {reports.map((report, index) => (
                  <ReportListCard
                    key={report.id}
                    report={report}
                    index={index}
                    selected={selected?.id === report.id}
                    onClick={() => setSelectedId(report.id)}
                  />
                ))}
              </aside>
              {selected ? <ReportDetail report={selected} /> : null}
            </div>
          ) : null}
        </div>
      </div>
    </ProtectedShell>
  );
}

function ReportListCard({
  report,
  index,
  selected,
  onClick
}: {
  report: AiConsultResponse;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={clsx(
        "flex w-full items-center gap-4 rounded-[20px] border bg-white p-4 text-right shadow-card transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-surface",
        selected ? "border-primary" : "border-transparent dark:border-lightGrey/60"
      )}
      onClick={onClick}
    >
      <span className="grid h-12 w-12 place-items-center rounded-[14px] bg-aiSurface text-primary dark:bg-primary/10">
        <Icon name="description_rounded" size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-[#1E293B] dark:text-darkBlue">تقرير رقم {index + 1}</span>
        <span className="mt-1 flex items-center gap-1 text-sm text-[#64748B] dark:text-grey">
          <Icon name="calendar_today" size={14} />
          {formatDateTime(report.createdAt)}
        </span>
      </span>
      <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-[11px] font-bold text-[#10B981]">مكتمل</span>
    </button>
  );
}

function ReportDetail({ report }: { report: AiConsultResponse }) {
  const demographics = useMemo(
    () => [
      { label: "المريض", value: report.patientName ?? "N/A" },
      { label: "العمر", value: report.patientAge != null ? `${report.patientAge}` : "N/A" },
      { label: "النوع", value: report.patientGender ?? "N/A" },
      { label: "الطول", value: report.patientHeight != null ? `${report.patientHeight} cm` : "N/A" },
      { label: "الوزن", value: report.patientWeight != null ? `${report.patientWeight} kg` : "N/A" },
      { label: "تاريخ الإرسال", value: formatDateTime(report.createdAt) }
    ],
    [report]
  );

  return (
    <Card className="space-y-6 p-0">
      <div className="border-b border-lightGrey/60 p-5">
        <div className="rounded-2xl border border-error/20 bg-error/10 p-4 text-sm font-bold leading-6 text-error" dir="ltr">
          {MEDICAL_DISCLAIMER}
        </div>
      </div>

      <section className="px-5">
        <h2 className="text-xl font-extrabold text-[#1E293B] dark:text-darkBlue">بيانات التقرير</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {demographics.map((item) => (
            <div key={item.label} className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3">
              <p className="text-xs font-bold text-[#64748B] dark:text-grey">{item.label}</p>
              <p className="mt-1 text-sm font-extrabold text-[#1E293B] dark:text-darkBlue" dir="auto">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5">
        <h2 className="mb-4 text-xl font-extrabold text-[#1E293B] dark:text-darkBlue">ملخص التقييم القلبي</h2>
        <ReportContent report={report} />
      </section>

      {report.patientInput || report.patientRequestData ? (
        <QuestionnaireSection report={report} />
      ) : null}
    </Card>
  );
}

function ReportContent({ report }: { report: AiConsultResponse }) {
  const parsedReport = parseMaybeJson(report.aiReport);

  if (parsedReport && hasDisplayValue(parsedReport)) {
    return <StructuredAssessment value={parsedReport} />;
  }

  return <MarkdownView value={report.aiReport || "No AI report content was returned for this assessment."} />;
}

function QuestionnaireSection({ report }: { report: AiConsultResponse }) {
  const parsedInput = parseMaybeJson(report.patientInput);
  const parsedRequest = parseMaybeJson(report.patientRequestData);
  const readableInput = report.patientInput && !parsedInput ? report.patientInput.trim() : "";

  return (
    <section className="space-y-4 px-5 pb-5">
      <div>
        <h2 className="text-xl font-extrabold text-[#1E293B] dark:text-darkBlue">ملخص إجابات المريض</h2>
        <p className="mt-1 text-sm font-semibold text-[#64748B] dark:text-grey">
          البيانات التي أرسلها المريض من تطبيق الهاتف قبل إنشاء التقرير.
        </p>
      </div>

      {readableInput ? (
        <div className="rounded-2xl border border-primary/10 bg-aiSurface/70 p-5 text-sm font-semibold leading-8 text-[#1E293B] dark:bg-surfaceMuted dark:text-darkBlue" dir="auto">
          {readableInput}
        </div>
      ) : null}

      {parsedInput && hasDisplayValue(parsedInput) ? <StructuredAssessment value={parsedInput} compact /> : null}

      {parsedRequest && hasDisplayValue(parsedRequest) ? (
        <details className="rounded-2xl border border-lightGrey/70 bg-aiSurface/60 p-4 dark:bg-surfaceMuted">
          <summary className="cursor-pointer text-sm font-extrabold text-primary">عرض بيانات النموذج المنظمة</summary>
          <div className="mt-4">
            <StructuredAssessment value={parsedRequest} compact />
          </div>
        </details>
      ) : null}

      <details className="rounded-2xl border border-lightGrey/70 bg-white/70 p-4 dark:bg-surfaceMuted">
        <summary className="cursor-pointer text-sm font-extrabold text-[#64748B] dark:text-grey">البيانات الخام</summary>
        {report.patientInput ? <RawPayload title="patientInput" value={report.patientInput} /> : null}
        {report.patientRequestData ? <RawPayload title="patientRequestData" value={report.patientRequestData} /> : null}
      </details>
    </section>
  );
}

function MarkdownView({ value }: { value: string }) {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className="space-y-3 rounded-2xl bg-white/70 p-5 leading-7 text-[#1E293B] dark:bg-surfaceMuted dark:text-darkBlue" dir="auto">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={index} className="h-2" />;
        if (/^---+$/.test(trimmed)) return <hr key={index} className="border-lightGrey/80" />;
        const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
        if (heading) {
          const level = heading[1].length;
          return (
            <h3 key={index} className={clsx("font-extrabold text-primary", level <= 2 ? "mt-5 text-xl" : "mt-4 text-lg")}>
              {renderInline(heading[2])}
            </h3>
          );
        }
        const bullet = /^[-*]\s+(.+)$/.exec(trimmed);
        if (bullet) {
          return (
            <p key={index} className="flex gap-3">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{renderInline(bullet[1])}</span>
            </p>
          );
        }
        const numbered = /^(\d+)\.\s+(.+)$/.exec(trimmed);
        if (numbered) {
          return (
            <p key={index} className="flex gap-3">
              <span className="font-extrabold text-primary">{numbered[1]}.</span>
              <span>{renderInline(numbered[2])}</span>
            </p>
          );
        }
        return (
          <p key={index} className="text-sm font-medium sm:text-[15px]">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type JsonRecord = Record<string, JsonValue>;

const knownStructuredKeys = new Set([
  "symptoms",
  "old_diagnosis",
  "oldDiagnosis",
  "diagnosis",
  "diagnoses",
  "medication",
  "medications",
  "current_medications",
  "notes",
  "patient_notes",
  "free_text_notes"
]);

function StructuredAssessment({ value, compact = false }: { value: JsonValue; compact?: boolean }) {
  const record: JsonRecord = isRecord(value) ? value : { data: value };
  const symptoms = readArray(record.symptoms).filter(isRecord);
  const diagnoses = readList(record.old_diagnosis ?? record.oldDiagnosis ?? record.diagnosis ?? record.diagnoses);
  const medications = readList(record.medication ?? record.medications ?? record.current_medications);
  const notes = textValue(record.notes ?? record.patient_notes ?? record.free_text_notes);
  const additionalEntries = Object.entries(record).filter(([key, entryValue]) => !knownStructuredKeys.has(key) && hasDisplayValue(entryValue));

  return (
    <div className={clsx("space-y-4", compact && "text-sm")}>
      {symptoms.length > 0 ? (
        <StructuredCard title="الأعراض المسجلة" icon="favorite" tone="danger" compact={compact}>
          <div className="grid gap-3 lg:grid-cols-2">
            {symptoms.map((symptom, index) => {
              const name = textValue(symptom.symptom ?? symptom.name ?? symptom.label ?? symptom.value) || `عرض رقم ${index + 1}`;
              const severity = textValue(symptom.severity);
              const duration = textValue(symptom.duration);
              return (
                <article key={`${name}-${index}`} className="rounded-2xl border border-lightGrey/70 bg-white p-4 dark:bg-surface">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="text-base font-extrabold text-[#1E293B] dark:text-darkBlue" dir="auto">
                      {name}
                    </p>
                    {severity ? <SeverityBadge value={severity} /> : null}
                  </div>
                  {duration ? (
                    <p className="mt-2 text-sm font-semibold text-[#64748B] dark:text-grey" dir="auto">
                      المدة: {duration}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </StructuredCard>
      ) : null}

      {diagnoses.length > 0 ? (
        <StructuredCard title="التشخيصات السابقة" icon="article_outlined" compact={compact}>
          <ChipList items={diagnoses} />
        </StructuredCard>
      ) : null}

      {medications.length > 0 ? (
        <StructuredCard title="الأدوية" icon="description_rounded" compact={compact}>
          <ChipList items={medications} />
        </StructuredCard>
      ) : null}

      {notes ? (
        <StructuredCard title="ملاحظات المريض" icon="chat_bubble_outline_rounded" compact={compact}>
          <p className="rounded-2xl bg-aiSurface/70 p-4 text-sm font-semibold leading-7 text-[#1E293B] dark:bg-surfaceMuted dark:text-darkBlue" dir="auto">
            {notes}
          </p>
        </StructuredCard>
      ) : null}

      {additionalEntries.length > 0 ? (
        <StructuredCard title="بيانات إضافية" icon="description_rounded" compact={compact}>
          <div className="grid gap-3 md:grid-cols-2">
            {additionalEntries.map(([key, entryValue]) => (
              <DataField key={key} label={humanizeKey(key)} value={entryValue} />
            ))}
          </div>
        </StructuredCard>
      ) : null}

      {symptoms.length === 0 && diagnoses.length === 0 && medications.length === 0 && !notes && additionalEntries.length === 0 ? (
        <div className="rounded-2xl bg-white/70 p-5 text-sm font-semibold text-[#64748B] dark:bg-surfaceMuted dark:text-grey">
          لا توجد بيانات منظمة قابلة للعرض في هذا التقرير.
        </div>
      ) : null}
    </div>
  );
}

function StructuredCard({
  title,
  icon,
  tone = "primary",
  compact = false,
  children
}: {
  title: string;
  icon: string;
  tone?: "primary" | "danger";
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-lightGrey/70 bg-white/80 p-4 shadow-[0_4px_12px_rgba(64,123,255,0.06)] dark:bg-surfaceMuted">
      <div className="mb-4 flex items-center gap-3">
        <span
          className={clsx(
            "grid h-10 w-10 place-items-center rounded-[14px]",
            tone === "danger" ? "bg-error/10 text-error" : "bg-aiSurface text-primary dark:bg-primary/10"
          )}
        >
          <Icon name={icon} size={20} />
        </span>
        <h3 className={clsx("font-extrabold text-[#1E293B] dark:text-darkBlue", compact ? "text-base" : "text-lg")}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function SeverityBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const isHigh = ["severe", "critical", "high", "شديد", "خطير"].some((item) => normalized.includes(item));
  const isMedium = ["moderate", "medium", "متوسط"].some((item) => normalized.includes(item));
  const className = isHigh
    ? "bg-error/10 text-error"
    : isMedium
      ? "bg-warning/20 text-[#B45309]"
      : "bg-[#10B981]/10 text-[#10B981]";

  return <span className={clsx("rounded-full px-3 py-1 text-xs font-extrabold", className)}>{severityLabel(value)}</span>;
}

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className="rounded-full border border-primary/10 bg-aiSurface px-3 py-1.5 text-sm font-bold text-primary dark:bg-primary/10" dir="auto">
          {item}
        </span>
      ))}
    </div>
  );
}

function DataField({ label, value }: { label: string; value: JsonValue }) {
  return (
    <div className="min-w-0 rounded-2xl border border-primary/10 bg-white p-4 dark:bg-surface">
      <p className="text-xs font-extrabold text-[#64748B] dark:text-grey">{label}</p>
      <div className="mt-2 text-sm font-semibold leading-7 text-[#1E293B] dark:text-darkBlue">
        <JsonValueView value={value} />
      </div>
    </div>
  );
}

function JsonValueView({ value }: { value: JsonValue }) {
  if (Array.isArray(value)) {
    const items = value.filter(hasDisplayValue);
    if (items.length === 0) return <span className="text-[#94A3B8]">لا توجد بيانات</span>;

    if (items.every((item) => !isRecord(item) && !Array.isArray(item))) {
      return <ChipList items={items.map((item) => formatScalar(item as JsonPrimitive))} />;
    }

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl bg-aiSurface/70 p-3 dark:bg-surfaceMuted">
            <JsonValueView value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(([, entryValue]) => hasDisplayValue(entryValue));
    if (entries.length === 0) return <span className="text-[#94A3B8]">لا توجد بيانات</span>;

    return (
      <div className="space-y-2">
        {entries.map(([key, entryValue]) => (
          <div key={key} className="grid gap-1 rounded-xl bg-aiSurface/70 p-3 dark:bg-surfaceMuted">
            <span className="text-xs font-extrabold text-[#64748B] dark:text-grey">{humanizeKey(key)}</span>
            <JsonValueView value={entryValue} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className="break-words" dir="auto">
      {formatScalar(value)}
    </span>
  );
}

function RawPayload({ title, value }: { title: string; value: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-extrabold text-[#64748B] dark:text-grey">{title}</p>
      <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-aiSurface/70 p-4 text-left text-xs leading-5 text-[#1E293B] dark:bg-surface dark:text-darkBlue" dir="ltr">
        {prettyMaybeJson(value)}
      </pre>
    </div>
  );
}

function renderInline(value: string) {
  const parts = value.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-extrabold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function parseMaybeJson(value?: string | null): JsonValue | null {
  if (!value?.trim()) return null;
  try {
    return JSON.parse(value) as JsonValue;
  } catch {
    return null;
  }
}

function prettyMaybeJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function isRecord(value: JsonValue): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasDisplayValue(value: JsonValue): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasDisplayValue);
  if (isRecord(value)) return Object.values(value).some(hasDisplayValue);
  return true;
}

function readArray(value: JsonValue | undefined): JsonValue[] {
  return Array.isArray(value) ? value : [];
}

function readList(value: JsonValue | undefined): string[] {
  if (value == null) return [];
  if (typeof value === "string") {
    const parsed = parseMaybeJson(value);
    if (parsed && parsed !== value) return readList(parsed);
    return value.trim() ? [value.trim()] : [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => textValue(item)).filter((item): item is string => Boolean(item));
  }
  const text = textValue(value);
  return text ? [text] : [];
}

function textValue(value: JsonValue | undefined): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return `${value}`;
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (Array.isArray(value)) return readList(value).join("، ");
  return Object.entries(value)
    .filter(([, entryValue]) => hasDisplayValue(entryValue))
    .map(([key, entryValue]) => `${humanizeKey(key)}: ${textValue(entryValue)}`)
    .join("، ");
}

function formatScalar(value: JsonPrimitive): string {
  if (value == null) return "لا توجد بيانات";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  return `${value}`;
}

function severityLabel(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized === "severe") return "شديد";
  if (normalized === "moderate") return "متوسط";
  if (normalized === "mild") return "خفيف";
  if (normalized === "critical") return "حرج";
  if (normalized === "high") return "مرتفع";
  if (normalized === "medium") return "متوسط";
  if (normalized === "low") return "منخفض";
  return value;
}

function humanizeKey(key: string): string {
  const labels: Record<string, string> = {
    age: "العمر",
    sex: "النوع",
    gender: "النوع",
    height_cm: "الطول",
    weight_kg: "الوزن",
    demographics: "البيانات الشخصية",
    history: "التاريخ المرضي",
    known_cardiac: "أمراض قلبية معروفة",
    prior_workup: "فحوصات سابقة",
    symptoms: "الأعراض",
    symptom: "العرض",
    severity: "الشدة",
    duration: "المدة",
    red_flags: "علامات الخطر",
    old_diagnosis: "التشخيصات السابقة",
    medication: "الأدوية",
    notes: "ملاحظات",
    patientInput: "إجابات المريض",
    patientRequestData: "بيانات الطلب"
  };

  return labels[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
