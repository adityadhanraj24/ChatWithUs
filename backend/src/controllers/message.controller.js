import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

export const getAllUsers = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const allUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error in getAllUsers controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all users who are in the 'friends' list
        const user = await User.findById(loggedInUserId).populate("friends", "_id fullName email profilePic");
        const friendIds = user.friends.map(f => f._id.toString());

        // Find all users with existing message history
        const messages = await Message.find({
            $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
        });

        const chatPartnerIds = messages.map(msg =>
            msg.senderId.toString() === loggedInUserId.toString()
                ? msg.receiverId.toString()
                : msg.senderId.toString()
        );

        // Combine and unique IDs
        const combinedIds = [...new Set([...friendIds, ...chatPartnerIds])];

        // Filter out the logged in user and blocked users
        const blockedUserIds = user.blockedUsers.map(id => id.toString());

        const filteredUsers = await User.find({
            _id: { 
                $in: combinedIds, 
                $nin: [loggedInUserId, ...blockedUserIds] 
            }
        }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getAllContacts controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        //find all messages where the logged in user is either sender or receiver
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId },
                { receiverId: loggedInUserId },
            ],
        });

        // Use square brackets to convert the Set into an Array!
        const chatPartnerIds = [
            ...new Set(
                messages.map((msg) =>
                    msg.senderId.toString() === loggedInUserId.toString()
                        ? msg.receiverId.toString()
                        : msg.senderId.toString()
                )
            ),
        ];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password")

        res.status(200).json(chatPartners);
    } catch (error) {
        console.error("Error in getChatPartners controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessagesByUserId controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Check if receiver has blocked the sender
        const receiver = await User.findById(receiverId);
        if (receiver.blockedUsers.includes(senderId)) {
            return res.status(403).json({ message: "You are blocked by this user" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })
        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);

    } catch (error) {
        console.error("Error in sendMessage controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const reactToMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) return res.status(404).json({ message: "Message not found" });

        const existingIndex = message.reactions.findIndex(
            (r) => r.userId.toString() === userId.toString()
        );

        if (existingIndex !== -1) {
            if (message.reactions[existingIndex].emoji === emoji) {
                // Same emoji clicked again → remove (toggle off)
                message.reactions.splice(existingIndex, 1);
            } else {
                // Different emoji → update
                message.reactions[existingIndex].emoji = emoji;
            }
        } else {
            // No reaction yet → add
            message.reactions.push({ userId, emoji });
        }

        await message.save();

        // Emit real-time reaction update to both participants
        const participantIds = [message.senderId.toString(), message.receiverId.toString()];
        participantIds.forEach((pid) => {
            const socketId = getReceiverSocketId(pid);
            if (socketId) {
                io.to(socketId).emit("messageReaction", {
                    messageId: message._id,
                    reactions: message.reactions,
                });
            }
        });

        res.status(200).json(message);
    } catch (error) {
        console.error("Error in reactToMessage controller: ", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}