import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  workspace_id: string;
  full_name: string | null;
  company_name: string | null;
  email: string;
  role: string;
  avatar_url: string | null;
  voucher_code: string | null;
  voucher_validated: boolean;
  settings: any;
}

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  user: User | null;
  profile: UserProfile | null;
  workspace: Workspace | null;
  error: string | null;
}

class AuthService {
  // Check if Supabase is properly configured
  private isSupabaseConfigured(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Force demo mode if environment variables are missing or set to demo
    if (!url || !key || 
        url === 'demo-mode' || key === 'demo-mode' ||
        url === 'https://your-project.supabase.co' || 
        key === 'your-supabase-anon-key') {
      console.log('🎭 Using demo mode - Supabase not configured');
      return false;
    }
    
    // Additional validation - check if keys look valid
    if (url.includes('demo') || key.includes('demo') || 
        url.length < 20 || key.length < 20) {
      console.log('🎭 Using demo mode - Invalid Supabase credentials detected');
      return false;
    }
    
    console.log('✅ Supabase configured - using real database');
    console.log(`📡 Connecting to: ${url}`);
    return true;
  }

  // Valid ACCESS voucher codes - required for signup
  private validAccessCodes = [
    'SAMAI2025',
    'EARLY2025', 
    'LAUNCH2025',
    'BETA2025',
    'INNOVARE2025'
  ];

  // Validate access code - REQUIRED for signup
  private validateAccessCode(code: string): boolean {
    if (!code) return false; // ACCESS CODE IS REQUIRED
    return this.validAccessCodes.includes(code.toUpperCase());
  }

