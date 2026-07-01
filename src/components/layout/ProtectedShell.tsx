"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Skeleton";
import { ConnectivityGate } from "@/components/layout/ConnectivityGate";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useConnectivity } from "@/services/connectivity";
import clsx from "@/utils/clsx";

const nav = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/patients", icon: "people", label: "Patients" },
  { href: "/chats", icon: "chat", label: "Chats" },
  { href: "/appointments", icon: "calendar_month", label: "Appointments" },
  { href: "/notifications", icon: "notifications", label: "Notifications" },
  { href: "/profile", icon: "person", label: "Profile" },
  { href: "/settings", icon: "settings", label: "Settings" }
];

export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { status: connectivity, refresh: refreshConnectivity } = useConnectivity();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, router, user]);

  if (loading) return <Spinner label="Checking session..." />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-darkBlue transition-colors lg:flex">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-lightGrey/70 bg-white px-4 py-6 transition-colors dark:bg-surface lg:flex">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/nabda-logo.svg" alt="NABDA" className="h-12 w-12" />
          <div>
            <p className="text-lg font-extrabold text-darkBlue">NABDA</p>
            <p className="text-xs font-semibold text-grey">Doctor Portal</p>
          </div>
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition",
                  active ? "bg-primary/10 text-primary" : "text-grey hover:bg-primary/5 hover:text-primary dark:hover:bg-primary/10"
                )}
              >
                <Icon name={item.icon} size={22} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button
          variant="danger"
          icon="logout_rounded"
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) logout();
          }}
        >
          Logout
        </Button>
      </aside>
      <main className="min-h-screen flex-1 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-lightGrey/60 bg-white/85 px-4 backdrop-blur transition-colors dark:bg-surface/85 lg:px-8">
          <div className="lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/nabda-logo.svg" alt="NABDA" className="h-10 w-10" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-grey">Welcome back</p>
            <p className="text-base font-extrabold text-darkBlue">Dr. {user.fullName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition hover:bg-primary/15"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Icon name={isDarkMode ? "light_mode" : "dark_mode"} size={22} />
            </button>
            <Link className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary" href="/notifications">
              <Icon name="notifications_outlined" size={22} />
            </Link>
            <Link href="/profile" className="flex items-center gap-3">
              <Avatar name={user.fullName} imageUrl={user.profileImageUrl} size={42} fallbackIcon="medical_services" />
            </Link>
          </div>
        </header>
        <div className="lg:hidden">
          <nav className="fixed bottom-4 left-4 right-4 z-30 grid grid-cols-5 rounded-[30px] border border-lightGrey/60 bg-white p-2 shadow-[0_10px_30px_rgba(64,123,255,0.15)] transition-colors dark:bg-surface">
            {nav.slice(0, 5).map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.href} href={item.href} className={clsx("grid place-items-center rounded-2xl p-2", active ? "bg-primary/10 text-primary" : "text-grey")}>
                  <Icon name={item.icon} size={22} />
                </Link>
              );
            })}
          </nav>
        </div>
        {children}
      </main>
      <ConnectivityGate status={connectivity} onRetry={refreshConnectivity} />
    </div>
  );
}
