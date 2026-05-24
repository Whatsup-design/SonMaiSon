import React from "react"
import { cn } from "../../../utils/cn"
import type { MemberStatus } from "../types/chat.types"

interface StatusDotProps {
  status: MemberStatus
  size?: "sm" | "md" | "lg"
  className?: string
}

const statusColorMap: Record<MemberStatus, string> = {
  online: "bg-emerald-400",
  idle: "bg-amber-400",
  dnd: "bg-rose-500",
  offline: "bg-slate-500",
}

const sizeMap = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3.5 w-3.5",
}

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = "md",
  className,
}) => {
  return (
    <span
      className={cn(
        "inline-block rounded-full ring-2 ring-current",
        sizeMap[size],
        statusColorMap[status],
        className
      )}
      aria-label={status}
    />
  )
}
