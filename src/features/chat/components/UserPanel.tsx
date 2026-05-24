import React from "react"
import { cn } from "../../../utils/cn"
import { StatusDot } from "./StatusDot"
import { Settings, Mic, Headphones } from "lucide-react"
import { currentUser } from "../data/mockData"

export const UserPanel: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-2 py-2 bg-[#232428]">
      {/* Avatar + info */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="relative shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5865F2] text-xs font-semibold text-white">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 ring-[3px] ring-[#232428] rounded-full">
            <StatusDot status={currentUser.status} size="sm" className="ring-0" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-white leading-tight">
            {currentUser.username}
          </span>
          <span className="truncate text-[11px] font-medium text-slate-400 leading-tight">
            Online
          </span>
        </div>
      </div>

      {/* Action icons */}
      <div className="flex items-center gap-0.5">
        {[Mic, Headphones, Settings].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className={cn(
              "flex h-8 w-8 items-center justify-center",
              "rounded-md text-slate-400",
              "transition-colors duration-150",
              "hover:bg-white/10 hover:text-slate-200"
            )}
            aria-label={Icon.displayName ?? "action"}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  )
}
