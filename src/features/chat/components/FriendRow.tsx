import React from "react"
import { cn } from "../../../utils/cn"
import type { Friend } from "../types/chat.types"
import { StatusDot } from "./StatusDot"
import { MessageCircle, X, Check } from "lucide-react"

interface FriendRowProps {
  friend: Friend
  onMessage: (friendId: string) => void
  onRemove: (friendId: string) => void
}

export const FriendRow: React.FC<FriendRowProps> = ({
  friend,
  onMessage,
  onRemove,
}) => {
  const initials = friend.username.slice(0, 2).toUpperCase()
  const isPending = friend.friendshipStatus === "pending_incoming" || friend.friendshipStatus === "pending_outgoing"
  const isBlocked = friend.friendshipStatus === "blocked"

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5",
        "rounded-lg",
        "transition-colors duration-150",
        "hover:bg-white/[0.03] cursor-pointer",
        "border-t border-slate-100"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
          {initials}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 ring-[3px] ring-[var(--color-surface-raised)] rounded-full">
          <StatusDot status={friend.status} size="sm" className="ring-0" />
        </div>
      </div>

      {/* Name + status */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {friend.username}
        </p>
        <p className="truncate text-xs font-medium text-slate-400 capitalize">
          {isPending
            ? friend.friendshipStatus === "pending_incoming"
              ? "Incoming request"
              : "Outgoing request"
            : isBlocked
              ? "Blocked"
              : friend.status}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {friend.friendshipStatus === "pending_incoming" ? (
          <>
            <button
              type="button"
              onClick={() => onMessage(friend.id)}
              className={cn(
                "flex h-9 w-9 items-center justify-center",
                "rounded-full bg-[var(--color-surface-overlay)]",
                "text-slate-400",
                "transition-colors duration-150",
                "hover:text-emerald-400"
              )}
              aria-label="Accept friend request"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(friend.id)}
              className={cn(
                "flex h-9 w-9 items-center justify-center",
                "rounded-full bg-[var(--color-surface-overlay)]",
                "text-slate-400",
                "transition-colors duration-150",
                "hover:text-rose-400"
              )}
              aria-label="Decline friend request"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : !isBlocked ? (
          <>
            <button
              type="button"
              onClick={() => onMessage(friend.id)}
              className={cn(
                "flex h-9 w-9 items-center justify-center",
                "rounded-full bg-[var(--color-surface-overlay)]",
                "text-slate-400",
                "transition-colors duration-150",
                "hover:text-slate-900"
              )}
              aria-label="Send message"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(friend.id)}
              className={cn(
                "flex h-9 w-9 items-center justify-center",
                "rounded-full bg-[var(--color-surface-overlay)]",
                "text-slate-400",
                "transition-colors duration-150",
                "hover:text-rose-400"
              )}
              aria-label="Remove friend"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onRemove(friend.id)}
            className={cn(
              "flex h-9 w-9 items-center justify-center",
              "rounded-full bg-[var(--color-surface-overlay)]",
              "text-slate-400",
              "transition-colors duration-150",
              "hover:text-rose-400"
            )}
            aria-label="Unblock"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
