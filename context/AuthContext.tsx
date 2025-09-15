import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get stored users
      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Find user with matching email and password
      const foundUser = users.find((u: any) => u.email === email && u.password === password);

      if (foundUser) {
        const userToStore = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          createdAt: foundUser.createdAt,
        };
        
        await AsyncStorage.setItem('currentUser', JSON.stringify(userToStore));
        setUser(userToStore);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Get existing users
      const usersData = await AsyncStorage.getItem('users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Check if email already exists
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        return false;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));

      // Login the new user
      const userToStore = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      };

      await AsyncStorage.setItem('currentUser', JSON.stringify(userToStore));
      setUser(userToStore);
      return true;
    } catch (error) {
      console.error('Error during signup:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}