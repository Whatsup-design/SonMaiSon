import { io, Socket } from "socket.io-client"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

let socket: Socket | null = null
let currentToken: string | null = null

export function getSocket(token: string): Socket {
  // Return existing socket if it exists with the same token (don't require connected — it may be reconnecting)
  if (socket && currentToken === token) return socket

  // Clean up stale socket (different token or disconnected)
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }

  currentToken = token

  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
  })

  // Global listeners — registered exactly once per socket instance
  socket.on("connection:ready", (payload: { socketId: string }) => {
    console.log("[Socket] Connected:", payload.socketId)
  })

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message)
  })

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
    currentToken = null
  }
}

export function getRawSocket(): Socket | null {
  return socket
}
