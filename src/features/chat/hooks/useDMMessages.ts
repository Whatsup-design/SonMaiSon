import { useState, useCallback, useEffect } from "react"
import type { Message, DMMessageResponse } from "../types/chat.types"
import { fetchDMMessages } from "../services/dmApi"
import { getSocket } from "../services/socketManager"

function toMessage(raw: DMMessageResponse): Message {
  const displayName = raw.author.display_name || raw.author.username
  return {
    id: raw.id,
    channelId: raw.conversationId,
    authorId: String(raw.authorId),
    authorName: displayName,
    content: raw.content,
    timestamp: raw.createdAt,
    isEdited: raw.editedAt !== null,
  }
}

interface UseDMMessagesReturn {
  messages: Message[]
  hasMore: boolean
  isLoadingMore: boolean
  isSending: boolean
  loadMore: () => void
  sendMessage: (content: string) => void
  editMessage: (messageId: string, newContent: string) => void
  deleteMessage: (messageId: string) => void
  error: string | null
}

export function useDMMessages(
  conversationId: string | null,
  token: string | null,
  _currentNumericUserId: number | null
): UseDMMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load messages + join socket room when conversation changes
  useEffect(() => {
    if (!conversationId || !token) {
      setMessages([])
      return
    }

    let cancelled = false

    // Clear old messages immediately so only the loader shows
    setMessages([])
    setIsLoadingMore(true)
    setError(null)

    // Fetch message history via REST
    fetchDMMessages(token, conversationId)
      .then((rawMessages) => {
        if (cancelled) return
        setMessages(rawMessages.map(toMessage))
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load messages")
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMore(false)
      })

    // Join socket room
    const socket = getSocket(token)
    socket.emit("dm:join", { conversationId })

    // Listen for new messages — server-confirmed only, no optimistic reconciliation
    const handleNewMessage = (raw: DMMessageResponse) => {
      if (raw.conversationId !== conversationId) return

      const newMsg = toMessage(raw)

      setMessages((prev) => {
        // Deduplicate by server message ID
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      // Server confirmed a message — clear sending indicator
      setIsSending(false)
    }

    const handleError = (err: { code: string; message: string }) => {
      setError(err.message)
      setIsSending(false)
    }

    socket.on("dm:message:new", handleNewMessage)
    socket.on("dm:error", handleError)

    return () => {
      cancelled = true
      socket.off("dm:message:new", handleNewMessage)
      socket.off("dm:error", handleError)
    }
  }, [conversationId, token])

  // Send — just emit, wait for server to confirm via dm:message:new
  const sendMessage = useCallback(
    (content: string) => {
      if (!conversationId || !token || !content.trim()) return
      if (content.trim().length > 4000) return

      setIsSending(true)

      const socket = getSocket(token)
      socket.emit("dm:message:send", {
        conversationId,
        content: content.trim(),
      })
    },
    [conversationId, token]
  )

  // Edit/delete are local-only (no backend endpoints specified)
  const editMessage = useCallback(
    (messageId: string, newContent: string) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent.trim(), isEdited: true }
            : msg
        )
      )
    },
    []
  )

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
  }, [])

  return {
    messages,
    hasMore: false,
    isLoadingMore,
    isSending,
    loadMore: () => {},
    sendMessage,
    editMessage,
    deleteMessage,
    error,
  }
}
