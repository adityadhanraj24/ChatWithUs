import { ArrowLeftIcon, XIcon, Phone, Video, MoreVertical, ShieldAlert, ShieldCheck } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import toast from "react-hot-toast";

function ChatHeader() {
    const { selectedUser, setSelectedUser } = useChatStore();
    const { onlineUsers, authUser } = useAuthStore();
    const { blockUser, unblockUser } = useFriendStore();
    const [showMenu, setShowMenu] = useState(false);
    
    const isOnline = onlineUsers.includes(selectedUser._id);
    const isBlocked = authUser?.blockedUsers?.includes(selectedUser._id);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape") setSelectedUser(null);
        };

        window.addEventListener("keydown", handleEscKey);

        // cleanup function
        return () => window.removeEventListener("keydown", handleEscKey);
    }, [setSelectedUser]);

    const handleCallClick = () => {
        toast("Calling feature coming soon!", { icon: "📞" });
    };

    const handleBlockToggle = async () => {
        if (isBlocked) {
            await unblockUser(selectedUser._id);
        } else {
            await blockUser(selectedUser._id);
        }
        setShowMenu(false);
    };

    return (
        <div className="flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 min-h-[64px] md:min-h-[84px] px-3 md:px-6 gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {/* Back button — mobile only */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
                    aria-label="Back"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>

                <div className={`avatar flex-shrink-0 ${isOnline ? "online" : "offline"}`}>
                    <div className="w-9 md:w-12 rounded-full">
                        <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
                    </div>
                </div>

                <div className="min-w-0">
                    <h3 className="text-slate-200 font-medium text-sm md:text-base truncate">
                        {selectedUser.fullName}
                    </h3>
                    <p className="text-slate-400 text-xs">{isOnline ? "Online" : "Offline"}</p>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2 md:gap-4">
                    <button 
                        onClick={handleCallClick}
                        className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                        title="Voice Call (Coming Soon)"
                    >
                        <Phone className="size-5 md:size-6" />
                    </button>
                    <button 
                        onClick={handleCallClick}
                        className="text-slate-400 hover:text-cyan-400 transition-colors p-2"
                        title="Video Call (Coming Soon)"
                    >
                        <Video className="size-5 md:size-6" />
                    </button>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="text-slate-400 hover:text-slate-200 transition-colors p-2"
                    >
                        <MoreVertical className="size-5 md:size-6" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                            <button
                                onClick={handleBlockToggle}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition-colors ${
                                    isBlocked ? "text-green-400 hover:bg-green-400/10" : "text-red-400 hover:bg-red-400/10"
                                }`}
                            >
                                {isBlocked ? (
                                    <><ShieldCheck className="size-4" /> Unblock User</>
                                ) : (
                                    <><ShieldAlert className="size-4" /> Block User</>
                                )}
                            </button>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 flex items-center gap-2 transition-colors md:hidden"
                            >
                                <XIcon className="size-4" /> Close Chat
                            </button>
                        </div>
                    )}
                </div>

                {/* Close button — desktop only */}
                <button
                    onClick={() => setSelectedUser(null)}
                    className="hidden md:block flex-shrink-0"
                >
                    <XIcon className="w-5 h-5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer" />
                </button>
            </div>
        </div>
    );
}
export default ChatHeader;