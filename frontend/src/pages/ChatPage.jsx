import { useChatStore } from "../store/useChatStore";

import BorderAnimate from "../component/BorderAnimate";
import ProfileHeader from "../component/ProfileHeader";
import ActiveTabSwitch from "../component/ActiveTabSwitch";
import ChatsList from "../component/ChatsList";
import ContactList from "../component/ContactList";
import NoConversationPlaceholder from "../component/NoConversationPlaceholder";
import ChatContainer from "../component/ChatContainer";
import AppBrand from "../component/AppBrand";
import SidebarSearch from "../component/SidebarSearch";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    /* STABLE PROFESSIONAL CONTAINER: 
       Mobile: Full viewport height, no borders.
       Desktop: Centered, fixed height, nice rounded borders.
    */
    <div className="w-full h-full md:h-[calc(100vh-140px)] md:max-h-[750px] md:max-w-6xl mx-auto flex items-center justify-center">
      <div className="w-full h-full flex overflow-hidden bg-slate-800/20 backdrop-blur-xl md:rounded-3xl md:border md:border-slate-700/50 shadow-2xl shadow-black/40">
        
        {/* ── SIDEBAR ─────────────────────────────────────── */}
        <div
          className={`
            ${selectedUser ? "hidden md:flex" : "flex"}
            w-full md:w-[350px] lg:w-[400px] bg-slate-900/40 flex-col flex-shrink-0 border-r border-slate-700/50 transition-all duration-300
          `}
        >
          {/* Top header parts */}
          <div className="flex-shrink-0 bg-slate-900/60 backdrop-blur-md">
            <AppBrand />
            <ProfileHeader />
            <SidebarSearch />
            <ActiveTabSwitch />
          </div>

          {/* Scrollable list part */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-hide p-2 md:p-3 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* ── MAIN CHAT VIEW ─────────────────────────────────── */}
        <div
          className={`
            ${selectedUser ? "flex" : "hidden md:flex"}
            flex-1 flex-col bg-slate-950/20 backdrop-blur-sm min-w-0 transition-all duration-300
          `}
        >
          {selectedUser ? (
            <ChatContainer />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
               <NoConversationPlaceholder />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export default ChatPage;