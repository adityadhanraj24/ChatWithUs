import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceHolder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";


function ChatContainer() {
    const {
        selectedUser,
        getMessagesByUserId,
        messages,
        isMessagesLoading,
        subscribeToMessages,
        unsubscribeFromMessages,
        typingUsers,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

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

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <ChatHeader />

            {/* Scrollable messages area */}
            <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-8">
                {messages.length > 0 && !isMessagesLoading ? (
                    <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
                        {messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                            >
                                <div
                                    className={`chat-bubble relative max-w-[85vw] md:max-w-none ${msg.senderId === authUser._id
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
                            </div>
                        ))}

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