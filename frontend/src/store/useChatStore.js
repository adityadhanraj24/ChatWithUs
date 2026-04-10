import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedContact: null,
    isUsersLoading: false,
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

    sendMessage: async (messageData) => {

        const { selectedUser, messages } = get();
        const { authUser } = useAuthStore.getState()

        const tempId = `temp-${Date.now()}`;
        const optimisiticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            image: messageData.image,
            createdAt: new Date().toISOString(),
        }
        set({ messages: [...messages, optimisiticMessage] })

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: messages.concat(res.data) })
        } catch (error) {
            set({ messages: messages })
            toast.error(error.response?.data?.message || "Something went wrong.");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser, isSoundEnabled } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        // New message listener
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;

            if (isMessageSentFromSelectedUser) {
                // Message is from the open chat — append it
                const currentMessages = get().messages;
                set({ messages: [...currentMessages, newMessage] });

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
                        [newMessage.senderId]: (state.unreadCounts[newMessage.senderId] || 0) + 1,
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
            if (senderId === selectedUser._id) {
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

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("newMessage");
        socket.off("typing");
        socket.off("stopTyping");
    },



}));