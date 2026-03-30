import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

import authRoutes from "./routes/auth.route.js"
import {connectDB} from "./lib/db.js"
import messageRoutes from "./routes/message.routes.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve();




const app=express();

const PORT=process.env.PORT || 3000;

app.use(express.json());

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



app.listen(PORT,()=>{
    console.log("Server is running on port: "+PORT);
    connectDB();
});