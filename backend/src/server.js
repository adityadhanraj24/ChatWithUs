// const express=require("express");
import authRoutes from "./routes/auth.route.js"
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config();

import messageRoutes from "./routes/message.routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app=express();

const PORT=process.env.PORT || 3000;

// console.log(process.env.PORT);



app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

//Ready for deployment
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get(/^\/.*/,(_,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
}



app.listen(3000,()=>{
    console.log("Server is running on port: "+PORT);
});