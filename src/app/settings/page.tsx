"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
  name: string;
  preferences: {
    sharedMemory: boolean;
    weeklyEmails: boolean;
    darkMode: boolean;
    accentColor: string;
    chatPreferences: {
      autoSave: boolean;
      typingIndicator: boolean;
      soundEnabled: boolean;
      textSize: string;
      userBubbleColor: string;
      aiBubbleColor: string;
      chatBackground: string;
    };
  };
}

const accentColors = [
  { name: "Indigo", value: "indigo", class: "from-indigo-500 to-indigo-600" },
  { name: "Purple", value: "purple", class: "from-purple-500 to-purple-600" },
  { name: "Pink", value: "pink", class: "from-pink-500 to-pink-600" },
  { name: "Blue", value: "blue", class: "from-blue-500 to-blue-600" },
  { name: "Green", value: "green", class: "from-green-500 to-green-600" },
  { name: "Orange", value: "orange", class: "from-orange-500 to-orange-600" },
];

const bubbleColors = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Teal", value: "teal", class: "bg-teal-500" },
];

const textSizes = [
  { name: "Small", value: "sm", class: "text-sm" },
  { name: "Medium", value: "md", class: "text-base" },
  { name: "Large", value: "lg", class: "text-lg" },
  { name: "Extra Large", value: "xl", class: "text-xl" },
];

