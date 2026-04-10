import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
    const { setActiveTab } = useChatStore();
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 space-y-4">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <MessageCircleIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
                <h4 className="text-xl font-medium text-slate-200 mb-1">No Conversations Yet</h4>
                <p className="max-w-sm text-sm">
                    Choose a contact from the sidebar to start messaging.
                </p>
            </div>
            <button className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors" onClick={() => setActiveTab("contacts")}>Find Contacts</button>
        </div>

    );
}
export default NoChatsFound;