import { useState, useEffect, useMemo } from "react"
import type { Member, MemberStatus, MemberRole, GuildMemberResponse } from "../types/chat.types"
import { fetchGuildDetails } from "../services/guildApi"

function toMemberStatus(status: string): MemberStatus {
  if (status === "online" || status === "idle" || status === "dnd" || status === "offline") {
    return status
  }
  return "offline"
}

function toMemberRole(role: string): MemberRole {
  if (role === "owner" || role === "admin" || role === "member") {
    return role
  }
  return "member"
}

function toMember(raw: GuildMemberResponse): Member {
  return {
    id: String(raw.userId),
    username: raw.user.displayName || raw.user.username || `User ${raw.userId}`,
    avatarUrl: raw.user.avatarUrl ?? undefined,
    status: toMemberStatus(raw.user.status),
    role: toMemberRole(raw.role),
  }
}

interface UseMembersReturn {
  members: Member[]
  onlineMembers: Member[]
  offlineMembers: Member[]
}

export function useMembers(
  token: string | null,
  guildId: string | null
): UseMembersReturn {
  const [members, setMembers] = useState<Member[]>([])

  useEffect(() => {
    if (!token || !guildId) {
      setMembers([])
      return
    }

    fetchGuildDetails(token, guildId)
      .then((details) => {
        setMembers(details.members.map(toMember))
      })
      .catch((err) => {
        console.error("Failed to fetch guild details:", err)
        setMembers([])
      })
  }, [token, guildId])

  const onlineMembers = useMemo(
    () => members.filter((m) => m.status !== "offline"),
    [members]
  )

  const offlineMembers = useMemo(
    () => members.filter((m) => m.status === "offline"),
    [members]
  )

  return { members, onlineMembers, offlineMembers }
}
