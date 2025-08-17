import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSignupClick?: () => void;
}

export default function SimpleLoginModal({ isOpen, onClose, onSuccess, onSignupClick }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.email || !formData.password) {
      setError('Please enter your email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Use proper Supabase authentication
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('No user data returned');
      }
      
      // Get user profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          subscription_tier,
          subscription_status
        `)
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error('Failed to load user profile');
      }
      
      // Set up proper authentication state
      const userProfile = {
        id: profileData.id,
        email: profileData.email,
        full_name: profileData.full_name || profileData.email.split('@')[0],
        subscription_tier: profileData.subscription_tier || 'free',
        subscription_status: profileData.subscription_status || 'active',
        status: 'active'
      };
      
      localStorage.setItem('is_authenticated', 'true');
      localStorage.setItem('user_auth_profile', JSON.stringify(userProfile));
      
      console.log("SUCCESS:", 'Successfully logged in!');
      onClose();
      onSuccess?.();
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Welcome back</DialogTitle>
          <DialogDescription className="text-slate-300">
            Sign in to your SAM AI - Agentic Sales AI Platform
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            style={{
              pointerEvents: loading ? 'none' : 'auto',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
          
          {onSignupClick && (
            <Button
              type="button"
              variant="ghost"
              className="w-full text-slate-300 hover:text-white hover:bg-slate-800"
              onClick={onSignupClick}
              disabled={loading}
            >
              Don't have an account? Sign up
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}