import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

function MessageInput() {
    const { playRandomKeyStrokeSound } = useKeyboardSound();
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
    const { socket } = useAuthStore();

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

    return (
        <div className="p-4 border-t border-slate-700/50">
            {imagePreview && (
                <div className="max-w-3xl mx-auto mb-3 flex items-center">
                    <div className="relative">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                        />
                        <button
                            onClick={removeImagePreview}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
                            type="button"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-4">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => {
                        setText(e.target.value);
                        isSoundEnabled && playRandomKeyStrokeSound();
                        emitTyping();
                    }}
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4"
                    placeholder="Type your message..."
                />

                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImagePreview}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${imagePreview ? "text-cyan-500" : ""
                        }`}
                >
                    <ImageIcon className="w-5 h-5" />
                </button>
                <button
                    type="submit"
                    disabled={!text.trim() && !imagePreview}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
export default MessageInput;