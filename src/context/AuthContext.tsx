import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { account, databases, client, DATABASE_ID, COLLECTION_USERS } from '../services/appwriteConfig';
import { ID, Query } from 'appwrite';

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

    // Set the session on the client
    client.setSession(storedSession);

    // Temporarily suppress console.error to avoid 401 logs
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      const session = await account.get();
      // Get user role from database by email
      let userRole = await getUserRoleByEmail(session.email);

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

  // Helper function to get user role by email
  const getUserRoleByEmail = async (email: string): Promise<UserRole> => {
    console.log('getUserRoleByEmail called with:', email);
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_USERS, [
        Query.equal('email', [email]),
        Query.limit(1)
      ]);
      
      console.log('Query response:', response.documents.length, 'documents found');
      
      if (response.documents.length > 0) {
        const role = response.documents[0].role as UserRole;
        console.log('Found role:', role);
        return role;
      }
    } catch (error) {
      console.log('Could not fetch user role from database:', error);
    }
    console.log('Using default role: BUYER');
    return UserRole.BUYER; // Default role
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
      const authUser = await account.create(ID.unique(), email, password, name);
      console.log('Account created:', authUser);

      // Create session
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Session created:', session);
      client.setSession(session.secret);

      // Get full session info
      const sessionInfo = await account.get();
      console.log('Session info:', sessionInfo);

      // Create user in database with the auth user ID
      console.log('Creating user document with role:', role);
      await databases.createDocument(DATABASE_ID, COLLECTION_USERS, authUser.$id, {
        username: sessionInfo.name.replace(/\s+/g, '').toLowerCase(),
        name: sessionInfo.name,
        email: sessionInfo.email,
        passwordHash: '',
        createdAt: new Date().toISOString(),
        role
      });
      console.log('User document created successfully');

      const userData: User = {
        $id: authUser.$id,
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
      // Delete any existing session first
      try {
        await account.deleteSession('current');
        console.log('Deleted existing session');
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

      // Get user role from database by email
      const userRole = await getUserRoleByEmail(sessionInfo.email);

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
      } else if (error.code === 429) {
        throw new Error('Too many login attempts. Please wait a few minutes and try again.');
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
