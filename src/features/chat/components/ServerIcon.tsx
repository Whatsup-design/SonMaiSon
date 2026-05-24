import React, { useState } from "react"
import { cn } from "../../../utils/cn"
import type { Server } from "../types/chat.types"

interface ServerIconProps {
  server: Server
  isActive: boolean
  onClick: () => void
}

export const ServerIcon: React.FC<ServerIconProps> = ({
  server,
  isActive,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const initials = (server.name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const iconClasses = cn(
    "relative flex h-12 w-12 items-center justify-center",
    "text-sm font-semibold text-white",
    "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer",
    isActive || isHovered ? "rounded-2xl" : "rounded-[24px]",
    isActive
      ? "rounded-2xl"
      : "hover:rounded-2xl"
  )

  const pillClasses = cn(
    "absolute left-0 top-1/2 -translate-x-[2px] -translate-y-1/2",
    "w-1 rounded-r-full bg-indigo-500",
    "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
    isActive
      ? "h-10"
      : isHovered
        ? "h-5"
        : "h-0 opacity-0"
  )

  return (
    <div className="group relative flex items-center justify-center">
      {/* Left pill indicator */}
      <span className={pillClasses} />

      {/* Server icon */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={iconClasses}
        style={{ backgroundColor: server.bannerColor }}
        aria-label={`Select ${server.name}`}
        title={server.name}
      >
        {initials}
      </button>

      {/* Tooltip */}
      <div
        className={cn(
          "pointer-events-none absolute left-full z-50 ml-4",
          "whitespace-nowrap rounded-lg px-3 py-2",
          "text-sm font-semibold text-white",
          "bg-slate-800 shadow-lg",
          "transition-all duration-150",
          isHovered ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        {server.name}
        {/* Arrow */}
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-y-4 border-r-4 border-y-transparent border-r-slate-900" />
      </div>
    </div>
  )
}
