import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { account, databases, client, DATABASE_ID, COLLECTION_USERS } from '../services/appwriteConfig';
import { ID } from 'appwrite';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    // Check if there's a stored session
    const sessionKey = `a_session_${client.config.project}`;
    const storedSession = localStorage.getItem(sessionKey);

    if (!storedSession) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Temporarily suppress console.error to avoid 401 logs
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      const session = await account.get();
      // Get user role from database
      let userRole = UserRole.BUYER; // Default role
      try {
        const userDoc = await databases.getDocument(DATABASE_ID, COLLECTION_USERS, session.$id);
        userRole = userDoc.role;
      } catch {
        // User document doesn't exist, use default role
      }

      const userData: User = {
        $id: session.$id,
        name: session.name,
        email: session.email,
        role: userRole
      };
      setUser(userData);
    } catch (error) {
      // No active session
      setUser(null);
    } finally {
      setIsLoading(false);
      // Restore console.error
      console.error = originalConsoleError;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      // Delete any existing session
      try {
        await account.deleteSession('current');
      } catch {
        // No existing session, continue
      }

      // Create account
      const user = await account.create(ID.unique(), email, password, name);
      console.log('Account created:', user);

      // Create session
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Session created:', session);
      client.setSession(session.secret);

      // Get full session info
      const sessionInfo = await account.get();
      console.log('Session info:', sessionInfo);

      // Create user in database
      await databases.createDocument(DATABASE_ID, COLLECTION_USERS, sessionInfo.$id, {
        username: sessionInfo.name.replace(/\s+/g, '').toLowerCase(),
        name: sessionInfo.name,
        email: sessionInfo.email,
        passwordHash: '',
        createdAt: new Date().toISOString(),
        role
      });

      const userData: User = {
        $id: sessionInfo.$id,
        name: sessionInfo.name,
        email: sessionInfo.email,
        role
      };
      setUser(userData);
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Provide more specific error messages
      if (error.code === 409) {
        throw new Error('Email already registered. Please use a different email or try logging in.');
      } else if (error.code === 400) {
        throw new Error('Invalid email or password. Please check your input.');
      } else {
        throw new Error(`Registration failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Delete any existing session
      try {
        await account.deleteSession('current');
      } catch {
        // No existing session, continue
      }

      // Create session
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Login session created:', session);
      client.setSession(session.secret);

      // Get full session info
      const sessionInfo = await account.get();
      console.log('Login session info:', sessionInfo);

      // Get user role from database
      let userRole = UserRole.BUYER; // Default role
      try {
        const userDoc = await databases.getDocument(DATABASE_ID, COLLECTION_USERS, sessionInfo.$id);
        userRole = userDoc.role;
      } catch {
        // User document doesn't exist, create them with default role
        await databases.createDocument(DATABASE_ID, COLLECTION_USERS, sessionInfo.$id, {
          username: sessionInfo.name.replace(/\s+/g, '').toLowerCase(),
          name: sessionInfo.name,
          email: sessionInfo.email,
          passwordHash: '',
          createdAt: new Date().toISOString(),
          role: UserRole.BUYER
        });
      }

      const userData: User = {
        $id: sessionInfo.$id,
        name: sessionInfo.name,
        email: sessionInfo.email,
        role: userRole
      };
      setUser(userData);
    } catch (error: any) {
      console.error('Login failed:', error);
      // Provide more specific error messages
      if (error.code === 401) {
        throw new Error('Invalid email or password. Please check your credentials.');
      } else if (error.code === 400) {
        throw new Error('Invalid login request. Please try again.');
      } else {
        throw new Error(`Login failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};