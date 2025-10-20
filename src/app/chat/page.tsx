"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, addDoc, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  isTyping?: boolean;
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewChat = useCallback(async () => {
    if (!user || !db) return;

    try {
      const chatRef = await addDoc(collection(db, "users", user.uid, "chats"), {
        title: "New Chat",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
        lastMessage: ""
      });
      // Redirect to the individual chat page
      router.push(`/chat/${chatRef.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  }, [user, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      createNewChat();
    }
  }, [user, authLoading, router, createNewChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // const loadMessages = useCallback((chatId: string) => {
  //   if (!user) return;

  //   const messagesRef = collection(db, "users", user.uid, "chats", chatId, "messages");
  //   const q = query(messagesRef, orderBy("timestamp", "asc"));

  //   const unsubscribe = onSnapshot(q, (snapshot) => {
  //     const messagesData: Message[] = [];
  //     snapshot.forEach((doc) => {
  //       const data = doc.data();
  //       messagesData.push({
  //         id: doc.id,
  //         text: data.text,
  //         sender: data.sender,
  //         timestamp: data.timestamp,
  //         isTyping: data.isTyping
  //       });
  //     });
  //     setMessages(messagesData);
  //   });

  //   return unsubscribe;
  // }, [user]);

  const sendMessage = async () => {
    if (!inputText.trim() || !chatId || !user || isLoading || !db) return;

    const userMessage = inputText.trim();
    setInputText("");
    setIsLoading(true);

    try {
      // Add user message
      await addDoc(collection(db, "users", user.uid, "chats", chatId, "messages"), {
        text: userMessage,
        sender: "user",
        timestamp: serverTimestamp()
      });

      // Add typing indicator
      const typingRef = await addDoc(collection(db, "users", user.uid, "chats", chatId, "messages"), {
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
            chatId: chatId
          })
        });

        if (!response.ok) {
          console.log(`API responded with status: ${response.status}, using fallback`);
          // Use fallback response instead of throwing error
          const fallbackResponse = generateAIResponse();
          await updateDoc(doc(db, "users", user.uid, "chats", chatId, "messages", typingRef.id), {
            isTyping: false,
            text: fallbackResponse
          });
        } else {
          const data = await response.json();
          
          // Remove typing indicator and add AI response
          await updateDoc(doc(db, "users", user.uid, "chats", chatId, "messages", typingRef.id), {
            isTyping: false,
            text: data.response
          });
        }

        // Update chat metadata
        await updateDoc(doc(db, "users", user.uid, "chats", chatId), {
          updatedAt: serverTimestamp(),
          lastMessage: userMessage,
          messageCount: messages.length + 2
        });
      } catch (error) {
        console.error("Error calling AI API:", error);
        // Fallback to simulated response
        await updateDoc(doc(db, "users", user.uid, "chats", chatId, "messages", typingRef.id), {
          isTyping: false,
          text: generateAIResponse()
        });
      } finally {
        setIsLoading(false);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
    }
  };

  const generateAIResponse = (): string => {
    // This is a placeholder - replace with actual OpenAI API integration
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
              <h1 className="text-xl font-semibold text-gray-900">Chat with Your Companion</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={createNewChat}
                className="text-indigo-600 hover:text-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                New Chat
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-200px)] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to your safe space</h3>
                        <p className="text-gray-600 mb-4">
                          I&apos;m here to listen and support you. Share whatever is on your mind.
                        </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setInputText("I&apos;ve been feeling anxious lately")}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    I&apos;ve been feeling anxious lately
                  </button>
                  <button
                    onClick={() => setInputText("I&apos;m struggling with motivation")}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                  >
                    I&apos;m struggling with motivation
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
                      messages.map((message) => (
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
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.isTyping ? (
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                        <span className="text-sm">AI is typing...</span>
                      </div>
                    ) : (
                      <p className="text-sm">{message.text}</p>
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