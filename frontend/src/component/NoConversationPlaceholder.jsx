import { MessageSquareIcon } from "lucide-react";

function NoConversationPlaceholder() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
        <MessageSquareIcon className="w-8 h-8 text-cyan-400" />
      </div>
      <h3 className="text-xl font-medium text-slate-200 mb-2">No Chat Selected</h3>
      <p className="max-w-sm text-sm">
        Choose a contact from the sidebar to start messaging.
      </p>
    </div>
  );
}

export default NoConversationPlaceholder;
