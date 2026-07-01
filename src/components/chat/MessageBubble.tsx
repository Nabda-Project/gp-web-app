import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { ChatMessage } from "@/types/models";
import { formatDateTime } from "@/utils/date";

export function MessageBubble({ message, currentUserId }: { message: ChatMessage; currentUserId: number }) {
  const isMe = message.senderId === currentUserId;
  return (
    <div className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe ? <Avatar name={message.senderName} size={24} /> : null}
      <div
        className={`max-w-[75%] rounded-[20px] px-4 py-3 shadow-[0_4px_10px_rgba(0,0,0,0.06)] ${
          isMe
            ? "rounded-br bg-gradient-to-br from-primary to-secondary text-white"
            : "rounded-bl border border-grey/10 bg-white text-darkBlue"
        }`}
      >
        <p className="text-[15px] leading-[1.4]">{message.content}</p>
        <p className={`mt-2 flex items-center justify-end gap-1 text-[11px] font-medium ${isMe ? "text-white/80" : "text-grey/80"}`}>
          {formatDateTime(message.timestamp)}
          {isMe ? <Icon name={message.read ? "remove_red_eye_rounded" : message.delivered ? "done_all_rounded" : "check_rounded"} size={14} /> : null}
        </p>
      </div>
    </div>
  );
}
