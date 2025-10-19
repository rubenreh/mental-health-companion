"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UserData {
  name: string;
  email: string;
  gender?: string;
  age?: number;
  preferences: {
    sharedMemory: boolean;
    weeklyEmails: boolean;
    interests: string[];
    topics: string[];
    goals: string[];
  };
}

const mentalHealthTopics = [
  "Anxiety", "Depression", "Stress Management", "Self-Care", "Mindfulness",
  "Sleep Issues", "Relationship Issues", "Work-Life Balance", "Self-Esteem",
  "Grief & Loss", "Trauma", "Addiction Recovery", "Eating Disorders",
  "Bipolar Disorder", "PTSD", "Social Anxiety", "Panic Attacks"
];

const commonGoals = [
  "Reduce anxiety", "Improve sleep", "Build confidence", "Manage stress",
  "Better relationships", "Self-care routine", "Mindfulness practice",
  "Emotional regulation", "Work-life balance", "Overcome fears"
];

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, authLoading, router]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          name: data.name || "",
          email: data.email || user.email || "",
          gender: data.gender || "",
          age: data.age || 0,
          preferences: {
            sharedMemory: data.preferences?.sharedMemory ?? true,
            weeklyEmails: data.preferences?.weeklyEmails ?? true,
            interests: data.preferences?.interests || [],
            topics: data.preferences?.topics || [],
            goals: data.preferences?.goals || []
          }
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserData["preferences"]>) => {
    if (!user || !userData) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        preferences: { ...userData.preferences, ...updates }
      });
      setUserData({
        ...userData,
        preferences: { ...userData.preferences, ...updates }
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && userData) {
      const updatedInterests = [...userData.preferences.interests, newInterest.trim()];
      updatePreferences({ interests: updatedInterests });
      setNewInterest("");
    }
  };

  const removeInterest = (index: number) => {
    if (userData) {
      const updatedInterests = userData.preferences.interests.filter((_, i) => i !== index);
      updatePreferences({ interests: updatedInterests });
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && userData) {
      const updatedTopics = [...userData.preferences.topics, newTopic.trim()];
      updatePreferences({ topics: updatedTopics });
      setNewTopic("");
    }
  };

  const removeTopic = (index: number) => {
    if (userData) {
      const updatedTopics = userData.preferences.topics.filter((_, i) => i !== index);
      updatePreferences({ topics: updatedTopics });
    }
  };

  const addGoal = () => {
    if (newGoal.trim() && userData) {
      const updatedGoals = [...userData.preferences.goals, newGoal.trim()];
      updatePreferences({ goals: updatedGoals });
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    if (userData) {
      const updatedGoals = userData.preferences.goals.filter((_, i) => i !== index);
      updatePreferences({ goals: updatedGoals });
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
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
          {/* Basic Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userData?.name || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={userData?.gender || ""}
                  onChange={(e) => setUserData(prev => prev ? { ...prev, gender: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={userData?.age || ""}
                  onChange={(e) => setUserData(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your age"
                />
              </div>
            </div>
          </motion.div>

          {/* Interests */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Interests</h2>
            <p className="text-gray-800 mb-6">
              Help your AI companion understand what you enjoy to provide more personalized support.
            </p>
            
            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest (e.g., music, hiking, cooking)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === "Enter" && addInterest()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addInterest}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Add
              </motion.button>
            </div>

            <div className="flex flex-wrap gap-3">
              {userData?.preferences.interests.map((interest, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
                >
                  <span>{interest}</span>
                  <button
                    onClick={() => removeInterest(index)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Mental Health Topics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mental Health Topics</h2>
            <p className="text-gray-800 mb-6">
              Select topics you'd like to focus on or learn more about. This helps your AI companion provide targeted support.
            </p>
            
            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Add a topic (e.g., anxiety, depression, stress)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === "Enter" && addTopic()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addTopic}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Add
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {mentalHealthTopics.map((topic) => (
                <motion.button
                  key={topic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (userData?.preferences.topics.includes(topic)) {
                      removeTopic(userData.preferences.topics.indexOf(topic));
                    } else {
                      addTopic();
                      setNewTopic(topic);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    userData?.preferences.topics.includes(topic)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {topic}
                </motion.button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {userData?.preferences.topics.map((topic, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
                >
                  <span>{topic}</span>
                  <button
                    onClick={() => removeTopic(index)}
                    className="text-emerald-600 hover:text-emerald-800 font-bold"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Goals */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-200/50"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Goals</h2>
            <p className="text-gray-800 mb-6">
              What would you like to work on or achieve? This helps your AI companion provide targeted support.
            </p>
            
            <div className="flex space-x-2 mb-6">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Add a goal (e.g., reduce anxiety, improve sleep, build confidence)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === "Enter" && addGoal()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addGoal}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Add
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {commonGoals.map((goal) => (
                <motion.button
                  key={goal}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (userData?.preferences.goals.includes(goal)) {
                      removeGoal(userData.preferences.goals.indexOf(goal));
                    } else {
                      addGoal();
                      setNewGoal(goal);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    userData?.preferences.goals.includes(goal)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {goal}
                </motion.button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {userData?.preferences.goals.map((goal, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
                >
                  <span>{goal}</span>
                  <button
                    onClick={() => removeGoal(index)}
                    className="text-orange-600 hover:text-orange-800 font-bold"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex justify-end"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving ? "Saving..." : "Save & Continue"}
            </motion.button>
          </motion.div>

          {saving && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-xl text-center"
            >
              Saving your profile...
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}