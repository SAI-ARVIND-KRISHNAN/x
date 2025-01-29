import http from 'http';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

import connectMongoDB from './db/connectMongoDB.js';
import app from './App.js';

dotenv.config();

//configuring cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running at ${PORT}...`);
    connectMongoDB();
})