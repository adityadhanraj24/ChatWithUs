import { useChatStore } from "../store/useChatStore";

import BorderAnimate from "../component/BorderAnimate";
import ProfileHeader from "../component/ProfileHeader";
import ActiveTabSwitch from "../component/ActiveTabSwitch";
import ChatsList from "../component/ChatsList";
import ContactList from "../component/ContactList";
import NoConversationPlaceholder from "../component/NoConversationPlaceholder";
import ChatContainer from "../component/ChatContainer";
import AppBrand from "../component/AppBrand";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    /* Fill all space given by App's <main> without overflowing */
    <div className="relative w-full max-w-6xl" style={{ height: "min(calc(100dvh - 112px), 820px)" }}>
      <BorderAnimate>
        {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
        <div
          className={`
            ${selectedUser ? "hidden md:flex" : "flex"}
            w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col flex-shrink-0 overflow-hidden
          `}
        >
          {/* App brand strip — visible on desktop inside sidebar */}
          <AppBrand />

          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 overscroll-contain">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* ── RIGHT CHAT PANEL ─────────────────────────────────── */}
        <div
          className={`
            ${selectedUser ? "flex" : "hidden md:flex"}
            flex-1 flex-col bg-slate-900/50 backdrop-blur-sm min-w-0 overflow-hidden
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