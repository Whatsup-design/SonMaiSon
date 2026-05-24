import React, { useState } from "react"
import { cn } from "../../../utils/cn"
import type { Friend, FriendsTab } from "../types/chat.types"
import { FriendRow } from "./FriendRow"
import { Menu, UserPlus } from "lucide-react"

interface FriendsDashboardProps {
  friends: Friend[]
  filteredFriends: Friend[]
  activeTab: FriendsTab
  onTabChange: (tab: FriendsTab) => void
  onRemoveFriend: (friendId: string) => void
  onAddFriend: (username: string) => void
  onMessageFriend: (friendId: string) => void
  onOpenMobileSidebar: () => void
}

const tabs: Array<{ key: FriendsTab; label: string }> = [
  { key: "online", label: "Online" },
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "blocked", label: "Blocked" },
]

export const FriendsDashboard: React.FC<FriendsDashboardProps> = ({
  friends: _allFriends,
  filteredFriends,
  activeTab,
  onTabChange,
  onRemoveFriend,
  onAddFriend,
  onMessageFriend,
  onOpenMobileSidebar,
}) => {
  const [showAddFriend, setShowAddFriend] = useState(false)
  const [addFriendInput, setAddFriendInput] = useState("")

  const handleAddFriend = () => {
    if (addFriendInput.trim()) {
      onAddFriend(addFriendInput)
      setAddFriendInput("")
      setShowAddFriend(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col h-screen overflow-hidden bg-[#313338]">
      {/* Header with tabs */}
      <div
        className={cn(
          "flex h-12 items-center gap-2 px-4",
          "border-b border-[#1F2023]",
          "shrink-0 overflow-x-auto"
        )}
      >
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center",
            "rounded-md text-slate-400",
            "transition-colors duration-150",
            "hover:bg-white/10 hover:text-white",
            "md:hidden shrink-0"
          )}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="text-base font-semibold text-white shrink-0">Friends</span>

        <div className="mx-2 h-6 w-px bg-white/10 shrink-0" />

        {/* Tab buttons */}
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "shrink-0 px-2 py-1",
              "rounded-md",
              "text-sm font-medium",
              "transition-colors duration-150",
              activeTab === tab.key
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}

        {/* Add Friend button */}
        <button
          type="button"
          onClick={() => setShowAddFriend((prev) => !prev)}
          className={cn(
            "shrink-0 ml-auto px-3 py-1",
            "rounded-md",
            "text-sm font-medium",
            "transition-colors duration-150",
            showAddFriend
              ? "bg-transparent text-emerald-400"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          )}
        >
          Add Friend
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Add friend section */}
        {showAddFriend ? (
          <div className="px-6 py-5 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white uppercase tracking-[0.02em] mb-1">
              Add Friend
            </h3>
            <p className="text-xs font-medium text-slate-400 mb-4">
              You can add friends with their username.
            </p>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2",
                "rounded-lg bg-[#1E1F22]",
                "border border-white/10",
                "focus-within:border-[#5865F2]"
              )}
            >
              <UserPlus className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={addFriendInput}
                onChange={(e) => setAddFriendInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddFriend()
                }}
                placeholder="Enter a username"
                className={cn(
                  "flex-1 bg-transparent outline-none",
                  "text-sm font-medium text-white",
                  "placeholder:text-slate-500"
                )}
              />
              <button
                type="button"
                onClick={handleAddFriend}
                disabled={!addFriendInput.trim()}
                className={cn(
                  "shrink-0 px-4 py-1.5",
                  "rounded-md text-sm font-semibold",
                  "transition-colors duration-150",
                  addFriendInput.trim()
                    ? "bg-[#5865F2] text-white hover:bg-[#4752C4]"
                    : "bg-[#5865F2]/50 text-white/50 cursor-not-allowed"
                )}
              >
                Send Request
              </button>
            </div>
          </div>
        ) : null}

        {/* Friend list */}
        <div className="px-4 sm:px-6 py-4">
          <h3 className="mb-2 text-xs font-semibold tracking-[0.02em] uppercase text-slate-400 px-2">
            {activeTab === "online"
              ? `Online — ${filteredFriends.length}`
              : activeTab === "all"
                ? `All Friends — ${filteredFriends.length}`
                : activeTab === "pending"
                  ? `Pending — ${filteredFriends.length}`
                  : `Blocked — ${filteredFriends.length}`}
          </h3>

          {filteredFriends.length > 0 ? (
            <div>
              {filteredFriends.map((friend) => (
                <FriendRow
                  key={friend.id}
                  friend={friend}
                  onMessage={onMessageFriend}
                  onRemove={onRemoveFriend}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm font-medium text-slate-500">
                {activeTab === "online"
                  ? "No friends are currently online."
                  : activeTab === "pending"
                    ? "No pending friend requests."
                    : activeTab === "blocked"
                      ? "No blocked users."
                      : "No friends yet. Send a request!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
