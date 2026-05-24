import React, { useState, useCallback } from "react"
import { cn } from "../../../utils/cn"
import { ServerIcon } from "./ServerIcon"
import { Modal } from "./Modal"
import { MessageCircle, Plus, Compass } from "lucide-react"
import type { Server } from "../types/chat.types"

interface ServerSidebarProps {
  servers: Server[]
  activeServerId: string | null
  isHomeActive: boolean
  onSelectServer: (serverId: string) => void
  onHomeClick: () => void
  onCreateServer: (name: string) => Promise<void>
}

export const ServerSidebar: React.FC<ServerSidebarProps> = ({
  servers,
  activeServerId,
  isHomeActive,
  onSelectServer,
  onHomeClick,
  onCreateServer,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [serverName, setServerName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateSubmit = useCallback(async () => {
    if (!serverName.trim() || isCreating) return
    setIsCreating(true)
    try {
      await onCreateServer(serverName.trim())
      setServerName("")
      setIsCreateOpen(false)
    } catch {
      // Error is handled in the hook
    } finally {
      setIsCreating(false)
    }
  }, [serverName, isCreating, onCreateServer])

  return (
    <>
      <nav
        className={cn(
          "flex flex-col items-center gap-2",
          "h-screen w-[72px] shrink-0 py-3",
          "bg-[#1E1F22] overflow-y-auto",
          "scrollbar-none"
        )}
        aria-label="Server navigation"
      >
        {/* Home / DMs button */}
        <div className="group relative flex items-center justify-center">
          <span
            className={cn(
              "absolute left-0 top-1/2 -translate-x-[2px] -translate-y-1/2",
              "w-1 rounded-r-full bg-white",
              "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isHomeActive ? "h-10" : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"
            )}
          />
          <button
            type="button"
            onClick={onHomeClick}
            className={cn(
              "flex h-12 w-12 items-center justify-center",
              "text-white",
              "transition-all duration-200",
              isHomeActive
                ? "rounded-xl bg-[#5865F2]"
                : "rounded-[24px] bg-[#313338] hover:rounded-xl hover:bg-[#5865F2]"
            )}
            aria-label="Direct Messages"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-auto h-[2px] w-8 rounded-full bg-white/8" />

        {/* Server list */}
        <div className="flex flex-col items-center gap-2">
          {servers.map((server) => (
            <ServerIcon
              key={server.id}
              server={server}
              isActive={server.id === activeServerId}
              onClick={() => onSelectServer(server.id)}
            />
          ))}
        </div>

        {/* Add server */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className={cn(
            "flex h-12 w-12 items-center justify-center",
            "rounded-[24px] bg-[#2B2D31] text-emerald-400",
            "transition-all duration-200",
            "hover:rounded-2xl hover:bg-emerald-500 hover:text-white"
          )}
          aria-label="Add a server"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Explore */}
        <button
          type="button"
          className={cn(
            "flex h-12 w-12 items-center justify-center",
            "rounded-[24px] bg-[#2B2D31] text-emerald-400",
            "transition-all duration-200",
            "hover:rounded-2xl hover:bg-emerald-500 hover:text-white"
          )}
          aria-label="Explore public servers"
        >
          <Compass className="h-6 w-6" />
        </button>
      </nav>

      {/* Create Server Modal */}
      <Modal
        isOpen={isCreateOpen}
        title="Create a Server"
        onClose={() => { setIsCreateOpen(false); setServerName("") }}
      >
        <p className="text-sm text-slate-400 mb-4">
          Give your new server a name. You can always change it later.
        </p>
        <label className="block text-xs font-bold uppercase text-slate-300 mb-2">
          Server Name
        </label>
        <input
          type="text"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreateSubmit() }}
          placeholder="My Awesome Server"
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
          disabled={!serverName.trim() || isCreating}
          className={cn(
            "w-full mt-4 py-2 rounded-md",
            "text-sm font-semibold text-white",
            "transition-colors duration-150",
            serverName.trim() && !isCreating
              ? "bg-[#5865F2] hover:bg-[#4752C4]"
              : "bg-[#5865F2]/50 cursor-not-allowed"
          )}
        >
          {isCreating ? "Creating..." : "Create Server"}
        </button>
      </Modal>
    </>
  )
}
