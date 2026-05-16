import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  sendVerificationEmail: () => Promise<void>;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        updateUserState(session.user);
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateUserState = async (supabaseUser: any) => {
    const userRole = await getUserRoleByEmail(supabaseUser.email);
    const isVerified = supabaseUser.email_confirmed_at ? true : false;
    
    setUser({
      $id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
      email: supabaseUser.email,
      role: userRole
    });
    
    setIsEmailVerified(isVerified);
    console.log('User state updated. Verified:', isVerified);
  };

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await updateUserState(session.user);
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRoleByEmail = async (email: string): Promise<UserRole> => {
    const PERMANENT_ADMIN_EMAILS = [
      'peterkehindeademola@gmail.com',
      'kilocode52@gmail.com',
      'peterkehindeademola9@gmail.com'
    ];
    
    if (PERMANENT_ADMIN_EMAILS.includes(email)) {
      return UserRole.ADMIN;
    }
    
    // In a real app, you'd fetch this from a 'profiles' table in Supabase
    return UserRole.BUYER;
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    if (role === UserRole.ADMIN) {
      throw new Error('Admin registration is not allowed.');
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      });

      if (error) throw error;
      
      if (data.user) {
        await updateUserState(data.user);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      if (data.user) {
        await updateUserState(data.user);
        
        // Log activity
        api.logActivity({
          userId: data.user.id,
          action: 'login',
          details: { email: data.user.email }
        }).catch(console.error);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsEmailVerified(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sendVerificationEmail = async () => {
    // Supabase sends these automatically or via resend
    console.log('Verification handling is managed by Supabase');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, sendVerificationEmail, isEmailVerified }}>
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
