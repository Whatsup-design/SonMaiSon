import React, { useState, useCallback } from "react"
import { cn } from "../../../utils/cn"
import { SendHorizonal, PlusCircle, Loader2 } from "lucide-react"

interface MessageInputProps {
  channelName: string
  isSending?: boolean
  onSend: (content: string) => void
}

export const MessageInput: React.FC<MessageInputProps> = ({
  channelName,
  isSending = false,
  onSend,
}) => {
  const [value, setValue] = useState("")

  const handleSubmit = useCallback(() => {
    if (!value.trim() || isSending) return
    onSend(value)
    setValue("")
  }, [value, onSend, isSending])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="shrink-0 px-4 pb-6 pt-1">
      <div
        className={cn(
          "flex items-end gap-2 px-4 py-2.5",
          "rounded-xl bg-[var(--color-surface-input)]",
          "border border-slate-200",
          "focus-within:border-white/[0.12]"
        )}
      >
        {/* Attachment button */}
        <button
          type="button"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center",
            "rounded-md text-slate-400",
            "transition-colors duration-150",
            "hover:text-slate-800"
          )}
          aria-label="Add attachment"
        >
          <PlusCircle className="h-5 w-5" />
        </button>

        {/* Text area */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          disabled={isSending}
          className={cn(
            "flex-1 resize-none",
            "max-h-32 min-h-[32px] py-1",
            "text-sm font-medium text-slate-700",
            "bg-transparent outline-none",
            "placeholder:text-slate-400",
            "disabled:opacity-50"
          )}
        />

        {/* Sending indicator / Send button */}
        {isSending ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!value.trim()}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center",
              "rounded-md",
              "transition-all duration-150",
              value.trim()
                ? "text-slate-800 bg-indigo-500 hover:bg-indigo-600 active:scale-95"
                : "text-slate-400 cursor-default"
            )}
            aria-label="Send message"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
