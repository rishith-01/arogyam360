'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSend,
  FiMessageCircle,
  FiUser,
  FiMessageSquare,
  FiActivity,
  FiSearch,
  FiZap,
  FiShield,
  FiArrowLeft,
  FiMoreVertical,
  FiSmile,
  FiPaperclip
} from 'react-icons/fi';
import Link from 'next/link';
import api from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  { text: "Analyze my last report", icon: <FiSearch className="text-blue-500" /> },
  { text: "Check my medications", icon: <FiZap className="text-amber-500" /> },
  { text: "Healthy diet tips", icon: <FiActivity className="text-emerald-500" /> },
  { text: "Consultation history", icon: <FiShield className="text-purple-500" /> },
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('report', file);
      formData.append('reportName', file.name);
      formData.append('reportType', 'general');
      // For patients, backend sets patientId automatically

      // Helper message
      setMessages(prev => [...prev, {
        role: 'user',
        content: `Uploading ${file.name}...`,
        timestamp: new Date().toISOString()
      }]);

      const response = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // After upload, prompt chatbot to analyze it
      const uploadMsg = `I just uploaded a medical report named "${file.name}". Please analyze it and summarize the key findings for me.`;

      // We manually add the user message about analysis without sending it yet? 
      // Or we just send it as a real message
      sendMessage(uploadMsg);

    } catch (error: any) {
      console.error('Upload error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I failed to upload the report. Error: ${error.response?.data?.error || error.message}`,
        timestamp: new Date().toISOString()
      }]);
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/chatbot/history');
      const history = response.data.history || [];
      const formattedMessages: Message[] = history
        .reverse()
        .flatMap((item: any) => [
          { role: 'user' as const, content: item.message, timestamp: item.createdAt },
          { role: 'assistant' as const, content: item.response, timestamp: item.createdAt },
        ]);
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/chat', {
        message: textToSend,
      });

      if (response.data && response.data.response) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.response,
          timestamp: response.data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error: any) {
      console.error('Chatbot error:', error);
      let errorContent = 'Sorry, I encountered an error. Please try again.';

      if (error.response?.data?.response) {
        errorContent = error.response.data.response;
      }

      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-10rem)] mt-20 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden transition-colors duration-300 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full flex flex-col h-full bg-white/50 dark:bg-slate-900/50 relative overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors order-first md:order-none">
              <FiArrowLeft className="w-5 h-5 text-gray-500 dark:text-slate-400" />
            </Link>
            <div className="relative">
              <div className="w-12 h-12 medical-gradient rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                <FiActivity className="w-7 h-7 text-white animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Arogyam AI</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Specialist</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400 dark:text-slate-500">
              <FiMoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-blue-50/80 dark:bg-blue-900/20 backdrop-blur-sm border-b border-blue-100 dark:border-blue-900/30 px-4 py-2 flex items-center justify-center gap-2 transition-colors"
        >
          <FiShield className="text-blue-500 dark:text-blue-400 w-4 h-4 flex-shrink-0" />
          <p className="text-[10px] md:text-xs text-blue-800 dark:text-blue-100 font-medium text-center">
            Informational assistance only. Always consult a qualified physician for medical decisions.
          </p>
        </motion.div>

        {/* Messages Space */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 medical-gradient rounded-[35%] flex items-center justify-center shadow-2xl animate-float">
                  <FiMessageCircle className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center transition-colors">
                  <FiZap className="w-6 h-6 text-amber-500 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Namaste, {user?.displayName?.split(' ')[0] || 'Health Seeker'}!</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">I'm your powered health assistant. How can I assist you today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage(q.text)}
                    className="glass-card p-4 flex items-center gap-3 text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-blue-100 dark:hover:shadow-blue-900 group transition-all"
                  >
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                      {q.icon}
                    </div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{q.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 md:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg overflow-hidden border-2 border-white dark:border-slate-800 transition-colors
                  ${message.role === 'user' ? 'bg-indigo-600' : 'medical-gradient'}`}>
                  {message.role === 'user' ? (
                    <span className="text-white font-black text-sm">{user?.displayName?.[0] || 'U'}</span>
                  ) : (
                    <FiActivity className="text-white w-6 h-6" />
                  )}
                </div>

                <div className={`max-w-[85%] md:max-w-[75%] rounded-3xl px-5 py-4 shadow-sm relative group transition-all
                  ${message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-gray-100 dark:border-white/5 shadow-md dark:shadow-none'}`}>

                  <div className="prose prose-sm md:prose-base max-w-none text-current leading-relaxed">
                    {message.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>
                    ))}
                  </div>

                  <div className={`mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity
                    ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Bubble Tail Replacement */}
                  <div className={`absolute top-0 w-4 h-4 
                    ${message.role === 'user'
                      ? '-right-1.5 bg-indigo-600 clip-path-triangle-right'
                      : '-left-1.5 bg-white dark:bg-slate-800 border-l border-t border-gray-100 dark:border-white/5 clip-path-triangle-left'}`}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 medical-gradient rounded-2xl flex items-center justify-center shadow-lg">
                <FiActivity className="text-white w-6 h-6 animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl rounded-tl-none px-6 py-4 shadow-sm border border-gray-100 dark:border-white/5 transition-colors">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i}
                      className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Modern Input Bar */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-gray-100 dark:border-white/10 p-4 md:p-6 z-10 transition-colors">
          <div className="max-w-4xl mx-auto flex items-end gap-3 glass-card p-2 md:p-3 relative group focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 focus-within:border-transparent transition-all">
            <button className="p-3 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl text-gray-400 dark:text-slate-500 transition-colors relative">
              <input
                type="file"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={loading}
              />
              <FiPaperclip className="w-6 h-6" />
            </button>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="How are you feeling today?"
              className="flex-1 px-2 py-3 bg-transparent border-none focus:ring-0 resize-none max-h-32 text-slate-700 dark:text-slate-200 font-medium placeholder:text-gray-400 dark:placeholder:text-slate-500 scrollbar-hide"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="medical-gradient text-white p-4 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none flex items-center justify-center transition-all group"
            >
              <FiSend className={`w-6 h-6 ${loading ? 'opacity-0' : 'opacity-100'} group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform`} />
              {loading && <div className="absolute w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 mt-4 font-bold uppercase tracking-widest transition-colors">
            Powered by Gemini 2.0 Flash Specialist
          </p>
        </div>
      </div>
    </div>
  );
}

