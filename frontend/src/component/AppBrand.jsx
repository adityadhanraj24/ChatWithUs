/**
 * AppBrand — shows the ChatSaathi logo + tagline at the top of the sidebar
 * when the user is logged in and viewing the chat page.
 */
function AppBrand() {
  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-slate-700/30 text-center">
      <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent leading-tight">
        ChatSaathi
      </h1>
      <p className="text-[10px] text-slate-500 mt-0.5 tracking-wide">Where Every Message Matters.</p>
    </div>
  );
}

export default AppBrand;
