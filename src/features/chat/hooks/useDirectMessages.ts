import { useState, useCallback, useEffect, useRef } from "react"
import type {
  DMConversationUI,
  DMConversationResponse,
  DMParticipantUser,
} from "../types/chat.types"
import { fetchConversations, createOrGetConversation } from "../services/dmApi"

function getRecipient(
  participants: DMConversationResponse["participants"],
  currentUserEmail: string | undefined
): DMParticipantUser | null {
  // Find the participant who is NOT the current user
  // We match by email since our auth user.id is a Supabase UUID, not the numeric DB id
  const other = participants.find((p) => p.user.email !== currentUserEmail)
  return other?.user ?? participants[0]?.user ?? null
}

function getDisplayName(user: DMParticipantUser): string {
  return user.display_name || user.username || user.email
}

function normalizeConversation(
  raw: DMConversationResponse,
  currentUserEmail: string | undefined
): DMConversationUI {
  const recipient = getRecipient(raw.participants, currentUserEmail)
  return {
    id: raw.id,
    recipientUserId: recipient?.id ?? 0,
    recipientDisplayName: recipient ? getDisplayName(recipient) : "Unknown",
    recipientUsername: recipient?.username ?? "unknown",
    recipientAvatarUrl: recipient?.avatar_url ?? null,
    recipientStatus: recipient?.status ?? "offline",
  }
}

interface UseDirectMessagesReturn {
  conversations: DMConversationUI[]
  selectedConversation: DMConversationUI | null
  selectConversation: (conversationId: string | null) => void
  createConversation: (targetUserId: number) => Promise<DMConversationUI | null>
  isLoading: boolean
  error: string | null
  currentNumericUserId: number | null
}

export function useDirectMessages(
  token: string | null,
  currentUserEmail: string | undefined
): UseDirectMessagesReturn {
  const [conversations, setConversations] = useState<DMConversationUI[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentNumericUserId, setCurrentNumericUserId] = useState<
    number | null
  >(null)

  const fetchedForTokenRef = useRef<string | null>(null)

  // Fetch conversations when token is available (re-fetches on token change)
  useEffect(() => {
    if (!token || fetchedForTokenRef.current === token) return
    fetchedForTokenRef.current = token

    setIsLoading(true)
    setError(null)
    fetchConversations(token)
      .then((rawConversations) => {
        const normalized = rawConversations.map((c) =>
          normalizeConversation(c, currentUserEmail)
        )
        setConversations(normalized)

        // Derive current user's numeric ID from the first conversation's participants
        if (rawConversations.length > 0) {
          const me = rawConversations[0].participants.find(
            (p) => p.user.email === currentUserEmail
          )
          if (me) setCurrentNumericUserId(me.user.id)
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load conversations")
      })
      .finally(() => setIsLoading(false))
  }, [token, currentUserEmail])

  const selectConversation = useCallback(
    (conversationId: string | null) => {
      setSelectedConversationId(conversationId)
    },
    []
  )

  const createConversation = useCallback(
    async (targetUserId: number): Promise<DMConversationUI | null> => {
      if (!token) return null
      try {
        const raw = await createOrGetConversation(token, targetUserId)
        const normalized = normalizeConversation(raw, currentUserEmail)

        // Add to list if new
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === normalized.id)
          if (exists) return prev
          return [normalized, ...prev]
        })

        // Derive numeric user id if we haven't yet
        if (!currentNumericUserId) {
          const me = raw.participants.find(
            (p) => p.user.email === currentUserEmail
          )
          if (me) setCurrentNumericUserId(me.user.id)
        }

        return normalized
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create conversation"
        )
        return null
      }
    },
    [token, currentUserEmail, currentNumericUserId]
  )

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) ?? null

  return {
    conversations,
    selectedConversation,
    selectConversation,
    createConversation,
    isLoading,
    error,
    currentNumericUserId,
  }
}
