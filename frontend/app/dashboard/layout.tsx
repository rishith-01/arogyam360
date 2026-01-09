'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navigation from '@/components/Navigation';
import { FiLogOut, FiActivity } from 'react-icons/fi';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 medical-gradient rounded-xl flex items-center justify-center shadow-md">
              <FiActivity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Arogyam-360
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
            >
              <FiLogOut className="group-hover:translate-x-1 transition-transform" />
              Logout
            </button>
          </div>
        </div>
      </header>
      <Navigation />
      <AnimatePresence mode="wait">
        <motion.main
          key={theme}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="relative"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}


