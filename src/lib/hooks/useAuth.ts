"use client";

import { useState, useEffect } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "User logged out");
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log("User authenticated, checking user document...");
        // Check if user document exists, create if not
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          console.log("Creating user document...");
          await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            name: user.displayName || "",
            createdAt: new Date(),
            preferences: {
              sharedMemory: true,
              weeklyEmails: true,
              interests: [],
              goals: []
            },
            chatHistory: []
          });
        }
        // Only redirect to dashboard if we're on the auth page
        if (window.location.pathname === '/auth') {
          console.log("Redirecting to dashboard...");
          router.push("/dashboard");
        }
      }
    });

    return unsubscribe;
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect is handled by onAuthStateChanged
            } catch (error: unknown) {
              throw new Error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        name: name,
        createdAt: new Date(),
        preferences: {
          sharedMemory: true,
          weeklyEmails: true,
          interests: [],
          goals: []
        },
        chatHistory: []
      });
      // Redirect is handled by onAuthStateChanged
            } catch (error: unknown) {
              throw new Error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/");
            } catch (error: unknown) {
              throw new Error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    logout
  };
}
