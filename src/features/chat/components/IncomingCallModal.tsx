import React from "react"
import { cn } from "../../../utils/cn"
import { Phone, PhoneOff } from "lucide-react"

interface IncomingCallModalProps {
  callerName: string
  onAccept: () => void
  onReject: () => void
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerName,
  onAccept,
  onReject,
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Card */}
      <div
        className={cn(
          "relative z-10 flex flex-col items-center gap-6",
          "w-full max-w-xs mx-4 px-8 py-10",
          "rounded-2xl bg-[#1E1F22]",
          "shadow-2xl shadow-black/60"
        )}
      >
        {/* Pulsing avatar */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#5865F2]/30 animate-ping" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#5865F2] text-2xl font-bold text-white">
            {(callerName ?? "?").slice(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-bold text-white">{callerName}</p>
          <p className="text-sm text-slate-400 mt-1">Incoming voice call...</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-8">
          {/* Reject */}
          <button
            type="button"
            onClick={onReject}
            className={cn(
              "flex h-14 w-14 items-center justify-center",
              "rounded-full bg-rose-500",
              "transition-all duration-150",
              "hover:bg-rose-600 active:scale-95"
            )}
            aria-label="Reject call"
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </button>

          {/* Accept */}
          <button
            type="button"
            onClick={onAccept}
            className={cn(
              "flex h-14 w-14 items-center justify-center",
              "rounded-full bg-emerald-500",
              "transition-all duration-150",
              "hover:bg-emerald-600 active:scale-95"
            )}
            aria-label="Accept call"
          >
            <Phone className="h-6 w-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
