import React from "react"
import { cn } from "../../../utils/cn"
import { MemberCard } from "./MemberCard"
import type { Member } from "../types/chat.types"

interface MemberSidebarProps {
  onlineMembers: Member[]
  offlineMembers: Member[]
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  onlineMembers,
  offlineMembers,
}) => {
  return (
    <div
      className={cn(
        "hidden lg:flex flex-col",
        "h-screen w-60 shrink-0",
        "bg-[#2B2D31]",
        "border-l border-[#1F2023]",
        "overflow-y-auto scrollbar-thin"
      )}
    >
      {/* Online members */}
      {onlineMembers.length > 0 ? (
        <div className="px-3 pt-4">
          <h3 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.02em] text-slate-400">
            Online — {onlineMembers.length}
          </h3>
          <div className="flex flex-col gap-0.5">
            {onlineMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Offline members */}
      {offlineMembers.length > 0 ? (
        <div className="px-3 pt-4 pb-4">
          <h3 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.02em] text-slate-400">
            Offline — {offlineMembers.length}
          </h3>
          <div className="flex flex-col gap-0.5">
            {offlineMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
