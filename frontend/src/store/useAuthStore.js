import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "https://chatwithus-production.up.railway.app";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isLoggedIn: false,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data, isLoggedIn: true });
            get().connectSocket();
        } catch (error) {
            console.log("checkAuth:", error.response?.data?.message || "User is not authenticated");
            set({ authUser: null, isLoggedIn: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            
            // Store token for mobile fallback
            if (res.data.token) {
                localStorage.setItem("jwt", res.data.token);
            }

            set({ authUser: res.data, isLoggedIn: true });
            toast.success("Logged in Successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please check console.");
            console.log("Error in login:", error);
            set({ authUser: null, isLoggedIn: false });
        } finally {
            set({ isLoggingIn: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            
            // Store token for mobile fallback
            if (res.data.token) {
                localStorage.setItem("jwt", res.data.token);
            }

            set({ authUser: res.data, isLoggedIn: true });
            toast.success("Account Created Successfully");
            
            get().connectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please check console.");
            console.log("Error in signup:", error);
            set({ authUser: null, isLoggedIn: false });
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            
            // Clear token
            localStorage.removeItem("jwt");

            set({ authUser: null, isLoggedIn: false });
            toast.success("Logged out Successfully");

            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please check console.");
            console.log("Error in logout:", error);
            // Even if request fails, clear local state
            localStorage.removeItem("jwt");
            set({ authUser: null, isLoggedIn: false });
        }
    },

    updateProfile: async (data) => {
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please check console.");
            console.log("Error in updateProfile:", error);
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        
        const token = localStorage.getItem("jwt");

        const socket = io(BASE_URL, {
            withCredentials: true,
            auth: {
                token: token // Pass token for mobile fallback
            }
        });

        socket.connect();

        set({ socket })

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds })
        })
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
        set({ socket: null })
    }

}));