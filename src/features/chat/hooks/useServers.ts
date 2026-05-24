import { useState, useCallback, useEffect, useRef } from "react"
import type { Server, GuildListItemResponse } from "../types/chat.types"
import { fetchGuilds, createGuild as apiCreateGuild, leaveGuild as apiLeaveGuild } from "../services/guildApi"

// Color palette for guild banners
const BANNER_COLORS = [
  "#5865F2", "#57F287", "#FEE75C", "#EB459E", "#ED4245",
  "#3BA55D", "#FAA61A", "#F47B67", "#E67E22", "#9B59B6",
]

function toServer(item: GuildListItemResponse, index: number): Server {
  const g = item.guild
  return {
    id: g.id,
    name: g.name ?? "Unnamed Server",
    iconUrl: g.icon_url ?? undefined,
    ownerId: String(g.owner_id ?? ""),
    bannerColor: BANNER_COLORS[index % BANNER_COLORS.length],
  }
}

interface UseServersReturn {
  servers: Server[]
  selectedServer: Server | null
  selectServer: (serverId: string) => void
  createServer: (name: string, iconUrl?: string) => Promise<void>
  leaveServer: (guildId: string) => Promise<void>
  /** Current user's role in the selected guild */
  myRole: string | null
  isLoading: boolean
}

export function useServers(token: string | null): UseServersReturn {
  const [servers, setServers] = useState<Server[]>([])
  const [selectedServerId, setSelectedServerId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  // Store the raw items so we can look up membership role
  const rawItemsRef = useRef<GuildListItemResponse[]>([])
  const fetchedForTokenRef = useRef<string | null>(null)

  useEffect(() => {
    if (!token || fetchedForTokenRef.current === token) return
    fetchedForTokenRef.current = token

    setIsLoading(true)
    fetchGuilds(token)
      .then((items) => {
        const safe = Array.isArray(items)
          ? items.filter((i): i is GuildListItemResponse => i?.guild != null)
          : []
        rawItemsRef.current = safe
        setServers(safe.map(toServer))
      })
      .catch((err) => {
        console.error("Failed to fetch guilds:", err)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const selectServer = useCallback((serverId: string) => {
    setSelectedServerId(serverId)
  }, [])

  const createServer = useCallback(
    async (name: string, iconUrl?: string) => {
      if (!token) return
      const raw = await apiCreateGuild(token, name, iconUrl)
      // createGuild returns a single GuildResponse (not wrapped)
      const newItem: GuildListItemResponse = {
        guild: raw,
        membership: { userId: 0, role: "owner", nickname: null, joinedAt: new Date().toISOString() },
      }
      rawItemsRef.current = [...rawItemsRef.current, newItem]
      const newServer = toServer(newItem, servers.length)
      setServers((prev) => [...prev, newServer])
      setSelectedServerId(newServer.id)
    },
    [token, servers.length]
  )

  const leaveServer = useCallback(
    async (guildId: string) => {
      if (!token) return
      await apiLeaveGuild(token, guildId)
      rawItemsRef.current = rawItemsRef.current.filter((i) => i.guild.id !== guildId)
      setServers((prev) => prev.filter((s) => s.id !== guildId))
      if (selectedServerId === guildId) {
        setSelectedServerId("")
      }
    },
    [token, selectedServerId]
  )

  const selectedServer =
    servers.find((s) => s.id === selectedServerId) ?? null

  // Derive the current user's role in the selected guild
  const myRole = selectedServerId
    ? rawItemsRef.current.find((i) => i.guild.id === selectedServerId)?.membership.role ?? null
    : null

  return { servers, selectedServer, selectServer, createServer, leaveServer, myRole, isLoading }
}
