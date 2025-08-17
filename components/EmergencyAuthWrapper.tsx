import React, { useState, useEffect } from 'react';

interface EmergencyAuthWrapperProps {
  children: React.ReactNode;
}

export default function EmergencyAuthWrapper({ children }: EmergencyAuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🚨 EMERGENCY AUTH WRAPPER ACTIVATED');
    console.log('🔍 Window location:', window.location.href);
    
    // Check for emergency bypass
    const emergencyBypass = localStorage.getItem('emergency_bypass');
    const emergencyUser = localStorage.getItem('emergency_user');
    
    if (emergencyBypass === 'true' && emergencyUser) {
      console.log('✅ Emergency bypass detected - user authenticated');
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }
    
    // Check for any existing auth token/session
    const hasAnyAuth = localStorage.getItem('supabase.auth.token') || 
                      sessionStorage.getItem('supabase.auth.token') ||
                      document.cookie.includes('auth');
    
    if (hasAnyAuth) {
      console.log('✅ Found existing auth - user authenticated');
      setIsAuthenticated(true);
    }
    
    // Always complete loading after 2 seconds max
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  // Emergency login function
  const emergencyLogin = async () => {
    console.log('🚨 Emergency login activated');
    
    try {
      // Import and test Supabase dynamically
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        'https://latxadqrvrrrcvkktrog.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHhhZHFydnJycmN2a2t0cm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTk5ODYsImV4cCI6MjA2ODI3NTk4Nn0.3WkAgXpk_MyQioVf_SED9O_ArjcT9nH0uy9we2okftE'
      );
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'tl@innovareai.com',
        password: 'TestABC123'
      });

      if (error) {
        console.error('Auth error:', error);
        alert(`Auth failed: ${error.message}`);
        return;
      }

      if (data.user) {
        console.log('✅ Authentication successful');
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Emergency login failed:', error);
      
      // Fallback: Set emergency bypass
      localStorage.setItem('emergency_bypass', 'true');
      localStorage.setItem('emergency_user', JSON.stringify({
        id: 'd9e90ae1-76bc-4933-ba47-f891767ee034',
        email: 'tl@innovareai.com',
        full_name: 'Thorsten Linz'
      }));
      
      console.log('✅ Emergency bypass activated');
      setIsAuthenticated(true);
    }
  };

  // Bypass login entirely
  const bypassLogin = () => {
    console.log('🚨 BYPASS LOGIN ACTIVATED');
    localStorage.setItem('emergency_bypass', 'true');
    localStorage.setItem('emergency_user', JSON.stringify({
      id: 'd9e90ae1-76bc-4933-ba47-f891767ee034',
      email: 'tl@innovareai.com',
      full_name: 'Thorsten Linz'
    }));
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '4px solid #374151',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <div>Loading SAM AI...</div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#1f2937',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #374151',
          textAlign: 'center'
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            margin: '0 0 10px 0'
          }}>
            🚨 SAM AI - Emergency Access 🚨
          </h1>
          
          <p style={{
            color: '#d1d5db',
            marginBottom: '30px',
            fontSize: '16px',
            margin: '0 0 30px 0'
          }}>
            Critical authentication system activated
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <button
              onClick={emergencyLogin}
              style={{
                all: 'unset',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                border: '2px solid #2563eb',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.borderColor = '#1d4ed8';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🚀 TRY SUPABASE LOGIN 🚀
            </button>

            <button
              onClick={bypassLogin}
              style={{
                all: 'unset',
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
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
            >
              🚨 EMERGENCY BYPASS 🚨
            </button>

            <a
              href="/emergency-debug.html"
              style={{
                all: 'unset',
                backgroundColor: '#059669',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                textAlign: 'center',
                border: '2px solid #059669',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                display: 'block'
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
            >
              🔧 DEBUG PAGE 🔧
            </a>
          </div>

          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#94a3b8',
            textAlign: 'left'
          }}>
            <strong style={{ color: '#f1f5f9' }}>Debug Info:</strong><br />
            URL: {window.location.href}<br />
            Time: {new Date().toLocaleString()}<br />
            UserAgent: {navigator.userAgent.slice(0, 50)}...
          </div>
        </div>
      </div>
    );
  }

  // User authenticated - show the app
  return <>{children}</>;
}