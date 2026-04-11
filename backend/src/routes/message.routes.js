import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessage, reactToMessage } from "../controllers/message.controller.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import express from "express";
const router = express.Router();


router.use(arcjetProtection, protectRoute);
router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.post("/react/:id", reactToMessage);

export default router;