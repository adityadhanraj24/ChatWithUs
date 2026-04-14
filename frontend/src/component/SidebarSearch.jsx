import { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { SearchIcon, UserPlusIcon, CheckIcon } from "lucide-react";

function SidebarSearch() {
    const { 
        searchUser, searchResults, isSearching, 
        sendRequest, getPendingRequests, pendingRequests, 
        acceptRequest, isProcessing 
    } = useFriendStore();
    const [searchEmail, setSearchEmail] = useState("");

    useEffect(() => {
        getPendingRequests();
        const interval = setInterval(getPendingRequests, 10000); // Poll for requests
        return () => clearInterval(interval);
    }, [getPendingRequests]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchEmail.trim()) {
            searchUser(searchEmail);
        }
    };

    return (
        <div className="px-4 py-2 space-y-3 border-b border-slate-700/50">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="email"
                        placeholder="Search by email..."
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    {isSearching ? <span className="loading loading-spinner loading-xs"></span> : <SearchIcon className="size-4" />}
                </button>
            </form>

            {/* Search Results */}
            {searchResults && (
                <div className="bg-slate-800/80 p-2 rounded-lg flex items-center justify-between gap-2 border border-cyan-500/30 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <img src={searchResults.profilePic || "/avatar.png"} className="size-8 rounded-full flex-shrink-0 object-cover" />
                        <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-200 truncate">{searchResults.fullName}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => sendRequest(searchResults._id)}
                        disabled={isProcessing}
                        className="bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-400 p-1.5 rounded-md transition-colors flex-shrink-0"
                        title="Send Friend Request"
                    >
                        <UserPlusIcon className="size-3.5" />
                    </button>
                </div>
            )}

            {/* Pending Requests Badge/List */}
            {pendingRequests.length > 0 && (
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                        Requests ({pendingRequests.length})
                    </p>
                    {pendingRequests.map((req) => (
                        <div key={req._id} className="bg-cyan-500/5 p-2 rounded-lg flex items-center justify-between gap-2 border border-slate-700/50">
                            <div className="flex items-center gap-2 min-w-0">
                                <img src={req.sender.profilePic || "/avatar.png"} className="size-6 rounded-full flex-shrink-0 object-cover" />
                                <p className="text-[11px] font-medium text-slate-300 truncate">{req.sender.fullName}</p>
                            </div>
                            <button
                                onClick={() => acceptRequest(req._id)}
                                disabled={isProcessing}
                                className="bg-green-600/20 hover:bg-green-600/40 text-green-400 p-1 rounded-md transition-colors"
                            >
                                <CheckIcon className="size-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SidebarSearch;