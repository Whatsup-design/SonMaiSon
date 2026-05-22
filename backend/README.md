# Backend

## Project Overview


## Tech Stack

- Runtime: Node.js
- Language: TypeScript
- Framework: Express.js
- Database/BaaS: Supabase
- Database: PostgreSQL via Supabase
- Auth: JWT
- Password hashing: bcrypt
- File upload: multer
- Rate limiting: express-rate-limit
- LINE bot integration: @line/bot-sdk
- Environment config: dotenv
- Dev runner: tsx / nodemon
- Package manager: npm
- Deployment: Render

## Environment Variables

Create a `.env` file in the `backend` directory.

```env
PORT=
NODE_ENV=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

JWT_SECRET=
JWT_EXPIRES_IN=

LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
```

## Commands

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run development server with nodemon:

```bash
npm run dev:nodemon
```

Type-check the project:

```bash
npm run typecheck
```

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```
