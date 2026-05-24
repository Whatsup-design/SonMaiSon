import type {
  Server,
  Channel,
  ServerMembership,
  CurrentUser,
  Message,
  Friend,
  DirectConversation,
} from "../types/chat.types"

// ─── Current User ────────────────────────────────────────────────
export const currentUser: CurrentUser = {
  id: "u-self",
  username: "sonmaison",
  email: "son@maison.dev",
  status: "online",
}

// ─── Servers ─────────────────────────────────────────────────────
export const servers: Server[] = [
  {
    id: "s-1",
    name: "Design Team",
    ownerId: "u-1",
    bannerColor: "#5865F2",
  },
  {
    id: "s-2",
    name: "Gaming Hub",
    ownerId: "u-3",
    bannerColor: "#57F287",
  },
  {
    id: "s-3",
    name: "Dev Community",
    ownerId: "u-self",
    bannerColor: "#FEE75C",
  },
  {
    id: "s-4",
    name: "Music Lounge",
    ownerId: "u-6",
    bannerColor: "#EB459E",
  },
]

// ─── Channels ────────────────────────────────────────────────────
export const channels: Channel[] = [
  // Design Team
  { id: "c-1",  serverId: "s-1", name: "general",        type: "text",  category: "Text Channels" },
  { id: "c-2",  serverId: "s-1", name: "inspiration",    type: "text",  category: "Text Channels" },
  { id: "c-3",  serverId: "s-1", name: "feedback",       type: "text",  category: "Text Channels" },
  { id: "c-4",  serverId: "s-1", name: "Design Review",  type: "voice", category: "Voice Channels" },
  { id: "c-5",  serverId: "s-1", name: "Chill Lounge",   type: "voice", category: "Voice Channels" },

  // Gaming Hub
  { id: "c-6",  serverId: "s-2", name: "general",        type: "text",  category: "Text Channels" },
  { id: "c-7",  serverId: "s-2", name: "lfg",            type: "text",  category: "Text Channels" },
  { id: "c-8",  serverId: "s-2", name: "clips",          type: "text",  category: "Text Channels" },
  { id: "c-9",  serverId: "s-2", name: "highlights",     type: "text",  category: "Text Channels" },
  { id: "c-10", serverId: "s-2", name: "Squad Room",     type: "voice", category: "Voice Channels" },
  { id: "c-11", serverId: "s-2", name: "Tournament",     type: "voice", category: "Voice Channels" },

  // Dev Community
  { id: "c-12", serverId: "s-3", name: "general",        type: "text",  category: "Text Channels" },
  { id: "c-13", serverId: "s-3", name: "help",           type: "text",  category: "Text Channels" },
  { id: "c-14", serverId: "s-3", name: "showcase",       type: "text",  category: "Text Channels" },
  { id: "c-15", serverId: "s-3", name: "off-topic",      type: "text",  category: "Text Channels" },
  { id: "c-16", serverId: "s-3", name: "Code Review",    type: "voice", category: "Voice Channels" },
  { id: "c-17", serverId: "s-3", name: "Pair Programming", type: "voice", category: "Voice Channels" },

  // Music Lounge
  { id: "c-18", serverId: "s-4", name: "general",        type: "text",  category: "Text Channels" },
  { id: "c-19", serverId: "s-4", name: "recommendations",type: "text",  category: "Text Channels" },
  { id: "c-20", serverId: "s-4", name: "lyrics",         type: "text",  category: "Text Channels" },
  { id: "c-21", serverId: "s-4", name: "Listening Party", type: "voice", category: "Voice Channels" },
  { id: "c-22", serverId: "s-4", name: "Live Session",   type: "voice", category: "Voice Channels" },
]

