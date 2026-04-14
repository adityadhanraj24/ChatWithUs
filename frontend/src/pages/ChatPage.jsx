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
    /* FIXED SIZE CONTAINER: Size remains same in all conditions */
    <div className="relative w-[95vw] max-w-6xl mx-auto h-[85vh] md:h-[820px] flex items-center justify-center">
      <BorderAnimate>
        {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
        <div
          className={`
            ${selectedUser ? "hidden md:flex" : "flex"}
            w-full md:w-80 bg-slate-800/80 backdrop-blur-md flex-col flex-shrink-0 overflow-hidden h-full border-r border-slate-700/30
          `}
        >
          {/* App brand strip — visible on desktop inside sidebar */}
          <AppBrand />

          <ProfileHeader />
          
          <SidebarSearch />
          
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 overscroll-contain scrollbar-hide">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* ── RIGHT CHAT PANEL ─────────────────────────────────── */}
        <div
          className={`
            ${selectedUser ? "flex" : "hidden md:flex"}
            flex-1 flex-col bg-slate-900/60 backdrop-blur-md min-w-0 overflow-hidden h-full
          `}
        >
          {selectedUser ? (
            <ChatContainer />
          ) : (
            <NoConversationPlaceholder />
          )}
        </div>
      </BorderAnimate>
    </div>
  );
}
export default ChatPage;