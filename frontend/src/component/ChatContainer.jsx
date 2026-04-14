import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceHolder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

// Quick-react emojis shown on hover
const QUICK_EMOJIS = ["😂", "❤️", "👍", "😮", "😢", "👏"];

function ChatContainer() {
    const {
        selectedUser,
        getMessagesByUserId,
        messages,
        isMessagesLoading,
        subscribeToMessages,
        unsubscribeFromMessages,
        typingUsers,
        reactToMessage,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const [hoveredMsgId, setHoveredMsgId] = useState(null);

    const isTyping = typingUsers[selectedUser?._id];

    useEffect(() => {
        getMessagesByUserId(selectedUser._id);
        subscribeToMessages();

        // clean up
        return () => unsubscribeFromMessages();
    }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    // Group reactions: { emoji: count }
    const groupReactions = (reactions = []) => {
        return reactions.reduce((acc, r) => {
            acc[r.emoji] = (acc[r.emoji] || 0) + 1;
            return acc;
        }, {});
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-900/40 relative">
            <ChatHeader />

            {/* Scrollable messages area */}
            <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-8 overscroll-contain scroll-smooth">
                {messages.length > 0 && !isMessagesLoading ? (
                    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 pb-4">
                        {messages.map((msg) => {
                            const isMine = msg.senderId === authUser._id;
                            const groupedReactions = groupReactions(msg.reactions);
                            const hasReactions = Object.keys(groupedReactions).length > 0;

                            return (
                                <div
                                    key={msg._id}
                                    className={`chat ${isMine ? "chat-end" : "chat-start"}`}
                                    onMouseEnter={() => setHoveredMsgId(msg._id)}
                                    onMouseLeave={() => setHoveredMsgId(null)}
                                >
                                    <div className="relative">
                                        {/* Quick reaction bar on hover */}
                                        {hoveredMsgId === msg._id && (
                                            <div
                                                className={`absolute ${isMine ? "right-full mr-2" : "left-full ml-2"} top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2 py-1 shadow-lg`}
                                            >
                                                {QUICK_EMOJIS.map((emoji) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => reactToMessage(msg._id, emoji)}
                                                        className="text-lg hover:scale-125 transition-transform duration-150"
                                                        title={emoji}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {/* Message bubble */}
                                        <div
                                            className={`chat-bubble relative max-w-[85vw] md:max-w-none ${isMine
                                                ? "bg-cyan-600 text-white"
                                                : "bg-slate-800 text-slate-200"
                                                }`}
                                        >
                                            {msg.image && (
                                                <img
                                                    src={msg.image}
                                                    alt="Shared"
                                                    className="rounded-lg w-full max-w-[260px] md:max-w-xs h-auto object-cover"
                                                />
                                            )}
                                            {msg.text && <p className="mt-2 break-words">{msg.text}</p>}
                                            <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                                                {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>

                                        {/* Reaction pills below the bubble */}
                                        {hasReactions && (
                                            <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                                                {Object.entries(groupedReactions).map(([emoji, count]) => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => reactToMessage(msg._id, emoji)}
                                                        className="flex items-center gap-0.5 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 text-sm hover:bg-slate-700 transition-colors"
                                                    >
                                                        <span>{emoji}</span>
                                                        {count > 1 && <span className="text-slate-300 text-xs">{count}</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="chat chat-start">
                                <div className="chat-bubble bg-slate-800 text-slate-200 flex items-center gap-1 py-3 px-4">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                                </div>
                            </div>
                        )}

                        {/* scroll anchor */}
                        <div ref={messageEndRef} />
                    </div>
                ) : isMessagesLoading ? (
                    <MessagesLoadingSkeleton />
                ) : (
                    <NoChatHistoryPlaceholder name={selectedUser.fullName} />
                )}
            </div>

            <MessageInput />
        </div>
    );
}

export default ChatContainer;