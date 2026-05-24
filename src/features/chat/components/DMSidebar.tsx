import React from "react"
import { cn } from "../../../utils/cn"
import type { DMConversationUI } from "../types/chat.types"
import { DMConversationItem } from "./DMConversationItem"
import { UserPanel } from "./UserPanel"
import { Search, Users, Loader2 } from "lucide-react"

interface DMSidebarProps {
  conversations: DMConversationUI[]
  activeConversationId: string | null
  isFriendsActive: boolean
  isLoading: boolean
  onSelectConversation: (conversationId: string | null) => void
  onFriendsClick: () => void
}

export const DMSidebar: React.FC<DMSidebarProps> = ({
  conversations,
  activeConversationId,
  isFriendsActive,
  isLoading,
  onSelectConversation,
  onFriendsClick,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col",
        "h-screen w-60 shrink-0",
        "bg-[#2B2D31]"
      )}
    >
      {/* Search input */}
      <div className="shrink-0 p-2">
        <button
          type="button"
          className={cn(
            "flex w-full items-center gap-2 px-2 py-1.5",
            "rounded-md bg-[#1E1F22]",
            "text-xs font-medium text-slate-400",
            "cursor-pointer hover:text-slate-300",
            "transition-colors duration-150"
          )}
        >
          <span className="flex-1 text-left truncate">Find or start a conversation</span>
          <Search className="h-3.5 w-3.5 shrink-0" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin">
        {/* Friends nav */}
        <button
          type="button"
          onClick={onFriendsClick}
          className={cn(
            "flex w-full items-center gap-3 px-2 py-2 mb-1",
            "rounded-md cursor-pointer",
            "text-sm font-medium",
            "transition-colors duration-150",
            isFriendsActive
              ? "bg-white/10 text-white"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <Users className="h-5 w-5 shrink-0" />
          <span>Friends</span>
        </button>

        {/* DM section header */}
        <h3 className="px-2 pt-4 pb-1.5 text-[11px] font-semibold tracking-[0.02em] uppercase text-slate-400">
          Direct Messages
        </h3>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-4 text-xs font-medium text-slate-500 text-center">
            No conversations yet
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {conversations.map((convo) => (
              <DMConversationItem
                key={convo.id}
                conversation={convo}
                isActive={convo.id === activeConversationId}
                onClick={() => onSelectConversation(convo.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* User panel */}
      <UserPanel />
    </div>
  )
}
