import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";
import { ShieldAlert } from "lucide-react";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser, unreadCounts, typingUsers } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => {
        const unreadCount = unreadCounts[chat._id] || 0;
        const isTyping = typingUsers[chat._id];
        const isBlocked = authUser?.blockedUsers?.includes(chat._id);

        return (
          <div
            key={chat._id}
            className={`bg-cyan-500/10 p-3 md:p-4 rounded-xl cursor-pointer hover:bg-cyan-500/20 transition-all flex items-center gap-2 md:gap-3 border border-transparent ${isBlocked ? "opacity-40 grayscale blur-[0.5px] border-red-500/20" : "hover:border-cyan-500/30"}`}
            onClick={() => setSelectedUser(chat)}
          >
            <div className={`avatar flex-shrink-0 ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-10 md:size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
              {isBlocked && (
                <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 border border-slate-900 shadow-lg">
                  <ShieldAlert className="size-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-slate-200 font-medium text-sm md:text-base truncate">{chat.fullName}</h4>
                {isBlocked && <span className="text-[10px] text-red-500 font-bold uppercase tracking-tighter">Blocked</span>}
              </div>
              {isTyping && !isBlocked && (
                <p className="text-cyan-400 text-xs animate-pulse">typing...</p>
              )}
              {isBlocked && (
                <p className="text-slate-500 text-[10px] truncate">This contact is blocked</p>
              )}
            </div>

            {/* Unread badge */}
            {unreadCount > 0 && !isBlocked && (
              <span className="flex-shrink-0 bg-cyan-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-in zoom-in">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
}
export default ChatsList;