"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { NotificationTile } from "@/components/notifications/NotificationTile";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList, Spinner } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/services/apiClient";
import type { NotificationItem } from "@/types/models";

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const pageRef = useRef(0);

  const load = useCallback(
    async (nextPage = 0, append = false) => {
      if (!user) return;
      if (append) {
        if (loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const nextItems = await api.notifications(user.id, nextPage, 20);
        setItems((current) => (append ? [...current, ...nextItems] : nextItems));
        pageRef.current = nextPage;
        const more = nextItems.length === 20;
        hasMoreRef.current = more;
        setHasMore(more);
      } finally {
        if (append) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (loadingMoreRef.current || !hasMoreRef.current) return;
        void load(pageRef.current + 1, true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [load]);

  async function open(item: NotificationItem) {
    if (!user) return;
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    void api.markNotificationRead(item.id, user.id).catch(() => undefined);
    if (item.type === "CHAT" && item.relatedId) router.push(`/chats/${item.relatedId}`);
    else if (item.type.startsWith("APPOINTMENT")) router.push("/appointments");
    else if (item.type === "PATIENT_ASSIGNED") router.push("/patients");
  }

  async function remove(item: NotificationItem) {
    if (!user) return;
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    await api.deleteNotification(item.id, user.id).catch(() => undefined);
  }

  async function markAll() {
    if (!user) return;
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    await api.markAllNotificationsRead(user.id).catch(() => undefined);
    showToast({ type: "success", title: "Notifications marked as read" });
  }

  async function deleteAll() {
    if (!user || !window.confirm("Delete all notifications?")) return;
    setItems([]);
    await api.deleteAllNotifications(user.id).catch(() => undefined);
  }

  return (
    <ProtectedShell>
      <div className="decorated-bg min-h-[calc(100vh-4rem)] p-6 lg:p-8">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-extrabold text-darkBlue">Notifications</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={markAll}>
              Mark all
            </Button>
            <Button variant="danger" icon="delete_sweep_rounded" onClick={deleteAll}>
              Delete all
            </Button>
          </div>
        </header>
        {loading ? <SkeletonList count={8} avatar={false} /> : null}
        {!loading && items.length === 0 ? (
            <EmptyState icon="notifications_off_rounded" title="No notifications" description="When you receive alerts or messages, they will appear here." actionText="Refresh" onAction={() => load()} />
        ) : null}
        <div className="space-y-3">
          {items.map((item) => (
            <NotificationTile key={item.id} item={item} onOpen={open} onDelete={remove} />
          ))}
        </div>
        {hasMore ? (
          <div ref={sentinelRef} className="mt-5 grid place-items-center py-4">
            {loadingMore ? <Spinner label="Loading more..." /> : <span className="h-1 w-1" aria-hidden />}
          </div>
        ) : null}
      </div>
    </ProtectedShell>
  );
}
