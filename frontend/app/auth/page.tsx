'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiActivity } from 'react-icons/fi';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from 'next-themes';

export default function AuthPage() {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        // Wait a bit for user to be set
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Create user profile
        const { auth: firebaseAuth } = await import('@/lib/firebase');
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (token) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, role }),
          });
        }
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0.8, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="glass-card p-8 w-full max-w-md relative z-10 border-white/40 dark:border-white/5"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 medical-gradient rounded-3xl mb-4 shadow-xl shadow-blue-200 dark:shadow-none"
            >
              <FiActivity className="w-10 h-10 text-white animate-pulse" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Arogyam-360</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-semibold uppercase tracking-widest text-xs">
              {isLogin ? 'Welcome back to health' : 'Create your health account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 dark:text-slate-50 font-medium transition-all"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                    I am a
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'patient' | 'doctor')}
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 dark:text-slate-50 font-medium transition-all appearance-none"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 dark:text-slate-50 font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider ml-1">
                Secret Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 dark:text-slate-50 font-medium transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full medical-gradient text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-200 dark:shadow-none hover:translate-y-[-2px] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up now"
                : 'Already have an account? Sign in here'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

