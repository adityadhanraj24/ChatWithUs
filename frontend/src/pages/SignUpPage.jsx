import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimate from "../component/BorderAnimate";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon, Sparkles } from "lucide-react";
import { Link } from "react-router";
import toast from "react-hot-toast";

function SignUpPage() {
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });
  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) { toast.error("Full name is required"); return false; }
    if (!formData.email.trim()) { toast.error("Email is required"); return false; }
    if (!/\S+@\S+\.\S+/.test(formData.email)) { toast.error("Invalid email format"); return false; }
    if (!formData.password) { toast.error("Password is required"); return false; }
    if (formData.password.length < 6) { toast.error("Password must be at least 6 characters"); return false; }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      signup(formData);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B1120] relative overflow-hidden p-0 sm:p-4">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full h-full sm:h-auto sm:max-w-6xl sm:aspect-[16/9] lg:aspect-[16/8] z-10">
        <div className="hidden sm:block h-full w-full">
          <BorderAnimate>
            <SignupContent formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isSigningUp={isSigningUp} />
          </BorderAnimate>
        </div>
        
        {/* Mobile View - No BorderAnimate to maximize space */}
        <div className="sm:hidden w-full h-screen">
           <SignupContent formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isSigningUp={isSigningUp} />
        </div>
      </div>
    </div>
  );
}

function SignupContent({ formData, setFormData, handleSubmit, isSigningUp }) {
  return (
    <div className="relative z-10 w-full h-full flex flex-col md:flex-row bg-[#111827]/80 backdrop-blur-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-slate-800/50">
      
      {/* BRANDING SECTION - Top on mobile, Left on desktop */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden order-1 md:order-2">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-6 animate-pulse">
            <Sparkles className="size-3" />
            <span>Join 10,000+ users</span>
          </div>
          
          <img
            src="/signup.png"
            alt="Welcome"
            className="w-48 md:w-64 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-float"
          />
          
          <h1 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            Chat<span className="text-cyan-400">Saathi</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Experience the next generation of messaging. Secure, fast, and beautiful.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="px-4 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-semibold">Free Forever</span>
            <span className="px-4 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-xs font-semibold">End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* FORM SECTION - Bottom on mobile, Right on desktop */}
      <div className="flex-1 bg-[#0B1120]/40 p-8 md:p-12 flex items-center justify-center order-2 md:order-1 relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-500 text-sm">Join the community today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <UserIcon className="size-5" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all shadow-inner"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <MailIcon className="size-5" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all shadow-inner"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  <LockIcon className="size-5" />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-500 text-white rounded-2xl py-4 font-bold shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              type="submit" 
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <div className="flex items-center justify-center gap-2">
                  <LoaderIcon className="size-5 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Start Chatting Now"
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-bold underline underline-offset-4 decoration-cyan-500/30">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;