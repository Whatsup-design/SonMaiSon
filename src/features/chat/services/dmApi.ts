import { fetchApi } from "../../../lib/api"
import type {
  DMConversationResponse,
  DMMessageResponse,
} from "../types/chat.types"

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export async function fetchConversations(
  token: string
): Promise<DMConversationResponse[]> {
  const res = await fetchApi<ApiResponse<DMConversationResponse[]>>(
    "/dm/conversations",
    { token }
  )
  return res.data
}

export async function createOrGetConversation(
  token: string,
  targetUserId: number
): Promise<DMConversationResponse> {
  const res = await fetchApi<ApiResponse<DMConversationResponse>>(
    "/dm/conversations",
    {
      token,
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    }
  )
  return res.data
}

export async function fetchDMMessages(
  token: string,
  conversationId: string,
  limit = 50
): Promise<DMMessageResponse[]> {
  const res = await fetchApi<ApiResponse<DMMessageResponse[]>>(
    `/dm/conversations/${conversationId}/messages?limit=${limit}`,
    { token }
  )
  return res.data
}
