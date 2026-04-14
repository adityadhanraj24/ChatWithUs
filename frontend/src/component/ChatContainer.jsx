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
        subscribeToChatEvents,
        unsubscribeFromChatEvents,
        typingUsers,
        reactToMessage,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const [hoveredMsgId, setHoveredMsgId] = useState(null);

    const isTyping = typingUsers[selectedUser?._id];

    useEffect(() => {
        getMessagesByUserId(selectedUser._id);
        subscribeToChatEvents();

        // clean up
        return () => unsubscribeFromChatEvents();
    }, [selectedUser, getMessagesByUserId, subscribeToChatEvents, unsubscribeFromChatEvents]);

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
        <div className="h-full flex flex-col overflow-hidden bg-slate-950/20 relative">
            <div className="flex-shrink-0 z-20 shadow-md">
                <ChatHeader />
            </div>

            {/* Scrollable messages area with a subtle pattern */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 overscroll-contain scroll-smooth bg-[radial-gradient(circle_at_center,rgba(20,30,50,0.4)_0%,transparent_100%)]">
                <div className="max-w-4xl mx-auto flex flex-col min-h-full">
                    <div className="flex-1">
                        {messages.length > 0 && !isMessagesLoading ? (
                            <div className="space-y-4 md:space-y-6 pb-6">
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
                                                    className={`chat-bubble relative break-words ${isMine
                                                        ? "bg-cyan-600 text-white shadow-cyan-900/20"
                                                        : "bg-slate-800 text-slate-200 border border-slate-700/50"
                                                        } max-w-[85%] md:max-w-[75%] rounded-2xl shadow-sm`}
                                                >
                                                    {msg.image && (
                                                        <img
                                                            src={msg.image}
                                                            alt="Shared"
                                                            className="rounded-lg w-full max-w-[260px] md:max-w-xs h-auto object-cover mb-2"
                                                        />
                                                    )}
                                                    {msg.text && <p className="leading-relaxed text-sm md:text-base">{msg.text}</p>}
                                                    <p className={`text-[10px] mt-1.5 opacity-60 flex items-center gap-1 ${isMine ? "justify-end text-cyan-100" : "justify-start text-slate-400"}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </p>
                                                </div>

                                                {/* Reaction pills below the bubble */}
                                                {hasReactions && (
                                                    <div className={`flex flex-wrap gap-1 mt-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                                                        {Object.entries(groupedReactions).map(([emoji, count]) => (
                                                            <button
                                                                key={emoji}
                                                                onClick={() => reactToMessage(msg._id, emoji)}
                                                                className="flex items-center gap-1 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-full px-2.5 py-0.5 text-xs hover:bg-slate-700 transition-colors shadow-sm"
                                                            >
                                                                <span>{emoji}</span>
                                                                {count > 1 && <span className="text-slate-300 font-bold">{count}</span>}
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
                                    <div className="chat chat-start animate-in fade-in slide-in-from-left-2 duration-300">
                                        <div className="chat-bubble bg-slate-800/80 backdrop-blur-sm text-slate-200 flex items-center gap-1.5 py-3 px-4 rounded-2xl border border-slate-700/30">
                                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
                                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                                        </div>
                                    </div>
                                )}

                                <div ref={messageEndRef} />
                            </div>
                        ) : isMessagesLoading ? (
                            <MessagesLoadingSkeleton />
                        ) : (
                            <NoChatHistoryPlaceholder name={selectedUser.fullName} />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 z-20">
                <MessageInput />
            </div>
        </div>
    );
}

export default ChatContainer;