import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { ImageIcon, SendIcon, XIcon, SmileIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";
import EmojiPicker from "emoji-picker-react";

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
        <div className="p-2 sm:p-4 border-t border-slate-700/50 relative bg-slate-900/50 backdrop-blur-md">
            {/* Emoji Picker - Adjusted for better mobile positioning */}
            {showEmojiPicker && (
                <div
                    ref={emojiPickerRef}
                    className="absolute bottom-full mb-2 left-0 right-0 sm:left-4 sm:right-auto z-50 flex justify-center sm:block"
                >
                    <div className="shadow-2xl rounded-xl overflow-hidden border border-slate-700">
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme="dark"
                            height={window.innerWidth < 640 ? 300 : 380}
                            width={window.innerWidth < 640 ? "95vw" : 320}
                            searchDisabled={false}
                            skinTonesDisabled
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                </div>
            )}

            {imagePreview && (
                <div className="max-w-3xl mx-auto mb-3 flex items-center px-2">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                            onClick={removeImagePreview}
                            className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700 border border-slate-600"
                            type="button"
                        >
                            <XIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-3">
                {/* Emoji button */}
                <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`flex-shrink-0 p-2 sm:px-3 text-slate-400 hover:text-yellow-400 rounded-lg transition-all active:scale-95 ${showEmojiPicker ? "text-yellow-400 bg-slate-800" : "hover:bg-slate-800/50"}`}
                    title="Emoji"
                >
                    <SmileIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Main Input Container */}
                <div className="flex-1 relative flex items-center">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            isSoundEnabled && playRandomKeyStrokeSound();
                            emitTyping();
                        }}
                        className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl py-2 sm:py-2.5 px-3 sm:px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-sm sm:text-base"
                        placeholder="Type your message..."
                    />
                    
                    {/* Image upload inside input for better spacing on mobile */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`absolute right-2 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors ${imagePreview ? "text-cyan-500" : "hover:bg-slate-700/50"}`}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
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
                    className="flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl p-2 sm:px-5 sm:py-2.5 font-medium hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                >
                    <SendIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
            </form>
        </div>
    );
}
export default MessageInput;