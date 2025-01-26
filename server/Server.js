import http from 'http';
import app from './App.js';
import dotenv from "dotenv";
import connectMongoDB from './db/connectMongoDB.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running at ${PORT}...`);
    connectMongoDB();
})