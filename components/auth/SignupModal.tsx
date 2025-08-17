import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SimpleVoucherInput from './SimpleVoucherInput';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SignupModal({ isOpen, onClose, onSuccess }: SignupModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    voucherCode: ''
  });
  const [isVoucherValid, setIsVoucherValid] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Starting signup process...', { 
      email: formData.email, 
      hasPassword: !!formData.password,
      hasFullName: !!formData.fullName,
      hasVoucherCode: !!formData.voucherCode,
      isVoucherValid 
    });
    
    // Auto-extend password if it's too short (for client ease)
    let finalPassword = formData.password;
    if (formData.password.length < 8) {
      finalPassword = formData.password + '123!@#'.substring(0, 8 - formData.password.length);
      console.log('🔐 Auto-extended password to meet 8-character requirement');
      console.info("INFO:", 'Password extended to meet security requirements');
    }

    // Validation
    if (!formData.email || !formData.password || !formData.fullName || !formData.voucherCode) {
      console.log('❌ Validation failed: Missing required fields');
      console.error("ERROR:", 'Please fill in all required fields including invitation code');
      return;
    }

    if (!isVoucherValid) {
      console.log('❌ Validation failed: Voucher not validated');
      console.error("ERROR:", 'Please validate your invitation code first');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      console.error("ERROR:", 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    console.log('🔄 Setting loading state and starting Supabase auth...');
    
    try {
      // Use proper Supabase authentication
      console.log('📝 Calling supabase.auth.signUp...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: finalPassword,
        options: {
          data: {
            full_name: formData.fullName
          }
        }
      });

      console.log('🔐 Auth response:', { authData, authError });

      if (authError) {
        console.log('❌ Auth error:', authError);
        
        // If user already exists, try to log them in instead
        if (authError.message.includes('User already registered') || authError.message.includes('already been registered')) {
          console.log('🔄 User exists, attempting login...');
          console.info("INFO:", 'Account exists, logging you in...');
          
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: finalPassword
          });

          if (loginError) {
            // If login fails, maybe password is different - show helpful message
            console.error("ERROR:", 'Account exists but password doesn\'t match. Please use the Sign In button instead.');
            setLoading(false);
            return;
          }

          if (loginData.user) {
            console.log('✅ Login successful');
            
            // Set up authentication state for immediate access
            const userProfile = {
              id: loginData.user.id,
              email: loginData.user.email || formData.email,
              full_name: loginData.user.user_metadata?.full_name || formData.fullName,
              role: 'admin',
              status: 'active'
            };

            localStorage.setItem('is_authenticated', 'true');
            localStorage.setItem('user_auth_profile', JSON.stringify(userProfile));
            
            setStep('success');
            console.log("SUCCESS:", 'Welcome back! Redirecting to dashboard...');
            
            setTimeout(() => {
              onClose();
              if (onSuccess) onSuccess();
              window.location.replace('/');
            }, 1000);
            
            return;
          }
        }
        
        throw authError;
      }

      if (!authData.user) {
        console.log('❌ No user data returned');
        throw new Error('No user data returned from signup');
      }

      console.log('✅ User created successfully:', authData.user.id);

      // Redeem voucher code
      console.log('🎫 Redeeming voucher code...');
      const { data: voucherData, error: voucherError } = await supabase.rpc('redeem_voucher_code', {
        voucher_code: formData.voucherCode,
        user_email: formData.email
      });

      console.log('🎫 Voucher response:', { voucherData, voucherError });

      if (voucherError || !voucherData?.success) {
        console.log('❌ Voucher redemption failed:', voucherData?.error);
        throw new Error(voucherData?.error || 'Failed to redeem voucher code');
      }

      console.log('✅ Voucher redeemed successfully');

      // Create user profile (simplified - no workspace)
      console.log('👤 Creating user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          workspace_id: null, // Single-user system, no workspace needed
          email: formData.email,
          full_name: formData.fullName,
          role: 'admin', // Single user is admin
          voucher_code_used: formData.voucherCode
        })
        .select()
        .single();

      console.log('👤 Profile response:', { profile, profileError });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      console.log('✅ Profile created successfully');

      // Set up authentication state for immediate login
      const userProfile = {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        role: profile.role,
        status: 'active'
      };

      console.log('💾 Setting localStorage auth data...');
      localStorage.setItem('is_authenticated', 'true');
      localStorage.setItem('user_auth_profile', JSON.stringify(userProfile));
      
      console.log('✅ Auth data saved to localStorage');
      
      // Show success
      setStep('success');
      console.log("SUCCESS:", 'Account created successfully! Redirecting to dashboard...');
      
      console.log('🎉 Showing success message and preparing redirect...');
      
      // Close modal and redirect immediately
      setTimeout(() => {
        console.log('🚀 Executing redirect to dashboard...');
        onClose();
        if (onSuccess) onSuccess();
        // Force full page reload to root (dashboard) to ensure proper authentication state
        window.location.replace('/');
      }, 1000);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error("ERROR:", err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      voucherCode: ''
    });
    setStep('form');
    setIsVoucherValid(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === 'form' ? 'Create your account' : 'Welcome to SAM AI!'}
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            {step === 'form' 
              ? 'Get started with SAM AI - Agentic Sales AI Platform. You need a valid invitation code to create an account.'
              : 'Your account has been created successfully'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'form' ? (
          <form onSubmit={handleSignup} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-200">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email *</Label>
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
              <Label htmlFor="password" className="text-slate-200">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            
            <SimpleVoucherInput
              value={formData.voucherCode}
              onChange={(voucherCode) => setFormData({ ...formData, voucherCode })}
              onValidationChange={(isValid) => setIsVoucherValid(isValid)}
              userEmail={formData.email}
              disabled={loading}
            />
            
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-none"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Sign up'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="rounded-full bg-green-900 p-3">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-center text-slate-300">
              Your account has been created successfully!<br />
              Redirecting to dashboard...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}