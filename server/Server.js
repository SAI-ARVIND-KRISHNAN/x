import http from 'http';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";
import cluster from 'cluster';
import os from 'os';

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

if (cluster.isPrimary) {
    console.log("Master process has started...")
    const NUM_WORKER = os.cpus().length;

    for (let i = 0; i < NUM_WORKER; i++) {
        cluster.fork();
    }
} else {
    server.listen(PORT, () => {
        console.log(`Server running at ${PORT}...`);
        connectMongoDB();
    });
}