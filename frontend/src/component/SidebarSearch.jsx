import { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { SearchIcon, UserPlusIcon, CheckIcon, UserCheck } from "lucide-react";

function SidebarSearch() {
    const { 
        searchUser, searchResults, isSearching, 
        sendRequest, getPendingRequests, pendingRequests, 
        acceptRequest, isProcessing 
    } = useFriendStore();
    const { getAllContacts } = useChatStore();
    const { authUser } = useAuthStore();
    const [searchEmail, setSearchEmail] = useState("");

    useEffect(() => {
        getPendingRequests();
        const interval = setInterval(getPendingRequests, 15000); 
        return () => clearInterval(interval);
    }, [getPendingRequests]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchEmail.trim()) {
            searchUser(searchEmail);
        }
    };

    const handleAccept = async (id) => {
        await acceptRequest(id);
        getAllContacts(); // Refresh contact list immediately after adding friend
    };

    // Check if the search result is already a friend
    const isAlreadyFriend = authUser?.friends?.includes(searchResults?._id);

    return (
        <div className="px-4 py-2 space-y-3 border-b border-slate-700/50 bg-slate-900/20">
            {/* Search Bar - The ONLY way to find unknown users */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input
                        type="email"
                        placeholder="Search known user by email..."
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 p-2 rounded-xl border border-cyan-500/20 transition-all disabled:opacity-50"
                >
                    {isSearching ? <span className="loading loading-spinner loading-xs"></span> : <SearchIcon className="size-4" />}
                </button>
            </form>

            {/* Search Results */}
            {searchResults && (
                <div className="bg-slate-800/60 p-2.5 rounded-xl flex items-center justify-between gap-2 border border-cyan-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <img src={searchResults.profilePic || "/avatar.png"} className="size-8 rounded-full flex-shrink-0 object-cover border border-slate-700" />
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-200 truncate">{searchResults.fullName}</p>
                            <p className="text-[9px] text-slate-500 truncate">{isAlreadyFriend ? "Already in contacts" : "Found user"}</p>
                        </div>
                    </div>
                    
                    {!isAlreadyFriend ? (
                        <button
                            onClick={() => sendRequest(searchResults._id)}
                            disabled={isProcessing}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white p-1.5 rounded-lg transition-all flex-shrink-0 shadow-lg shadow-cyan-900/20 disabled:opacity-50"
                            title="Add Friend"
                        >
                            <UserPlusIcon className="size-3.5" />
                        </button>
                    ) : (
                        <div className="p-1.5 bg-slate-700/50 text-slate-400 rounded-lg">
                            <UserCheck className="size-3.5" />
                        </div>
                    )}
                </div>
            )}

            {/* Pending Requests Badge/List */}
            {pendingRequests.length > 0 && (
                <div className="space-y-1.5 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 px-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            New Requests
                        </p>
                    </div>
                    <div className="max-h-32 overflow-y-auto scrollbar-hide space-y-1">
                        {pendingRequests.map((req) => (
                            <div key={req._id} className="bg-cyan-500/5 p-2 rounded-xl flex items-center justify-between gap-2 border border-slate-800 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-2 min-w-0">
                                    <img src={req.sender.profilePic || "/avatar.png"} className="size-6 rounded-full flex-shrink-0 object-cover border border-slate-700" />
                                    <p className="text-[11px] font-medium text-slate-300 truncate">{req.sender.fullName}</p>
                                </div>
                                <button
                                    onClick={() => handleAccept(req._id)}
                                    disabled={isProcessing}
                                    className="bg-green-500/20 hover:bg-green-500/40 text-green-400 p-1.5 rounded-lg transition-all border border-green-500/20"
                                >
                                    <CheckIcon className="size-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SidebarSearch;