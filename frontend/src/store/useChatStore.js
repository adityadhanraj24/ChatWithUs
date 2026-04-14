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

    moveChatToTop: (user) => {
        const { chats } = get();
        const existingChatIndex = chats.findIndex(c => c._id === user._id);
        
        let updatedChats = [...chats];
        if (existingChatIndex !== -1) {
            updatedChats.splice(existingChatIndex, 1);
        }
        updatedChats.unshift(user);
        set({ chats: updatedChats });
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
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

        // Reorder instantly
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

    // GLOBAL Subscription for all messages (reordering & unread counts)
    subscribeToGlobalMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("newMessage", async (newMessage) => {
            const { selectedUser, chats, allUsers, isSoundEnabled } = get();
            const authUser = useAuthStore.getState().authUser;
            if (!authUser) return;

            const isSentByMe = newMessage.senderId === authUser._id;
            const otherUserId = isSentByMe ? newMessage.receiverId : newMessage.senderId;

            // 1. Move/Add to top of chats list
            let userToMove = chats.find(c => c._id === otherUserId);
            if (!userToMove) {
                userToMove = allUsers.find(u => u._id === otherUserId);
                if (!userToMove) {
                    await get().getMyChatPartners();
                    userToMove = get().chats.find(c => c._id === otherUserId);
                }
            }
            if (userToMove) get().moveChatToTop(userToMove);

            // 2. Update active chat messages if open
            if (selectedUser?._id === otherUserId) {
                // If message is not already in list (avoid duplicates from optimistic update)
                const exists = get().messages.some(m => m._id === newMessage._id);
                if (!exists) {
                    set({ messages: [...get().messages, newMessage] });
                }
            } else if (!isSentByMe) {
                // 3. Increment unread count for background chats
                set((state) => ({
                    unreadCounts: {
                        ...state.unreadCounts,
                        [otherUserId]: (state.unreadCounts[otherUserId] || 0) + 1,
                    },
                }));
            }

            // 4. Play sound
            if (isSoundEnabled && !isSentByMe) {
                const sound = new Audio("/Sounds/notification.mp3");
                sound.currentTime = 0;
                sound.play().catch((e) => console.log("Audio play failed:", e));
            }
        });

        socket.on("messageReaction", ({ messageId, reactions }) => {
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg._id === messageId ? { ...msg, reactions } : msg
                ),
            }));
        });
    },

    // LOCAL Subscription for typing indicators
    subscribeToChatEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

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
    },

    unsubscribeFromGlobalMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("messageReaction");
    },

    unsubscribeFromChatEvents: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("typing");
        socket.off("stopTyping");
    },
}));