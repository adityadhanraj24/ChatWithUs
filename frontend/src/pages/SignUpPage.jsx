import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import BorderAnimate from "../component/BorderAnimate";
import { MessageCircleIcon, LockIcon, MailIcon, UserIcon, LoaderIcon } from "lucide-react";
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0B1120] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-6xl md:h-[800px] h-auto z-10">
        <BorderAnimate>
          <div className="relative z-10 w-full h-full flex flex-col md:flex-row bg-[#1e293b] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
            {/* FORM CLOUMN - LEFT SIDE */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center md:border-r border-slate-700/50">
              <div className="w-full max-w-md">
                {/* HEADING TEXT */}
                <div className="text-center mb-10">
                  <MessageCircleIcon className="w-12 h-12 mx-auto text-slate-400 mb-4" strokeWidth={1.5} />
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">Create Account</h2>
                  <p className="text-slate-400 text-sm">Sign up for a new account</p>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* FULL NAME */}
                  <div>
                    <label className="auth-input-label">Full Name</label>
                    <div className="relative">
                      <UserIcon className="auth-input-icon" strokeWidth={1.5} />

                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* EMAIL INPUT */}
                  <div>
                    <label className="auth-input-label">Email</label>
                    <div className="relative">
                      <MailIcon className="auth-input-icon" strokeWidth={1.5} />

                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="johndoe@gmail.com"
                      />
                    </div>
                  </div>

                  {/* PASSWORD INPUT */}
                  <div>
                    <label className="auth-input-label">Password</label>
                    <div className="relative">
                      <LockIcon className="auth-input-icon" strokeWidth={1.5} />

                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button className="auth-btn mt-6" type="submit" disabled={isSigningUp}>
                    {isSigningUp ? (
                      <LoaderIcon className="w-full h-5 animate-spin text-center mx-auto" />
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="auth-link">
                    <span className="text-slate-400">Already have an account? </span>
                    <span className="text-cyan-400 hover:text-cyan-300 font-medium">Login</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* FORM ILLUSTRATION - RIGHT SIDE */}
            <div className="hidden md:w-1/2 md:flex items-center justify-center p-6 bg-gradient-to-bl from-slate-800/20 to-transparent">
              <div>
                <img
                  src="/signup.png"
                  alt="People using mobile devices"
                  className="w-full h-auto object-contain"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-medium text-cyan-400">Start Your Journey Today</h3>

                  <div className="mt-4 flex justify-center gap-4">
                    <span className="auth-badge">Free</span>
                    <span className="auth-badge">Easy Setup</span>
                    <span className="auth-badge">Private</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimate>
      </div>
    </div>
  );
}
export default SignUpPage;