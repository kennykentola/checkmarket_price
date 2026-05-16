import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { account, databases, client, DATABASE_ID, COLLECTION_USERS } from '../services/appwriteConfig';
import { ID, Query } from 'appwrite';
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
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    
    // Temporarily suppress console.error to avoid 401 logs
    const originalConsoleError = console.error;
    console.error = () => {};

    try {
      // Try to get the current session from Appwrite
      // Appwrite SDK v14+ automatically restores sessions from storage
      const session = await account.get();
      console.log('Session restored on refresh:', session);
      
      // Get user role from database by email
      const userRole = await getUserRoleByEmail(session.email);

      const userData: User = {
        $id: session.$id,
        name: session.name,
        email: session.email,
        role: userRole
      };
      setUser(userData);
      setIsEmailVerified(session.emailVerification ?? false);
    } catch (error) {
      // No active session
      console.log('No session found on refresh');
      setUser(null);
      setIsEmailVerified(false);
    } finally {
      setIsLoading(false);
      // Restore console.error
      console.error = originalConsoleError;
    }
  };

   // Helper function to get user role by email
   const getUserRoleByEmail = async (email: string): Promise<UserRole> => {
     console.log('getUserRoleByEmail called with:', email);
     
     // Permanent admin emails that should always have admin role
     const PERMANENT_ADMIN_EMAILS = [
       'peterkehindeademola@gmail.com',
       'kilocode52@gmail.com',
       'peterkehindeademola9@gmail.com'
     ];
     
     // Check if email is a permanent admin
     if (PERMANENT_ADMIN_EMAILS.includes(email)) {
       console.log('Permanent admin email detected:', email);
       return UserRole.ADMIN;
     }
     
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
     // Prevent self-registration as admin
     if (role === UserRole.ADMIN) {
       throw new Error('Admin registration is not allowed. Please contact an administrator to be granted admin access.');
     }
     
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
       setIsEmailVerified(false);

       // Automatically send verification email after registration
       try {
         await account.createVerification(`${window.location.origin}/verify`);
         console.log('Verification email sent automatically after registration');
       } catch (verifyError) {
         console.warn('Could not send verification email:', verifyError);
         // Don't throw — registration itself succeeded
       }
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
      // The Appwrite SDK automatically persists this session
      const session = await account.createEmailPasswordSession(email, password);
      console.log('Login session created:', session);

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
      setIsEmailVerified(sessionInfo.emailVerification ?? false);
      console.log('User logged in successfully:', userData);

      // Log login activity
      try {
        await api.logActivity({
          userId: userData.$id,
          userName: userData.name,
          userEmail: userData.email,
          action: 'login',
          description: `User logged in to the system`,
          timestamp: new Date().toISOString(),
          ipAddress: '', // IP address would need to be captured from the request
          details: { role: userData.role }
        });
      } catch (error) {
        console.warn('Failed to log login activity:', error);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      console.error('Error code:', error.code);
      console.error('Error type:', error.type);
      console.error('Full error:', JSON.stringify(error));
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 401 || error.message?.includes('401')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 429) {
        errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
      } else if (error.code === 400) {
        errorMessage = 'Invalid login request. Please try again.';
      } else if (error.message?.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. The account does not exist or password is incorrect.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Log logout activity before deleting session
      if (user) {
        try {
          await api.logActivity({
            userId: user.$id,
            userName: user.name,
            userEmail: user.email,
            action: 'logout',
            description: `User logged out of the system`,
            timestamp: new Date().toISOString(),
            ipAddress: '',
            details: { role: user.role }
          });
        } catch (error) {
          console.warn('Failed to log logout activity:', error);
        }
      }

      await account.deleteSession('current');
      setUser(null);
      setIsEmailVerified(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await account.createVerification(`${window.location.origin}/verify`);
      console.log('Verification email sent');
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      throw new Error(`Failed to send verification email: ${error.message || 'Unknown error'}`);
    }
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
