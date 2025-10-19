"use client";

import { useState, useEffect, useRef, use } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc, deleteDoc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: any;
  isTyping?: boolean;
}

interface ChatData {
  id: string;
  title: string;
  createdAt: any;
  updatedAt: any;
  messageCount: number;
  lastMessage: string;
}

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user && resolvedParams.chatId) {
      loadUserData();
      loadChatData();
      loadMessages();
    }
  }, [user, authLoading, router, resolvedParams.chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const getBubbleColor = (sender: "user" | "ai") => {
    if (!userData?.preferences?.chatPreferences) return sender === "user" ? "bg-indigo-600" : "bg-gray-100";
    
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
    
    return colorMap[color] || (sender === "user" ? "bg-indigo-600" : "bg-gray-100");
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

  const loadChatData = async () => {
    if (!user || !resolvedParams.chatId) return;

    try {
      const chatDoc = await doc(db, "users", user.uid, "chats", resolvedParams.chatId);
      const chatSnapshot = await getDoc(chatDoc);
      
      if (chatSnapshot.exists()) {
        setChatData({
          id: chatSnapshot.id,
          ...chatSnapshot.data()
        } as ChatData);
      } else {
        // Chat doesn't exist, show error message instead of redirecting
        console.log("Chat not found");
        setChatData(null);
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
      setChatData(null);
    }
  };

  const loadMessages = () => {
    if (!user || !resolvedParams.chatId) return;

    const messagesRef = collection(db, "users", user.uid, "chats", resolvedParams.chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          timestamp: data.timestamp,
          isTyping: data.isTyping
        });
      });
      setMessages(messagesData);
    });

    return unsubscribe;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !resolvedParams.chatId || !user || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsLoading(true);

    try {
      // Add user message
      await addDoc(collection(db, "users", user.uid, "chats", resolvedParams.chatId, "messages"), {
        text: userMessage,
        sender: "user",
        timestamp: serverTimestamp()
      });

      // Add typing indicator
      const typingRef = await addDoc(collection(db, "users", user.uid, "chats", resolvedParams.chatId, "messages"), {
        text: "",
        sender: "ai",
        timestamp: serverTimestamp(),
        isTyping: true
      });

      // Call AI API
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            userId: user.uid,
            chatId: resolvedParams.chatId
          })
        });

        if (!response.ok) {
          console.log(`API responded with status: ${response.status}, using fallback`);
          // Use fallback response instead of throwing error
          const fallbackResponse = generateAIResponse(userMessage);
          await updateDoc(doc(db, "users", user.uid, "chats", resolvedParams.chatId, "messages", typingRef.id), {
            isTyping: false,
            text: fallbackResponse
          });
        } else {
          const data = await response.json();
          
          // Remove typing indicator and add AI response
          await updateDoc(doc(db, "users", user.uid, "chats", resolvedParams.chatId, "messages", typingRef.id), {
            isTyping: false,
            text: data.response
          });
        }

        // Update chat metadata
        await updateDoc(doc(db, "users", user.uid, "chats", resolvedParams.chatId), {
          updatedAt: serverTimestamp(),
          lastMessage: userMessage,
          messageCount: messages.length + 2
        });
      } catch (error) {
        console.error("Error calling AI API:", error);
        // Fallback to simulated response
        await updateDoc(doc(db, "users", user.uid, "chats", resolvedParams.chatId, "messages", typingRef.id), {
          isTyping: false,
          text: generateAIResponse(userMessage)
        });
      } finally {
        setIsLoading(false);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "I understand you're going through a difficult time. Can you tell me more about what's been on your mind lately?",
      "That sounds really challenging. It's completely normal to feel this way. What strategies have helped you cope in the past?",
      "I'm here to listen and support you. What would you like to focus on today?",
      "It takes courage to share what you're feeling. How can I help you work through this?",
      "I can sense this is important to you. What would you like to explore together?",
      "Thank you for trusting me with this. Let's work through this step by step.",
      "I'm here to support you through this. What's one small thing that might help you feel better right now?",
      "Your feelings are valid and important. What would you like to do to take care of yourself today?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const deleteChat = async () => {
    if (!user || !resolvedParams.chatId || isDeleting) return;

    setIsDeleting(true);
    try {
      // Delete all messages first
      const messagesRef = collection(db, "users", user.uid, "chats", resolvedParams.chatId, "messages");
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the chat document
      await deleteDoc(doc(db, "users", user.uid, "chats", resolvedParams.chatId));
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!chatData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Chat Not Found</h1>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat Not Found</h2>
            <p className="text-gray-600 mb-6">
              The chat you're looking for doesn't exist or you don't have permission to access it.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {chatData?.title || "Chat"}
                </h1>
                <p className="text-sm text-gray-500">
                  {messages.length} messages
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={deleteChat}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Chat"}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`${getChatBackground()} rounded-xl shadow-lg h-[calc(100vh-200px)] flex flex-col`}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your conversation</h3>
                <p className="text-gray-600 mb-4">
                  I'm here to listen and support you. Share whatever is on your mind.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setInputText("I've been feeling anxious lately")}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    I've been feeling anxious lately
                  </button>
                  <button
                    onClick={() => setInputText("I'm struggling with motivation")}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    I'm struggling with motivation
                  </button>
                  <button
                    onClick={() => setInputText("I feel lonely")}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    I feel lonely
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === "user"
                        ? `${getBubbleColor("user")} text-white`
                        : `${getBubbleColor("ai")} text-gray-900`
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <span className={`${getTextSize()}`}>AI is typing...</span>
                      </div>
                    ) : (
                      <p className={getTextSize()}>{message.text}</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
