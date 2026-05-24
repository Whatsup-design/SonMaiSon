import React from "react"
import { cn } from "../../../utils/cn"
import type { Channel } from "../types/chat.types"
import { useMessages } from "../hooks/useMessages"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { Hash, Menu, Loader2 } from "lucide-react"

interface ChatViewProps {
  channel: Channel
  token: string | null
  currentUserId: string
  onOpenMobileSidebar: () => void
}

export const ChatView: React.FC<ChatViewProps> = ({
  channel,
  token,
  currentUserId,
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
  } = useMessages(token, channel.id)

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#313338]">
      {/* Header */}
      <div
        className={cn(
          "flex h-12 items-center gap-2 px-4",
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

        <Hash className="h-5 w-5 text-slate-400 shrink-0" />
        <h1 className="text-base font-semibold text-white truncate">
          {channel.name}
        </h1>
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
            currentUserId={currentUserId}
            onLoadMore={loadMore}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
          />

          {/* Input */}
          <MessageInput
            channelName={channel.name}
            isSending={isSending}
            onSend={sendMessage}
          />
        </>
      )}
    </div>
  )
}