const chatBackgrounds = [
  { name: "Light", value: "light", class: "bg-white" },
  { name: "Gray", value: "gray", class: "bg-gray-50" },
  { name: "Blue", value: "blue", class: "bg-blue-50" },
  { name: "Purple", value: "purple", class: "bg-purple-50" },
  { name: "Green", value: "green", class: "bg-green-50" },
  { name: "Pink", value: "pink", class: "bg-pink-50" },
];

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || "",
          preferences: {
            sharedMemory: data.preferences?.sharedMemory ?? true,
            weeklyEmails: data.preferences?.weeklyEmails ?? true,
            darkMode: data.preferences?.darkMode ?? false,
            accentColor: data.preferences?.accentColor ?? "indigo",
            chatPreferences: {
              autoSave: data.preferences?.chatPreferences?.autoSave ?? true,
              typingIndicator: data.preferences?.chatPreferences?.typingIndicator ?? true,
              soundEnabled: data.preferences?.chatPreferences?.soundEnabled ?? false,
              textSize: data.preferences?.chatPreferences?.textSize ?? "md",
              userBubbleColor: data.preferences?.chatPreferences?.userBubbleColor ?? "indigo",
              aiBubbleColor: data.preferences?.chatPreferences?.aiBubbleColor ?? "gray",
              chatBackground: data.preferences?.chatPreferences?.chatBackground ?? "light",
            }
          }
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, authLoading, router, loadUserData]);

  // Apply theme when userData changes
  useEffect(() => {
    if (userData) {
      applyTheme(userData.preferences.darkMode, userData.preferences.accentColor);
    }
  }, [userData]);

  const handleSave = async () => {
    if (!user || !userData) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferences: userData.preferences
      });
      
      // Apply theme changes immediately
      applyTheme(userData.preferences.darkMode, userData.preferences.accentColor);
      
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const applyTheme = (darkMode: boolean, accentColor: string) => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply accent color by setting data attribute
    document.documentElement.setAttribute('data-accent', accentColor);
  };

  const getBubbleColor = (sender: "user" | "ai") => {
    if (!userData?.preferences?.chatPreferences) return sender === "user" ? "bg-indigo-500" : "bg-gray-100";
    
    const color = sender === "user" 
      ? userData.preferences.chatPreferences.userBubbleColor 
      : userData.preferences.chatPreferences.aiBubbleColor;
    
    const colorMap: { [key: string]: string } = {
      blue: "bg-blue-500",
      indigo: "bg-indigo-500", 
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      teal: "bg-teal-500",
      gray: "bg-gray-100"
    };
    
    return colorMap[color] || (sender === "user" ? "bg-indigo-500" : "bg-gray-100");
  };

  const getTextSize = () => {
    if (!userData?.preferences?.chatPreferences?.textSize) return "text-base";
    
    const sizeMap: { [key: string]: string } = {
      sm: "text-sm",
      md: "text-base", 
      lg: "text-lg",
      xl: "text-xl"
    };
    
    return sizeMap[userData.preferences.chatPreferences.textSize] || "text-base";
  };

  const getChatBackground = () => {
    if (!userData?.preferences?.chatPreferences?.chatBackground) return "bg-white";
    
    const bgMap: { [key: string]: string } = {
      light: "bg-white",
      gray: "bg-gray-50",
      blue: "bg-blue-50",
      purple: "bg-purple-50", 
      green: "bg-green-50",
      pink: "bg-pink-50"
    };
    
    return bgMap[userData.preferences.chatPreferences.chatBackground] || "bg-white";
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
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-700 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Appearance Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Appearance</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Dark Mode</h3>
                  <p className="text-gray-800">Switch to dark theme for better viewing in low light</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.preferences.darkMode || false}
                    onChange={(e) => setUserData(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, darkMode: e.target.checked }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Accent Color</h3>
                <p className="text-gray-600 mb-4">Choose your preferred accent color for the interface</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {accentColors.map((color) => (
                    <motion.button
                      key={color.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserData(prev => prev ? {
                        ...prev,
                        preferences: { ...prev.preferences, accentColor: color.value }
                      } : null)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        userData?.preferences.accentColor === color.value
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 bg-gradient-to-r ${color.class} rounded-lg`}></div>
                      <p className="text-sm font-medium text-gray-700 mt-2">{color.name}</p>
                      {userData?.preferences.accentColor === color.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat Preferences</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Auto-save Messages</h3>
                  <p className="text-gray-800">Automatically save your messages as you type</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.preferences.chatPreferences.autoSave || false}
                    onChange={(e) => setUserData(prev => prev ? {
                      ...prev,
                      preferences: { 
                        ...prev.preferences, 
                        chatPreferences: { 
                          ...prev.preferences.chatPreferences, 
                          autoSave: e.target.checked 
                        }
                      }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Typing Indicator</h3>
                  <p className="text-gray-800">Show when the AI is typing a response</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.preferences.chatPreferences.typingIndicator || false}
                    onChange={(e) => setUserData(prev => prev ? {
                      ...prev,
                      preferences: { 
                        ...prev.preferences, 
                        chatPreferences: { 
                          ...prev.preferences.chatPreferences, 
                          typingIndicator: e.target.checked 
                        }
                      }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Sound Effects</h3>
                  <p className="text-gray-800">Play sounds for new messages and notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.preferences.chatPreferences.soundEnabled || false}
                    onChange={(e) => setUserData(prev => prev ? {
                      ...prev,
                      preferences: { 
                        ...prev.preferences, 
                        chatPreferences: { 
                          ...prev.preferences.chatPreferences, 
                          soundEnabled: e.target.checked 
                        }
                      }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Chat Customization */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat Appearance</h2>
            <div className="space-y-8">
              {/* Text Size */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Size</h3>
                <p className="text-gray-800 mb-4">Choose the size of text in chat messages</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {textSizes.map((size) => (
                    <motion.button
                      key={size.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserData(prev => prev ? {
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          chatPreferences: { 
                            ...prev.preferences.chatPreferences, 
                            textSize: size.value 
                          }
                        }
                      } : null)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        userData?.preferences.chatPreferences.textSize === size.value
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`${size.class} font-medium text-gray-700`}>
                        Sample Text
                      </div>
                      <p className="text-sm font-medium text-gray-700 mt-2">{size.name}</p>
                      {userData?.preferences.chatPreferences.textSize === size.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* User Bubble Color */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Message Color</h3>
                <p className="text-gray-800 mb-4">Choose the color for your message bubbles</p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {bubbleColors.map((color) => (
                    <motion.button
                      key={color.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserData(prev => prev ? {
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          chatPreferences: { 
                            ...prev.preferences.chatPreferences, 
                            userBubbleColor: color.value 
                          }
                        }
                      } : null)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        userData?.preferences.chatPreferences.userBubbleColor === color.value
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 ${color.class} rounded-lg`}></div>
                      <p className="text-sm font-medium text-gray-700 mt-2">{color.name}</p>
                      {userData?.preferences.chatPreferences.userBubbleColor === color.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* AI Bubble Color */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Message Color</h3>
                <p className="text-gray-800 mb-4">Choose the color for AI response bubbles</p>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                  {bubbleColors.map((color) => (
                    <motion.button
                      key={color.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserData(prev => prev ? {
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          chatPreferences: { 
                            ...prev.preferences.chatPreferences, 
                            aiBubbleColor: color.value 
                          }
                        }
                      } : null)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        userData?.preferences.chatPreferences.aiBubbleColor === color.value
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 ${color.class} rounded-lg`}></div>
                      <p className="text-sm font-medium text-gray-700 mt-2">{color.name}</p>
                      {userData?.preferences.chatPreferences.aiBubbleColor === color.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Chat Background */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Background</h3>
                <p className="text-gray-800 mb-4">Choose the background color for chat conversations</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {chatBackgrounds.map((bg) => (
                    <motion.button
                      key={bg.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setUserData(prev => prev ? {
                        ...prev,
                        preferences: { 
                          ...prev.preferences, 
                          chatPreferences: { 
                            ...prev.preferences.chatPreferences, 
                            chatBackground: bg.value 
                          }
                        }
                      } : null)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        userData?.preferences.chatPreferences.chatBackground === bg.value
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-full h-8 ${bg.class} rounded-lg border border-gray-200`}></div>
                      <p className="text-sm font-medium text-gray-700 mt-2">{bg.name}</p>
                      {userData?.preferences.chatPreferences.chatBackground === bg.value && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat Preview</h2>
            <p className="text-gray-800 mb-4">See how your chat will look with your current settings</p>
            
            <div className={`${getChatBackground()} rounded-xl p-6 space-y-4 max-h-64 overflow-y-auto`}>
              {/* Sample User Message */}
              <div className="flex justify-end">
                <div className={`max-w-xs px-4 py-3 rounded-2xl ${getBubbleColor("user")} text-white`}>
                  <p className={getTextSize()}>Hello, I&apos;m feeling anxious today</p>
                </div>
              </div>
              
              {/* Sample AI Message */}
              <div className="flex justify-start">
                <div className={`max-w-xs px-4 py-3 rounded-2xl ${getBubbleColor("ai")} text-gray-900`}>
                  <p className={getTextSize()}>I understand you&apos;re feeling anxious. That&apos;s completely normal. Can you tell me more about what&apos;s making you feel this way?</p>
                </div>
              </div>
              
              {/* Sample User Message */}
              <div className="flex justify-end">
                <div className={`max-w-xs px-4 py-3 rounded-2xl ${getBubbleColor("user")} text-white`}>
                  <p className={getTextSize()}>I have a big presentation tomorrow</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Data</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Shared Memory</h3>
                  <p className="text-gray-800">Allow AI to remember conversations across different chats</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.preferences.sharedMemory || false}
                    onChange={(e) => setUserData(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, sharedMemory: e.target.checked }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Weekly Emails</h3>
                  <p className="text-gray-800">Receive weekly mental health tips and check-ins</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData?.preferences.weeklyEmails || false}
                    onChange={(e) => setUserData(prev => prev ? {
                      ...prev,
                      preferences: { ...prev.preferences, weeklyEmails: e.target.checked }
                    } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={saving}
              className={`bg-gradient-to-r ${getAccentClasses(userData?.preferences.accentColor || 'indigo')} text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {saving ? "Saving..." : "Save Settings"}
            </motion.button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}