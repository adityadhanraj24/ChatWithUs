import { useChatStore } from "../store/useChatStore";

import BorderAnimate from "../component/BorderAnimate";
import ProfileHeader from "../component/ProfileHeader";
import ActiveTabSwitch from "../component/ActiveTabSwitch";
import ChatsList from "../component/ChatsList";
import ContactList from "../component/ContactList";
import NoConversationPlaceholder from "../component/NoConversationPlaceholder";
import ChatContainer from "../component/ChatContainer";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="relative w-full max-w-6xl h-[calc(100dvh-2rem)] md:h-[800px]">
      <BorderAnimate>
        {/* LEFT SIDE — hidden on mobile when a chat is open */}
        <div
          className={`
            ${selectedUser ? "hidden md:flex" : "flex"}
            w-full md:w-80 bg-slate-800/50 backdrop-blur-sm flex-col flex-shrink-0
          `}
        >
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactList />}
          </div>
        </div>

        {/* RIGHT SIDE — full width on mobile when chat open, hidden when not selected */}
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