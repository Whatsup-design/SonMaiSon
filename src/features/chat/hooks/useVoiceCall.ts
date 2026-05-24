import { useState, useCallback, useEffect, useRef } from "react"
import { useWebRTC } from "./useWebRTC"
import { getSocket } from "../services/socketManager"

export type CallState = "idle" | "calling" | "incoming" | "connected"

interface IncomingCallInfo {
  callId: string
  conversationId: string
  callerName: string
}

interface UseVoiceCallReturn {
  callState: CallState
  callError: string | null
  incomingCall: IncomingCallInfo | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  /** Start a voice call (caller side) */
  startCall: (conversationId: string) => Promise<void>
  /** Accept an incoming call (receiver side) */
  acceptCall: () => Promise<void>
  /** Reject an incoming call (receiver side) */
  rejectCall: () => void
  /** Hang up an active call (either side) */
  hangUp: () => void
}

const CALL_TIMEOUT_MS = 30_000

function getMicErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError") return "Microphone permission denied"
    if (err.name === "NotFoundError") return "No microphone found on this device"
    if (err.name === "NotReadableError") return "Microphone is already in use"
  }
  return "Could not access microphone"
}

export function useVoiceCall(token: string | null): UseVoiceCallReturn {
  const [callState, setCallState] = useState<CallState>("idle")
  const [callError, setCallError] = useState<string | null>(null)
  const [incomingCall, setIncomingCall] = useState<IncomingCallInfo | null>(null)

  const callIdRef = useRef<string | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const callingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callStateRef = useRef<CallState>("idle")

  const webrtc = useWebRTC()

  // Keep ref in sync with state so socket handlers can read current value
  useEffect(() => {
    callStateRef.current = callState
  }, [callState])

  // Auto-clear error after 5s
  useEffect(() => {
    if (!callError) return
    const timer = setTimeout(() => setCallError(null), 5000)
    return () => clearTimeout(timer)
  }, [callError])

  const clearCallingTimeout = useCallback(() => {
    if (callingTimeoutRef.current) {
      clearTimeout(callingTimeoutRef.current)
      callingTimeoutRef.current = null
    }
  }, [])

  const endCall = useCallback(() => {
    clearCallingTimeout()
    webrtc.cleanup()
    callIdRef.current = null
    conversationIdRef.current = null
    setCallState("idle")
    setIncomingCall(null)
  }, [webrtc, clearCallingTimeout])

  // ── Start call (caller side) ──
  const startCall = useCallback(
    async (conversationId: string) => {
      if (!token || callState !== "idle") return
      setCallError(null)

      try {
        await webrtc.requestMic()
      } catch (err) {
        setCallError(getMicErrorMessage(err))
        return
      }

      conversationIdRef.current = conversationId
      callStateRef.current = "calling"  // sync ref BEFORE emit to block self-invite
      setCallState("calling")

      // Timeout: if no response in 30s, auto-cleanup
      clearCallingTimeout()
      callingTimeoutRef.current = setTimeout(() => {
        setCallError("No answer — call timed out")
        webrtc.cleanup()
        callIdRef.current = null
        conversationIdRef.current = null
        setCallState("idle")
      }, CALL_TIMEOUT_MS)

      const socket = getSocket(token)
      socket.emit("call:invite", { conversationId })
    },
    [token, callState, webrtc, clearCallingTimeout]
  )

  // ── Accept incoming call (receiver side) ──
  const acceptCall = useCallback(async () => {
    if (!token || !incomingCall) return
    setCallError(null)

    try {
      await webrtc.requestMic()
    } catch (err) {
      setCallError(getMicErrorMessage(err))
      setIncomingCall(null)
      setCallState("idle")
      return
    }

    callIdRef.current = incomingCall.callId
    conversationIdRef.current = incomingCall.conversationId
    setIncomingCall(null)
    setCallState("connected")

    // Init peer connection (receiver will wait for offer)
    webrtc.initPeerConnection()

    // Set up ICE candidate forwarding
    webrtc.setOnIceCandidate((candidate) => {
      const socket = getSocket(token)
      socket.emit("call:webrtc:ice-candidate", {
        conversationId: conversationIdRef.current,
        callId: callIdRef.current,
        candidate,
      })
    })

    const socket = getSocket(token)
    socket.emit("call:accept", {
      conversationId: incomingCall.conversationId,
      callId: incomingCall.callId,
    })
  }, [token, incomingCall, webrtc])

  // ── Reject incoming call ──
  const rejectCall = useCallback(() => {
    if (!token || !incomingCall) return

    const socket = getSocket(token)
    socket.emit("call:reject", {
      conversationId: incomingCall.conversationId,
      callId: incomingCall.callId,
    })
    setIncomingCall(null)
    setCallState("idle")
  }, [token, incomingCall])

  // ── Hang up ──
  const hangUp = useCallback(() => {
    if (!token) return

    if (callIdRef.current && conversationIdRef.current) {
      const socket = getSocket(token)
      socket.emit("call:end", {
        conversationId: conversationIdRef.current,
        callId: callIdRef.current,
      })
    }
    endCall()
  }, [token, endCall])

  // ── Socket listeners ──
  useEffect(() => {
    if (!token) return

    const socket = getSocket(token)

    // Incoming call invitation
    const handleInvited = (data: {
      callId: string
      conversationId: string
      callType: string
      caller: { id: number; username: string; displayName: string }
      createdAt: string
    }) => {
      // Ignore if we are the caller (backend broadcasts to both users)
      if (callStateRef.current !== "idle") return

      callIdRef.current = data.callId
      conversationIdRef.current = data.conversationId
      setIncomingCall({
        callId: data.callId,
        conversationId: data.conversationId,
        callerName: data.caller.displayName || data.caller.username || "Unknown",
      })
      setCallState("incoming")
    }

    // Call accepted (caller receives this)
    const handleAccepted = async () => {
      clearCallingTimeout()
      setCallState("connected")

      // Create peer connection (caller side)
      webrtc.initPeerConnection()

      // Set up ICE forwarding
      webrtc.setOnIceCandidate((candidate) => {
        socket.emit("call:webrtc:ice-candidate", {
          conversationId: conversationIdRef.current,
          callId: callIdRef.current,
          candidate,
        })
      })

      // Create and send offer
      try {
        const offer = await webrtc.createOffer()
        socket.emit("call:webrtc:offer", {
          conversationId: conversationIdRef.current,
          callId: callIdRef.current,
          offer,
        })
      } catch (err) {
        console.error("[VoiceCall] Failed to create offer:", err)
        setCallError("Failed to establish connection")
        endCall()
      }
    }

    // Receive SDP offer (receiver side)
    const handleOffer = async (data: {
      conversationId: string
      callId: string
      offer: RTCSessionDescriptionInit
    }) => {
      try {
        const answer = await webrtc.handleOffer(data.offer)
        socket.emit("call:webrtc:answer", {
          conversationId: data.conversationId,
          callId: data.callId,
          answer,
        })
      } catch (err) {
        console.error("[VoiceCall] Failed to handle offer:", err)
        setCallError("Failed to establish connection")
        endCall()
      }
    }

    // Receive SDP answer (caller side)
    const handleAnswer = async (data: {
      conversationId: string
      callId: string
      answer: RTCSessionDescriptionInit
    }) => {
      try {
        await webrtc.handleAnswer(data.answer)
      } catch (err) {
        console.error("[VoiceCall] Failed to handle answer:", err)
      }
    }

    // ICE candidate exchange
    const handleIceCandidate = (data: {
      conversationId: string
      callId: string
      candidate: RTCIceCandidateInit
    }) => {
      webrtc.addIceCandidate(data.candidate)
    }

    // Call rejected
    const handleRejected = () => {
      setCallError("Call was rejected")
      endCall()
    }

    // Call ended by remote
    const handleEnded = () => {
      endCall()
    }

    // Call error
    const handleError = (data: { code: string; message: string }) => {
      setCallError(data.message)
      endCall()
    }

    socket.on("call:invited", handleInvited)
    socket.on("call:accepted", handleAccepted)
    socket.on("call:webrtc:offer", handleOffer)
    socket.on("call:webrtc:answer", handleAnswer)
    socket.on("call:webrtc:ice-candidate", handleIceCandidate)
    socket.on("call:rejected", handleRejected)
    socket.on("call:ended", handleEnded)
    socket.on("call:error", handleError)

    return () => {
      socket.off("call:invited", handleInvited)
      socket.off("call:accepted", handleAccepted)
      socket.off("call:webrtc:offer", handleOffer)
      socket.off("call:webrtc:answer", handleAnswer)
      socket.off("call:webrtc:ice-candidate", handleIceCandidate)
      socket.off("call:rejected", handleRejected)
      socket.off("call:ended", handleEnded)
      socket.off("call:error", handleError)
    }
  }, [token, webrtc, endCall])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callingTimeoutRef.current) clearTimeout(callingTimeoutRef.current)
      webrtc.cleanup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    callState,
    callError,
    incomingCall,
    localStream: webrtc.localStream,
    remoteStream: webrtc.remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
  }
}
