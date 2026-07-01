"use client";

import { Icon } from "@/components/ui/Icon";
import type { ConnectivityStatus } from "@/services/connectivity";

interface Props {
  status: ConnectivityStatus;
  onRetry: () => void;
}

export function ConnectivityGate({ status, onRetry }: Props) {
  if (status === "online") return null;

  const isOffline = status === "offline";
  const title = isOffline ? "You are offline" : "Cannot reach the server";
  const description = isOffline
    ? "Check your internet connection. The app will resume automatically when you are back online."
    : "The NABDA backend is not responding right now. Please try again in a moment.";
  const icon = isOffline ? "wifi_off" : "cloud_off";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-darkBlue/60 px-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon name={icon} size={32} />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-darkBlue">{title}</h2>
        <p className="mt-2 text-sm text-grey">{description}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          Retry now
        </button>
      </div>
    </div>
  );
}
