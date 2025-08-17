import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleSignupFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SimpleSignupFlow({ isOpen, onClose, onSuccess }: SimpleSignupFlowProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    voucherCode: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.fullName || !formData.voucherCode) {
      console.error("ERROR:", 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Make password compliant
      const password = formData.password.length >= 8 
        ? formData.password 
        : 'SAMai2025!';

      // Validate voucher first
      const { data: voucherCheck } = await supabase.rpc('validate_voucher_code', {
        voucher_code: formData.voucherCode.toUpperCase(),
        user_email: formData.email.toLowerCase()
      });

      if (!voucherCheck?.valid) {
        console.error("ERROR:", 'Invalid invitation code for this email');
        setLoading(false);
        return;
      }

      // Try signup
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
        options: {
          data: { full_name: formData.fullName }
        }
      });

      if (authError && authError.message.includes('already registered')) {
        // User exists, try login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: password
        });

        if (loginData.user) {
          localStorage.setItem('is_authenticated', 'true');
          localStorage.setItem('user_auth_profile', JSON.stringify({
            id: loginData.user.id,
            email: loginData.user.email,
            full_name: loginData.user.user_metadata?.full_name || formData.fullName,
            role: 'admin',
            status: 'active'
          }));
          
          console.log("SUCCESS:", 'Welcome back! Redirecting...');
          setTimeout(() => {
            window.location.replace('/');
          }, 1500);
          return;
        }
      }

      if (authError) {
        throw authError;
      }

      // Redeem voucher
      await supabase.rpc('redeem_voucher_code', {
        voucher_code: formData.voucherCode.toUpperCase(),
        user_email: formData.email
      });

      // Create profile
      await supabase.from('profiles').insert({
        id: authData.user!.id,
        workspace_id: null,
        email: formData.email,
        full_name: formData.fullName,
        role: 'admin',
        voucher_code_used: formData.voucherCode.toUpperCase()
      });

      // Set auth
      localStorage.setItem('is_authenticated', 'true');
      localStorage.setItem('user_auth_profile', JSON.stringify({
        id: authData.user!.id,
        email: formData.email,
        full_name: formData.fullName,
        role: 'admin',
        status: 'active'
      }));

      console.log("SUCCESS:", 'Account created! Redirecting...');
      setTimeout(() => {
        window.location.replace('/');
      }, 1500);

    } catch (err: any) {
      console.error('Signup error:', err);
      console.error("ERROR:", 'Signup failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Join SAM AI</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-200">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="fullName"
                placeholder="Your name"
                className="pl-10 bg-slate-800 border-slate-600 text-white"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="pl-10 bg-slate-800 border-slate-600 text-white"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Password (optional)</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="Leave blank for auto-generated"
                className="pl-10 bg-slate-800 border-slate-600 text-white"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="voucherCode" className="text-slate-200">Invitation Code</Label>
            <Input
              id="voucherCode"
              placeholder="Your invitation code"
              className="bg-slate-800 border-slate-600 text-white"
              value={formData.voucherCode}
              onChange={(e) => setFormData({ ...formData, voucherCode: e.target.value.toUpperCase() })}
              disabled={loading}
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your account...
              </>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}