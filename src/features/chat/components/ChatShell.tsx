import React, { useState, useCallback } from "react"
import { useAuth } from "../../../hooks/useAuth"
import { useServers } from "../hooks/useServers"
import { useChannels } from "../hooks/useChannels"
import { useMembers } from "../hooks/useMembers"
import { useFriends } from "../hooks/useFriends"
import { useDirectMessages } from "../hooks/useDirectMessages"
import { useVoiceCall } from "../hooks/useVoiceCall"
import { ServerSidebar } from "./ServerSidebar"
import { ChannelSidebar } from "./ChannelSidebar"
import { DMSidebar } from "./DMSidebar"
import { ServerDashboard } from "./ServerDashboard"
import { ChatView } from "./ChatView"
import { MemberSidebar } from "./MemberSidebar"
import { FriendsDashboard } from "./FriendsDashboard"
import { DMChatView } from "./DMChatView"
import { GlobalCallWidget } from "./GlobalCallWidget"
import { IncomingCallModal } from "./IncomingCallModal"

export const ChatShell: React.FC = () => {
  const { token, user } = useAuth()

  // ── Server state ──
  const { servers, selectedServer, selectServer, createServer, leaveServer, myRole } = useServers(token)
  const {
    channels,
    selectedChannel,
    selectChannel,
    createChannel,
    channelsByCategory,
  } = useChannels(token, selectedServer?.id ?? null)
  const { members, onlineMembers, offlineMembers } = useMembers(
    token,
    selectedServer?.id ?? null
  )

  // ── DM / Friends state ──
  const {
    friends,
    filteredFriends,
    activeTab,
    setActiveTab,
    addFriend,
    removeFriend,
  } = useFriends()
  const {
    conversations,
    selectedConversation,
    selectConversation,
    isLoading: isDMLoading,
    currentNumericUserId,
  } = useDirectMessages(token, user?.email)

  // ── Voice call (hoisted for global persistence) ──
  const voiceCall = useVoiceCall(token)

  // ── View mode ──
  const [isHomeView, setIsHomeView] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // When friends tab is clicked in DMSidebar, deselect any DM conversation
  const [isFriendsActive, setIsFriendsActive] = useState(true)

  // Check if current user is the owner of the selected server
  const isOwner = selectedServer
    ? selectedServer.ownerId === String(currentNumericUserId ?? "")
    : false

  const handleHomeClick = useCallback(() => {
    setIsHomeView(true)
    selectServer("")
    selectChannel(null)
    selectConversation(null)
    setIsFriendsActive(true)
  }, [selectServer, selectChannel, selectConversation])

  const handleSelectServer = useCallback(
    (serverId: string) => {
      setIsHomeView(false)
      selectServer(serverId)
      selectChannel(null)
      selectConversation(null)
    },
    [selectServer, selectChannel, selectConversation]
  )

  const handleSelectChannel = useCallback(
    (channelId: string | null) => {
      selectChannel(channelId)
      setIsMobileSidebarOpen(false)
    },
    [selectChannel]
  )

  const handleSelectConversation = useCallback(
    (conversationId: string | null) => {
      selectConversation(conversationId)
      setIsFriendsActive(false)
      setIsMobileSidebarOpen(false)
    },
    [selectConversation]
  )

  const handleFriendsClick = useCallback(() => {
    selectConversation(null)
    setIsFriendsActive(true)
  }, [selectConversation])

  const handleMessageFriend = useCallback(
    (friendId: string) => {
      const numericFriendId = parseInt(friendId.replace("u-", ""), 10)
      const existing = conversations.find(
        (c) => c.recipientUserId === numericFriendId
      )
      if (existing) {
        handleSelectConversation(existing.id)
      }
    },
    [conversations, handleSelectConversation]
  )

  const handleLeaveServer = useCallback(async () => {
    if (!selectedServer) return
    await leaveServer(selectedServer.id)
    setIsHomeView(true)
  }, [selectedServer, leaveServer])

  const openMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(true)
  }, [])

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false)
  }, [])

  // ── Render the correct second sidebar ──
  const renderSecondSidebar = (onChannelSelect: (id: string | null) => void) => {
    if (isHomeView) {
      return (
        <DMSidebar
          conversations={conversations}
          activeConversationId={selectedConversation?.id ?? null}
          isFriendsActive={isFriendsActive && !selectedConversation}
          isLoading={isDMLoading}
          onSelectConversation={(id) => {
            onChannelSelect(id)
            if (id) {
              setIsFriendsActive(false)
              selectConversation(id)
            }
          }}
          onFriendsClick={handleFriendsClick}
        />
      )
    }
    if (selectedServer) {
      return (
        <ChannelSidebar
          server={selectedServer}
          channelsByCategory={channelsByCategory}
          activeChannelId={selectedChannel?.id ?? null}
          myRole={myRole}
          isOwner={isOwner}
          onSelectChannel={onChannelSelect}
          onCreateChannel={createChannel}
          onLeaveServer={handleLeaveServer}
        />
      )
    }
    return null
  }

  // ── Render main content ──
  const renderMainContent = () => {
    // Home view with active DM conversation
    if (isHomeView && selectedConversation) {
      return (
        <DMChatView
          conversation={selectedConversation}
          token={token}
          currentNumericUserId={currentNumericUserId}
          callState={voiceCall.callState}
          onStartCall={voiceCall.startCall}
          onOpenMobileSidebar={openMobileSidebar}
        />
      )
    }
    // Home view with friends dashboard
    if (isHomeView) {
      return (
        <FriendsDashboard
          friends={friends}
          filteredFriends={filteredFriends}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRemoveFriend={removeFriend}
          onAddFriend={addFriend}
          onMessageFriend={handleMessageFriend}
          onOpenMobileSidebar={openMobileSidebar}
        />
      )
    }
    // Server view with text channel selected — includes member sidebar
    if (selectedServer && selectedChannel && selectedChannel.type === "text") {
      return (
        <div className="flex flex-1 overflow-hidden">
          <ChatView
            channel={selectedChannel}
            token={token}
            currentUserId={String(currentNumericUserId ?? "")}
            onOpenMobileSidebar={openMobileSidebar}
          />
          <MemberSidebar
            onlineMembers={onlineMembers}
            offlineMembers={offlineMembers}
          />
        </div>
      )
    }
    // Server view with dashboard
    if (selectedServer) {
      return (
        <ServerDashboard
          server={selectedServer}
          members={members}
          onlineMembers={onlineMembers}
          offlineMembers={offlineMembers}
          channelCount={channels.length}
          onOpenMobileSidebar={openMobileSidebar}
        />
      )
    }
    // Fallback
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-lg font-medium text-slate-400">
          Select a server to get started
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-surface-base)] p-3 gap-3">
      {/* ── Desktop sidebars (always visible on md+) ── */}
      <div className="hidden md:flex gap-3 shrink-0">
        <ServerSidebar
          servers={servers}
          activeServerId={selectedServer?.id ?? null}
          isHomeActive={isHomeView}
          onSelectServer={handleSelectServer}
          onHomeClick={handleHomeClick}
          onCreateServer={createServer}
        />
        {renderSecondSidebar(selectChannel)}
      </div>

      {/* ── Mobile sidebar overlay (below md) ── */}
      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <ServerSidebar
            servers={servers}
            activeServerId={selectedServer?.id ?? null}
            isHomeActive={isHomeView}
            onSelectServer={handleSelectServer}
            onHomeClick={handleHomeClick}
            onCreateServer={createServer}
          />
          {renderSecondSidebar(isHomeView ? handleSelectConversation : handleSelectChannel)}

          {/* Backdrop */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex-1 bg-black/60 backdrop-blur-sm cursor-default"
            aria-label="Close sidebar"
          />
        </div>
      ) : null}

      {/* ── Main content ── */}
      {renderMainContent()}

      {/* ── Global voice call widget (persists across routes) ── */}
      {(voiceCall.callState === "calling" || voiceCall.callState === "connected") && voiceCall.peerName ? (
        <GlobalCallWidget
          callState={voiceCall.callState}
          peerName={voiceCall.peerName}
          localStream={voiceCall.localStream}
          remoteStream={voiceCall.remoteStream}
          callError={voiceCall.callError}
          onHangUp={voiceCall.hangUp}
        />
      ) : null}

      {/* ── Incoming call modal (global overlay) ── */}
      {voiceCall.callState === "incoming" && voiceCall.incomingCall ? (
        <IncomingCallModal
          callerName={voiceCall.incomingCall.callerName}
          onAccept={voiceCall.acceptCall}
          onReject={voiceCall.rejectCall}
        />
      ) : null}
    </div>
  )
}
