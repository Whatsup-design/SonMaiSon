import React from "react"
import { cn } from "../../../utils/cn"
import type { Channel } from "../types/chat.types"
import { Hash, Volume2 } from "lucide-react"

interface ChannelItemProps {
  channel: Channel
  isActive: boolean
  onClick: () => void
}

export const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  isActive,
  onClick,
}) => {
  const Icon = channel.type === "text" ? Hash : Volume2

  const itemClasses = cn(
    "group flex items-center gap-1.5 px-2 py-1.5",
    "rounded-md cursor-pointer",
    "text-sm font-medium",
    "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)]",
    isActive
      ? "text-slate-900 bg-indigo-50 font-semibold"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
  )

  return (
    <button
      type="button"
      onClick={onClick}
      className={itemClasses}
      aria-label={`${channel.type} channel: ${channel.name}`}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-60" />
      <span className="truncate">{channel.name}</span>
    </button>
  )
}
