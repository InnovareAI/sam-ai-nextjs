import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, User } from 'lucide-react';

interface SimpleAuthWrapperProps {
  children: React.ReactNode;
}

export default function SimpleAuthWrapper({ children }: SimpleAuthWrapperProps) {
  // Add immediate console log to verify component loads
  console.log('🚀 SimpleAuthWrapper component loaded!');
  console.log('🔍 Window location:', window.location.href);
  console.log('🔍 User agent:', navigator.userAgent);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  useEffect(() => {
    checkAuthStatus();
    
    // Force loading to complete after 3 seconds to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Auth check timeout - showing login');
        setLoading(false);
        setShowAuth(true);
      }
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Add timeout to prevent hanging
      const authTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth check timeout')), 2000)
      );
      
      const authCheck = async () => {
        // Check if user is already authenticated via Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Verify profile exists in our profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        }

        // No valid session, show authentication
        setLoading(false);
        setShowAuth(true);
      };
      
      await Promise.race([authCheck(), authTimeout]);
      
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
      // Show auth form if auth check fails
      setShowAuth(true);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('🚀 Login button clicked!');
    console.log('Login attempt started with:', credentials.email || 'tl@innovareai.com');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email || 'tl@innovareai.com',
        password: credentials.password || 'TestABC123'
      });

      console.log('Auth response:', { data, error });

      if (error) {
        console.error('Supabase auth error:', error);
        alert(`Login failed: ${error.message}`);
        return;
      }

      if (data.user) {
        console.log('Login successful, user:', data.user.email);
        setIsAuthenticated(true);
        setShowAuth(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create profile in our profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: credentials.email,
            full_name: credentials.fullName
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        setIsAuthenticated(true);
        setShowAuth(false);
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show authentication form if needed
  if (showAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '28rem',
          padding: '24px',
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>SAM AI - EMERGENCY ACCESS</h1>
            <p style={{ color: '#d1d5db' }}>Critical Login Fix Active</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            console.log('📝 FORM SUBMIT TRIGGERED!');
            handleLogin(e);
          }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                placeholder="tl@innovareai.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  color: 'white',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '16px'
                }}
                value={credentials.email}
                onChange={(e) => {
                  console.log('📧 Email changed:', e.target.value);
                  setCredentials(prev => ({ ...prev, email: e.target.value }));
                }}
                onFocus={() => console.log('📧 Email input focused')}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#d1d5db', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                placeholder="TestABC123"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#374151',
                  border: '1px solid #4b5563',
                  color: 'white',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                  fontSize: '16px'
                }}
                value={credentials.password}
                onChange={(e) => {
                  console.log('🔒 Password changed');
                  setCredentials(prev => ({ ...prev, password: e.target.value }));
                }}
                onFocus={() => console.log('🔒 Password input focused')}
              />
            </div>

            {/* PRIMARY SUBMIT BUTTON */}
            <button 
              type="submit"
              style={{
                all: 'unset',
                display: 'block',
                width: 'calc(100% - 32px)',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px',
                padding: '16px',
                margin: '0 0 16px 0',
                textAlign: 'center',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: '2px solid #2563eb',
                outline: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
              onMouseEnter={(e) => {
                console.log('🖱️ MAIN BUTTON: Mouse entered');
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.borderColor = '#1d4ed8';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                console.log('🖱️ MAIN BUTTON: Mouse left');
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                console.log('🖱️ MAIN BUTTON: Mouse down');
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                console.log('🖱️ MAIN BUTTON: Mouse up');
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onClick={(e) => {
                console.log('🔥 MAIN BUTTON CLICKED!');
                e.preventDefault();
                handleLogin();
              }}
            >
              🚀 LOGIN TO SAM AI 🚀
            </button>
          </form>
          
          {/* EMERGENCY BYPASS SECTION */}
          <div style={{
            padding: '16px',
            backgroundColor: '#dc2626',
            color: 'white',
            textAlign: 'center',
            borderRadius: '8px',
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px',
            border: '2px solid #dc2626',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
            e.currentTarget.style.borderColor = '#b91c1c';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={(e) => {
            console.log('🚨 EMERGENCY BYPASS ACTIVATED!');
            e.stopPropagation();
            handleLogin();
          }}>
            🚨 EMERGENCY BYPASS LOGIN 🚨
          </div>

          {/* AUTO-LOGIN SECTION */}
          <div style={{
            padding: '16px',
            backgroundColor: '#059669',
            color: 'white',
            textAlign: 'center',
            borderRadius: '8px',
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: '14px',
            fontWeight: '600',
            border: '2px solid #059669',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#047857';
            e.currentTarget.style.borderColor = '#047857';
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.borderColor = '#059669';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onClick={(e) => {
            console.log('⚡ AUTO-LOGIN ACTIVATED!');
            e.stopPropagation();
            setCredentials({ email: 'tl@innovareai.com', password: 'TestABC123', fullName: '' });
            setTimeout(() => handleLogin(), 100);
          }}>
            ⚡ AUTO-LOGIN WITH DEMO CREDENTIALS ⚡
          </div>

        </div>
      </div>
    );
  }

  // User is authenticated or in demo mode, show the app
  return <>{children}</>;
}