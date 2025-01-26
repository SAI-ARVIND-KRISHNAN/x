import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js'

const app = express();

app.use(cors());

app.use(authRouter);

export default app;