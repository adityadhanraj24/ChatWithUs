import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    acceptFriendRequest,
    blockUser,
    getPendingRequests,
    searchUsersByEmail,
    sendFriendRequest,
    unblockUser
} from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/search", protectRoute, searchUsersByEmail);
router.post("/request/:id", protectRoute, sendFriendRequest);
router.get("/requests", protectRoute, getPendingRequests);
router.put("/accept/:id", protectRoute, acceptFriendRequest);
router.post("/block/:id", protectRoute, blockUser);
router.post("/unblock/:id", protectRoute, unblockUser);

export default router;