"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Skeleton";
import { VitalCard } from "@/components/vitals/VitalCard";
import { VitalChart } from "@/components/vitals/VitalChart";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/apiClient";
import { realtime } from "@/services/websocket";
import type { DailySummary, HealthMetric, HourlySummary } from "@/types/models";
import { displayMetric } from "@/utils/format";

export default function PatientVitalsPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const id = Number(patientId);
  const { user } = useAuth();
  const [latest, setLatest] = useState<HealthMetric | null>(null);
  const [data, setData] = useState<Array<DailySummary | HourlySummary>>([]);
  const [range, setRange] = useState<"24H" | "7D" | "30D">("24H");
  const [mode, setMode] = useState<"hr" | "spo2" | "both">("both");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [metric, summary] = await Promise.all([
        api.latestMetric(id),
        range === "24H" ? api.hourlySummary(id, 24) : api.dailySummary(id, range === "7D" ? 7 : 30)
      ]);
      setLatest(metric);
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, id, range]);

  useEffect(() => {
    return realtime.onVitals((incoming) => {
      if (incoming.patientId === id) setLatest(incoming);
    });
  }, [id]);

  return (
    <ProtectedShell>
      <div className="decorated-bg min-h-[calc(100vh-4rem)] p-6 lg:p-8">
        <Link href={`/patients/${id}`} className="text-sm font-bold text-primary">
          Patient Details
        </Link>
        <h1 className="mt-1 text-3xl font-extrabold text-darkBlue">Patient Vitals</h1>
        {loading ? <Spinner /> : null}
        {error && !loading ? <EmptyState icon="error_outline_rounded" title="Failed to load chart data" description={error} actionText="Retry" onAction={load} /> : null}
        {!loading && !error ? (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <VitalCard label="Heart Rate" value={displayMetric(latest?.heartRate)} unit="BPM" icon="favorite" color="#FF5252" />
              <VitalCard label="SpO2" value={displayMetric(latest?.spo2)} unit="%" icon="water_drop" color="#2196F3" />
              <VitalCard label="Battery" value={displayMetric(latest?.batteryLevel)} unit="%" icon="battery_full" color="#4CAF50" />
            </div>
            <Card className="space-y-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-darkBlue">Health Trends</h2>
                  <p className="text-xs text-grey">Chart shows hourly/daily averages.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["24H", "7D", "30D"] as const).map((item) => (
                    <Button key={item} variant={range === item ? "primary" : "outline"} onClick={() => setRange(item)}>
                      {item}
                    </Button>
                  ))}
                  {(["hr", "spo2", "both"] as const).map((item) => (
                    <Button key={item} variant={mode === item ? "secondary" : "outline"} onClick={() => setMode(item)}>
                      {item === "hr" ? "Heart Rate" : item === "spo2" ? "SpO2" : "Both"}
                    </Button>
                  ))}
                </div>
              </div>
              <VitalChart data={data} mode={mode} />
            </Card>
          </div>
        ) : null}
      </div>
    </ProtectedShell>
  );
}
