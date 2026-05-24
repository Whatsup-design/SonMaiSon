import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { createSocketServer } from './realtime/socket';
import { router } from './routes';
import authRoutes from './routes/auth';
import channelRoutes from './routes/channel';
import dmRoutes from './routes/dm';
import guildRoutes from './routes/guild';

dotenv.config();

const app = express();
const port = env.port;
const httpServer = createServer(app);

createSocketServer(httpServer);

app.set('trust proxy', 1);

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());


app.use('/', router);

app.use('/auth', authRoutes);
app.use('/dm', dmRoutes);
app.use('/guilds', guildRoutes);
app.use('/channels', channelRoutes);
// app.use('/user', authMiddleware, userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

httpServer.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  // Mock project: user routes are paused for now.
  // console.log(`Dashboard: http://localhost:${port}/user/dashboard`);
});
