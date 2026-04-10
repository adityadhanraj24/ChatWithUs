function UsersLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="flex items-center gap-3 bg-slate-800/30 p-4 rounded-lg animate-pulse">
          <div className="w-12 h-12 bg-slate-700 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 bg-slate-700 rounded w-1/3" />
            <div className="h-3 bg-slate-700/50 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default UsersLoadingSkeleton;
