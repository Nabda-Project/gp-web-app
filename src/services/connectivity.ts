"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, api } from "@/services/apiClient";
import { tokenStorage } from "@/services/storage";

export type ConnectivityStatus = "online" | "offline" | "backend-down";

const NETWORK_UNREACHABLE_HINTS = ["Cannot reach the backend API", "Network error"];

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status !== undefined) return false;
  return NETWORK_UNREACHABLE_HINTS.some((hint) => error.message.includes(hint));
}

async function probeBackend(): Promise<boolean> {
  if (!tokenStorage.getToken()) return true;
  try {
    await api.me();
    return true;
  } catch (error) {
    if (isNetworkError(error)) return false;
    return true;
  }
}

export function useConnectivity(pollMs = 30_000): { status: ConnectivityStatus; refresh: () => void } {
  const [status, setStatus] = useState<ConnectivityStatus>(() =>
    typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "online"
  );
  const evaluateRef = useRef<() => Promise<void>>(async () => undefined);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const evaluate = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        if (!cancelled) setStatus("offline");
        return;
      }
      const reachable = await probeBackend();
      if (cancelled) return;
      setStatus(reachable ? "online" : "backend-down");
    };

    evaluateRef.current = evaluate;

    const handleOnline = () => void evaluate();
    const handleOffline = () => setStatus("offline");
    const handleFocus = () => void evaluate();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("focus", handleFocus);

    void evaluate();
    timer = setInterval(() => void evaluate(), pollMs);

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("focus", handleFocus);
      if (timer) clearInterval(timer);
    };
  }, [pollMs]);

  const refresh = useCallback(() => {
    void evaluateRef.current();
  }, []);

  return { status, refresh };
}
