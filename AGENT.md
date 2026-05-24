# Agent Context

## Competition Product

We are building a Discord clone for the hackathon/competition.

The user is responsible for backend and database development. Treat backend stability, real-time communication, database correctness, and deploy readiness as high priority.

## Core Features

1. Direct message chatting
   - Real-time DM chat should use WebSocket-style communication.
   - Backend should support authenticated users sending and receiving messages.
   - Database design should preserve message ownership, room/conversation membership, timestamps, and future moderation needs.

2. Video call
   - This is the next feature priority.
   - Video call should likely use WebRTC for peer media and backend WebSocket/signaling for call setup.
   - Backend should not stream raw video unless explicitly required; it should coordinate signaling, rooms, participants, call lifecycle, and authorization.

3. Authentication and authorization
   - Authentication and authorization are considered mostly finished for now.
   - Existing backend foundations include Supabase Auth, Google OAuth, email/password auth, global response format, global error handling, Zod validation, auth rate limiting, and Render deployment setup.
   - Continue to use authenticated user identity from verified tokens. Do not trust user ids sent from frontend body/query when enforcing ownership.

## Backend Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express.js
- Database/BaaS: Supabase
- Database: PostgreSQL via Supabase
- Auth: Supabase Auth / JWT bearer token verification
- Validation: Zod
- Password/Auth provider: Supabase Auth
- Rate limiting: express-rate-limit
- Deployment: Render
- Package manager: npm

## Backend Design Principles

- Keep REST APIs consistent with the global response format:
  - success responses use `sendSuccess`
  - error responses flow through `AppError` and `errorHandler`
- Validate request body, params, and query with Zod middleware before controller logic.
- Controllers should stay thin:
  - receive validated request
  - call service
  - send response
- Services should own business logic and Supabase/database interactions.
- Middleware should own cross-cutting concerns such as auth, rate limiting, validation, and authorization.
- For user-owned data, use `req.authUser.id` from auth middleware, not user ids supplied by the client.
- Prefer database constraints and RLS/policies as a safety net when user-owned tables are introduced.

## Real-Time Design Notes

For DM chat:
- Use WebSocket or Socket.IO for real-time delivery.
- Store messages in PostgreSQL/Supabase for persistence.
- Real-time transport should not be the only source of truth.
- Plan for conversations/rooms, participants, messages, read state, and online presence.

For video call:
- Use WebRTC for media between clients.
- Use backend real-time signaling for:
  - call invite
  - join/leave room
  - WebRTC offer
  - WebRTC answer
  - ICE candidates
  - call ended
- The backend should authorize that users are allowed to join the call room.
- The backend should track call state enough for UX and cleanup, but should not attempt to process video streams.

## Current Next Step

Start with the video call architecture and implementation planning.

Recommended first backend tasks:
1. Decide the signaling transport: Socket.IO is preferred for speed in hackathon context.
2. Define call room model and participant authorization.
3. Add signaling events and payload contracts.
4. Add minimal database tables only if call history/state persistence is needed.
5. Provide frontend contract for WebRTC signaling events.

## Hackathon Priorities

- Build an end-to-end golden path first.
- Avoid over-engineering before the demo flow works.
- Keep deploy working at all times.
- Prefer simple, inspectable systems over clever abstractions.
- Make API contracts easy for frontend developers to consume.
