import React from "react"
import { cn } from "../../../utils/cn"
import { Search, X, Loader2, MessageSquare } from "lucide-react"
import type { SearchMessage } from "../hooks/useDMSearch"

interface DMSearchPanelProps {
  query: string
  onQueryChange: (q: string) => void
  results: SearchMessage[]
  isLoading: boolean
  error: string | null
  onClose: () => void
  onResultClick: (messageId: string) => void
}

function formatSearchTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (days === 1) {
    return "Yesterday"
  } else if (days < 7) {
    return d.toLocaleDateString([], { weekday: "short" })
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" })
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-indigo-100 text-indigo-700 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

export const DMSearchPanel: React.FC<DMSearchPanelProps> = ({
  query,
  onQueryChange,
  results,
  isLoading,
  error,
  onClose,
  onResultClick,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col",
        "w-72 h-full shrink-0",
        "bg-white rounded-2xl",
        "border border-slate-200",
        "shadow-lg shadow-slate-200/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 flex-1">
          Search Messages
        </h3>
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "flex h-7 w-7 items-center justify-center",
            "rounded-lg text-slate-400",
            "transition-colors duration-150",
            "hover:bg-slate-100 hover:text-slate-600"
          )}
          aria-label="Close search"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Search input */}
      <div className="px-3 py-2">
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2",
            "rounded-xl bg-slate-50",
            "border border-slate-200",
            "focus-within:border-indigo-400",
            "transition-colors duration-150"
          )}
        >
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search this conversation..."
            autoFocus
            className={cn(
              "flex-1 text-sm font-medium text-slate-700",
              "bg-transparent outline-none",
              "placeholder:text-slate-400"
            )}
          />
          {query ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
          </div>
        ) : error ? (
          /* Error */
          <div className="px-3 py-6 text-center">
            <p className="text-sm font-medium text-rose-500">{error}</p>
          </div>
        ) : query.trim() && results.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <MessageSquare className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">
              No messages found
            </p>
          </div>
        ) : (
          /* Results list */
          <div className="flex flex-col gap-1">
            {results.map((msg) => {
              const authorName = msg.author?.displayName || msg.author?.username || "Unknown"
              const initials = authorName.slice(0, 2).toUpperCase()

              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => onResultClick(msg.id)}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 w-full text-left",
                    "rounded-xl",
                    "transition-colors duration-150",
                    "hover:bg-slate-50 active:scale-[0.99]",
                    "cursor-pointer"
                  )}
                >
                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white mt-0.5">
                    {initials}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-slate-700 truncate">
                        {authorName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatSearchTime(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 break-words line-clamp-2 mt-0.5">
                      {highlightMatch(msg.content ?? "", query)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
