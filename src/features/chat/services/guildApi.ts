import { fetchApi } from "../../../lib/api"
import type {
  GuildResponse,
  GuildListItemResponse,
  GuildDetailResponse,
  GuildChannelResponse,
  ChannelMessageResponse,
} from "../types/chat.types"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function fetchGuilds(token: string): Promise<GuildListItemResponse[]> {
  const res = await fetchApi<ApiResponse<GuildListItemResponse[]>>("/guilds", { token })
  // data is [{ guild, membership }, ...]
  if (Array.isArray(res.data)) return res.data
  return []
}

export async function createGuild(
  token: string,
  name: string,
  iconUrl?: string
): Promise<GuildResponse> {
  const res = await fetchApi<ApiResponse<GuildResponse>>("/guilds", {
    token,
    method: "POST",
    body: JSON.stringify({ name, iconUrl: iconUrl ?? null }),
  })
  return res.data
}

export async function fetchGuildDetails(
  token: string,
  guildId: string
): Promise<GuildDetailResponse> {
  const res = await fetchApi<ApiResponse<GuildDetailResponse>>(
    `/guilds/${guildId}`,
    { token }
  )
  return res.data
}

export async function fetchChannels(
  token: string,
  guildId: string
): Promise<GuildChannelResponse[]> {
  const res = await fetchApi<ApiResponse<GuildChannelResponse[]>>(
    `/guilds/${guildId}/channels`,
    { token }
  )
  return res.data
}

export async function createChannel(
  token: string,
  guildId: string,
  name: string,
  type: string,
  position: number
): Promise<GuildChannelResponse> {
  const res = await fetchApi<ApiResponse<GuildChannelResponse>>(
    `/guilds/${guildId}/channels`,
    {
      token,
      method: "POST",
      body: JSON.stringify({ name, type, position }),
    }
  )
  return res.data
}

export async function leaveGuild(
  token: string,
  guildId: string
): Promise<void> {
  await fetchApi<ApiResponse<null>>(`/guilds/${guildId}/leave`, {
    token,
    method: "POST",
  })
}

export async function fetchChannelMessages(
  token: string,
  channelId: string,
  limit = 50
): Promise<ChannelMessageResponse[]> {
  const res = await fetchApi<ApiResponse<ChannelMessageResponse[]>>(
    `/channels/${channelId}/messages?limit=${limit}`,
    { token }
  )
  return res.data
}

export async function sendMessageREST(
  token: string,
  channelId: string,
  content: string
): Promise<ChannelMessageResponse> {
  const res = await fetchApi<ApiResponse<ChannelMessageResponse>>(
    `/channels/${channelId}/messages`,
    {
      token,
      method: "POST",
      body: JSON.stringify({ content }),
    }
  )
  return res.data
}
