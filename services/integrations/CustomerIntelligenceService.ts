/**
 * Customer Intelligence Service - Integrates Stripe, trial data, and usage analytics
 * Provides customer context for personalized SAM conversations
 */

export interface CustomerContext {
  customerId: string;
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'unpaid' | 'canceled';
  daysUntilRenewal: number;
  customerAge: number; // Days since first signup
  usageLevel: 'low' | 'medium' | 'high';
  churnRisk: 'low' | 'medium' | 'high';
  lastLogin: Date;
  campaignsActive: number;
  performanceScore: number; // 0-100 based on campaign results
  paymentFailures: number;
  supportTickets: number;
  teamSize: number;
  planType: string;
  mrr: number; // Monthly recurring revenue
}

export interface StripeSubscriptionData {
  id: string;
  status: string;
  current_period_end: number;
  created: number;
  customer: string;
  items: any[];
  latest_invoice: any;
  payment_method: any;
}

export interface UsageAnalytics {
  last_login: Date;
  login_frequency: number;
  features_used: string[];
  campaigns_created: number;
  campaigns_active: number;
  campaign_performance: {
    response_rate: number;
    conversion_rate: number;
    roi: number;
  };
  team_adoption: number; // Percentage of team members actively using
}

export class CustomerIntelligenceService {
  private static instance: CustomerIntelligenceService;
  private stripeApiKey: string;
  private supabaseClient: any;

  private constructor() {
    this.stripeApiKey = process.env.STRIPE_SECRET_KEY || '';
    // this.supabaseClient = supabase client for usage data
  }

  public static getInstance(): CustomerIntelligenceService {
    if (!CustomerIntelligenceService.instance) {
      CustomerIntelligenceService.instance = new CustomerIntelligenceService();
    }
    return CustomerIntelligenceService.instance;
  }

  /**
   * Get comprehensive customer context for personalized conversations
   */
  async getCustomerContext(customerId: string): Promise<CustomerContext> {
    try {
      // Get Stripe subscription data
      const stripeData = await this.getStripeSubscription(customerId);
      
      // Get usage analytics from platform
      const usageData = await this.getUsageAnalytics(customerId);
      
      // Calculate derived metrics
      const context = this.calculateCustomerContext(stripeData, usageData);
      
      return context;
    } catch (error) {
      console.error('Failed to get customer context:', error);
      
      // Return safe default context
      return this.getDefaultCustomerContext(customerId);
    }
  }

  /**
   * Get Stripe subscription data
   */
  private async getStripeSubscription(customerId: string): Promise<StripeSubscriptionData | null> {
    try {
      // TODO: Implement Stripe API integration
      const stripe = require('stripe')(this.stripeApiKey);
      
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 1
      });

