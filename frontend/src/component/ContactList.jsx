import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { ShieldAlert, UserCheck } from "lucide-react";

function ContactList() {
    const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers = [], authUser } = useAuthStore();

    useEffect(() => {
        getAllContacts();
    }, [getAllContacts]);

    if (isUsersLoading || !allContacts) return <UsersLoadingSkeleton />;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-2 mb-1">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    My Contacts
                </h5>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                    {allContacts.length}
                </span>
            </div>

            {allContacts.length === 0 && (
                <div className="text-slate-400 text-center text-xs p-8 mt-2 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center gap-3">
                    <div className="p-3 bg-slate-800/50 rounded-full">
                        <UserCheck className="size-5 text-slate-600" />
                    </div>
                    <p>No contacts yet. Search for a friend's email to start connecting!</p>
                </div>
            )}

            {allContacts.map((contact) => {
                const isBlocked = authUser?.blockedUsers?.includes(contact._id);
                const isOnline = onlineUsers.includes(contact._id);

                return (
                    <div
                        key={contact._id}
                        className={`group bg-slate-800/30 p-3 rounded-xl border border-transparent transition-all hover:bg-slate-700/40 hover:border-slate-700/50 flex items-center justify-between gap-3 ${isBlocked ? "opacity-40 grayscale blur-[0.5px]" : ""}`}
                    >
                        <div 
                            className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                            onClick={() => !isBlocked && setSelectedUser(contact)}
                        >
                            <div className={`avatar flex-shrink-0 ${isOnline ? "online" : "offline"}`}>
                                <div className="size-10 md:size-11 rounded-full overflow-hidden border border-slate-700/50">
                                    <img src={contact.profilePic || "/avatar.png"} className="w-full h-full object-cover" alt={contact.fullName} />
                                </div>
                                {isBlocked && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 border border-slate-900">
                                        <ShieldAlert className="size-3 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-slate-200 font-medium text-sm md:text-base truncate">{contact.fullName}</h4>
                                <p className="text-[10px] text-slate-500 truncate">{isOnline ? "Active now" : "Offline"}</p>
                            </div>
                        </div>
                        
                        {isBlocked && (
                            <ShieldAlert className="size-4 text-red-500/40" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ContactList;