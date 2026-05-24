import React from "react"
import { cn } from "../../../utils/cn"
import type { Member } from "../types/chat.types"
import { StatusDot } from "./StatusDot"
import { Shield, Crown } from "lucide-react"

interface MemberCardProps {
  member: Member
}

const roleBadgeMap: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  owner: {
    icon: <Crown className="h-3 w-3" />,
    label: "Owner",
    color: "text-amber-400 bg-amber-400/10",
  },
  admin: {
    icon: <Shield className="h-3 w-3" />,
    label: "Admin",
    color: "text-sky-400 bg-sky-400/10",
  },
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const badge = roleBadgeMap[member.role]

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5",
        "rounded-lg",
        "transition-colors duration-150",
        "hover:bg-slate-100 cursor-pointer"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
          {(member.username ?? "?").slice(0, 2).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 ring-[3px] ring-[var(--color-surface-overlay)] rounded-full">
          <StatusDot status={member.status} size="sm" className="ring-0" />
        </div>
      </div>

      {/* Name + role */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm font-medium text-slate-700">
          {member.username}
        </span>
        {badge ? (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5",
              "text-[10px] font-semibold tracking-wide uppercase",
              badge.color
            )}
          >
            {badge.icon}
            {badge.label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
