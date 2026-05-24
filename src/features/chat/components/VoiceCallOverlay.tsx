import React, { useRef, useEffect, useState } from "react"
import { cn } from "../../../utils/cn"
import { PhoneOff, Mic, MicOff } from "lucide-react"
import type { CallState } from "../hooks/useVoiceCall"

interface VoiceCallOverlayProps {
  callState: CallState
  recipientName: string
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  onHangUp: () => void
}

export const VoiceCallOverlay: React.FC<VoiceCallOverlayProps> = ({
  callState,
  recipientName,
  localStream,
  remoteStream,
  onHangUp,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)

  // Attach remote stream to audio element
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Call duration timer
  useEffect(() => {
    if (callState !== "connected") {
      setDuration(0)
      return
    }
    const interval = setInterval(() => {
      setDuration((d) => d + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [callState])

  // Toggle mute
  const toggleMute = () => {
    if (!localStream) return
    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
    }
  }

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const statusText =
    callState === "calling"
      ? "Calling..."
      : callState === "connected"
        ? formatDuration(duration)
        : ""

  return (
    <>
      {/* Hidden audio element for remote playback */}
      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      {/* Call banner */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3",
          "bg-emerald-600/90 backdrop-blur-sm",
          "border-b border-emerald-500/30",
          "shrink-0"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Pulsing dot for active call */}
          <div className="relative flex h-3 w-3 shrink-0">
            {callState === "connected" ? (
              <span className="absolute inline-flex h-full w-full rounded-full bg-white/60 animate-ping" />
            ) : null}
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {recipientName}
            </p>
            <p className="text-xs text-white/70">{statusText}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mute toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className={cn(
              "flex h-9 w-9 items-center justify-center",
              "rounded-full transition-all duration-150",
              isMuted
                ? "bg-white/20 text-rose-300"
                : "bg-white/10 text-white hover:bg-white/20"
            )}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>

          {/* Hang up */}
          <button
            type="button"
            onClick={onHangUp}
            className={cn(
              "flex h-9 w-9 items-center justify-center",
              "rounded-full bg-rose-500",
              "transition-all duration-150",
              "hover:bg-rose-600 active:scale-95"
            )}
            aria-label="Hang up"
          >
            <PhoneOff className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    </>
  )
}