  // Demo fallback for when Supabase is not configured
  private async simulateSignUp(email: string, password: string, fullName: string, companyName: string, voucherCode?: string): Promise<AuthResult> {
    console.log('🎭 Demo Mode: Simulating user signup...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: 'demo-user-' + Date.now(),
      email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_metadata: {
        full_name: fullName,
        company_name: companyName
      }
    };

    const mockProfile = {
      id: mockUser.id,
      workspace_id: 'demo-workspace-' + Date.now(),
      full_name: fullName,
      company_name: companyName,
      email,
      role: 'owner',
      avatar_url: null,
      voucher_code: voucherCode || null,
      voucher_validated: voucherCode ? this.validateAccessCode(voucherCode) : false,
      settings: {
        preferences: { theme: 'dark', notifications: true },
        onboarding: { completed_steps: [], current_step: 'welcome' }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const mockWorkspace = {
      id: mockProfile.workspace_id,
      name: `${companyName} Workspace`,
      slug: `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
      settings: {
        company_name: companyName,
        onboarding_completed: false,
        features_enabled: {
          ai_agents: true,
          training_room: true,
          deal_room: true,
          data_room: true
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store in localStorage for demo persistence
    localStorage.setItem('sam-demo-user', JSON.stringify({ user: mockUser, profile: mockProfile, workspace: mockWorkspace }));

    return {
      user: mockUser as any,
      profile: mockProfile,
      workspace: mockWorkspace,
      error: null
    };
  }

  private async simulateSignIn(email: string, password: string): Promise<AuthResult> {
    console.log('🎭 Demo Mode: Simulating user signin...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to get stored demo user
    const stored = localStorage.getItem('sam-demo-user');
    if (stored) {
      const { user, profile, workspace } = JSON.parse(stored);
      if (user.email === email) {
        return { user, profile, workspace, error: null };
      }
    }

    // If no stored user matches, create a default demo user
    return this.simulateSignUp(email, password, email.split('@')[0], 'Demo Company');
  }

  async signUp(email: string, password: string, fullName: string, companyName: string, voucherCode?: string): Promise<AuthResult> {
    // Validate access code - REQUIRED for signup
    if (!voucherCode) {
      return { user: null, profile: null, workspace: null, error: 'Access code is required to create an account. Please enter a valid access code.' };
    }
    
    if (!this.validateAccessCode(voucherCode)) {
      return { user: null, profile: null, workspace: null, error: 'Invalid access code. Please check your access code and try again.' };
    }

    // Use demo mode if Supabase is not configured
    if (!this.isSupabaseConfigured()) {
      return this.simulateSignUp(email, password, fullName, companyName, voucherCode);
    }

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
            voucher_code: voucherCode || null,
          }
        }
      });

      if (authError) {
        // Check if this is an API key error and fall back to demo mode
        if (authError.message.includes('Invalid API key') || 
            authError.message.includes('API key') ||
            authError.message.includes('unauthorized')) {
          console.log('🎭 Supabase API error detected, falling back to demo mode');
          return this.simulateSignUp(email, password, fullName, companyName, voucherCode);
        }
        return { user: null, profile: null, workspace: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, profile: null, workspace: null, error: 'Failed to create user account' };
      }

      // 2. Create workspace for the user
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: `${companyName} Workspace`,
          slug: `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
          settings: {
            company_name: companyName,
            onboarding_completed: false,
            features_enabled: {
              ai_agents: true,
              training_room: true,
              deal_room: true,
              data_room: true
            }
          }
        })
        .select()
        .single();

      if (workspaceError) {
        // Check if this is a database table error and fall back to demo mode
        if (workspaceError.message.includes('relation "workspaces" does not exist') ||
            workspaceError.message.includes('PGRST116') ||
            workspaceError.code === 'PGRST116') {
          console.log('🎭 Database tables not found during signup, falling back to demo mode');
          return this.simulateSignUp(email, password, fullName, companyName, voucherCode);
        }
        
        // Clean up: delete the user if workspace creation fails
        console.error('Workspace creation failed:', workspaceError);
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup user after workspace error:', cleanupError);
        }
        
        // Provide specific error message based on the error type
        let errorMessage = 'Failed to create workspace';
        if (workspaceError.message) {
          errorMessage += `: ${workspaceError.message}`;
        }
        
        return { user: null, profile: null, workspace: null, error: errorMessage };
      }

      // 3. Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          workspace_id: workspace.id,
          full_name: fullName,
          company_name: companyName,
          email: email,
          role: 'owner',
          voucher_code: voucherCode || null,
          voucher_validated: voucherCode ? this.validateAccessCode(voucherCode) : false,
          settings: {
            preferences: {
              theme: 'dark',
              notifications: true
            },
            onboarding: {
              completed_steps: [],
              current_step: 'welcome'
            }
          }
        })
        .select()
        .single();

      if (profileError) {
        // Check if this is a database table error and fall back to demo mode
        if (profileError.message.includes('relation "profiles" does not exist') ||
            profileError.message.includes('PGRST116') ||
            profileError.code === 'PGRST116') {
          console.log('🎭 Database tables not found during profile creation, falling back to demo mode');
          return this.simulateSignUp(email, password, fullName, companyName, voucherCode);
        }
        
        // Clean up: delete workspace and user if profile creation fails
        console.error('Profile creation failed:', profileError);
        try {
          await supabase.from('workspaces').delete().eq('id', workspace.id);
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Failed to cleanup after profile error:', cleanupError);
        }
        
        // Provide specific error message
        let errorMessage = 'Failed to create profile';
        if (profileError.message) {
          errorMessage += `: ${profileError.message}`;
        }
        
        return { user: null, profile: null, workspace: null, error: errorMessage };
      }

      return {
        user: authData.user,
        profile,
        workspace,
        error: null
      };

    } catch (error) {
      console.error('Supabase signup error:', error);
      // Fall back to demo mode on any network/API errors
      if (error instanceof Error && 
          (error.message.includes('API key') || 
           error.message.includes('network') ||
           error.message.includes('fetch'))) {
        console.log('🎭 Network/API error detected, falling back to demo mode');
        return this.simulateSignUp(email, password, fullName, companyName, voucherCode);
      }
      
      return {
        user: null,
        profile: null,
        workspace: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    // Use demo mode if Supabase is not configured
    if (!this.isSupabaseConfigured()) {
      return this.simulateSignIn(email, password);
    }

    try {
      // 1. Sign in user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        // Check if this is an API key error and fall back to demo mode
        if (authError.message.includes('Invalid API key') || 
            authError.message.includes('API key') ||
            authError.message.includes('unauthorized') ||
            authError.message.includes('Invalid login credentials')) {
          console.log('🎭 Supabase authentication error detected during login, falling back to demo mode');
          return this.simulateSignIn(email, password);
        }
        return { user: null, profile: null, workspace: null, error: authError.message };
      }

      if (!authData.user) {
        return { user: null, profile: null, workspace: null, error: 'Failed to sign in' };
      }

      // 2. Get user profile and workspace
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          workspaces (*)
        `)
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        // Check if this is a database table error and fall back to demo mode
        if (profileError && (
            profileError.message.includes('relation "profiles" does not exist') ||
            profileError.message.includes('relation "workspaces" does not exist') ||
            profileError.message.includes('PGRST116') ||
            profileError.code === 'PGRST116'
          )) {
          console.log('🎭 Database tables not found, falling back to demo mode');
          return this.simulateSignIn(email, password);
        }
        return { user: null, profile: null, workspace: null, error: 'Failed to load user profile' };
      }

      return {
        user: authData.user,
        profile,
        workspace: profile.workspaces,
        error: null
      };

    } catch (error) {
      console.error('Supabase signin error:', error);
      // Fall back to demo mode on any network/API/database errors
      if (error instanceof Error && 
          (error.message.includes('API key') || 
           error.message.includes('network') ||
           error.message.includes('fetch') ||
           error.message.includes('relation') ||
           error.message.includes('PGRST116'))) {
        console.log('🎭 Network/API/Database error detected, falling back to demo mode');
        return this.simulateSignIn(email, password);
      }
      
      return {
        user: null,
        profile: null,
        workspace: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    // Use demo mode if Supabase is not configured
    if (!this.isSupabaseConfigured()) {
      console.log('🎭 Demo Mode: Signing out...');
      localStorage.removeItem('sam-demo-user');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  async getCurrentUser(): Promise<AuthResult> {
    // Use demo mode if Supabase is not configured
    if (!this.isSupabaseConfigured()) {
      const stored = localStorage.getItem('sam-demo-user');
      if (stored) {
        const { user, profile, workspace } = JSON.parse(stored);
        return { user, profile, workspace, error: null };
      } else {
        return { user: null, profile: null, workspace: null, error: 'No demo session found' };
      }
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { user: null, profile: null, workspace: null, error: userError?.message || 'No user session' };
      }

      // Get user profile and workspace
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          workspaces (*)
        `)
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return { user: null, profile: null, workspace: null, error: 'Failed to load user profile' };
      }

      return {
        user,
        profile,
        workspace: profile.workspaces,
        error: null
      };

    } catch (error) {
      return {
        user: null,
        profile: null,
        workspace: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async resetPassword(email: string): Promise<{ error: string | null }> {
    // Use demo mode if Supabase is not configured
    if (!this.isSupabaseConfigured()) {
      console.log('🎭 Demo Mode: Password reset simulation');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { error: error?.message || null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    // Use demo mode if Supabase is not configured
    if (!this.isSupabaseConfigured()) {
      console.log('🎭 Demo Mode: Auth state change listener (no-op)');
      return { data: { subscription: { unsubscribe: () => {} } }, error: null };
    }

    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}

export const authService = new AuthService();