// ─── Members ─────────────────────────────────────────────────────
export const serverMemberships: ServerMembership[] = [
  {
    serverId: "s-1",
    members: [
      { id: "u-self", username: "sonmaison",   status: "online",  role: "member" },
      { id: "u-1",    username: "alice_design", status: "online",  role: "owner" },
      { id: "u-2",    username: "bob_ui",       status: "idle",    role: "admin" },
      { id: "u-3",    username: "charlie_ux",   status: "online",  role: "member" },
      { id: "u-4",    username: "diana_dev",    status: "dnd",     role: "member" },
      { id: "u-5",    username: "evan_art",     status: "offline", role: "member" },
      { id: "u-6",    username: "fiona_3d",     status: "online",  role: "member" },
      { id: "u-7",    username: "greg_motion",  status: "offline", role: "member" },
    ],
  },
  {
    serverId: "s-2",
    members: [
      { id: "u-self", username: "sonmaison",    status: "online",  role: "member" },
      { id: "u-3",    username: "charlie_ux",    status: "online",  role: "owner" },
      { id: "u-8",    username: "hank_fps",      status: "online",  role: "admin" },
      { id: "u-9",    username: "ivy_moba",      status: "idle",    role: "member" },
      { id: "u-10",   username: "jake_rpg",      status: "online",  role: "member" },
      { id: "u-11",   username: "kara_strat",    status: "dnd",     role: "member" },
      { id: "u-12",   username: "leo_retro",     status: "offline", role: "member" },
      { id: "u-13",   username: "mia_speedrun",  status: "online",  role: "member" },
      { id: "u-14",   username: "noah_indie",    status: "offline", role: "member" },
      { id: "u-15",   username: "olivia_sim",    status: "idle",    role: "member" },
    ],
  },
  {
    serverId: "s-3",
    members: [
      { id: "u-self", username: "sonmaison",     status: "online",  role: "owner" },
      { id: "u-1",    username: "alice_design",   status: "online",  role: "admin" },
      { id: "u-4",    username: "diana_dev",      status: "dnd",     role: "admin" },
      { id: "u-16",   username: "paul_rust",      status: "online",  role: "member" },
      { id: "u-17",   username: "quinn_go",       status: "idle",    role: "member" },
      { id: "u-18",   username: "rachel_ts",      status: "online",  role: "member" },
      { id: "u-19",   username: "sam_py",         status: "offline", role: "member" },
      { id: "u-20",   username: "tina_devops",    status: "online",  role: "member" },
      { id: "u-21",   username: "uma_ml",         status: "offline", role: "member" },
      { id: "u-22",   username: "victor_web",     status: "online",  role: "member" },
      { id: "u-23",   username: "wendy_db",       status: "idle",    role: "member" },
    ],
  },
  {
    serverId: "s-4",
    members: [
      { id: "u-self", username: "sonmaison",     status: "online",  role: "member" },
      { id: "u-6",    username: "fiona_3d",       status: "online",  role: "owner" },
      { id: "u-9",    username: "ivy_moba",       status: "idle",    role: "admin" },
      { id: "u-24",   username: "xander_beats",   status: "online",  role: "member" },
      { id: "u-25",   username: "yuki_keys",      status: "dnd",     role: "member" },
      { id: "u-26",   username: "zara_vocals",    status: "online",  role: "member" },
      { id: "u-27",   username: "alex_guitar",    status: "offline", role: "member" },
      { id: "u-28",   username: "bella_drums",    status: "online",  role: "member" },
    ],
  },
]

// ─── Mock Messages ───────────────────────────────────────────────

const sampleMessages = [
  "Hey everyone! What's up?",
  "Just finished a big refactor, feels great 🎉",
  "Has anyone tried the new update?",
  "I'll be AFK for about an hour",
  "Can someone review my PR? It's pretty small",
  "That's a really cool approach, I hadn't thought of that",
  "lol 😂",
  "Good morning! ☀️",
  "I think we should discuss this in the voice channel",
  "Thanks for the help!",
  "Does anyone have experience with WebSockets?",
  "I'm stuck on this bug, any ideas?",
  "Just deployed to staging, please test",
  "The design looks really clean 👌",
  "Agreed, let's go with that approach",
  "brb, grabbing coffee ☕",
  "Wow, that was fast!",
  "Let me look into it and get back to you",
  "The meeting is at 3pm, don't forget",
  "Working on the API integration now",
  "This is a great idea, let's do it",
  "Anyone available for pair programming?",
  "Fixed the issue, pushing now",
  "Happy Friday everyone! 🎊",
  "I found a useful article about this topic",
  "The tests are passing now ✅",
  "Let me share my screen",
  "What do you all think about this layout?",
  "Nice work on the feature!",
  "I'll create a ticket for that",
  "Can we move this to #off-topic?",
  "Just checking in, how's progress?",
  "That's exactly what I needed, thanks!",
  "Running a quick build to verify...",
  "The performance improved significantly 🚀",
  "I'll handle the code review today",
  "Sounds good to me 👍",
  "Let me know if you need any help",
  "We should probably add some tests for that",
  "The deadline is next Friday btw",
]

const messageCache = new Map<string, Message[]>()

