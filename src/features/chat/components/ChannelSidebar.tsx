import React, { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "../../../utils/cn"
import { ChannelItem } from "./ChannelItem"
import { UserPanel } from "./UserPanel"
import { Modal } from "./Modal"
import { ChevronDown, Plus, LogOut } from "lucide-react"
import type { Channel, Server } from "../types/chat.types"

interface ChannelSidebarProps {
  server: Server
  channelsByCategory: Record<string, Channel[]>
  activeChannelId: string | null
  myRole: string | null
  isOwner: boolean
  onSelectChannel: (channelId: string | null) => void
  onCreateChannel: (name: string) => Promise<void>
  onLeaveServer: () => Promise<void>
}

interface CategorySectionProps {
  name: string
  channels: Channel[]
  activeChannelId: string | null
  canCreate: boolean
  onSelectChannel: (channelId: string | null) => void
  onCreateClick: () => void
}

const CategorySection: React.FC<CategorySectionProps> = ({
  name,
  channels,
  activeChannelId,
  canCreate,
  onSelectChannel,
  onCreateClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="mb-1">
      <div className="flex items-center pt-4 pb-1 px-1">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={cn(
            "flex flex-1 items-center gap-0.5",
            "text-[11px] font-semibold tracking-[0.02em] uppercase",
            "text-slate-400 cursor-pointer",
            "transition-colors duration-150",
            "hover:text-slate-200"
          )}
        >
          <ChevronDown
            className={cn(
              "h-3 w-3 shrink-0 transition-transform duration-200",
              !isExpanded && "-rotate-90"
            )}
          />
          <span className="truncate">{name}</span>
        </button>

        {/* Create channel button — only for owner/admin */}
        {canCreate ? (
          <button
            type="button"
            onClick={onCreateClick}
            className={cn(
              "flex h-4 w-4 items-center justify-center",
              "text-slate-400 cursor-pointer",
              "transition-colors duration-150",
              "hover:text-slate-200"
            )}
            aria-label="Create channel"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {isExpanded ? (
        <div className="flex flex-col gap-0.5 px-1.5">
          {channels.map((channel) => (
            <ChannelItem
              key={channel.id}
              channel={channel}
              isActive={channel.id === activeChannelId}
              onClick={() => onSelectChannel(channel.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  server,
  channelsByCategory,
  activeChannelId,
  myRole,
  isOwner,
  onSelectChannel,
  onCreateChannel,
  onLeaveServer,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [channelName, setChannelName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const canManage = myRole === "owner" || myRole === "admin"

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!isDropdownOpen) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    window.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      window.removeEventListener("keydown", handleKey)
    }
  }, [isDropdownOpen])

  const handleCreateSubmit = useCallback(async () => {
    if (!channelName.trim() || isCreating) return
    setIsCreating(true)
    try {
      await onCreateChannel(channelName.trim())
      setChannelName("")
      setIsCreateOpen(false)
    } catch {
      // handled in hook
    } finally {
      setIsCreating(false)
    }
  }, [channelName, isCreating, onCreateChannel])

  const handleLeave = useCallback(async () => {
    if (isLeaving) return
    setIsLeaving(true)
    try {
      await onLeaveServer()
      setIsDropdownOpen(false)
    } catch {
      // handled in hook
    } finally {
      setIsLeaving(false)
    }
  }, [isLeaving, onLeaveServer])

  return (
    <>
      <div
        className={cn(
          "flex flex-col",
          "h-screen w-60 shrink-0",
          "bg-[#2B2D31]"
        )}
      >
        {/* Server header — dropdown trigger */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((p) => !p)}
            className={cn(
              "flex h-12 w-full items-center justify-between px-4",
              "text-base font-semibold text-white",
              "border-b border-[#1F2023]",
              "transition-colors duration-150",
              "hover:bg-white/5 cursor-pointer"
            )}
          >
            <span className="truncate">{server.name}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen ? (
            <div
              className={cn(
                "absolute left-2 right-2 top-[52px] z-20",
                "rounded-lg bg-[#111214] p-1.5",
                "shadow-xl shadow-black/40",
                "border border-white/5"
              )}
            >
              {/* Leave Server — hidden for owners */}
              {!isOwner ? (
                <button
                  type="button"
                  onClick={handleLeave}
                  disabled={isLeaving}
                  className={cn(
                    "flex w-full items-center gap-2 px-2.5 py-2",
                    "rounded-md text-sm font-medium",
                    "transition-colors duration-150 cursor-pointer",
                    isLeaving
                      ? "text-slate-500 cursor-not-allowed"
                      : "text-rose-400 hover:bg-rose-500/10"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLeaving ? "Leaving..." : "Leave Server"}</span>
                </button>
              ) : (
                <p className="px-2.5 py-2 text-xs text-slate-500">
                  Owners cannot leave the server.
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Channel list */}
        <div className="flex-1 overflow-y-auto px-1 scrollbar-thin">
          {Object.entries(channelsByCategory).map(([category, chans]) => (
            <CategorySection
              key={category}
              name={category}
              channels={chans}
              activeChannelId={activeChannelId}
              canCreate={canManage}
              onSelectChannel={onSelectChannel}
              onCreateClick={() => { setIsCreateOpen(true); setIsDropdownOpen(false) }}
            />
          ))}
        </div>

        {/* User panel */}
        <UserPanel />
      </div>

      {/* Create Channel Modal */}
      <Modal
        isOpen={isCreateOpen}
        title="Create Channel"
        onClose={() => { setIsCreateOpen(false); setChannelName("") }}
      >
        <p className="text-sm text-slate-400 mb-4">
          Create a new text channel for your server.
        </p>
        <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
          Channel Name
        </label>
        <input
          type="text"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreateSubmit() }}
          placeholder="general-chat"
          autoFocus
          className={cn(
            "w-full px-3 py-2 rounded-md",
            "bg-[#1E1F22] text-white text-sm",
            "border border-white/10",
            "outline-none focus:border-[#5865F2]",
            "placeholder:text-slate-500",
            "transition-colors duration-150"
          )}
        />
        <button
          type="button"
          onClick={handleCreateSubmit}
          disabled={!channelName.trim() || isCreating}
          className={cn(
            "w-full mt-4 py-2 rounded-md",
            "text-sm font-semibold text-white",
            "transition-colors duration-150",
            channelName.trim() && !isCreating
              ? "bg-[#5865F2] hover:bg-[#4752C4]"
              : "bg-[#5865F2]/50 cursor-not-allowed"
          )}
        >
          {isCreating ? "Creating..." : "Create Channel"}
        </button>
      </Modal>
    </>
  )
}
