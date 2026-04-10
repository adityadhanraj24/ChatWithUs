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
const allowedOrigin = (env.CLIENT_URL || "https://chat-with-us-jh33.vercel.app").replace(/\/$/, "");
app.use(cors({ origin: [allowedOrigin, "http://localhost:5173"], credentials: true }));

// console.log(process.env.PORT);



app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
    return res.send("hi")
})

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