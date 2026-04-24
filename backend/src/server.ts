import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { env } from './config/env';
import { router } from './routes';
import userRoutes from './routes/User';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const port = env.port;

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);

app.use(express.json());


app.use('/', router);

app.use('/auth', authRoutes);
app.use('/User', userRoutes);

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Dashboard: http://localhost:${port}/user/dashboard`);
});
