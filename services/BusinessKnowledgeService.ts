/**
 * Business Knowledge Base Service
 * Manages persistent business context and knowledge for each user
 */

import { supabase } from '@/integrations/supabase/client';
import { MemoryService } from './memory/MemoryService';

export interface BusinessProfile {
  id?: string;
  user_id: string;
  company_name: string;
  company_description: string;
  website_url?: string;
  industry: string;
  company_size?: string;
  target_audience: string;
  ideal_customer_profile: any; // JSON object
  value_propositions: string[];
  competitors: string[];
  sales_challenges: string[];
  current_sales_process: string;
  onboarding_completed: boolean;
  onboarding_stage: string; // 'introduction' | 'discovery' | 'icp_definition' | 'knowledge_building' | 'completed'
  knowledge_base: any; // JSON object with all collected information
  
  // Supporting materials for positioning understanding
  supporting_documents?: {
    website_copy?: string[];
    linkedin_posts?: string[];
    email_templates?: string[];
    sales_decks?: string[];
    case_studies?: string[];
    competitor_analysis?: string[];
    messaging_examples?: string[];
    brand_voice_examples?: string[];
    value_prop_statements?: string[];
    customer_testimonials?: string[];
  };
  
  // Competitive intelligence for positioning
  competitive_intelligence?: {
    competitor_websites?: string[];
    envied_positioning?: string[];
    good_sales_examples?: string[];
    competitor_strengths?: string[];
    differentiation_points?: string[];
    market_positioning_notes?: string[];
  };
  
  // Enhanced discovery framework insights - extracted from comprehensive conversation flow
  customer_objectives?: string[];
  customer_pain_points?: string[];
  customer_objections?: string[];
  customer_fears?: string[];
  past_failures?: string[];
  alternative_solutions?: string[];
  desired_changes?: string[];
  expected_results?: string[];
  
  // Emotional intelligence and communication insights
  pain_language_patterns?: string[];
  emotional_triggers?: string[];
  urgency_indicators?: string[];
  buying_signal_language?: string[];
  communication_preferences?: string[];
  personality_type?: string;
  tone_preferences?: string[];
  
  // Competitive messaging intelligence
  effective_messages?: string[];
  failed_approaches?: string[];
  winning_subject_lines?: string[];
  social_proof_preferences?: string[];
  common_objections?: string[];
  objection_responses?: string[];
  industry_language?: string[];
  success_metrics_language?: string[];
  
  // Stakeholder communication mapping
  stakeholder_communication_preferences?: Record<string, string>;
  role_based_priorities?: Record<string, string[]>;
  influencer_mapping?: Record<string, string>;
  proof_requirements_by_role?: Record<string, string[]>;
  internal_politics?: string[];
  approval_process?: string[];
  decision_making_styles?: Record<string, string>;
  
  // Modern sales framework insights
  qualification_frameworks?: string[];
  intent_signals?: string[];
  committee_strategies?: string[];
  multi_threading_approach?: string[];
  social_selling_methods?: string[];
  expansion_strategies?: string[];
  pipeline_optimization?: string[];
  sales_tech_stack?: string[];
  
  // Content marketing and authority building
  content_topics?: string[];
  authority_positioning?: string[];
  content_formats?: string[];
  content_channels?: string[];
  unique_perspectives?: string[];
  content_metrics?: string[];
  industry_expertise?: string[];
  prospect_questions?: string[];
  
  // Generative Engine Optimization (GEO) insights
  ai_search_queries?: string[];
  prospect_terminology?: string[];
  ai_positioning?: string[];
  authoritative_sources?: string[];
  expertise_description?: string[];
  data_contributions?: string[];
  industry_misconceptions?: string[];
  solution_categorization?: string[];
  
  // LinkedIn authority building
  linkedin_challenges?: string[];
  content_engagement_patterns?: string[];
  professional_reputation?: string[];
  linkedin_formats?: string[];
  industry_conversations?: string[];
  linkedin_strategy?: string[];
  optimal_timing?: string[];
  linkedin_cta_effectiveness?: string[];
  
  // Thought leadership content
  contrarian_viewpoints?: string[];
  future_trends?: string[];
  failure_lessons?: string[];
  unique_frameworks?: string[];
  industry_myths?: string[];
  knowledge_gaps?: string[];
  unique_research?: string[];
  industry_predictions?: string[];
  
