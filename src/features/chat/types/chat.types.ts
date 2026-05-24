export type MemberStatus = "online" | "idle" | "dnd" | "offline"

export type MemberRole = "owner" | "admin" | "member"

export type ChannelType = "text" | "voice"

export interface Server {
  id: string
  name: string
  iconUrl?: string
  ownerId: string
  bannerColor: string
}

export interface Channel {
  id: string
  serverId: string
  name: string
  type: ChannelType
  category: string
}

export interface Member {
  id: string
  username: string
  avatarUrl?: string
  status: MemberStatus
  role: MemberRole
}

export interface ServerMembership {
  serverId: string
  members: Member[]
}

export interface CurrentUser {
  id: string
  username: string
  email: string
  avatarUrl?: string
  status: MemberStatus
}

export interface Message {
  id: string
  channelId: string
  authorId: string
  authorName: string
  content: string
  timestamp: string
  isEdited: boolean
}

export type FriendshipStatus = "accepted" | "pending_incoming" | "pending_outgoing" | "blocked"

export type FriendsTab = "online" | "all" | "pending" | "blocked"

export interface Friend {
  id: string
  username: string
  avatarUrl?: string
  status: MemberStatus
  friendshipStatus: FriendshipStatus
}

export interface DirectConversation {
  id: string
  recipientId: string
  recipientName: string
  recipientStatus: MemberStatus
  lastMessage: string
  lastMessageAt: string
}

// ─── Backend DM API types ────────────────────────────────────────

export interface DMParticipantUser {
  id: number
  email: string
  username: string
  display_name: string
  avatar_url: string | null
  status: string
}

export interface DMParticipant {
  userId: number
  joinedAt: string
  user: DMParticipantUser
}

export interface DMConversationResponse {
  id: string
  participants: DMParticipant[]
}

export interface DMMessageAuthor {
  id: number
  username: string
  display_name: string
  avatar_url: string | null
}

export interface DMMessageResponse {
  id: string
  conversationId: string
  authorId: number
  content: string
  createdAt: string
  editedAt: string | null
  author: DMMessageAuthor
}

// Normalized DM conversation for UI
export interface DMConversationUI {
  id: string
  recipientUserId: number
  recipientDisplayName: string
  recipientUsername: string
  recipientAvatarUrl: string | null
  recipientStatus: string
}

// ─── Backend Guild API types ─────────────────────────────────────

export interface GuildResponse {
  id: string
  name: string
  icon_url: string | null
  owner_id: number
  created_at: string
  updated_at: string
}

export interface GuildMembershipResponse {
  userId: number
  role: string
  nickname: string | null
  joinedAt: string
}

// GET /guilds returns array of { guild, membership }
export interface GuildListItemResponse {
  guild: GuildResponse
  membership: GuildMembershipResponse
}

export interface GuildChannelResponse {
  id: string
  guildId: string
  name: string
  type: string
  position: number
  createdAt: string
}

export interface GuildMemberUser {
  id: number
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  status: string
}

export interface GuildMemberResponse {
  userId: number
  role: string
  joinedAt: string
  user: GuildMemberUser
}

export interface GuildDetailResponse {
  id: string
  name: string
  icon_url: string | null
  owner_id: number
  created_at: string
  members: GuildMemberResponse[]
  channels: GuildChannelResponse[]
}

export interface ChannelMessageAuthor {
  id: number
  username: string | null
  displayName: string | null
  avatarUrl: string | null
}

export interface ChannelMessageResponse {
  id: string
  channelId: string
  authorId: number
  content: string
  createdAt: string
  editedAt: string | null
  author: ChannelMessageAuthor
}
