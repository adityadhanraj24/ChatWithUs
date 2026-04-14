import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { SearchIcon, UserPlusIcon, CheckIcon, XIcon, UserCheckIcon } from "lucide-react";

function ContactList() {
    const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
    const { onlineUsers = [] } = useAuthStore();
    const { 
        searchUser, searchResults, isSearching, 
        sendRequest, getPendingRequests, pendingRequests, 
        acceptRequest, isProcessing 
    } = useFriendStore();
    const [searchEmail, setSearchEmail] = useState("");

    useEffect(() => {
        getAllContacts();
        getPendingRequests();
    }, [getAllContacts, getPendingRequests]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchEmail.trim()) {
            searchUser(searchEmail);
        }
    };

    if (isUsersLoading || !allContacts) return <UsersLoadingSkeleton />;

    return (
        <div className="flex flex-col gap-4">
            {/* Search Section */}
            <div className="space-y-2">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="email"
                            placeholder="Find friend by email..."
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-3 rounded-lg transition-colors"
                    >
                        {isSearching ? <span className="loading loading-spinner loading-xs"></span> : <SearchIcon className="size-4" />}
                    </button>
                </form>

                {searchResults && (
                    <div className="bg-slate-700/30 p-3 rounded-lg flex items-center justify-between gap-2 border border-cyan-500/20">
                        <div className="flex items-center gap-2 min-w-0">
                            <img src={searchResults.profilePic || "/avatar.png"} className="size-8 rounded-full flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate">{searchResults.fullName}</p>
                                <p className="text-xs text-slate-400 truncate">{searchResults.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => sendRequest(searchResults._id)}
                            disabled={isProcessing}
                            className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 p-2 rounded-lg transition-colors flex-shrink-0"
                            title="Send Friend Request"
                        >
                            <UserPlusIcon className="size-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="space-y-2">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                        Friend Requests ({pendingRequests.length})
                    </h5>
                    {pendingRequests.map((req) => (
                        <div key={req._id} className="bg-slate-700/30 p-3 rounded-lg flex items-center justify-between gap-2 border border-slate-600">
                            <div className="flex items-center gap-2 min-w-0">
                                <img src={req.sender.profilePic || "/avatar.png"} className="size-8 rounded-full flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{req.sender.fullName}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                                <button
                                    onClick={() => acceptRequest(req._id)}
                                    disabled={isProcessing}
                                    className="bg-green-600/20 hover:bg-green-600/40 text-green-400 p-1.5 rounded-lg transition-colors"
                                    title="Accept"
                                >
                                    <CheckIcon className="size-4" />
                                </button>
                                {/* We could add reject functionality here too if desired */}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
                    Your Contacts
                </h5>
                {allContacts.length === 0 && (
                    <div className="text-slate-400 text-center text-sm p-4 mt-2 bg-slate-800/20 rounded-lg">No Contacts found.</div>
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
        </div>
    );
}
export default ContactList;