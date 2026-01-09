'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiFileText, FiPackage, FiShoppingBag, FiVideo, FiMessageCircle, FiUser } from 'react-icons/fi';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/dashboard/reports', label: 'Reports', icon: FiFileText },
    { href: '/dashboard/medications', label: 'Medications', icon: FiPackage },
    { href: '/dashboard/nutrition', label: 'Nutrition', icon: FiShoppingBag },
    { href: '/dashboard/consultations', label: 'Consultations', icon: FiVideo },
    { href: '/dashboard/chatbot', label: 'Chatbot', icon: FiMessageCircle },
    { href: '/dashboard/profile', label: 'Profile', icon: FiUser },
  ];

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-white/5 sticky top-[73px] z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 md:space-x-4 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 font-bold text-sm transition-all duration-200 whitespace-nowrap ${isActive
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

