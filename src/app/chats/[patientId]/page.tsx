"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ProtectedShell } from "@/components/layout/ProtectedShell";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/apiClient";
import { realtime } from "@/services/websocket";
import type { ChatMessage, PatientResponse, PresenceStatus } from "@/types/models";

export default function ActiveChatPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const id = Number(patientId);
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [presence, setPresence] = useState<PresenceStatus | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const [history, patients, nextPresence] = await Promise.all([
        api.chatHistory(user.id, id).catch(() => []),
        api.patients(user.id),
        api.presence(id).catch(() => null)
      ]);
      setMessages(history);
      setPatient(patients.find((item) => item.id === id) ?? null);
      setPresence(nextPresence);
      const hasUndelivered = history.some(
        (message) => message.senderId === id && message.receiverId === user.id && !message.delivered
      );
      if (hasUndelivered) void api.markChatDelivered(id, user.id).catch(() => undefined);
      void api.markChatRead(id, user.id).catch(() => undefined);
      void api.deleteChatNotifications(user.id, id).catch(() => undefined);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    if (!user) return;
    const off = realtime.onMessage((message) => {
      if (
        (message.senderId === id && message.receiverId === user.id) ||
        (message.senderId === user.id && message.receiverId === id)
      ) {
        setMessages((items) => [...items, message]);
        if (message.senderId === id) void api.markChatDelivered(id, user.id).catch(() => undefined);
      }
    });
    const presenceTimer = window.setInterval(() => {
      api.presence(id).then(setPresence).catch(() => undefined);
    }, 15000);
    return () => {
      off();
      window.clearInterval(presenceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, id]);

  function send(event: FormEvent) {
    event.preventDefault();
    if (!user || !content.trim()) return;
    const message: ChatMessage = {
      senderId: user.id,
      receiverId: id,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      delivered: false,
      senderName: user.fullName
    };
    setMessages((items) => [...items, message]);
    realtime.sendChat(message);
    setContent("");
  }

  return (
    <ProtectedShell>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#F4F7FA]">
        <header className="flex items-center gap-4 rounded-b-3xl bg-white px-6 py-4 shadow-soft">
          <Link href="/chats" className="text-primary">
            <Icon name="arrow_back" size={22} />
          </Link>
          <Avatar name={patient?.fullName} imageUrl={patient?.profileImageUrl} size={44} />
          <div>
            <h1 className="text-base font-bold text-darkBlue">{patient?.fullName ?? `Patient #${id}`}</h1>
            <p className={`text-xs font-semibold ${presence?.online ? "text-accentTeal" : "text-grey"}`}>
              {presence?.online ? "Online" : "Offline"}
            </p>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4">
          {loading ? <Spinner label="Loading chat..." /> : null}
          {!loading && messages.length === 0 ? (
            <EmptyState icon="mark_chat_unread_rounded" title="No messages yet" description="Send a message to start the conversation!" />
          ) : null}
          <div className="space-y-3">
            {user && messages.map((message, index) => <MessageBubble key={`${message.timestamp}-${index}`} message={message} currentUserId={user.id} />)}
          </div>
        </div>
        <form onSubmit={send} className="flex gap-3 bg-[#F4F7FA] p-4">
          <input
            className="min-h-[52px] flex-1 rounded-[30px] border border-lightGrey/50 bg-white px-5 shadow-soft"
            placeholder="Type a message..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
          <button className="gradient-primary grid h-[52px] w-[52px] place-items-center rounded-full text-white shadow-button" aria-label="Send">
            <Icon name="send_rounded" size={22} />
          </button>
        </form>
      </div>
    </ProtectedShell>
  );
}