      return subscriptions.data.length > 0 ? subscriptions.data[0] : null;
    } catch (error) {
      console.error('Stripe API error:', error);
      return null;
    }
  }

  /**
   * Get usage analytics from platform database
   */
  private async getUsageAnalytics(customerId: string): Promise<UsageAnalytics | null> {
    try {
      // TODO: Implement Supabase query for usage data
      const { data, error } = await this.supabaseClient
        .from('user_analytics')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Usage analytics error:', error);
      return null;
    }
  }

  /**
   * Calculate comprehensive customer context from raw data
   */
  private calculateCustomerContext(
    stripeData: StripeSubscriptionData | null, 
    usageData: UsageAnalytics | null
  ): CustomerContext {
    const now = new Date();
    
    // Calculate subscription metrics
    const subscriptionStatus = stripeData?.status as CustomerContext['subscriptionStatus'] || 'active';
    const renewalDate = stripeData ? new Date(stripeData.current_period_end * 1000) : new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const signupDate = stripeData ? new Date(stripeData.created * 1000) : new Date();
    const customerAge = Math.ceil((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate usage level
    const usageLevel = this.calculateUsageLevel(usageData);
    
    // Calculate churn risk
    const churnRisk = this.calculateChurnRisk(stripeData, usageData, daysUntilRenewal);

    return {
      customerId: stripeData?.customer || '',
      subscriptionStatus,
      daysUntilRenewal,
      customerAge,
      usageLevel,
      churnRisk,
      lastLogin: usageData?.last_login || new Date(),
      campaignsActive: usageData?.campaigns_active || 0,
      performanceScore: this.calculatePerformanceScore(usageData),
      paymentFailures: 0, // TODO: Get from Stripe invoice history
      supportTickets: 0, // TODO: Get from support system
      teamSize: 1, // TODO: Get from user management
      planType: 'basic', // TODO: Get from Stripe product
      mrr: 0 // TODO: Calculate from Stripe subscription amount
    };
  }

  /**
   * Calculate usage level based on activity metrics
   */
  private calculateUsageLevel(usageData: UsageAnalytics | null): 'low' | 'medium' | 'high' {
    if (!usageData) return 'low';

    const now = new Date();
    const daysSinceLogin = (now.getTime() - usageData.last_login.getTime()) / (1000 * 60 * 60 * 24);
    
    // High usage: Active within 3 days, multiple campaigns, good adoption
    if (daysSinceLogin <= 3 && usageData.campaigns_active >= 2 && usageData.team_adoption > 0.7) {
      return 'high';
    }
    
    // Medium usage: Active within week, some campaigns
    if (daysSinceLogin <= 7 && usageData.campaigns_active >= 1) {
      return 'medium';
    }
    
    // Low usage: Inactive or minimal usage
    return 'low';
  }

  /**
   * Calculate churn risk based on multiple factors
   */
  private calculateChurnRisk(
    stripeData: StripeSubscriptionData | null,
    usageData: UsageAnalytics | null,
    daysUntilRenewal: number
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Usage risk factors
    if (!usageData || usageData.campaigns_active === 0) riskScore += 30;
    if (usageData && usageData.login_frequency < 2) riskScore += 20;
    if (usageData && usageData.team_adoption < 0.3) riskScore += 15;

    // Performance risk factors
    if (usageData && usageData.campaign_performance.response_rate < 0.05) riskScore += 25;
    if (usageData && usageData.campaign_performance.roi < 1.0) riskScore += 20;

    // Renewal timing risk
    if (daysUntilRenewal <= 7) riskScore += 10;
    if (daysUntilRenewal <= 3) riskScore += 20;

    // Subscription status risk
    if (stripeData?.status === 'past_due') riskScore += 40;
    if (stripeData?.status === 'unpaid') riskScore += 50;

    if (riskScore >= 70) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculatePerformanceScore(usageData: UsageAnalytics | null): number {
    if (!usageData) return 0;

    let score = 0;
    
    // Campaign performance (40 points)
    score += Math.min(usageData.campaign_performance.response_rate * 800, 20); // Up to 20 points
    score += Math.min(usageData.campaign_performance.conversion_rate * 2000, 20); // Up to 20 points
    
    // Usage consistency (30 points)
    score += Math.min(usageData.login_frequency * 5, 15); // Up to 15 points
    score += Math.min(usageData.campaigns_active * 5, 15); // Up to 15 points
    
    // Feature adoption (20 points)
    score += Math.min(usageData.features_used.length * 2, 10); // Up to 10 points
    score += usageData.team_adoption * 10; // Up to 10 points
    
    // ROI performance (10 points)
    score += Math.min(usageData.campaign_performance.roi * 5, 10); // Up to 10 points

    return Math.round(Math.min(score, 100));
  }

  /**
   * Get safe default context when data is unavailable
   */
  private getDefaultCustomerContext(customerId: string): CustomerContext {
    return {
      customerId,
      subscriptionStatus: 'active',
      daysUntilRenewal: 15,
      customerAge: 30,
      usageLevel: 'medium',
      churnRisk: 'low',
      lastLogin: new Date(),
      campaignsActive: 1,
      performanceScore: 50,
      paymentFailures: 0,
      supportTickets: 0,
      teamSize: 1,
      planType: 'basic',
      mrr: 0
    };
  }

  /**
   * Determine SAM's role based on customer context
   */
  getSamRole(context: CustomerContext): string {
    // Trial users
    if (context.subscriptionStatus === 'trialing') {
      if (context.daysUntilRenewal <= 3) return 'trial_conversion_specialist';
      if (context.daysUntilRenewal <= 7) return 'trial_optimization_specialist';
      return 'trial_onboarding_specialist';
    }

    // Payment issues
    if (context.subscriptionStatus === 'past_due' || context.subscriptionStatus === 'unpaid') {
      return 'payment_recovery_specialist';
    }

    // Active customers approaching renewal
    if (context.subscriptionStatus === 'active' && context.daysUntilRenewal <= 7) {
      return context.churnRisk === 'high' ? 'urgent_retention_specialist' : 'churn_prevention_specialist';
    }

    // Regular customer success based on age
    if (context.subscriptionStatus === 'active') {
      if (context.customerAge <= 30) return 'onboarding_specialist';
      if (context.customerAge <= 90) return 'adoption_specialist';
      return 'growth_specialist';
    }

    return 'customer_success_manager';
  }
}

export default CustomerIntelligenceService;