  // Content distribution optimization
  platform_preferences?: string[];
  content_repurposing?: string[];
  email_strategy?: string[];
  content_roi_metrics?: string[];
  amplification_partnerships?: string[];
  cross_platform_consistency?: string[];
  lead_magnets?: string[];
  content_balance?: string[];
  
  created_at?: string;
  updated_at?: string;
}

export interface ConversationContext {
  business_profile: BusinessProfile | null;
  recent_topics: string[];
  user_preferences: any;
  conversation_history_summary: string;
}

export class BusinessKnowledgeService {
  private static instance: BusinessKnowledgeService;
  private memoryService: MemoryService;

  private constructor() {
    this.memoryService = MemoryService.getInstance();
  }

  public static getInstance(): BusinessKnowledgeService {
    if (!BusinessKnowledgeService.instance) {
      BusinessKnowledgeService.instance = new BusinessKnowledgeService();
    }
    return BusinessKnowledgeService.instance;
  }

  /**
   * Get or create business profile for user
   */
  async getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile exists, return null
        return null;
      }

      if (error) {
        console.error('Error getting business profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get business profile:', error);
      return null;
    }
  }

  /**
   * Create new business profile
   */
  async createBusinessProfile(userId: string, initialData: Partial<BusinessProfile>): Promise<BusinessProfile | null> {
    try {
      const profileData = {
        user_id: userId,
        company_name: initialData.company_name || '',
        company_description: initialData.company_description || '',
        website_url: initialData.website_url,
        industry: initialData.industry || '',
        company_size: initialData.company_size,
        target_audience: initialData.target_audience || '',
        ideal_customer_profile: initialData.ideal_customer_profile || {},
        value_propositions: initialData.value_propositions || [],
        competitors: initialData.competitors || [],
        sales_challenges: initialData.sales_challenges || [],
        current_sales_process: initialData.current_sales_process || '',
        onboarding_completed: false,
        onboarding_stage: 'introduction',
        knowledge_base: initialData.knowledge_base || {
          documents_analyzed: [],
          key_insights: [],
          messaging_frameworks: [],
          success_stories: []
        }
      };

      const { data, error } = await supabase
        .from('business_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating business profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to create business profile:', error);
      return null;
    }
  }

  /**
   * Update business profile with contextual memory storage
   */
  async updateBusinessProfile(userId: string, updates: Partial<BusinessProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('business_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating business profile:', error);
        return false;
      }

      // Store updated profile in contextual memory for better retrieval
      if (updates.company_name) {
        try {
          const currentProfile = await this.getBusinessProfile(userId);
          if (currentProfile) {
            await this.memoryService.storeBusinessProfile(
              userId,
              updates.company_name,
              { ...currentProfile, ...updates }
            );
            console.log('✅ Business profile stored in contextual memory');
          }
        } catch (memoryError) {
          console.error('Failed to store business profile in memory:', memoryError);
          // Don't fail the entire operation if memory storage fails
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to update business profile:', error);
      return false;
    }
  }

  /**
   * Update onboarding stage
   */
  async updateOnboardingStage(userId: string, stage: string): Promise<boolean> {
    return this.updateBusinessProfile(userId, {
      onboarding_stage: stage,
      onboarding_completed: stage === 'completed'
    });
  }

  /**
   * Add to knowledge base
   */
  async addToKnowledgeBase(userId: string, category: string, data: any): Promise<boolean> {
    try {
      const profile = await this.getBusinessProfile(userId);
      if (!profile) return false;

      const updatedKnowledgeBase = {
        ...profile.knowledge_base,
        [category]: [
          ...(profile.knowledge_base[category] || []),
          {
            ...data,
            added_at: new Date().toISOString()
          }
        ]
      };

      return this.updateBusinessProfile(userId, {
        knowledge_base: updatedKnowledgeBase
      });
    } catch (error) {
      console.error('Failed to add to knowledge base:', error);
      return false;
    }
  }

  /**
   * Add supporting document for positioning analysis
   */
  async addSupportingDocument(userId: string, documentType: string, content: string, source?: string): Promise<boolean> {
    try {
      const profile = await this.getBusinessProfile(userId);
      if (!profile) return false;

      const currentDocs = profile.supporting_documents || {};
      const updatedDocs = {
        ...currentDocs,
        [documentType]: [
          ...(currentDocs[documentType] || []),
          {
            content,
            source: source || 'user_provided',
            added_at: new Date().toISOString()
          }
        ]
      };

      return this.updateBusinessProfile(userId, {
        supporting_documents: updatedDocs
      });
    } catch (error) {
      console.error('Failed to add supporting document:', error);
      return false;
    }
  }

  /**
   * Get supporting documents for positioning analysis
   */
  async getSupportingDocuments(userId: string): Promise<any> {
    try {
      const profile = await this.getBusinessProfile(userId);
      return profile?.supporting_documents || {};
    } catch (error) {
      console.error('Failed to get supporting documents:', error);
      return {};
    }
  }

  /**
   * Add competitive intelligence
   */
  async addCompetitiveIntelligence(userId: string, intelligenceType: string, content: string): Promise<boolean> {
    try {
      const profile = await this.getBusinessProfile(userId);
      if (!profile) return false;

      const currentIntel = profile.competitive_intelligence || {};
      const updatedIntel = {
        ...currentIntel,
        [intelligenceType]: [
          ...(currentIntel[intelligenceType] || []),
          {
            content,
            added_at: new Date().toISOString()
          }
        ]
      };

      return this.updateBusinessProfile(userId, {
        competitive_intelligence: updatedIntel
      });
    } catch (error) {
      console.error('Failed to add competitive intelligence:', error);
      return false;
    }
  }

  /**
   * Get competitive intelligence
   */
  async getCompetitiveIntelligence(userId: string): Promise<any> {
    try {
      const profile = await this.getBusinessProfile(userId);
      return profile?.competitive_intelligence || {};
    } catch (error) {
      console.error('Failed to get competitive intelligence:', error);
      return {};
    }
  }

  /**
   * Get conversation context for SAM
   */
  async getConversationContext(userId: string): Promise<ConversationContext> {
    try {
      const businessProfile = await this.getBusinessProfile(userId);
      
      // Get recent conversation topics from message history
      const recentTopics = await this.getRecentTopics(userId);
      
      return {
        business_profile: businessProfile,
        recent_topics: recentTopics,
        user_preferences: businessProfile?.knowledge_base?.user_preferences || {},
        conversation_history_summary: await this.getConversationSummary(userId)
      };
    } catch (error) {
      console.error('Failed to get conversation context:', error);
      return {
        business_profile: null,
        recent_topics: [],
        user_preferences: {},
        conversation_history_summary: ''
      };
    }
  }

  /**
   * Generate personalized greeting based on context
   */
  generatePersonalizedGreeting(context: ConversationContext): string {
    const profile = context.business_profile;
    
    if (!profile) {
      // New user - professional introduction matching SAM's tone
      return `Hello there, my name is **SAM** and I am your specialized B2B Sales and Marketing Agent.

How are you today?`;
    }

    if (!profile.onboarding_completed) {
      // Returning user still in onboarding
      const stage = profile.onboarding_stage;
      
      switch (stage) {
        case 'introduction':
          return `Hey! Welcome back.

We started talking about ${profile.company_name || 'your business'} last time. Ready to dive deeper so my agents can start solving your sales challenges?`;

        case 'discovery':
          return `Good to see you again!

We were building the foundation for ${profile.company_name} - got your industry (${profile.industry}) and some initial context. 

Let's keep going with your ideal customer profile so my agents know exactly who to target.`;

        case 'icp_definition':
          return `Hey there!

We're making good progress on ${profile.company_name} - I understand your target audience (${profile.target_audience}) and business context. 

Ready to finish up the discovery so we can start generating qualified leads?`;

        case 'knowledge_building':
          return `Welcome back!

I've got a solid understanding of ${profile.company_name} from our conversations. 

Before we move forward, do you have any supporting materials to share? LinkedIn posts you've written, website copy, sales decks, or any messaging that represents how you position yourself? This helps my agents create outreach that sounds authentically like YOU.

Or if you've already shared materials, ready to put my agents to work?`;

        default:
          return `Hey! Good to see you again. 

What's the priority for ${profile.company_name} today - more setup or ready to start generating results?`;
      }
    }

    // Returning user with completed setup - ready for action
    const companyContext = profile.company_name ? ` for ${profile.company_name}` : '';
    const recentTopicsContext = context.recent_topics.length > 0 
      ? ` Last time we were working on ${context.recent_topics.slice(0, 2).join(', ')}.` 
      : '';

    return `Hey! Ready to make things happen?

I've got all the context about your business${companyContext} and my agents are ready to work.${recentTopicsContext}

What's the priority today:
• Find qualified prospects matching your ICP?
• Create personalized outreach campaigns?
• Optimize existing campaigns for better results?
• Set up automated follow-up sequences?

Or something else you need to tackle?`;
  }

  /**
   * Helper: Get recent conversation topics
   */
  private async getRecentTopics(userId: string): Promise<string[]> {
    try {
      // This would analyze recent conversation messages to extract topics
      // For now, return empty array - can be enhanced later
      return [];
    } catch (error) {
      console.error('Failed to get recent topics:', error);
      return [];
    }
  }

  /**
   * Save conversation messages with contextual retrieval
   */
  async saveConversationMessages(userId: string, messages: any[]): Promise<boolean> {
    try {
      const profile = await this.getBusinessProfile(userId);
      if (!profile) return false;

      const updatedKnowledgeBase = {
        ...profile.knowledge_base,
        recent_conversations: messages.slice(-20), // Keep last 20 messages
        last_conversation_date: new Date().toISOString()
      };

      // Store conversation in contextual memory for better retrieval
      try {
        const conversationSummary = this.summarizeConversation(messages);
        const conversationType = this.determineConversationType(messages);
        
        await this.memoryService.storeConversationHistory(
          userId,
          conversationType,
          {
            business_context: profile.company_name || 'Unknown Company',
            workflow_stage: profile.onboarding_stage || 'introduction',
            user_goals: this.extractUserGoals(messages),
            key_insights: this.extractKeyInsights(messages),
            decisions: this.extractDecisions(messages),
            next_steps: this.extractNextSteps(messages),
            recommendations: this.extractRecommendations(messages),
            agent_insights: this.extractAgentInsights(messages)
          }
        );
        console.log('✅ Conversation stored in contextual memory');
      } catch (memoryError) {
        console.error('Failed to store conversation in memory:', memoryError);
        // Don't fail the entire operation if memory storage fails
      }

      return this.updateBusinessProfile(userId, {
        knowledge_base: updatedKnowledgeBase
      });
    } catch (error) {
      console.error('Failed to save conversation messages:', error);
      return false;
    }
  }

  /**
   * Determine conversation type for contextual storage
   */
  private determineConversationType(messages: any[]): 'discovery' | 'campaign_planning' | 'optimization' {
    const messageText = messages.map(m => m.content.toLowerCase()).join(' ');
    
    if (messageText.includes('discovery') || messageText.includes('business') || messageText.includes('company')) {
      return 'discovery';
    } else if (messageText.includes('campaign') || messageText.includes('optimization') || messageText.includes('performance')) {
      return 'optimization';
    } else {
      return 'campaign_planning';
    }
  }

  /**
   * Extract user goals from conversation for contextual storage
   */
  private extractUserGoals(messages: any[]): string[] {
    const goals: string[] = [];
    const userMessages = messages.filter(m => m.sender === 'user');
    
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes('want to') || content.includes('need to') || content.includes('goal')) {
        goals.push(msg.content.substring(0, 200)); // First 200 chars
      }
    });
    
    return goals.slice(0, 5); // Max 5 goals
  }

  /**
   * Extract key insights from conversation
   */
  private extractKeyInsights(messages: any[]): string[] {
    const insights: string[] = [];
    const samMessages = messages.filter(m => m.sender === 'sam');
    
    samMessages.forEach(msg => {
      if (msg.content.includes('insight') || msg.content.includes('recommend') || msg.content.includes('suggest')) {
        insights.push(msg.content.substring(0, 200));
      }
    });
    
    return insights.slice(0, 5);
  }

  /**
   * Extract decisions made during conversation
   */
  private extractDecisions(messages: any[]): string[] {
    const decisions: string[] = [];
    const allMessages = messages;
    
    allMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      if (content.includes('decide') || content.includes('choose') || content.includes('go with')) {
        decisions.push(msg.content.substring(0, 200));
      }
    });
    
    return decisions.slice(0, 3);
  }

  /**
   * Extract next steps from conversation
   */
  private extractNextSteps(messages: any[]): string[] {
    const nextSteps: string[] = [];
    const samMessages = messages.filter(m => m.sender === 'sam');
    
    samMessages.forEach(msg => {
      if (msg.content.includes('next step') || msg.content.includes('next, we') || msg.content.includes('let\'s')) {
        nextSteps.push(msg.content.substring(0, 200));
      }
    });
    
    return nextSteps.slice(0, 3);
  }

  /**
   * Extract recommendations from conversation
   */
  private extractRecommendations(messages: any[]): string[] {
    const recommendations: string[] = [];
    const samMessages = messages.filter(m => m.sender === 'sam');
    
    samMessages.forEach(msg => {
      if (msg.content.includes('recommend') || msg.content.includes('suggest') || msg.content.includes('I think')) {
        recommendations.push(msg.content.substring(0, 200));
      }
    });
    
    return recommendations.slice(0, 5);
  }

  /**
   * Extract agent insights from conversation
   */
  private extractAgentInsights(messages: any[]): string[] {
    const insights: string[] = [];
    
    messages.forEach(msg => {
      if (msg.agentTrace && msg.agentTrace.length > 0) {
        msg.agentTrace.forEach((trace: any) => {
          if (trace.action && trace.result) {
            insights.push(`${trace.agentType}: ${trace.action} - ${JSON.stringify(trace.result).substring(0, 100)}`);
          }
        });
      }
    });
    
    return insights.slice(0, 3);
  }

  /**
   * Summarize conversation for storage
   */
  private summarizeConversation(messages: any[]): string {
    const userMessages = messages.filter(m => m.sender === 'user').length;
    const samMessages = messages.filter(m => m.sender === 'sam').length;
    const topics = this.extractTopics(messages);
    
    return `Conversation with ${userMessages} user messages, ${samMessages} SAM responses. Topics: ${topics.join(', ')}`;
  }

  /**
   * Extract topics from conversation
   */
  private extractTopics(messages: any[]): string[] {
    const topics = new Set<string>();
    const keywordMap = {
      'discovery': ['business', 'company', 'industry', 'target'],
      'prospecting': ['prospect', 'lead', 'research', 'outreach'],
      'campaigns': ['campaign', 'message', 'sequence', 'automation'],
      'performance': ['results', 'metrics', 'optimization', 'analytics']
    };
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      Object.entries(keywordMap).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          topics.add(topic);
        }
      });
    });
    
    return Array.from(topics);
  }

  /**
   * Get recent conversation messages
   */
  async getRecentMessages(userId: string): Promise<any[]> {
    try {
      const profile = await this.getBusinessProfile(userId);
      return profile?.knowledge_base?.recent_conversations || [];
    } catch (error) {
      console.error('Failed to get recent messages:', error);
      return [];
    }
  }

  /**
   * Helper: Get conversation summary
   */
  private async getConversationSummary(userId: string): Promise<string> {
    try {
      const recentMessages = await this.getRecentMessages(userId);
      if (recentMessages.length === 0) return '';
      
      // Generate a simple summary of recent conversation topics
      const userMessages = recentMessages.filter((msg: any) => msg.sender === 'user');
      const lastUserMessages = userMessages.slice(-3);
      
      if (lastUserMessages.length > 0) {
        return `Recent topics: ${lastUserMessages.map((msg: any) => msg.content.substring(0, 50)).join(', ')}`;
      }
      
      return '';
    } catch (error) {
      console.error('Failed to get conversation summary:', error);
      return '';
    }
  }

  /**
   * Check if user needs onboarding
   */
  async needsOnboarding(userId: string): Promise<boolean> {
    const profile = await this.getBusinessProfile(userId);
    return !profile || !profile.onboarding_completed;
  }

  /**
   * Generate natural conversational response for new users after initial greeting
   */
  generateWelcomeOptionsMenu(): string {
    return `I'm doing great, thanks for asking! How's your day going?`;
  }

  /**
   * Generate follow-up response after user answers "how's your day" (v2.0)
   */
  generateGreetingFollowUp(userResponse: string, customerContext?: any): string {
    // Check for deflection first
    if (this.detectUserDeflection(userResponse)) {
      return this.generateDeflectionRecovery(userResponse);
    }
    
    const acknowledgment = this.generateSmartAcknowledgment(userResponse);
    
    // Customer-aware follow-up questions based on their status
    return `${acknowledgment}! ${this.generateCustomerAwareQuestion(customerContext)}`;
  }

  /**
   * Generate customer-aware follow-up question based on their status (v3.0)
   */
  private generateCustomerAwareQuestion(customerContext?: any): string {
    // If no customer context available, use trial user assumption (safest default)
    if (!customerContext) {
      return "How's your experience with SAM AI going so far? What have you been able to explore?";
    }

    const { subscriptionStatus, daysUntilRenewal, customerAge, usageLevel, trialStatus } = customerContext;

    // Trial users
    if (subscriptionStatus === 'trialing') {
      if (daysUntilRenewal <= 3) {
        return `Your trial ends in ${daysUntilRenewal} days - how has your experience been so far?`;
      }
      if (daysUntilRenewal <= 7) {
        return "How's your SAM AI trial progressing? What results are you seeing from your campaigns?";
      }
      return "How's your experience with SAM AI going so far? What have you been able to test out?";
    }

    // Paying customers approaching renewal (churn prevention)
    if (subscriptionStatus === 'active' && daysUntilRenewal <= 7) {
      if (usageLevel === 'low') {
        return `Your renewal is in ${daysUntilRenewal} days - how has your experience with SAM AI been this month?`;
      }
      return `How has your month with SAM AI been? Your renewal is coming up in ${daysUntilRenewal} days.`;
    }

    // New paying customers (onboarding) - Comprehensive intelligence gathering needed
    if (subscriptionStatus === 'active' && customerAge <= 30) {
      return "I want to make sure we set up your sales automation perfectly for your business. Let's start with the basics so I can understand your business - what industry are you in, and what does your company do?";
    }

    // Established customers (optimization)
    if (subscriptionStatus === 'active' && customerAge <= 90) {
      return "How are your SAM AI campaigns performing this month? What's working best for you?";
    }

    // Mature customers (growth)
    if (subscriptionStatus === 'active' && customerAge > 90) {
      return "How are your results with SAM AI lately? Ready to explore scaling up even further?";
    }

    // Payment issues
    if (subscriptionStatus === 'past_due' || subscriptionStatus === 'unpaid') {
      return "I noticed there might be a payment issue with your account - let's get that sorted out. How has your experience been overall?";
    }

    // Default for active customers
    return "How are things going with your SAM AI account? What's working well for you?";
  }

  /**
   * Detect if user is deflecting or browsing (v2.0)
   */
  private detectUserDeflection(userResponse: string): boolean {
    const lowerResponse = userResponse.toLowerCase();
    const deflectionPatterns = [
      'just looking', 'just browsing', 'checking things out', 'just curious',
      'don\'t really have problems', 'just seeing what\'s out there',
      'not sure yet', 'still figuring it out'
    ];
    
    return deflectionPatterns.some(pattern => lowerResponse.includes(pattern));
  }

  /**
   * Generate recovery response for deflecting users (v2.0)
   */
  private generateDeflectionRecovery(userResponse: string): string {
    const lowerResponse = userResponse.toLowerCase();
    
    if (lowerResponse.includes('just browsing') || lowerResponse.includes('just looking')) {
      return "That's totally fair! I find most people end up here because something about their current sales process could be better. Even if you're just exploring - what would perfect sales results look like for your business?";
    } else if (lowerResponse.includes('don\'t really have problems')) {
      return "That makes sense! Sometimes the best time to explore is when things are going well. If you could wave a magic wand and have your sales process work exactly how you wanted - what would that look like?";
    } else if (lowerResponse.includes('not sure') || lowerResponse.includes('figuring it out')) {
      return "That's completely understandable - sales can feel overwhelming! Let's keep it simple: if you could fix just ONE thing about how you currently get new customers, what would it be?";
    } else {
      return "That makes sense! What would success look like for you in the sales area?";
    }
  }

  /**
   * Generate enhanced smart acknowledgment based on user's response (v2.0)
   */
  private generateSmartAcknowledgment(userResponse: string): string {
    const lowerResponse = userResponse.toLowerCase();
    
    // High energy responses
    if (lowerResponse.includes('great') || lowerResponse.includes('awesome') || 
        lowerResponse.includes('fantastic') || lowerResponse.includes('amazing')) {
      return "That's fantastic";
    } 
    // Medium energy responses
    else if (lowerResponse.includes('good') || lowerResponse.includes('well') || 
             lowerResponse.includes('fine') || lowerResponse.includes('pretty good')) {
      return "That's great";
    } 
    // Low energy/busy responses with empathy
    else if (lowerResponse.includes('busy') || lowerResponse.includes('hectic') || 
             lowerResponse.includes('swamped')) {
      return "That sounds busy! I'll keep this brief then";
    } 
    else if (lowerResponse.includes('tired') || lowerResponse.includes('long day') || 
             lowerResponse.includes('exhausted')) {
      return "That sounds like a long day";
    } 
    // Neutral/deflection responses
    else if (lowerResponse.includes('okay') || lowerResponse.includes('alright') || 
             lowerResponse.includes('can\'t complain')) {
      return "That's good";
    }
    // Browsing/deflection responses
    else if (lowerResponse.includes('just looking') || lowerResponse.includes('just browsing') || 
             lowerResponse.includes('checking things out')) {
      return "That's totally fair";
    } 
    else {
      return "That's great";
    }
  }

  /**
   * Extract business insights from user message
   */
  extractBusinessInsights(message: string, currentProfile?: BusinessProfile): Partial<BusinessProfile> {
    const insights: Partial<BusinessProfile> = {};
    const lowerMessage = message.toLowerCase();

    // Extract company name
    const companyPatterns = [
      /(?:company|business|startup|firm|organization)(?:\s+is|\s+called)?\s+([A-Za-z0-9\s&\.]+?)(?:\s+with|\s+and|\s+we|\s+I|,|\.|$)/i,
      /(?:we|i)(?:\s+are|\s+work\s+at|\s+run)\s+([A-Za-z0-9\s&\.]+?)(?:\s+with|\s+and|\s+we|\s+I|,|\.|$)/i,
      /(?:at|for)\s+([A-Z][a-zA-Z0-9\s&\.]+?)(?:\s+with|\s+and|\s+we|\s+I|,|\.|$)/i,
      /(?:called|named)\s+([A-Za-z0-9\s&\.]+?)(?:\s+with|\s+and|\s+we|\s+I|,|\.|$)/i
    ];

    for (const pattern of companyPatterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].length > 2 && match[1].length < 50) {
        // Clean up the match
        const cleanedName = match[1].trim()
          .replace(/\s+(with|and|we|I|that|which).*$/i, '')
          .replace(/\s+$/, '');
        
        if (cleanedName.length > 1) {
          insights.company_name = cleanedName;
          break;
        }
      }
    }

    // Extract industry
    const industryMap = {
      'saas': 'SaaS',
      'software': 'Software',
      'fintech': 'FinTech',
      'edtech': 'EdTech',
      'healthtech': 'HealthTech',
      'healthcare': 'Healthcare',
      'e-commerce': 'E-commerce',
      'ecommerce': 'E-commerce',
      'marketing': 'Marketing',
      'consulting': 'Consulting',
      'technology': 'Technology',
      'manufacturing': 'Manufacturing',
      'retail': 'Retail',
      'finance': 'Finance',
      'education': 'Education',
      'real estate': 'Real Estate'
    };

    for (const [industry, displayName] of Object.entries(industryMap)) {
      if (lowerMessage.includes(industry)) {
        insights.industry = displayName;
        break;
      }
    }

    // Extract company size
    const sizePatterns = [
      /(\d+)\s*(?:-|to)\s*(\d+)\s*(?:employees?|people|team|members)/i,
      /(?:about|around|roughly)?\s*(\d+)\s*(?:employees?|people|team|members)/i,
      /(?:small|startup|early|growing)\s*(?:company|business|team)/i,
      /(?:enterprise|large|big)\s*(?:company|business|organization)/i
    ];

    for (const pattern of sizePatterns) {
      const match = message.match(pattern);
      if (match) {
        if (match[1] && match[2]) {
          // Range like "25-50 employees"
          insights.company_size = `${match[1]}-${match[2]} employees`;
        } else if (match[1] && !match[2]) {
          // Single number like "25 employees"
          const num = parseInt(match[1]);
          if (num <= 50) {
            insights.company_size = '1-50 employees';
          } else if (num <= 200) {
            insights.company_size = '51-200 employees';
          } else if (num <= 500) {
            insights.company_size = '201-500 employees';
          } else {
            insights.company_size = '500+ employees';
          }
        } else if (match[0].includes('small') || match[0].includes('startup')) {
          insights.company_size = '1-50 employees';
        } else if (match[0].includes('enterprise') || match[0].includes('large')) {
          insights.company_size = '500+ employees';
        }
        break;
      }
    }

    // Extract target audience/roles
    const roleMap = {
      'ctos': 'CTOs',
      'cto': 'CTOs',
      'chief technology officer': 'CTOs',
      'ceos': 'CEOs', 
      'ceo': 'CEOs',
      'chief executive officer': 'CEOs',
      'cmos': 'CMOs',
      'cmo': 'CMOs',
      'chief marketing officer': 'CMOs',
      'vps': 'VPs',
      'vp': 'VPs',
      'vice president': 'VPs',
      'directors': 'Directors',
      'director': 'Directors',
      'managers': 'Managers',
      'manager': 'Managers',
      'founders': 'Founders',
      'founder': 'Founders',
      'owners': 'Owners',
      'owner': 'Owners',
      'decision makers': 'Decision Makers',
      'decision maker': 'Decision Makers'
    };

    for (const [role, displayName] of Object.entries(roleMap)) {
      if (lowerMessage.includes(role)) {
        insights.target_audience = displayName;
        break;
      }
    }

    // Extract customer objectives
    const objectivePatterns = [
      /(?:objective|goal|aim).*(?:increase|boost|grow|improve|enhance|reduce|cut|save|streamline|optimize).*?([^.!?]+)/gi,
      /(?:want to|need to|trying to|hoping to)\s+([^.!?]+)/gi,
      /(?:most important|main|primary|key)\s+(?:objective|goal|focus).*?([^.!?]+)/gi
    ];

    for (const pattern of objectivePatterns) {
      const matches = message.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 5) {
          if (!insights.customer_objectives) insights.customer_objectives = [];
          insights.customer_objectives.push(match[1].trim());
        }
      }
    }

    // Extract pain points and frustrations
    const painPointPatterns = [
      /(?:frustrated|annoyed|upset|disappointed).*?(?:by|with|about)\s+([^.!?]+)/gi,
      /(?:pain point|problem|issue|challenge|difficulty).*?([^.!?]+)/gi,
      /(?:struggle with|having trouble|can't seem to)\s+([^.!?]+)/gi
    ];

    for (const pattern of painPointPatterns) {
      const matches = message.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 5) {
          if (!insights.customer_pain_points) insights.customer_pain_points = [];
          insights.customer_pain_points.push(match[1].trim());
        }
      }
    }

    // Extract objections and roadblocks
    const objectionPatterns = [
      /(?:objection|concern|worry|hesitation|roadblock|barrier).*?([^.!?]+)/gi,
      /(?:customers say|clients complain|people think|they believe)\s+([^.!?]+)/gi,
      /(?:hung up on|resistant to|skeptical about)\s+([^.!?]+)/gi
    ];

    for (const pattern of objectionPatterns) {
      const matches = message.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 5) {
          if (!insights.customer_objections) insights.customer_objections = [];
          insights.customer_objections.push(match[1].trim());
        }
      }
    }

    // Extract fears and anxieties
    if (lowerMessage.includes('fear') || lowerMessage.includes('afraid') || lowerMessage.includes('worried') || lowerMessage.includes('anxiety')) {
      const fearPatterns = [
        /(?:fear|afraid|worried|anxiety).*?(?:about|of|that)\s+([^.!?]+)/gi,
        /(?:scared|terrified|concerned)\s+([^.!?]+)/gi
      ];

      for (const pattern of fearPatterns) {
        const matches = message.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 5) {
            if (!insights.customer_fears) insights.customer_fears = [];
            insights.customer_fears.push(match[1].trim());
          }
        }
      }
    }

    // Extract past failures and disappointments
    if (lowerMessage.includes('failed') || lowerMessage.includes('disappointed') || lowerMessage.includes('didn\'t work')) {
      const failurePatterns = [
        /(?:tried|used|implemented)\s+([^.!?]+).*?(?:failed|disappointed|didn't work|caused problems)/gi,
        /(?:past experience|previous solution|last vendor)\s+([^.!?]+).*?(?:failed|disappointed|problems)/gi
      ];

      for (const pattern of failurePatterns) {
        const matches = message.matchAll(pattern);
        for (const match of matches) {
          if (match[1] && match[1].length > 5) {
            if (!insights.past_failures) insights.past_failures = [];
            insights.past_failures.push(match[1].trim());
          }
        }
      }
    }

    // Extract alternative solutions they currently use
    const alternativePatterns = [
      /(?:currently use|using|have|work with)\s+([^.!?]+?)(?:\s+(?:to|for|because))/gi,
      /(?:alternative|instead|rather than).*?(?:use|try|implement)\s+([^.!?]+)/gi
    ];

    for (const pattern of alternativePatterns) {
      const matches = message.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].length > 3) {
          if (!insights.alternative_solutions) insights.alternative_solutions = [];
          insights.alternative_solutions.push(match[1].trim());
        }
      }
    }

    return insights;
  }
}

export default BusinessKnowledgeService;