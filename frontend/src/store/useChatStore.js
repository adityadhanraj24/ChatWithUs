import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    allUsers: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isAllUsersLoading: false,
    isMessageLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") !== "false",
    unreadCounts: {},   // { [userId]: number }
    typingUsers: {},    // { [userId]: boolean }

    toggleSound: () => {
        const newSoundState = !get().isSoundEnabled;
        localStorage.setItem("isSoundEnabled", newSoundState);
        set({ isSoundEnabled: newSoundState });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedUser: (selectedUser) => {
        set({ selectedUser });
        if (selectedUser) {
            // clear unread count when opening a chat
            get().clearUnread(selectedUser._id);
        }
    },

    clearUnread: (userId) => {
        set((state) => ({
            unreadCounts: { ...state.unreadCounts, [userId]: 0 },
        }));
    },

    getAllContacts: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({ allContacts: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
            console.log("Error in getAllContacts:", error);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getAllUsers: async () => {
        set({ isAllUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/all");
            set({ allUsers: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch all users");
        } finally {
            set({ isAllUsersLoading: false });
        }
    },

    getMyChatPartners: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({ chats: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessagesByUserId: async (userId) => {
        set({ isMessageLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong.");
        } finally {
            set({ isMessageLoading: false });
        }
    },

    // Move a chat to the top of the list
    moveChatToTop: (user) => {
        const { chats } = get();
        const existingChatIndex = chats.findIndex(c => c._id === user._id);
        
        let updatedChats = [...chats];
        if (existingChatIndex !== -1) {
            // Remove from current position
            updatedChats.splice(existingChatIndex, 1);
        }
        // Add to front
        updatedChats.unshift(user);
        set({ chats: updatedChats });
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages, chats } = get();
        const { authUser } = useAuthStore.getState();

        const tempId = `temp-${Date.now()}`;
        const optimisiticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            reactions: [],
            createdAt: new Date().toISOString(),
        }
        set({ messages: [...messages, optimisiticMessage] })

        // Move to top instantly
        get().moveChatToTop(selectedUser);

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: messages.concat(res.data) })
        } catch (error) {
            set({ messages: messages })
            toast.error(error.response?.data?.message || "Something went wrong.");
        }
    },

    reactToMessage: async (messageId, emoji) => {
        try {
            await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not add reaction.");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // New message listener
        socket.on("newMessage", async (newMessage) => {
            const { selectedUser, chats, allUsers } = get();
            
            // Determine who the other person is
            const otherUserId = newMessage.senderId === useAuthStore.getState().authUser._id 
                ? newMessage.receiverId 
                : newMessage.senderId;

            // Find the user object to move to top
            let userToMove = chats.find(c => c._id === otherUserId);
            if (!userToMove) {
                // If not in chats, look in allUsers (Global directory)
                userToMove = allUsers.find(u => u._id === otherUserId);
                
                // If still not found, we might need to fetch their info, 
                // but for now let's just use what we have or trigger a refresh
                if (!userToMove) {
                    await get().getMyChatPartners(); // Refresh chats list
                    userToMove = get().chats.find(c => c._id === otherUserId);
                }
            }

            if (userToMove) {
                get().moveChatToTop(userToMove);
            }

            const isFromSelectedUser = selectedUser?._id === otherUserId;

            if (isFromSelectedUser) {
                // Message is from the open chat — append it
                set({ messages: [...get().messages, newMessage] });

                if (get().isSoundEnabled) {
                    const sound = new Audio("/Sounds/notification.mp3");
                    sound.currentTime = 0;
                    sound.play().catch((e) => console.log("Audio play failed:", e));
                }
            } else {
                // Message is from a background conversation — increment unread badge
                set((state) => ({
                    unreadCounts: {
                        ...state.unreadCounts,
                        [otherUserId]: (state.unreadCounts[otherUserId] || 0) + 1,
                    },
                }));

                if (get().isSoundEnabled) {
                    const sound = new Audio("/Sounds/notification.mp3");
                    sound.currentTime = 0;
                    sound.play().catch((e) => console.log("Audio play failed:", e));
                }
            }
        });

        // Typing indicator listeners
        socket.on("typing", ({ senderId }) => {
            if (senderId === get().selectedUser?._id) {
                set((state) => ({
                    typingUsers: { ...state.typingUsers, [senderId]: true },
                }));
            }
        });

        socket.on("stopTyping", ({ senderId }) => {
            set((state) => ({
                typingUsers: { ...state.typingUsers, [senderId]: false },
            }));
        });

        // Reaction listener
        socket.on("messageReaction", ({ messageId, reactions }) => {
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === messageId ? { ...msg, reactions } : msg
                ),
            }));
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("messageReaction");
    },
}));