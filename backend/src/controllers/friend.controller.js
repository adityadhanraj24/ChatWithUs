import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const searchUsersByEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const loggedInUserId = req.user._id;

        const user = await User.findOne({ email }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is the same as the logged in user
        if (user._id.toString() === loggedInUserId.toString()) {
            return res.status(400).json({ message: "You cannot add yourself" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error in searchUsersByEmail controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendFriendRequest = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "You cannot send request to yourself" });
        }

        // Check if already friends
        const sender = await User.findById(senderId);
        if (sender.friends.includes(receiverId)) {
            return res.status(400).json({ message: "Already friends" });
        }

        // Check if request already pending
        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: receiverId,
            status: "pending",
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        const newRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
        });

        await newRequest.save();

        // Real-time notification
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("friendRequestReceived", {
                request: newRequest,
                sender: {
                    _id: sender._id,
                    fullName: sender.fullName,
                    profilePic: sender.profilePic,
                }
            });
        }

        res.status(201).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.error("Error in sendFriendRequest controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const requests = await FriendRequest.find({
            receiver: userId,
            status: "pending",
        }).populate("sender", "fullName profilePic email");

        res.status(200).json(requests);
    } catch (error) {
        console.error("Error in getPendingRequests controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const acceptFriendRequest = async (req, res) => {
    try {
        const { id: requestId } = req.params;
        const userId = req.user._id;

        const request = await FriendRequest.findById(requestId);
        if (!request || request.receiver.toString() !== userId.toString() || request.status !== "pending") {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = "accepted";
        await request.save();

        // Add to friends lists
        await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.receiver } });
        await User.findByIdAndUpdate(request.receiver, { $addToSet: { friends: request.sender } });

        // Real-time notification to the sender
        const senderSocketId = getReceiverSocketId(request.sender);
        if (senderSocketId) {
            io.to(senderSocketId).emit("friendRequestAccepted", {
                receiverId: userId,
                fullName: req.user.fullName,
            });
        }

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.error("Error in acceptFriendRequest controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const blockUser = async (req, res) => {
    try {
        const { id: userToBlockId } = req.params;
        const userId = req.user._id;

        if (userId.toString() === userToBlockId) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: userToBlockId } });

        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        console.error("Error in blockUser controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const unblockUser = async (req, res) => {
    try {
        const { id: userToUnblockId } = req.params;
        const userId = req.user._id;

        await User.findByIdAndUpdate(userId, { $pull: { blockedUsers: userToUnblockId } });

        res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        console.error("Error in unblockUser controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}