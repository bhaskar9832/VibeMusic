import React, { useState } from 'react';
import { loginWithGoogle } from '../services/authService';
import { AuthUser } from '../types';
import { Music2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onLogin(user);
    } catch (error) {
      console.error("Login failed", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        
        {/* Logo Section */}
        <div className="mb-12 text-center animate-fade-in-down">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-cyan-500/30 mb-8 transform hover:scale-105 transition-transform duration-500">
            <Music2 size={48} className="text-white drop-shadow-md" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">VibeMusic</h1>
          <p className="text-slate-400 text-xl font-light">Your context. Your music.</p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 p-8 rounded-[32px] shadow-2xl animate-fade-in-up">
          <h2 className="text-xl font-semibold text-white mb-8 text-center tracking-wide">Welcome Back</h2>
          
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-slate-900 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-4 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <>
                 <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>
          
          <div className="mt-8 text-center">
             <p className="text-xs text-slate-500">
               By continuing, you agree to our <span className="text-cyan-500 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-cyan-500 hover:underline cursor-pointer">Privacy Policy</span>.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
};
