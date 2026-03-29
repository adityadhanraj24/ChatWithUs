// const express=require("express");
import authRoutes from "./routes/auth.route.js"
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import messageRoutes from "./routes/message.routes.js"


const app=express();

const PORT=process.env.PORT || 3000;

// console.log(process.env.PORT);



app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

app.listen(3000,()=>{
    console.log("Server is running on port: "+PORT);
});