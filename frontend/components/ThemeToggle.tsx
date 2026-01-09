'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-10 h-10 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-200 dark:border-gray-700" />
        );
    }

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 w-10 h-10 rounded-xl glass-morphism flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-white/40 dark:border-white/10"
            aria-label="Toggle Theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                {theme === 'dark' ? (
                    <motion.div
                        key="moon"
                        initial={{ y: 20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FiMoon className="w-5 h-5 text-blue-400" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="sun"
                        initial={{ y: 20, opacity: 0, rotate: -90 }}
                        animate={{ y: 0, opacity: 1, rotate: 0 }}
                        exit={{ y: -20, opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <FiSun className="w-5 h-5 text-amber-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
