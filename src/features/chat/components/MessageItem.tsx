import React, { useState, useCallback } from "react"
import { cn } from "../../../utils/cn"
import type { Message } from "../types/chat.types"
import { Pencil, Trash2, X, Check } from "lucide-react"

interface MessageItemProps {
  message: Message
  isCompact: boolean
  currentUserId: string
  onEdit: (messageId: string, newContent: string) => void
  onDelete: (messageId: string) => void
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  if (isToday) return `Today at ${time}`
  if (isYesterday) return `Yesterday at ${time}`
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${time}`
}

function formatCompactTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const MessageItem: React.FC<MessageItemProps> = React.memo(function MessageItem({
  message,
  isCompact,
  currentUserId,
  onEdit,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)

  const isOwnMessage = message.authorId === currentUserId

  const handleSaveEdit = useCallback(() => {
    if (editValue.trim() && editValue.trim() !== message.content) {
      onEdit(message.id, editValue)
    }
    setIsEditing(false)
  }, [editValue, message.id, message.content, onEdit])

  const handleCancelEdit = useCallback(() => {
    setEditValue(message.content)
    setIsEditing(false)
  }, [message.content])

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSaveEdit()
      }
      if (e.key === "Escape") {
        handleCancelEdit()
      }
    },
    [handleSaveEdit, handleCancelEdit]
  )

  const initials = (message.authorName ?? "?").slice(0, 2).toUpperCase()

  // Compact mode — no avatar/name, just indented content with hover timestamp
  if (isCompact) {
    return (
      <div
        data-message-id={message.id}
        className={cn(
          "group relative flex items-start gap-4 px-4 py-0.5",
          "hover:bg-white/[0.02]"
        )}
      >
        {/* Hover timestamp in the gutter */}
        <span className="w-10 shrink-0 pt-0.5 text-right text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
          {formatCompactTime(message.timestamp)}
        </span>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <EditRow
              editValue={editValue}
              onChangeValue={setEditValue}
              onKeyDown={handleEditKeyDown}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <p className="text-sm font-normal text-slate-600 break-words">
              {message.content}
              {message.isEdited ? (
                <span className="ml-1 text-[10px] text-slate-400">(edited)</span>
              ) : null}
            </p>
          )}
        </div>

        {/* Hover actions */}
        {isOwnMessage && !isEditing ? (
          <ActionButtons
            onEdit={() => setIsEditing(true)}
            onDelete={() => onDelete(message.id)}
          />
        ) : null}
      </div>
    )
  }

  // Full mode — avatar + name + timestamp
  return (
    <div
      data-message-id={message.id}
      className={cn(
        "group relative flex items-start gap-4 px-4 pt-4 pb-0.5",
        "hover:bg-white/[0.02]"
      )}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white mt-0.5">
        {initials}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-slate-800 hover:underline cursor-pointer">
            {message.authorName}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {isEditing ? (
          <EditRow
            editValue={editValue}
            onChangeValue={setEditValue}
            onKeyDown={handleEditKeyDown}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        ) : (
          <p className="mt-0.5 text-sm font-normal text-slate-600 break-words">
            {message.content}
            {message.isEdited ? (
              <span className="ml-1 text-[10px] text-slate-400">(edited)</span>
            ) : null}
          </p>
        )}
      </div>

      {/* Hover actions */}
      {isOwnMessage && !isEditing ? (
        <ActionButtons
          onEdit={() => setIsEditing(true)}
          onDelete={() => onDelete(message.id)}
        />
      ) : null}
    </div>
  )
})

// ─── Sub-components (private to this file) ───────────────────────

interface ActionButtonsProps {
  onEdit: () => void
  onDelete: () => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onEdit, onDelete }) => (
  <div
    className={cn(
      "absolute -top-3 right-4",
      "flex items-center gap-0.5",
      "rounded-md bg-[var(--color-surface-overlay)] border border-slate-200",
      "opacity-0 group-hover:opacity-100",
      "transition-opacity duration-100",
      "shadow-lg"
    )}
  >
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "flex h-7 w-7 items-center justify-center",
        "text-slate-400 rounded-l-md",
        "transition-colors duration-100",
        "hover:bg-slate-100 hover:text-slate-800"
      )}
      aria-label="Edit message"
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      onClick={onDelete}
      className={cn(
        "flex h-7 w-7 items-center justify-center",
        "text-slate-400 rounded-r-md",
        "transition-colors duration-100",
        "hover:bg-rose-500/20 hover:text-rose-400"
      )}
      aria-label="Delete message"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </div>
)

interface EditRowProps {
  editValue: string
  onChangeValue: (val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSave: () => void
  onCancel: () => void
}

const EditRow: React.FC<EditRowProps> = ({
  editValue,
  onChangeValue,
  onKeyDown,
  onSave,
  onCancel,
}) => (
  <div className="flex items-center gap-2 mt-1">
    <input
      type="text"
      value={editValue}
      onChange={(e) => onChangeValue(e.target.value)}
      onKeyDown={onKeyDown}
      className={cn(
        "flex-1 px-3 py-1.5",
        "text-sm font-medium text-slate-700",
        "bg-[var(--color-surface-input)] rounded-md",
        "border border-slate-200 outline-none",
        "focus:border-indigo-500"
      )}
      autoFocus
    />
    <button
      type="button"
      onClick={onSave}
      className="flex h-7 w-7 items-center justify-center rounded-md text-emerald-400 hover:bg-emerald-400/10 transition-colors duration-100"
      aria-label="Save edit"
    >
      <Check className="h-4 w-4" />
    </button>
    <button
      type="button"
      onClick={onCancel}
      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 transition-colors duration-100"
      aria-label="Cancel edit"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
)
