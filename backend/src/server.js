import express from "express";
import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from "cors";

// dotenv.config();

import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js"
import messageRoutes from "./routes/message.routes.js"
import { env } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();

const PORT = env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// console.log(process.env.PORT);



app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);



//Ready for deployment
if (env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get(/^\/.*/, (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}



server.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
    connectDB();
});