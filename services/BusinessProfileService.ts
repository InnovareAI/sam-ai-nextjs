/**
 * Business Profile Service
 * Manages comprehensive business information and context for SAM AI
 */

import { supabase } from '@/integrations/supabase/client';

export interface BusinessProfile {
  id: string;
  user_id: string;
  
  // Basic Company Information
  company_name: string;
  company_description: string;
  website_url?: string;
  industry: string;
  company_size?: string;
  
  // Sales & Marketing Context
  target_audience: string;
  ideal_customer_profile: ICP;
  value_propositions: string[];
  competitors: string[];
  sales_challenges: string[];
  current_sales_process: string;
  
  // Onboarding & Knowledge Base
  onboarding_completed: boolean;
  onboarding_stage: OnboardingStage;
  knowledge_base: KnowledgeBase;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface ICP {
  primary_criteria: {
    industry: string[];
    company_size: string;
    revenue_range: string;
    roles: string[];
  };
  secondary_criteria: {
    tech_stack: string[];
    growth_stage: string;
    locations: string[];
  };
  disqualifiers: string[];
  ideal_use_cases: string[];
}

export interface KnowledgeBase {
  documents_analyzed: {
    type: string;
    url: string;
    insights: string[];
    added_at: string;
  }[];
  key_insights: {
    category: string;
    insight: string;
    source: string;
    added_at: string;
  }[];
  messaging_frameworks: {
    audience: string;
    pain_points: string[];
    solutions: string[];
    proof_points: string[];
  }[];
  success_stories: {
    customer: string;
    challenge: string;
    solution: string;
    result: string;
  }[];
  user_preferences: {
    communication_style: string;
    preferred_industries: string[];
    meeting_preferences: string;
  };
}

export type OnboardingStage = 
  | 'introduction' 
  | 'discovery' 
  | 'icp_definition' 
  | 'knowledge_building' 
  | 'completed';

export class BusinessProfileService {
  private static instance: BusinessProfileService;

  public static getInstance(): BusinessProfileService {
    if (!BusinessProfileService.instance) {
      BusinessProfileService.instance = new BusinessProfileService();
    }
    return BusinessProfileService.instance;
  }

  private constructor() {}

