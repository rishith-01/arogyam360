'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import {
  FiFileText,
  FiPackage,
  FiShoppingBag,
  FiVideo,
  FiMessageCircle,
  FiUser,
  FiActivity,
  FiZap,
} from 'react-icons/fi';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState({
    reports: 0,
    consultations: 0,
    medications: 0,
    plans: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const api = (await import('@/lib/api')).default;

      // Fetch stats with individual error handling to prevent one failure from breaking all
      const [reportsRes, consultationsRes, plansRes] = await Promise.all([
        api.get('/reports').catch(err => {
          console.error('Error fetching reports:', err);
          return { data: { reports: [] } };
        }),
        api.get('/consultations').catch(err => {
          console.error('Error fetching consultations:', err);
          return { data: { consultations: [] } };
        }),
        api.get('/nutrition').catch(err => {
          console.error('Error fetching nutrition plans:', err);
          return { data: { plans: [] } };
        }),
      ]);

      setStats({
        reports: reportsRes.data.reports?.length || 0,
        consultations: consultationsRes.data.consultations?.length || 0,
        medications: userProfile?.medicalHistory?.medications?.length || 0,
        plans: plansRes.data.plans?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default stats on error
      setStats({
        reports: 0,
        consultations: 0,
        medications: userProfile?.medicalHistory?.medications?.length || 0,
        plans: 0,
      });
    }
  };

  const isDoctor = userProfile?.role === 'doctor';

  const features = isDoctor
    ? [
      {
        title: 'Manage Reports',
        description: 'Upload and update patient reports',
        icon: FiFileText,
        href: '/dashboard/reports',
        color: 'bg-blue-500',
      },
      {
        title: 'Manage Medications',
        description: 'Add medications for patients',
        icon: FiPackage,
        href: '/dashboard/medications',
        color: 'bg-red-500',
      },
      {
        title: 'Nutrition Plans',
        description: 'Create diet plans for patients',
        icon: FiShoppingBag,
        href: '/dashboard/nutrition',
        color: 'bg-green-500',
      },
      {
        title: 'Consultations',
        description: 'Accept and manage consultations',
        icon: FiVideo,
        href: '/dashboard/consultations',
        color: 'bg-purple-500',
      },
      {
        title: 'Medical Chatbot',
        description: 'Get health guidance',
        icon: FiMessageCircle,
        href: '/dashboard/chatbot',
        color: 'bg-indigo-500',
      },
      {
        title: 'Profile',
        description: 'Manage your profile',
        icon: FiUser,
        href: '/dashboard/profile',
        color: 'bg-gray-500',
      },
    ]
    : [
      {
        title: 'Medical Reports',
        description: 'View your medical reports',
        icon: FiFileText,
        href: '/dashboard/reports',
        color: 'bg-blue-500',
      },
      {
        title: 'Medications',
        description: 'View your medications',
        icon: FiPackage,
        href: '/dashboard/medications',
        color: 'bg-red-500',
      },
      {
        title: 'Nutrition Plans',
        description: 'View your diet plans',
        icon: FiShoppingBag,
        href: '/dashboard/nutrition',
        color: 'bg-green-500',
      },
      {
        title: 'Consultations',
        description: 'Book doctor consultations',
        icon: FiVideo,
        href: '/dashboard/consultations',
        color: 'bg-purple-500',
      },
      {
        title: 'Medical Chatbot',
        description: 'Get health guidance',
        icon: FiMessageCircle,
        href: '/dashboard/chatbot',
        color: 'bg-indigo-500',
      },
      {
        title: 'Profile',
        description: 'Manage your profile',
        icon: FiUser,
        href: '/dashboard/profile',
        color: 'bg-gray-500',
      },
    ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 medical-gradient rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105">
              <FiActivity className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                Namaste{userProfile?.name ? `, ${userProfile.name}` : ''}!
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest text-xs mt-1">
                Your Health Journey Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />
            <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm transition-colors">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter">System Normal</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: 'Medical Reports', value: stats.reports, icon: <FiFileText className="text-blue-600 dark:text-blue-400" />, color: 'from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900/50' },
            { label: 'Consultations', value: stats.consultations, icon: <FiVideo className="text-purple-600 dark:text-purple-400" />, color: 'from-purple-50/50 to-white dark:from-purple-900/10 dark:to-slate-900/50' },
            { label: 'Active Meds', value: stats.medications, icon: <FiPackage className="text-red-600 dark:text-red-400" />, color: 'from-red-50/50 to-white dark:from-red-900/10 dark:to-slate-900/50' },
            { label: 'Health Plans', value: stats.plans, icon: <FiShoppingBag className="text-emerald-600 dark:text-emerald-400" />, color: 'from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-900/50' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`glass-card p-6 bg-gradient-to-br ${stat.color} border-white/40 dark:border-white/5 transition-colors`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm transition-colors">
                  {stat.icon}
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-slate-50 tracking-tighter">
                  {stat.value}
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide uppercase italic">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              whileHover={{ scale: 1.03, translateY: -8 }}
              className="group"
            >
              <Link href={feature.href}>
                <div className="glass-card p-8 h-full relative overflow-hidden group-hover:shadow-2xl transition-all cursor-pointer border-white/40 dark:border-white/5">
                  {/* Decorative Gradient Background */}
                  <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-20 ${feature.color}`} />

                  <div className={`${feature.color} w-16 h-16 rounded-[30%] flex items-center justify-center mb-6 shadow-xl transform transition-transform group-hover:rotate-6 group-hover:scale-110`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-slate-50 mb-2 flex items-center gap-2">
                      {feature.title}
                      <FiZap className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center text-primary-600 dark:text-primary-400 font-bold text-sm uppercase tracking-widest gap-2 group-hover:gap-3 transition-all">
                    Explore Feature
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

