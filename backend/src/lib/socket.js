import { Server } from "socket.io";
import http from "http";
import express from "express";
import { env } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: (env.CLIENT_URL || "https://chat-with-us-jh33.vercel.app").replace(/\/$/, ""),
        credentials: true,
    }
})

io.use(socketAuthMiddleware);

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.user.fullName);
    const userId = socket.user._id
    userSocketMap[userId] = socket.id;

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Typing indicator relay
    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", { senderId: userId.toString() });
        }
    });

    socket.on("stopTyping", ({ receiverId }) => {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stopTyping", { senderId: userId.toString() });
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.user.fullName);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    })
})
export { io, server, app };