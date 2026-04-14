import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useChatStore } from "../store/useChatStore";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { ImageIcon, SendIcon, XIcon, SmileIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const EmojiPicker = lazy(() => import("emoji-picker-react"));

function MessageInput() {
    const { playRandomKeyStrokeSound } = useKeyboardSound();
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
    const { socket } = useAuthStore();

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const emitTyping = () => {
        if (!socket || !selectedUser) return;
        socket.emit("typing", { receiverId: selectedUser._id });

        // Clear any existing timeout then set a new one
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { receiverId: selectedUser._id });
        }, 2000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;

        // Stop typing indicator immediately on send
        if (socket && selectedUser) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            socket.emit("stopTyping", { receiverId: selectedUser._id });
        }

        if (isSoundEnabled) {
            playRandomKeyStrokeSound();
        }
        sendMessage({
            text: text.trim(),
            image: imagePreview,
        });
        setText("");
        setImagePreview(null);
        setShowEmojiPicker(false);
        if (fileInputRef.current)
            fileInputRef.current.value = "";
    };

    const handleImagePreview = (e) => {
        const file = e.target.files[0];
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
    };

    const removeImagePreview = () => {
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    return (
        <div className="p-3 md:p-5 relative bg-slate-900/80 backdrop-blur-xl border-t border-slate-700/40">
            {/* Emoji Picker - Premium styling */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute bottom-[calc(100%+12px)] left-2 right-2 sm:left-6 sm:right-auto z-50 flex justify-center sm:block"
                >
                    <div className="shadow-2xl rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 ring-1 ring-black/20">
                        <Suspense fallback={<div className="p-12 text-slate-400 flex flex-col items-center gap-2"><span className="loading loading-spinner loading-md text-cyan-500"></span><p className="text-xs">Loading Emojis...</p></div>}>
                            <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                theme="dark"
                                height={window.innerWidth < 640 ? 350 : 420}
                                width={window.innerWidth < 640 ? "calc(100vw - 32px)" : 350}
                                searchDisabled={false}
                                skinTonesDisabled
                                previewConfig={{ showPreview: false }}
                            />
                        </Suspense>
                    </div>
                </div>
            )}

            {imagePreview && (
                <div className="max-w-4xl mx-auto mb-4 flex items-center px-2 animate-in slide-in-from-bottom-2">
                    <div className="relative group">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                        />
                        <button
                            onClick={removeImagePreview}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-red-500 transition-colors border border-slate-600 shadow-md"
                            type="button"
                        >
                            <XIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="max-w-5xl mx-auto flex items-end gap-2 md:gap-4">
                {/* Tools */}
                <div className="flex items-center bg-slate-800/50 rounded-2xl p-1 border border-slate-700/40">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                        className={`p-2.5 text-slate-400 hover:text-yellow-400 rounded-xl transition-all active:scale-90 ${showEmojiPicker ? "text-yellow-400 bg-slate-700/60" : "hover:bg-slate-700/40"}`}
                        title="Emoji"
                    >
                        <SmileIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2.5 text-slate-400 hover:text-cyan-400 rounded-xl transition-all active:scale-90 ${imagePreview ? "text-cyan-400 bg-cyan-400/10" : "hover:bg-slate-700/40"}`}
                        title="Attach Image"
                    >
                        <ImageIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>

                {/* Text Area / Input */}
                <div className="flex-1 min-w-0">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            isSoundEnabled && playRandomKeyStrokeSound();
                            emitTyping();
                        }}
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl py-3 px-4 md:px-6 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/40 transition-all text-sm md:text-base shadow-inner"
                        placeholder="Type a message..."
                    />
                </div>

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImagePreview}
                    className="hidden"
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!text.trim() && !imagePreview}
                    className="flex-shrink-0 bg-gradient-to-tr from-cyan-600 to-teal-500 text-white rounded-2xl p-3 md:px-6 md:py-3 font-semibold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed group"
                >
                    <SendIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
            </form>
        </div>
    );
}

export default MessageInput;