"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  messageCount: number;
}

interface UserData {
  name: string;
  preferences: {
    sharedMemory: boolean;
    weeklyEmails: boolean;
    interests: string[];
    goals: string[];
    darkMode?: boolean;
    accentColor?: string;
  };
}

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!user || !db) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [user]);

  const loadRecentChats = useCallback(() => {
    if (!user || !db) return;

    const chatsRef = collection(db, "users", user.uid, "chats");
    const q = query(chatsRef, orderBy("updatedAt", "desc"), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats: Chat[] = [];
      snapshot.forEach((doc) => {
        chats.push({
          id: doc.id,
          ...doc.data()
        } as Chat);
      });
      setRecentChats(chats);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      loadUserData();
      loadRecentChats();
    }
  }, [user, authLoading, router, loadUserData, loadRecentChats]);

  // Apply theme when userData changes
  useEffect(() => {
    if (userData) {
      // Apply dark mode
      if (userData.preferences.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Apply accent color
      document.documentElement.setAttribute('data-accent', userData.preferences.accentColor || 'indigo');
    }
  }, [userData]);


  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getAccentClasses = (accentColor: string) => {
    const colorMap: { [key: string]: string } = {
      indigo: 'from-indigo-500 to-indigo-600',
      purple: 'from-purple-500 to-purple-600',
      pink: 'from-pink-500 to-pink-600',
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600'
    };
    return colorMap[accentColor] || 'from-indigo-500 to-indigo-600';
  };

  const getAccentTextClasses = (accentColor: string) => {
    const colorMap: { [key: string]: string } = {
      indigo: 'text-indigo-600 hover:text-indigo-700',
      purple: 'text-purple-600 hover:text-purple-700',
      pink: 'text-pink-600 hover:text-pink-700',
      blue: 'text-blue-600 hover:text-blue-700',
      green: 'text-green-600 hover:text-green-700',
      orange: 'text-orange-600 hover:text-orange-700'
    };
    return colorMap[accentColor] || 'text-indigo-600 hover:text-indigo-700';
  };

  const getAccentHoverBgClasses = (accentColor: string) => {
    const colorMap: { [key: string]: string } = {
      indigo: 'hover:bg-indigo-50',
      purple: 'hover:bg-purple-50',
      pink: 'hover:bg-pink-50',
      blue: 'hover:bg-blue-50',
      green: 'hover:bg-green-50',
      orange: 'hover:bg-orange-50'
    };
    return colorMap[accentColor] || 'hover:bg-indigo-50';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
                      <div className={`w-10 h-10 bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo')} rounded-xl flex items-center justify-center`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <Link href="/" className={`text-3xl font-bold bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo')} bg-clip-text text-transparent`}>
                        MindCompanion
                      </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/profile")}
                className={`text-gray-700 ${getAccentTextClasses(userData?.preferences.accentColor || 'indigo')} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getAccentHoverBgClasses(userData?.preferences.accentColor || 'indigo')}`}
              >
                Profile
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/settings")}
                className={`text-gray-700 ${getAccentTextClasses(userData?.preferences.accentColor || 'indigo')} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getAccentHoverBgClasses(userData?.preferences.accentColor || 'indigo')}`}
              >
                Settings
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/chat")}
                className={`bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo')} text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                New Chat
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50"
              >
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
                  <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
                    Welcome back, <span className={`bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo')} bg-clip-text text-transparent`}>{userData?.name || user?.email?.split('@')[0]}</span>!
                  </h1>
          <p className="text-xl text-gray-800 max-w-2xl mx-auto">
            How are you feeling today? I&apos;m here to listen and support you on your mental health journey.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/chat")}
            className="group bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold">Start New Chat</h3>
                  <p className="text-lg opacity-90">Begin a new conversation</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm opacity-80">Share what&apos;s on your mind and get personalized support</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/profile")}
            className="group bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold">Your Profile</h3>
                  <p className="text-lg opacity-90">Manage your information</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm opacity-80">Update interests, topics, and personal details</p>
              </div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/settings")}
            className="group bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 text-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold">Settings</h3>
                  <p className="text-lg opacity-90">Customize your experience</p>
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm opacity-80">Dark mode, colors, and chat preferences</p>
              </div>
            </div>
          </motion.button>
        </motion.div>

        {/* Recent Chats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-3xl font-bold text-gray-900">Recent Conversations</h3>
            {recentChats.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push("/chat")}
                        className={`${getAccentTextClasses(userData?.preferences.accentColor || 'indigo')} font-semibold text-lg transition-colors`}
                      >
                        View All
                      </motion.button>
            )}
          </div>
          {recentChats.length === 0 ? (
            <div className="text-center py-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className={`w-24 h-24 bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo').replace('500', '100').replace('600', '200')} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                <svg className={`w-12 h-12 ${getAccentTextClasses(userData?.preferences.accentColor || 'indigo').split(' ')[0]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </motion.div>
              <h4 className="text-2xl font-semibold text-gray-900 mb-4">No conversations yet</h4>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                Start your mental health journey by beginning your first conversation with MindCompanion.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/chat")}
                className={`bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo')} text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                Start Your First Chat
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02, x: 5 }}
                          className={`group border border-gray-200/50 rounded-xl p-6 hover:bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo').replace('500', '50').replace('600', '100')} cursor-pointer transition-all duration-300 hover:shadow-lg`}
                          onClick={() => router.push(`/chat/${chat.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className={`text-xl font-semibold text-gray-900 group-hover:${getAccentTextClasses(userData?.preferences.accentColor || 'indigo').split(' ')[1]} transition-colors mb-2`}>
                        {chat.title}
                      </h4>
                      <p className="text-gray-600 group-hover:text-gray-700 transition-colors">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500 group-hover:text-gray-600 transition-colors">
                      <p className="font-medium">{chat.messageCount} messages</p>
                      <p>{chat.updatedAt ? 
                        new Date(chat.updatedAt).toLocaleDateString() : 
                        "Recently"
                      }</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
