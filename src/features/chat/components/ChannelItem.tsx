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
      ? "text-white bg-white/10"
      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
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
