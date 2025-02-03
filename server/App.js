import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'
import notificationRouter from './routes/notification.routes.js';

const app = express();

//we give credentials in the cores so that cookies persist on the frontend
app.use(cors({credentials: true, origin: "http://localhost:6969"}));

app.use(express.json()); //to parse json data
app.use(cookieParser()) //use to parse cookies
app.use(express.urlencoded({extended: true})); //to parse url-encoded form data

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/notifications", notificationRouter);

export default app;