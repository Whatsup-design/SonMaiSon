import { useState, useCallback, useMemo } from "react"
import type { Friend, FriendsTab } from "../types/chat.types"
import { friends as mockFriends } from "../data/mockData"

interface UseFriendsReturn {
  friends: Friend[]
  filteredFriends: Friend[]
  activeTab: FriendsTab
  setActiveTab: (tab: FriendsTab) => void
  addFriend: (username: string) => void
  removeFriend: (friendId: string) => void
}

export function useFriends(): UseFriendsReturn {
  const [friends, setFriends] = useState<Friend[]>(mockFriends)
  const [activeTab, setActiveTab] = useState<FriendsTab>("online")

  const filteredFriends = useMemo(() => {
    switch (activeTab) {
      case "online":
        return friends.filter(
          (f) => f.friendshipStatus === "accepted" && f.status !== "offline"
        )
      case "all":
        return friends.filter((f) => f.friendshipStatus === "accepted")
      case "pending":
        return friends.filter(
          (f) =>
            f.friendshipStatus === "pending_incoming" ||
            f.friendshipStatus === "pending_outgoing"
        )
      case "blocked":
        return friends.filter((f) => f.friendshipStatus === "blocked")
      default:
        return friends
    }
  }, [friends, activeTab])

  const addFriend = useCallback((username: string) => {
    if (!username.trim()) return
    const newFriend: Friend = {
      id: `u-friend-${Date.now()}`,
      username: username.trim(),
      status: "offline",
      friendshipStatus: "pending_outgoing",
    }
    setFriends((prev) => [...prev, newFriend])
  }, [])

  const removeFriend = useCallback((friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId))
  }, [])

  return {
    friends,
    filteredFriends,
    activeTab,
    setActiveTab,
    addFriend,
    removeFriend,
  }
}
