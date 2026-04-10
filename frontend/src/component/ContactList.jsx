import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
    const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers = [] } = useAuthStore();

    useEffect(() => {
        getAllContacts();
    }, [getAllContacts]);

    if (isUsersLoading || !allContacts) return <UsersLoadingSkeleton />;

    return (
        <div className="flex flex-col gap-2">
            {allContacts.length === 0 && (
                <div className="text-slate-400 text-center text-sm p-4 mt-2">No Contacts found.</div>
            )}
            {allContacts.map((contact) => (
                <div
                    key={contact._id}
                    className="bg-cyan-500/10 p-3 md:p-4 rounded-lg cursor-pointer hover:bg-cyan-500/20 transition-colors"
                    onClick={() => setSelectedUser(contact)}
                >
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className={`avatar flex-shrink-0 ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
                            <div className="size-10 md:size-12 rounded-full overflow-hidden">
                                <img src={contact.profilePic || "/avatar.png"} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <h4 className="text-slate-200 font-medium text-sm md:text-base truncate">{contact.fullName}</h4>
                    </div>
                </div>
            ))}
        </div>
    );
}
export default ContactList;