  /**
   * Get business profile for current user
   */
  async getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile exists yet
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching business profile:', error);
      throw error;
    }
  }

  /**
   * Create new business profile
   */
  async createBusinessProfile(
    userId: string, 
    profileData: Partial<BusinessProfile>
  ): Promise<BusinessProfile> {
    try {
      const defaultProfile = {
        user_id: userId,
        company_name: '',
        company_description: '',
        industry: '',
        target_audience: '',
        ideal_customer_profile: {
          primary_criteria: {
            industry: [],
            company_size: '',
            revenue_range: '',
            roles: []
          },
          secondary_criteria: {
            tech_stack: [],
            growth_stage: '',
            locations: []
          },
          disqualifiers: [],
          ideal_use_cases: []
        },
        value_propositions: [],
        competitors: [],
        sales_challenges: [],
        current_sales_process: '',
        onboarding_completed: false,
        onboarding_stage: 'introduction' as OnboardingStage,
        knowledge_base: {
          documents_analyzed: [],
          key_insights: [],
          messaging_frameworks: [],
          success_stories: [],
          user_preferences: {
            communication_style: 'professional',
            preferred_industries: [],
            meeting_preferences: 'flexible'
          }
        },
        ...profileData
      };

      const { data, error } = await supabase
        .from('business_profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating business profile:', error);
      throw error;
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(
    userId: string, 
    updates: Partial<BusinessProfile>
  ): Promise<BusinessProfile> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating business profile:', error);
      throw error;
    }
  }

  /**
   * Update onboarding stage
   */
  async updateOnboardingStage(
    userId: string, 
    stage: OnboardingStage
  ): Promise<void> {
    try {
      const updates: any = { onboarding_stage: stage };
      if (stage === 'completed') {
        updates.onboarding_completed = true;
      }

      await this.updateBusinessProfile(userId, updates);
    } catch (error) {
      console.error('Error updating onboarding stage:', error);
      throw error;
    }
  }

  /**
   * Add knowledge base insight
   */
  async addKnowledgeInsight(
    userId: string,
    insight: {
      category: string;
      insight: string;
      source: string;
    }
  ): Promise<void> {
    try {
      const profile = await this.getBusinessProfile(userId);
      if (!profile) throw new Error('Business profile not found');

      const newInsight = {
        ...insight,
        added_at: new Date().toISOString()
      };

      const updatedKnowledgeBase = {
        ...profile.knowledge_base,
        key_insights: [...profile.knowledge_base.key_insights, newInsight]
      };

      await this.updateBusinessProfile(userId, {
        knowledge_base: updatedKnowledgeBase
      });
    } catch (error) {
      console.error('Error adding knowledge insight:', error);
      throw error;
    }
  }

  /**
   * Add messaging framework
   */
  async addMessagingFramework(
    userId: string,
    framework: {
      audience: string;
      pain_points: string[];
      solutions: string[];
      proof_points: string[];
    }
  ): Promise<void> {
    try {
      const profile = await this.getBusinessProfile(userId);
      if (!profile) throw new Error('Business profile not found');

      const updatedKnowledgeBase = {
        ...profile.knowledge_base,
        messaging_frameworks: [...profile.knowledge_base.messaging_frameworks, framework]
      };

      await this.updateBusinessProfile(userId, {
        knowledge_base: updatedKnowledgeBase
      });
    } catch (error) {
      console.error('Error adding messaging framework:', error);
      throw error;
    }
  }

  /**
   * Add success story
   */
  async addSuccessStory(
    userId: string,
    story: {
      customer: string;
      challenge: string;
      solution: string;
      result: string;
    }
  ): Promise<void> {
    try {
      const profile = await this.getBusinessProfile(userId);
      if (!profile) throw new Error('Business profile not found');

      const updatedKnowledgeBase = {
        ...profile.knowledge_base,
        success_stories: [...profile.knowledge_base.success_stories, story]
      };

      await this.updateBusinessProfile(userId, {
        knowledge_base: updatedKnowledgeBase
      });
    } catch (error) {
      console.error('Error adding success story:', error);
      throw error;
    }
  }

  /**
   * Get or create business profile
   */
  async getOrCreateBusinessProfile(userId: string): Promise<BusinessProfile> {
    try {
      let profile = await this.getBusinessProfile(userId);
      
      if (!profile) {
        profile = await this.createBusinessProfile(userId, {});
      }

      return profile;
    } catch (error) {
      console.error('Error getting or creating business profile:', error);
      throw error;
    }
  }

  /**
   * Check if onboarding is complete
   */
  async isOnboardingComplete(userId: string): Promise<boolean> {
    try {
      const profile = await this.getBusinessProfile(userId);
      return profile?.onboarding_completed || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(profile: BusinessProfile): number {
    const fields = [
      'company_name',
      'company_description', 
      'industry',
      'target_audience',
      'current_sales_process'
    ];

    const icpFields = [
      profile.ideal_customer_profile.primary_criteria.industry.length > 0,
      profile.ideal_customer_profile.primary_criteria.company_size !== '',
      profile.ideal_customer_profile.primary_criteria.roles.length > 0
    ];

    const arrayFields = [
      profile.value_propositions.length > 0,
      profile.competitors.length > 0
    ];

    const completedFields = fields.filter(field => profile[field as keyof BusinessProfile] && (profile[field as keyof BusinessProfile] as string).trim() !== '').length;
    const completedIcpFields = icpFields.filter(Boolean).length;
    const completedArrayFields = arrayFields.filter(Boolean).length;

    const totalFields = fields.length + icpFields.length + arrayFields.length;
    const completedTotal = completedFields + completedIcpFields + completedArrayFields;

    return Math.round((completedTotal / totalFields) * 100);
  }
}

export const businessProfileService = BusinessProfileService.getInstance();