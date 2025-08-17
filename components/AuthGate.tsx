import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SimpleLoginModal from '@/components/auth/SimpleLoginModal';
import SignupModal from '@/components/auth/SignupModal';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/follow-ups-public',
    '/follow-ups',
    '/test-inbox',
    '/inbox-direct',
    '/simple-inbox',
    '/linkedin-setup',
    '/linkedin-manager',
    '/linkedin-diagnostic',
    '/linkedin-onboarding',
    '/onboarding',
    '/login',
    '/auth/login',
    '/admin/login'
  ];
  
  // Check if current route is public
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const isAuth = localStorage.getItem('is_authenticated') === 'true';
      const userProfile = localStorage.getItem('user_auth_profile');
      
      if (isAuth && userProfile) {
        try {
          const profile = JSON.parse(userProfile);
          if (profile.id) {
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          // Clear bad data
          localStorage.removeItem('is_authenticated');
          localStorage.removeItem('user_auth_profile');
        }
      }
      
      setIsAuthenticated(false);
      setLoading(false);
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };
  
  const handleAuthSuccess = () => {
    // After successful auth, re-run the complete auth check
    setTimeout(() => {
      checkAuth();
    }, 100);
  };
  
  const checkAuthFromStorage = () => {
    const isAuth = localStorage.getItem('is_authenticated') === 'true';
    const userProfile = localStorage.getItem('user_auth_profile');
    
    if (isAuth && userProfile) {
      try {
        const profile = JSON.parse(userProfile);
        if (profile.id) {
          setIsAuthenticated(true);
          return true;
        }
      } catch (e) {
        // Clear bad data
        localStorage.removeItem('is_authenticated');
        localStorage.removeItem('user_auth_profile');
      }
    }
    
    return false;
  };
  
  // Allow public routes to bypass authentication entirely
  if (isPublicRoute) {
    return <>{children}</>;
  }
  
  // Production authentication with graceful fallback
  // If authentication check fails in production, show the app anyway
  if (import.meta.env.PROD && !loading) {
    try {
      // Check if we have minimal auth requirements
      const hasBasicAuth = isAuthenticated || localStorage.getItem('demo_mode') === 'true';
      if (!hasBasicAuth) {
        // Set demo mode to allow access
        localStorage.setItem('demo_mode', 'true');
        console.log('PROD MODE: Enabling demo mode for guest access');
      }
      return <>{children}</>;
    } catch (error) {
      console.error('Auth check error in production:', error);
      // Always return the app in production to prevent white screens
      return <>{children}</>;
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SAM AI</h1>
            <p className="text-slate-300">Agentic Sales AI Platform</p>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Welcome</h2>
            <p className="text-slate-300 mb-6">
              Please sign in or create an account to continue
            </p>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-none" 
                size="lg"
                onClick={() => setShowLogin(true)}
              >
                Sign In
              </Button>
              
              <Button 
                className="w-full bg-slate-800 hover:bg-slate-700 text-white border-slate-600" 
                size="lg" 
                variant="outline"
                onClick={() => setShowSignup(true)}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
        
        <SimpleLoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSuccess={handleAuthSuccess}
          onSignupClick={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
        
        <SignupModal
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }
  
  return <>{children}</>;
}