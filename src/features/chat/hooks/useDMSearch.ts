import { useState, useEffect, useRef, useCallback } from "react"
import { fetchApi } from "../../../lib/api"

interface SearchMessageAuthor {
  id: number
  username: string
  displayName: string
  avatarUrl: string | null
}

export interface SearchMessage {
  id: string
  conversationId: string
  authorId: number
  content: string
  createdAt: string
  editedAt: string | null
  author: SearchMessageAuthor
}

interface SearchResponse {
  success: boolean
  data: SearchMessage[]
}

interface UseDMSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: SearchMessage[]
  isLoading: boolean
  error: string | null
  clearSearch: () => void
}

const DEBOUNCE_MS = 300

export function useDMSearch(
  conversationId: string | null,
  token: string | null
): UseDMSearchReturn {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Clear everything when conversation changes
  useEffect(() => {
    setQuery("")
    setResults([])
    setError(null)
    setIsLoading(false)
  }, [conversationId])

  // Debounced search
  useEffect(() => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }

    const trimmed = query.trim()

    // If empty query, clear results immediately
    if (!trimmed || !conversationId || !token) {
      setResults([])
      setIsLoading(false)
      setError(null)
      // Cancel in-flight request
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
      return
    }

    setIsLoading(true)
    setError(null)

    debounceRef.current = setTimeout(async () => {
      // Cancel previous in-flight request
      if (abortRef.current) {
        abortRef.current.abort()
      }
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const encoded = encodeURIComponent(trimmed)
        const resp = await fetchApi<SearchResponse>(
          `/dm/conversations/${conversationId}/messages/search?q=${encoded}&limit=20`,
          { token, signal: controller.signal }
        )
        if (!controller.signal.aborted) {
          setResults(resp.data ?? [])
          setIsLoading(false)
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Search failed"
        if (!controller.signal.aborted) {
          setError(message)
          setResults([])
          setIsLoading(false)
        }
      }
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, conversationId, token])

  const clearSearch = useCallback(() => {
    setQuery("")
    setResults([])
    setError(null)
    setIsLoading(false)
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  return { query, setQuery, results, isLoading, error, clearSearch }
}
