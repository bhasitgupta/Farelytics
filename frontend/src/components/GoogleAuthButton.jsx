import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';

export default function GoogleAuthButton({ compact = false }) {
  const { user, loginWithGoogle, logout, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Official Google 'G' Logo SVG per Google Identity Branding Guidelines
  const GoogleGIcon = () => (
    <svg className={`w-4 h-4 flex-shrink-0 ${compact ? 'mr-1.5' : 'mr-2.5'}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );

  if (user) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex items-center gap-2 h-8 px-2.5 ${compact ? 'rounded-full' : 'rounded-lg'} border border-[#DFDDD8] bg-white hover:bg-[#ECEAE5] text-xs font-medium text-[#2D2D2D] transition-all btn-tactile focus:outline-none focus:ring-2 focus:ring-[#3171C6]`}
          aria-expanded={isMenuOpen}
        >
          <div className="w-5 h-5 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center text-[10px] font-bold">
            {user.email ? user.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <span className="hidden sm:inline-block max-w-[120px] truncate text-[#4E4E4E]">
            {user.email}
// Refactor progress checkpoint: step 2/4
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#DEDEDE] rounded-xl shadow-tactile-hover py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
            <div className="px-3 py-2 border-b border-[#DEDEDE]/60 text-xs">
              <p className="font-semibold text-[#171717] truncate">{user.name}</p>
              <p className="text-[11px] text-[#737373] truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
              className="w-full px-3 py-1.5 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={loginWithGoogle}
      disabled={loading}
      className={`inline-flex items-center justify-center h-8 ${compact ? 'px-3 rounded-full' : 'px-3.5 rounded-lg'} border border-[#DEDEDE] hover:border-[#171717] bg-white hover:bg-[#F8F9FA] active:bg-[#EEEEEE] text-xs font-semibold text-[#171717] shadow-2xs transition-all whitespace-nowrap disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#F25623] cursor-pointer`}
      aria-label="Sign in with Google"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mr-2"></span>
      ) : (
        <GoogleGIcon />
      )}
      <span>{compact ? 'Sign in' : 'Continue with Google'}</span>
    </button>
  );
}