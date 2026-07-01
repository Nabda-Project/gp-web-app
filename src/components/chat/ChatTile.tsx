"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { ChatContact } from "@/types/models";
import { formatDateTime } from "@/utils/date";

export function ChatTile({ contact }: { contact: ChatContact }) {
  return (
    <Link href={`/chats/${contact.partnerId}`} className="flex items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <Avatar name={contact.partnerName} imageUrl={contact.partnerProfileImageUrl} size={52} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-bold text-darkBlue">{contact.partnerName}</span>
        <span className="block truncate text-[13px] text-grey">{contact.lastMessage || "No messages yet"}</span>
      </span>
      <span className="text-right">
        <span className="block text-[11px] text-grey">{contact.lastMessageTimestamp ? formatDateTime(contact.lastMessageTimestamp) : ""}</span>
        {contact.unreadCount > 0 ? (
          <span className="mt-2 inline-flex rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white">{contact.unreadCount}</span>
        ) : null}
      </span>
    </Link>
  );
}
