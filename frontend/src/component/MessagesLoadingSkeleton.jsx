const skeletonWidths = ["w-24", "w-36", "w-28", "w-40", "w-20", "w-32"];

function MessagesLoadingSkeleton() {
    return (
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 px-1">
            {[...Array(6)].map((_, index) => (
                <div
                    key={index}
                    className={`chat ${index % 2 === 0 ? "chat-start" : "chat-end"} animate-pulse`}
                >
                    <div className={`chat-bubble bg-slate-800 text-white ${skeletonWidths[index]} h-8`}></div>
                </div>
            ))}
        </div>
    );
}
export default MessagesLoadingSkeleton;