import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes.js'
import cookieParser from 'cookie-parser';

const app = express();

//we give credentials in the cores so that cookies persist on the frontend
app.use(cors({credentials: true, origin: "http://localhost:6969"}));

app.use(express.json()); //to parse json data
app.use(cookieParser()) //use to parse cookies
app.use(express.urlencoded({extended: true})); //to parse url-encoded form data

app.use("/api/auth", authRouter);

export default app;