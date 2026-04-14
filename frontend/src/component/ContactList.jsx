import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { UserPlusIcon, ShieldAlert } from "lucide-react";

function ContactList() {
    const { getAllUsers, allUsers, setSelectedUser, isAllUsersLoading } = useChatStore();
    const { onlineUsers = [], authUser } = useAuthStore();
    const { sendRequest, isProcessing } = useFriendStore();

    useEffect(() => {
        getAllUsers();
    }, [getAllUsers]);

    if (isAllUsersLoading || !allUsers) return <UsersLoadingSkeleton />;

    return (
        <div className="flex flex-col gap-2">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">
                Global Directory
            </h5>
            {allUsers.length === 0 && (
                <div className="text-slate-400 text-center text-sm p-4 mt-2 bg-slate-800/20 rounded-lg">
                    No users found.
                </div>
            )}
            {allUsers.map((user) => {
                const isBlocked = authUser?.blockedUsers?.includes(user._id);
                const isFriend = authUser?.friends?.includes(user._id);

                return (
                    <div
                        key={user._id}
                        className={`group bg-slate-800/40 p-3 rounded-xl border border-slate-700/30 transition-all hover:bg-slate-700/40 flex items-center justify-between gap-3 ${isBlocked ? "opacity-40 grayscale blur-[0.5px]" : ""}`}
                    >
                        <div 
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                            onClick={() => !isBlocked && setSelectedUser(user)}
                        >
                            <div className={`avatar flex-shrink-0 ${onlineUsers.includes(user._id) ? "online" : "offline"}`}>
                                <div className="size-10 md:size-11 rounded-full overflow-hidden">
                                    <img src={user.profilePic || "/avatar.png"} className="w-full h-full object-cover" alt={user.fullName} />
                                </div>
                                {isBlocked && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border border-slate-900">
                                        <ShieldAlert className="size-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-slate-200 font-medium text-sm md:text-base truncate">{user.fullName}</h4>
                                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                            </div>
                        </div>

                        {!isFriend && !isBlocked && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sendRequest(user._id);
                                }}
                                disabled={isProcessing}
                                className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 p-2 rounded-lg transition-colors disabled:opacity-50"
                                title="Send Friend Request"
                            >
                                <UserPlusIcon className="size-4" />
                            </button>
                        )}
                        
                        {isBlocked && (
                            <ShieldAlert className="size-5 text-red-500/50" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ContactList;