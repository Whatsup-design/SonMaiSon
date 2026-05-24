import { useRef, useCallback, useState } from "react"

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
}

export interface UseWebRTCReturn {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  /** Request microphone access */
  requestMic: () => Promise<MediaStream>
  /** Initialize peer connection and add local tracks. Must call requestMic first. */
  initPeerConnection: () => RTCPeerConnection
  /** Create an SDP offer (caller side) */
  createOffer: () => Promise<RTCSessionDescriptionInit>
  /** Handle incoming SDP offer and return an answer (receiver side) */
  handleOffer: (offer: RTCSessionDescriptionInit) => Promise<RTCSessionDescriptionInit>
  /** Handle incoming SDP answer (caller side) */
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>
  /** Add a remote ICE candidate */
  addIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>
  /** Register callback for outgoing ICE candidates */
  setOnIceCandidate: (cb: ((candidate: RTCIceCandidateInit) => void) | null) => void
  /** Tear down everything — stop tracks, close PC, reset state */
  cleanup: () => void
}

export function useWebRTC(): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const iceCandidateCbRef = useRef<((candidate: RTCIceCandidateInit) => void) | null>(null)

  const requestMic = useCallback(async (): Promise<MediaStream> => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })
    localStreamRef.current = stream
    setLocalStream(stream)
    return stream
  }, [])

  const initPeerConnection = useCallback((): RTCPeerConnection => {
    // Close existing if any
    if (pcRef.current) {
      pcRef.current.close()
    }

    const pc = new RTCPeerConnection(ICE_SERVERS)
    pcRef.current = pc

    // Add local audio tracks
    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        pc.addTrack(track, localStreamRef.current)
      }
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      const remote = event.streams[0] ?? new MediaStream()
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = remote
      } else {
        // Add track to existing stream
        remote.getTracks().forEach((t) => remoteStreamRef.current!.addTrack(t))
      }
      setRemoteStream(remoteStreamRef.current)
    }

    // Forward ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && iceCandidateCbRef.current) {
        iceCandidateCbRef.current(event.candidate.toJSON())
      }
    }

    return pc
  }, [])

  const createOffer = useCallback(async (): Promise<RTCSessionDescriptionInit> => {
    const pc = pcRef.current
    if (!pc) throw new Error("PeerConnection not initialized")

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    return pc.localDescription!
  }, [])

  const handleOffer = useCallback(
    async (offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> => {
      const pc = pcRef.current
      if (!pc) throw new Error("PeerConnection not initialized")

      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      return pc.localDescription!
    },
    []
  )

  const handleAnswer = useCallback(
    async (answer: RTCSessionDescriptionInit): Promise<void> => {
      const pc = pcRef.current
      if (!pc) throw new Error("PeerConnection not initialized")
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    },
    []
  )

  const addIceCandidate = useCallback(
    async (candidate: RTCIceCandidateInit): Promise<void> => {
      const pc = pcRef.current
      if (!pc) return
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch {
        // Non-critical — can happen if PC is already closed
      }
    },
    []
  )

  const setOnIceCandidate = useCallback(
    (cb: ((candidate: RTCIceCandidateInit) => void) | null) => {
      iceCandidateCbRef.current = cb
    },
    []
  )

  const cleanup = useCallback(() => {
    // Stop local tracks (release mic)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
    }
    // Stop remote tracks
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((t) => t.stop())
      remoteStreamRef.current = null
    }
    // Close peer connection
    if (pcRef.current) {
      pcRef.current.ontrack = null
      pcRef.current.onicecandidate = null
      pcRef.current.close()
      pcRef.current = null
    }
    // Clear ICE callback
    iceCandidateCbRef.current = null

    setLocalStream(null)
    setRemoteStream(null)
  }, [])

  return {
    localStream,
    remoteStream,
    requestMic,
    initPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    addIceCandidate,
    setOnIceCandidate,
    cleanup,
  }
}
