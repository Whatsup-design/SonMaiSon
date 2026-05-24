import React, { useRef, useEffect, useLayoutEffect, useCallback } from "react"
import { cn } from "../../../utils/cn"
import type { Message } from "../types/chat.types"
import { MessageItem } from "./MessageItem"
import { Loader2 } from "lucide-react"

interface MessageListProps {
  messages: Message[]
  hasMore: boolean
  isLoadingMore: boolean
  currentUserId: string
  onLoadMore: () => void
  onEditMessage: (messageId: string, newContent: string) => void
  onDeleteMessage: (messageId: string) => void
}

function shouldShowFull(current: Message, previous: Message | undefined): boolean {
  if (!previous) return true
  if (previous.authorId !== current.authorId) return true

  // Show full header if more than 7 minutes between messages
  const gap = new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime()
  return gap > 7 * 60 * 1000
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  hasMore,
  isLoadingMore,
  currentUserId,
  onLoadMore,
  onEditMessage,
  onDeleteMessage,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll restoration refs
  const lastMessageIdRef = useRef<string | null>(null)
  const isRestoringScrollRef = useRef(false)
  const scrollStateRef = useRef({ scrollHeight: 0, scrollTop: 0 })

  // Infinite scroll — observe the sentinel at the top
  useEffect(() => {
    const sentinel = sentinelRef.current
    const container = scrollContainerRef.current
    if (!sentinel || !container) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          handleLoadMore()
        }
      },
      { root: container, threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore])

  // Save scroll state before loading older messages, then trigger loadMore
  const handleLoadMore = useCallback(() => {
    const container = scrollContainerRef.current
    if (container) {
      scrollStateRef.current = {
        scrollHeight: container.scrollHeight,
        scrollTop: container.scrollTop,
      }
      isRestoringScrollRef.current = true
    }
    onLoadMore()
  }, [onLoadMore])

  // Restore scroll position after older messages are prepended (runs before paint)
  useLayoutEffect(() => {
    if (isRestoringScrollRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const { scrollHeight: prevHeight, scrollTop: prevTop } = scrollStateRef.current
      container.scrollTop = prevTop + (container.scrollHeight - prevHeight)
      isRestoringScrollRef.current = false
    }
  }, [messages])

  // Auto-scroll to bottom ONLY when new messages appear at the end
  // (not when older messages are prepended via loadMore)
  useEffect(() => {
    const currentLastId = messages[messages.length - 1]?.id ?? null

    if (currentLastId !== lastMessageIdRef.current) {
      // First load → instant scroll; subsequent new messages → smooth scroll
      const behavior = lastMessageIdRef.current === null ? "auto" : "smooth"
      bottomRef.current?.scrollIntoView({ behavior })
    }

    lastMessageIdRef.current = currentLastId
  }, [messages])

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto scrollbar-thin"
    >
      {/* Sentinel for infinite scroll trigger */}
      <div ref={sentinelRef} className="h-1" />

      {/* Loading spinner */}
      {isLoadingMore ? (
        <div className="flex items-center justify-center py-4">
          <Loader2
            className={cn(
              "h-5 w-5 text-slate-400",
              "animate-spin"
            )}
          />
        </div>
      ) : null}

      {/* "Beginning of channel" indicator */}
      {!hasMore ? (
        <div className="px-4 pt-8 pb-4">
          <h3 className="text-2xl font-bold text-white tracking-[-0.02em]">
            Welcome to the channel!
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-400">
            This is the beginning of the message history.
          </p>
          <div className="mt-4 h-px bg-white/5" />
        </div>
      ) : null}

      {/* Message list */}
      {messages.map((message, index) => {
        const previous = index > 0 ? messages[index - 1] : undefined
        const showFull = shouldShowFull(message, previous)

        return (
          <MessageItem
            key={message.id}
            message={message}
            isCompact={!showFull}
            currentUserId={currentUserId}
            onEdit={onEditMessage}
            onDelete={onDeleteMessage}
          />
        )
      })}

      {/* Scroll anchor */}
      <div ref={bottomRef} className="h-px" />
    </div>
  )
}
