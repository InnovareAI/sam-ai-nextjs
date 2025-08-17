import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  permissions?: Record<string, boolean>;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;
  private session: Session | null = null;

  private constructor() {
    this.initializeAuth();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth() {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.session = session;
      await this.loadUserProfile(session.user.id);
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      this.session = session;
      if (session) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUser = null;
      }
    });
  }

  private async loadUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      this.currentUser = {
        id: data.id,
        email: data.email,
        firstName: data.full_name?.split(' ')[0],
        lastName: data.full_name?.split(' ').slice(1).join(' '),
        subscriptionTier: data.subscription_tier,
        subscriptionStatus: data.subscription_status,
        permissions: data.permissions || {}
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      // Regular signup without workspace creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: `${data.firstName} ${data.lastName}`
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signup');

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          full_name: `${data.firstName} ${data.lastName}`,
          subscription_tier: 'free',
          subscription_status: 'active',
          permissions: {}
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      const user: AuthUser = {
        id: authData.user.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        subscriptionTier: 'free',
        subscriptionStatus: 'active',
        permissions: {}
      };

      this.currentUser = user;
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  }


  async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from signin');

      await this.loadUserProfile(authData.user.id);
      
      return { user: this.currentUser, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  }

  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.currentUser = null;
      this.session = null;
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://sameaisalesassistant.netlify.app/reset-password'
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<{ user: AuthUser | null; error: Error | null }> {
    try {
      if (!this.currentUser) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.firstName && updates.lastName ? `${updates.firstName} ${updates.lastName}` : undefined,
          subscription_tier: updates.subscriptionTier,
          subscription_status: updates.subscriptionStatus
        })
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      // Update local user
      this.currentUser = {
        ...this.currentUser,
        ...updates
      };

      return { user: this.currentUser, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  getSession(): Session | null {
    return this.session;
  }

  isAuthenticated(): boolean {
    return !!this.session;
  }

  hasPermission(permission: string): boolean {
    if (!this.currentUser) return false;
    
    // Check if user has subscription access for permission
    if (this.currentUser.subscriptionTier === 'pro' || this.currentUser.subscriptionTier === 'enterprise') {
      return true;
    }
    
    // Check specific permission
    return !!this.currentUser.permissions?.[permission];
  }

  async refreshSession(): Promise<{ error: Error | null }> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      this.session = session;
      if (session) {
        await this.loadUserProfile(session.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  }
}

export const authService = AuthService.getInstance();