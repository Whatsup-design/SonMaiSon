import React, { useRef, useEffect, useState } from "react"
import { cn } from "../../../utils/cn"
import { PhoneOff, Mic, MicOff } from "lucide-react"
import type { CallState } from "../hooks/useVoiceCall"

interface GlobalCallWidgetProps {
  callState: CallState
  peerName: string
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  callError: string | null
  onHangUp: () => void
}

export const GlobalCallWidget: React.FC<GlobalCallWidgetProps> = ({
  callState,
  peerName,
  localStream,
  remoteStream,
  callError,
  onHangUp,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)

  // Attach remote stream to hidden audio
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream
    }
  }, [remoteStream])

  // Duration timer
  useEffect(() => {
    if (callState !== "connected") {
      setDuration(0)
      return
    }
    const interval = setInterval(() => setDuration((d) => d + 1), 1000)
    return () => clearInterval(interval)
  }, [callState])

  const toggleMute = () => {
    if (!localStream) return
    const track = localStream.getAudioTracks()[0]
    if (track) {
      track.enabled = !track.enabled
      setIsMuted(!track.enabled)
    }
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  const statusText =
    callState === "calling"
      ? "Calling..."
      : callState === "connected"
        ? `Voice Connected · ${formatDuration(duration)}`
        : ""

  return (
    <>
      <audio ref={audioRef} autoPlay playsInline className="hidden" />

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "flex items-center gap-4 p-4",
          "rounded-xl shadow-lg",
          "bg-[#1E1F22]",
          callState === "connected"
            ? "border border-emerald-500/50"
            : "border border-[#5865F2]/50"
        )}
      >
        {/* Pulsing dot + info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex h-2.5 w-2.5 shrink-0">
            {callState === "connected" ? (
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/60 animate-ping" />
            ) : null}
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                callState === "connected" ? "bg-emerald-500" : "bg-[#5865F2]"
              )}
            />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate max-w-[160px]">
              {peerName}
            </p>
            <p className="text-xs text-slate-400">{statusText}</p>
          </div>
        </div>

        {/* Error */}
        {callError ? (
          <p className="text-xs text-rose-400 max-w-[120px] truncate">
            {callError}
          </p>
        ) : null}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Mute toggle (only when connected) */}
          {callState === "connected" ? (
            <button
              type="button"
              onClick={toggleMute}
              className={cn(
                "flex h-9 w-9 items-center justify-center",
                "rounded-lg transition-all duration-150",
                isMuted
                  ? "bg-rose-500/20 text-rose-400"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>
          ) : null}

          {/* Hang up */}
          <button
            type="button"
            onClick={onHangUp}
            className={cn(
              "flex items-center gap-2 px-4 py-2",
              "rounded-lg bg-rose-500 text-white text-sm font-semibold",
              "transition-all duration-150",
              "hover:bg-rose-600 active:scale-95"
            )}
          >
            <PhoneOff className="h-4 w-4" />
            <span>Hang Up</span>
          </button>
        </div>
      </div>
    </>
  )
}
