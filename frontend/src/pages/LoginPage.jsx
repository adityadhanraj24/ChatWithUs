import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimate from "../component/BorderAnimate";
import { MessageCircleIcon, LockIcon, MailIcon, LoaderIcon, Sparkles, LogIn } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const validateForm = () => {
    if (!formData.email.trim()) { toast.error("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { toast.error("Invalid email format"); return false; }
    if (!formData.password) { toast.error("Password is required"); return false; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      login(formData);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1120] relative overflow-hidden p-0 sm:p-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full h-full sm:h-auto sm:max-w-6xl sm:aspect-[16/9] lg:aspect-[16/8] z-10">
        <div className="hidden sm:block h-full w-full">
          <BorderAnimate>
            <LoginContent formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isLoggingIn={isLoggingIn} />
          </BorderAnimate>
        </div>
        
        {/* Mobile View */}
        <div className="sm:hidden w-full h-screen">
           <LoginContent formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isLoggingIn={isLoggingIn} />
        </div>
      </div>
    </div>
  );
}

function LoginContent({ formData, setFormData, handleSubmit, isLoggingIn }) {
  return (
    <div className="relative z-10 w-full h-full flex flex-col md:flex-row bg-[#111827]/80 backdrop-blur-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-slate-800/50">
      
      {/* BRANDING SECTION */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-900/20 p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden order-1 md:order-1">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6 animate-pulse">
            <LogIn className="size-3" />
            <span>Welcome back to ChatSaathi</span>
          </div>
          
          <img
            src="/signup.png"
            alt="Welcome"
            className="w-48 md:w-64 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(79,70,229,0.3)] animate-float"
          />
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            Hello<span className="text-indigo-400"> Again!</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Pick up right where you left off. Your friends are waiting for you.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="size-3 text-yellow-400" /> Fast Login
            </span>
            <span className="px-4 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-semibold">Secure Access</span>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="flex-1 bg-[#0B1120]/40 p-8 md:p-12 flex items-center justify-center order-2 md:order-2 relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Member Login</h2>
            <p className="text-slate-500 text-sm">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <MailIcon className="size-5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-inner"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Password</label>
                <button type="button" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider">Forgot Password?</button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <LockIcon className="size-5" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl py-4 font-bold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              type="submit" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center gap-2">
                  <LoaderIcon className="size-5 animate-spin" />
                  <span>Logging in...</span>
                </div>
              ) : (
                "Sign In to Account"
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              New here?{" "}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4 decoration-indigo-500/30">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;