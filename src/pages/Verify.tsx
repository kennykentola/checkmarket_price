import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export const Verify = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 3000);
      } else if (session?.user) {
        setStatus('pending');
      } else {
        setStatus('error');
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === 'loading' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-600 mb-6">Your email has been successfully confirmed. Redirecting you to the dashboard...</p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go to Dashboard
              </Link>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">We've sent a verification link to your Gmail. Please click it to activate your account.</p>
              <div className="space-y-4">
                <p className="text-xs text-gray-500 italic">Didn't see it? Check your Spam folder.</p>
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-600 mb-6">The verification link may have expired or is invalid.</p>
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
