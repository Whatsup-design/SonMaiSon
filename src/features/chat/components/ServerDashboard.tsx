import React from "react"
import { cn } from "../../../utils/cn"
import type { Server, Member } from "../types/chat.types"
import { MemberCard } from "./MemberCard"
import { Users, Wifi, Hash, Menu } from "lucide-react"

interface ServerDashboardProps {
  server: Server
  members: Member[]
  onlineMembers: Member[]
  offlineMembers: Member[]
  channelCount: number
  onOpenMobileSidebar: () => void
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div
    className={cn(
      "flex items-center gap-3 px-5 py-4",
      "rounded-xl bg-[var(--color-surface-overlay)]",
      "border border-slate-100"
    )}
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-slate-600">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold leading-tight text-slate-800 tracking-tight">
        {value}
      </p>
      <p className="text-xs font-medium text-slate-400">{label}</p>
    </div>
  </div>
)

export const ServerDashboard: React.FC<ServerDashboardProps> = ({
  server,
  members,
  onlineMembers,
  offlineMembers,
  channelCount,
  onOpenMobileSidebar,
}) => {
  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-[var(--color-surface-raised)] rounded-2xl border border-slate-200">
      {/* Header bar */}
      <div
        className={cn(
          "flex h-12 items-center gap-3 px-4",
          "border-b border-slate-200",
          "shrink-0"
        )}
      >
        {/* Mobile hamburger — hidden on md+ */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center",
            "rounded-md text-slate-400",
            "transition-colors duration-150",
            "hover:bg-slate-100 hover:text-slate-900",
            "md:hidden"
          )}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-base font-semibold text-slate-800">
          Welcome to {server.name}
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Banner */}
        <div
          className="relative h-36"
          style={{
            background: `linear-gradient(135deg, ${server.bannerColor}cc 0%, ${server.bannerColor}66 60%, #FFFFFF 100%)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-surface-raised)]" />
          <div className="absolute bottom-4 left-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg"
              style={{ backgroundColor: server.bannerColor }}
            >
              {server.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </div>

        <div className="px-4 pb-8 sm:px-6">
          {/* Server name & description */}
          <div className="mt-4 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-[-0.02em]">
              {server.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-400">
              A community server for collaboration and fun.
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 gap-3 mb-8 sm:grid-cols-3">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Members"
              value={members.length}
            />
            <StatCard
              icon={<Wifi className="h-5 w-5" />}
              label="Online"
              value={onlineMembers.length}
            />
            <StatCard
              icon={<Hash className="h-5 w-5" />}
              label="Channels"
              value={channelCount}
            />
          </div>

          {/* Online members */}
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold tracking-[0.02em] uppercase text-slate-400">
              Online — {onlineMembers.length}
            </h3>
            <div className="rounded-xl bg-[var(--color-surface-overlay)] border border-slate-100 overflow-hidden">
              {onlineMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>

          {/* Offline members */}
          {offlineMembers.length > 0 ? (
            <div>
              <h3 className="mb-3 text-xs font-semibold tracking-[0.02em] uppercase text-slate-400">
                Offline — {offlineMembers.length}
              </h3>
              <div className="rounded-xl bg-[var(--color-surface-overlay)] border border-slate-100 overflow-hidden opacity-60">
                {offlineMembers.map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
