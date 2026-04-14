import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
    pendingRequests: [],
    searchResults: null,
    isSearching: false,
    isProcessing: false,

    searchUser: async (email) => {
        set({ isSearching: true, searchResults: null });
        try {
            const res = await axiosInstance.post("/friends/search", { email });
            set({ searchResults: res.data });
        } catch (error) {
            toast.error(error.response.data.message || "User not found");
        } finally {
            set({ isSearching: false });
        }
    },

    sendRequest: async (userId) => {
        set({ isProcessing: true });
        try {
            await axiosInstance.post(`/friends/request/${userId}`);
            toast.success("Friend request sent");
        } catch (error) {
            toast.error(error.response.data.message || "Failed to send request");
        } finally {
            set({ isProcessing: false });
        }
    },

    getPendingRequests: async () => {
        try {
            const res = await axiosInstance.get("/friends/requests");
            set({ pendingRequests: res.data });
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    },

    acceptRequest: async (requestId) => {
        set({ isProcessing: true });
        try {
            await axiosInstance.put(`/friends/accept/${requestId}`);
            set((state) => ({
                pendingRequests: state.pendingRequests.filter((r) => r._id !== requestId),
            }));
            toast.success("Friend request accepted");
        } catch (error) {
            toast.error(error.response.data.message || "Failed to accept request");
        } finally {
            set({ isProcessing: false });
        }
    },

    blockUser: async (userId) => {
        try {
            await axiosInstance.post(`/friends/block/${userId}`);
            toast.success("User blocked");
        } catch (error) {
            toast.error(error.response.data.message || "Failed to block user");
        }
    },

    unblockUser: async (userId) => {
        try {
            await axiosInstance.post(`/friends/unblock/${userId}`);
            toast.success("User unblocked");
        } catch (error) {
            toast.error(error.response.data.message || "Failed to unblock user");
        }
    },
}));