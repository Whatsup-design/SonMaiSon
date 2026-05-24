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
  peerName: string | null
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  /** Start a voice call (caller side) */
  startCall: (conversationId: string, peerName: string) => Promise<void>
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
  const [peerName, setPeerName] = useState<string | null>(null)

  const callIdRef = useRef<string | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const callingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callStateRef = useRef<CallState>("idle")

  const webrtc = useWebRTC()
  const webrtcRef = useRef(webrtc)
  webrtcRef.current = webrtc

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
    webrtcRef.current.cleanup()
    callIdRef.current = null
    conversationIdRef.current = null
    callStateRef.current = "idle"  // sync ref immediately
    setCallState("idle")
    setIncomingCall(null)
    setPeerName(null)
  }, [clearCallingTimeout])

  const endCallRef = useRef(endCall)
  endCallRef.current = endCall

  // ── Start call (caller side) ──
  const startCall = useCallback(
    async (conversationId: string, name: string) => {
      console.log("[VoiceCall] startCall called", { conversationId, name, callState, hasToken: !!token })
      if (!token || callState !== "idle") {
        console.log("[VoiceCall] startCall blocked — token:", !!token, "callState:", callState)
        return
      }
      setCallError(null)

      try {
        await webrtcRef.current.requestMic()
        console.log("[VoiceCall] Mic granted")
      } catch (err) {
        console.error("[VoiceCall] Mic denied:", err)
        setCallError(getMicErrorMessage(err))
        return
      }

      conversationIdRef.current = conversationId
      callStateRef.current = "calling"  // sync ref BEFORE emit to block self-invite
      setCallState("calling")
      setPeerName(name)

      // Timeout: if no response in 30s, auto-cleanup
      clearCallingTimeout()
      callingTimeoutRef.current = setTimeout(() => {
        setCallError("No answer \u2014 call timed out")
        webrtcRef.current.cleanup()
        callIdRef.current = null
        conversationIdRef.current = null
        callStateRef.current = "idle"  // sync ref immediately
        setCallState("idle")
      }, CALL_TIMEOUT_MS)

      const socket = getSocket(token)
      console.log("[VoiceCall] Emitting call:invite", { conversationId, socketConnected: socket.connected })
      socket.emit("call:invite", { conversationId })
    },
    [token, callState, clearCallingTimeout]
  )

  // ── Accept incoming call (receiver side) ──
  const acceptCall = useCallback(async () => {
    if (!token || !incomingCall) return
    setCallError(null)

    try {
      await webrtcRef.current.requestMic()
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
    webrtcRef.current.initPeerConnection()

    // Set up ICE candidate forwarding
    webrtcRef.current.setOnIceCandidate((candidate) => {
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
  }, [token, incomingCall])

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
    console.log("[VoiceCall] Registering socket listeners, connected:", socket.connected)

    // Debug: log ALL events received on this socket
    const onAny = (event: string, ...args: unknown[]) => {
      if (event.startsWith("call:")) {
        console.log("[Socket Event]", event, args)
      }
    }
    socket.onAny(onAny)

    // Incoming call invitation (backend emits 'call:incoming')
    const handleInvited = (data: {
      callId: string
      conversationId: string
      callType: string
      caller: { id: number; username: string; displayName: string }
      createdAt: string
    }) => {
      console.log("[VoiceCall] call:invited received", { callStateRef: callStateRef.current, data })
      // Ignore if we are the caller (backend broadcasts to both users)
      if (callStateRef.current !== "idle") {
        console.log("[VoiceCall] call:invited IGNORED — callState is", callStateRef.current)
        return
      }

      const name = data.caller.displayName || data.caller.username || "Unknown"
      callIdRef.current = data.callId
      conversationIdRef.current = data.conversationId
      callStateRef.current = "incoming"  // sync ref immediately
      setPeerName(name)
      setIncomingCall({
        callId: data.callId,
        conversationId: data.conversationId,
        callerName: name,
      })
      setCallState("incoming")
    }

    // Call accepted (caller receives this)
    const handleAccepted = async () => {
      clearCallingTimeout()
      setCallState("connected")

      // Create peer connection (caller side)
      webrtcRef.current.initPeerConnection()

      // Set up ICE forwarding
      webrtcRef.current.setOnIceCandidate((candidate) => {
        socket.emit("call:webrtc:ice-candidate", {
          conversationId: conversationIdRef.current,
          callId: callIdRef.current,
          candidate,
        })
      })

      // Create and send offer
      try {
        const offer = await webrtcRef.current.createOffer()
        socket.emit("call:webrtc:offer", {
          conversationId: conversationIdRef.current,
          callId: callIdRef.current,
          offer,
        })
      } catch (err) {
        console.error("[VoiceCall] Failed to create offer:", err)
        setCallError("Failed to establish connection")
        endCallRef.current()
      }
    }

    // Receive SDP offer (receiver side)
    const handleOffer = async (data: {
      conversationId: string
      callId: string
      offer: RTCSessionDescriptionInit
    }) => {
      try {
        const answer = await webrtcRef.current.handleOffer(data.offer)
        socket.emit("call:webrtc:answer", {
          conversationId: data.conversationId,
          callId: data.callId,
          answer,
        })
      } catch (err) {
        console.error("[VoiceCall] Failed to handle offer:", err)
        setCallError("Failed to establish connection")
        endCallRef.current()
      }
    }

    // Receive SDP answer (caller side)
    const handleAnswer = async (data: {
      conversationId: string
      callId: string
      answer: RTCSessionDescriptionInit
    }) => {
      try {
        await webrtcRef.current.handleAnswer(data.answer)
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
      webrtcRef.current.addIceCandidate(data.candidate)
    }

    // Call rejected
    const handleRejected = () => {
      setCallError("Call was rejected")
      endCallRef.current()
    }

    // Call ended by remote
    const handleEnded = () => {
      endCallRef.current()
    }

    // Call error
    const handleError = (data: { code: string; message: string }) => {
      setCallError(data.message)
      endCallRef.current()
    }

    socket.on("call:incoming", handleInvited)
    socket.on("call:accepted", handleAccepted)
    socket.on("call:webrtc:offer", handleOffer)
    socket.on("call:webrtc:answer", handleAnswer)
    socket.on("call:webrtc:ice-candidate", handleIceCandidate)
    socket.on("call:rejected", handleRejected)
    socket.on("call:ended", handleEnded)
    socket.on("call:error", handleError)

    return () => {
      socket.offAny(onAny)
      socket.off("call:incoming", handleInvited)
      socket.off("call:accepted", handleAccepted)
      socket.off("call:webrtc:offer", handleOffer)
      socket.off("call:webrtc:answer", handleAnswer)
      socket.off("call:webrtc:ice-candidate", handleIceCandidate)
      socket.off("call:rejected", handleRejected)
      socket.off("call:ended", handleEnded)
      socket.off("call:error", handleError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, clearCallingTimeout])

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
    peerName,
    localStream: webrtc.localStream,
    remoteStream: webrtc.remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
  }
}