function getAuthorsForChannel(channelId: string): Array<{ id: string; username: string }> {
  // Support DM conversation IDs (prefixed with "dm-")
  if (channelId.startsWith("dm-")) {
    const convo = directConversations.find((c) => c.id === channelId)
    if (convo) {
      return [
        { id: currentUser.id, username: currentUser.username },
        { id: convo.recipientId, username: convo.recipientName },
      ]
    }
  }

  const channel = channels.find((c) => c.id === channelId)
  if (!channel) return [{ id: currentUser.id, username: currentUser.username }]

  const membership = serverMemberships.find((sm) => sm.serverId === channel.serverId)
  if (!membership) return [{ id: currentUser.id, username: currentUser.username }]

  return membership.members.map((m) => ({ id: m.id, username: m.username }))
}

export function generateMockMessages(channelId: string, count = 80): Message[] {
  const cached = messageCache.get(channelId)
  if (cached) return cached

  const authors = getAuthorsForChannel(channelId)
  const now = Date.now()
  const messages: Message[] = []

  for (let i = 0; i < count; i++) {
    const author = authors[i % authors.length]
    // Space messages across ~4 days, oldest first
    const ageMs = (count - i) * 3_200_000 // ~53 min between messages
    const timestamp = new Date(now - ageMs).toISOString()

    messages.push({
      id: `msg-${channelId}-${i}`,
      channelId,
      authorId: author.id,
      authorName: author.username,
      content: sampleMessages[i % sampleMessages.length],
      timestamp,
      isEdited: i % 11 === 0,
    })
  }

  messageCache.set(channelId, messages)
  return messages
}

// ─── Friends ─────────────────────────────────────────────────────

export const friends: Friend[] = [
  { id: "u-1",  username: "alice_design",  status: "online",  friendshipStatus: "accepted" },
  { id: "u-3",  username: "charlie_ux",    status: "online",  friendshipStatus: "accepted" },
  { id: "u-4",  username: "diana_dev",     status: "dnd",     friendshipStatus: "accepted" },
  { id: "u-6",  username: "fiona_3d",      status: "online",  friendshipStatus: "accepted" },
  { id: "u-8",  username: "hank_fps",      status: "online",  friendshipStatus: "accepted" },
  { id: "u-9",  username: "ivy_moba",      status: "idle",    friendshipStatus: "accepted" },
  { id: "u-10", username: "jake_rpg",      status: "online",  friendshipStatus: "accepted" },
  { id: "u-16", username: "paul_rust",     status: "online",  friendshipStatus: "accepted" },
  { id: "u-18", username: "rachel_ts",     status: "offline", friendshipStatus: "accepted" },
  { id: "u-24", username: "xander_beats",  status: "online",  friendshipStatus: "accepted" },
  // Pending
  { id: "u-20", username: "tina_devops",   status: "online",  friendshipStatus: "pending_incoming" },
  { id: "u-22", username: "victor_web",    status: "offline", friendshipStatus: "pending_outgoing" },
  // Blocked
  { id: "u-12", username: "leo_retro",     status: "offline", friendshipStatus: "blocked" },
]

// ─── Direct Conversations ────────────────────────────────────────

export const directConversations: DirectConversation[] = [
  {
    id: "dm-1",
    recipientId: "u-1",
    recipientName: "alice_design",
    recipientStatus: "online",
    lastMessage: "The new mockups look amazing!",
    lastMessageAt: new Date(Date.now() - 300_000).toISOString(),
  },
  {
    id: "dm-2",
    recipientId: "u-3",
    recipientName: "charlie_ux",
    recipientStatus: "online",
    lastMessage: "Let's play tonight?",
    lastMessageAt: new Date(Date.now() - 1_800_000).toISOString(),
  },
  {
    id: "dm-3",
    recipientId: "u-4",
    recipientName: "diana_dev",
    recipientStatus: "dnd",
    lastMessage: "PR is ready for review",
    lastMessageAt: new Date(Date.now() - 7_200_000).toISOString(),
  },
  {
    id: "dm-4",
    recipientId: "u-8",
    recipientName: "hank_fps",
    recipientStatus: "online",
    lastMessage: "GG! That was a great match",
    lastMessageAt: new Date(Date.now() - 14_400_000).toISOString(),
  },
  {
    id: "dm-5",
    recipientId: "u-16",
    recipientName: "paul_rust",
    recipientStatus: "online",
    lastMessage: "Have you seen the new Rust release?",
    lastMessageAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
  {
    id: "dm-6",
    recipientId: "u-9",
    recipientName: "ivy_moba",
    recipientStatus: "idle",
    lastMessage: "Thanks for the tips!",
    lastMessageAt: new Date(Date.now() - 172_800_000).toISOString(),
  },
]
