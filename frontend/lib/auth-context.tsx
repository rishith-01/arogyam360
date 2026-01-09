'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userProfile: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  logout: async () => { },
  userProfile: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000, // 5 second timeout
          });
          setUserProfile(response.data);
        } catch (error: any) {
          // Handle network errors gracefully
          if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
            console.warn('Backend server may be unavailable. User authentication will work, but profile data may be limited.');
            // Set a basic user profile from Firebase user data
            setUserProfile({
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
            });
          } else if (error.response?.status === 404) {
            // Profile doesn't exist yet (likely new user during signup flow)
            console.log('User profile not found in backend (likely new user). Using basic Firebase profile.');
            setUserProfile({
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
            });
          } else {
            console.error('Error fetching user profile:', error);
            // For other errors, still set basic profile
            setUserProfile({
              uid: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
            });
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


