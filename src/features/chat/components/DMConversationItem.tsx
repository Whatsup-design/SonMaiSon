import React from "react"
import { cn } from "../../../utils/cn"
import type { DMConversationUI } from "../types/chat.types"

interface DMConversationItemProps {
  conversation: DMConversationUI
  isActive: boolean
  onClick: () => void
}

export const DMConversationItem: React.FC<DMConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const initials = conversation.recipientDisplayName
    .slice(0, 2)
    .toUpperCase()

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-2 py-1.5",
        "rounded-md cursor-pointer",
        "transition-colors duration-150",
        isActive
          ? "bg-white/10 text-white"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {conversation.recipientAvatarUrl ? (
          <img
            src={conversation.recipientAvatarUrl}
            alt={conversation.recipientDisplayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5865F2] text-xs font-semibold text-white">
            {initials}
          </div>
        )}
      </div>

      {/* Name */}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">
          {conversation.recipientDisplayName}
        </p>
      </div>
    </button>
  )
}
