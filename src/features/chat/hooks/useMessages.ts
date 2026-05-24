import { useState, useCallback, useEffect } from "react"
import type { Message, ChannelMessageResponse } from "../types/chat.types"
import { fetchChannelMessages, sendMessageREST } from "../services/guildApi"
import { getSocket, getRawSocket } from "../services/socketManager"

function toMessage(raw: ChannelMessageResponse): Message {
  const displayName = raw.author.displayName || raw.author.username || `User ${raw.authorId}`
  return {
    id: raw.id,
    channelId: raw.channelId,
    authorId: String(raw.authorId),
    authorName: displayName,
    content: raw.content,
    timestamp: raw.createdAt,
    isEdited: raw.editedAt !== null,
  }
}

interface UseMessagesReturn {
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

export function useMessages(
  token: string | null,
  channelId: string | null
): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch history + join socket room when channel changes
  useEffect(() => {
    if (!channelId || !token) {
      setMessages([])
      return
    }

    let cancelled = false

    // Clear old messages immediately so only the loader shows
    setMessages([])
    setIsLoadingMore(true)
    setError(null)

    // Fetch message history via REST
    fetchChannelMessages(token, channelId)
      .then((rawMessages) => {
        if (cancelled) return
        setMessages(rawMessages.map(toMessage))

        // After successful load, join the socket room
        const socket = getSocket(token)
        socket.emit("channel:join", { channelId })
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load messages")
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMore(false)
      })

    // Set up socket listeners
    const socket = getSocket(token)

    const handleNewMessage = (raw: ChannelMessageResponse) => {
      if (raw.channelId !== channelId) return

      const newMsg = toMessage(raw)
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      setIsSending(false)
    }

    const handleError = (err: { code: string; message: string }) => {
      setError(err.message)
      setIsSending(false)
    }

    socket.on("channel:message:new", handleNewMessage)
    socket.on("channel:error", handleError)

    return () => {
      cancelled = true
      socket.off("channel:message:new", handleNewMessage)
      socket.off("channel:error", handleError)
    }
  }, [channelId, token])

  // Send — prefer socket, fallback to REST if disconnected
  const sendMessage = useCallback(
    (content: string) => {
      if (!channelId || !token || !content.trim()) return
      if (content.trim().length > 4000) return

      setIsSending(true)

      const socket = getRawSocket()

      if (socket?.connected) {
        socket.emit("channel:message:send", {
          channelId,
          content: content.trim(),
        })
      } else {
        // REST fallback
        sendMessageREST(token, channelId, content.trim())
          .then((raw) => {
            const msg = toMessage(raw)
            setMessages((prev) => {
              if (prev.some((m) => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          })
          .catch((err) => {
            setError(err instanceof Error ? err.message : "Failed to send message")
          })
          .finally(() => setIsSending(false))
      }
    },
    [channelId, token]
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
