import { useState, useCallback, useMemo, useEffect } from "react"
import type { Channel, GuildChannelResponse } from "../types/chat.types"
import { fetchChannels as apiFetchChannels, createChannel as apiCreateChannel } from "../services/guildApi"

function toChannel(raw: GuildChannelResponse): Channel {
  const type = raw.type === "voice" ? "voice" : "text"
  return {
    id: raw.id,
    serverId: raw.guildId,
    name: raw.name,
    type,
    category: type === "text" ? "Text Channels" : "Voice Channels",
  }
}

interface UseChannelsReturn {
  channels: Channel[]
  selectedChannel: Channel | null
  selectChannel: (channelId: string | null) => void
  createChannel: (name: string) => Promise<void>
  channelsByCategory: Record<string, Channel[]>
  isLoading: boolean
}

export function useChannels(
  token: string | null,
  guildId: string | null
): UseChannelsReturn {
  const [channels, setChannels] = useState<Channel[]>([])
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch channels when guild changes
  useEffect(() => {
    if (!token || !guildId) {
      setChannels([])
      setSelectedChannelId(null)
      return
    }

    setIsLoading(true)
    apiFetchChannels(token, guildId)
      .then((rawChannels) => {
        setChannels(rawChannels.map(toChannel))
      })
      .catch((err) => {
        console.error("Failed to fetch channels:", err)
        setChannels([])
      })
      .finally(() => setIsLoading(false))
  }, [token, guildId])

  const channelsByCategory = useMemo(() => {
    const grouped: Record<string, Channel[]> = {}
    for (const channel of channels) {
      const list = grouped[channel.category] ?? []
      list.push(channel)
      grouped[channel.category] = list
    }
    return grouped
  }, [channels])

  const selectChannel = useCallback((channelId: string | null) => {
    setSelectedChannelId(channelId)
  }, [])

  const createChannel = useCallback(
    async (name: string) => {
      if (!token || !guildId) return
      const raw = await apiCreateChannel(token, guildId, name, "text", channels.length + 1)
      const newChannel = toChannel(raw)
      setChannels((prev) => [...prev, newChannel])
    },
    [token, guildId, channels.length]
  )

  const selectedChannel =
    channels.find((ch) => ch.id === selectedChannelId) ?? null

  return { channels, selectedChannel, selectChannel, createChannel, channelsByCategory, isLoading }
}
