"use client";

import { useEffect, useState } from "react";
import { ChatTile } from "@/components/chat/ChatTile";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/apiClient";
import type { ChatContact } from "@/types/models";

export default function ChatsPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      setContacts(await api.conversations(user.id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <ProtectedShell>
      <div className="decorated-bg min-h-[calc(100vh-4rem)] p-6 lg:p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-darkBlue">Chats</h1>
          <p className="mt-1 text-sm text-grey">Conversations with assigned patients.</p>
        </header>
        {loading ? <SkeletonList count={8} /> : null}
        {!loading && contacts.length === 0 ? (
          <EmptyState icon="chat_bubble_outline_rounded" title="No conversations yet" description="Start chatting from the Patients tab!" actionText="Refresh" onAction={load} />
        ) : null}
        <div className="grid gap-3 xl:grid-cols-2">
          {contacts.map((contact) => (
            <ChatTile key={contact.partnerId} contact={contact} />
          ))}
        </div>
      </div>
    </ProtectedShell>
  );
}
