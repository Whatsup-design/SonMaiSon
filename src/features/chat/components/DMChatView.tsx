import React from "react"
import { cn } from "../../../utils/cn"
import type { DMConversationUI } from "../types/chat.types"
import { useDMMessages } from "../hooks/useDMMessages"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { Menu, Phone, Loader2 } from "lucide-react"
import type { CallState } from "../hooks/useVoiceCall"

interface DMChatViewProps {
  conversation: DMConversationUI
  token: string | null
  currentNumericUserId: number | null
  callState: CallState
  onStartCall: (conversationId: string, peerName: string) => Promise<void>
  onOpenMobileSidebar: () => void
}

export const DMChatView: React.FC<DMChatViewProps> = ({
  conversation,
  token,
  currentNumericUserId,
  callState,
  onStartCall,
  onOpenMobileSidebar,
}) => {
  const {
    messages,
    hasMore,
    isLoadingMore,
    isSending,
    loadMore,
    sendMessage,
    editMessage,
    deleteMessage,
    error,
  } = useDMMessages(conversation.id, token, currentNumericUserId)

  const initials = (conversation.recipientDisplayName ?? "?")
    .slice(0, 2)
    .toUpperCase()

  const handleStartCall = async () => {
    await onStartCall(conversation.id, conversation.recipientDisplayName)
  }

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#313338]">
      {/* Header — friend info + call button */}
      <div
        className={cn(
          "flex h-12 items-center gap-3 px-4",
          "border-b border-[#1F2023]",
          "shrink-0"
        )}
      >
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center",
            "rounded-md text-slate-400",
            "transition-colors duration-150",
            "hover:bg-white/10 hover:text-white",
            "md:hidden"
          )}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Friend avatar */}
        <div className="shrink-0">
          {conversation.recipientAvatarUrl ? (
            <img
              src={conversation.recipientAvatarUrl}
              alt={conversation.recipientDisplayName}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5865F2] text-[10px] font-semibold text-white">
              {initials}
            </div>
          )}
        </div>

        <span className="flex-1 text-base font-semibold text-white truncate">
          {conversation.recipientDisplayName}
        </span>

        {/* Voice call button */}
        <button
          type="button"
          onClick={handleStartCall}
          disabled={callState !== "idle"}
          className={cn(
            "flex h-8 w-8 items-center justify-center",
            "rounded-md transition-colors duration-150",
            callState === "idle"
              ? "text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
              : "text-slate-600 cursor-not-allowed"
          )}
          aria-label="Start voice call"
        >
          <Phone className="h-5 w-5" />
        </button>
      </div>

      {/* Error state */}
      {error ? (
        <div className="px-4 py-3 bg-rose-500/10 border-b border-rose-500/20">
          <p className="text-sm font-medium text-rose-400">{error}</p>
        </div>
      ) : null}

      {/* Loading state */}
      {isLoadingMore && messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Messages */}
          <MessageList
            messages={messages}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            currentUserId={String(currentNumericUserId ?? "")}
            onLoadMore={loadMore}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
          />

          {/* Input */}
          <MessageInput
            channelName={conversation.recipientDisplayName}
            isSending={isSending}
            onSend={sendMessage}
          />
        </>
      )}
    </div>
  )
}
