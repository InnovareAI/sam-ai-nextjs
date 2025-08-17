/**
 * Apollo Integration Service for SAM AI
 * Handles communication with your custom Apollo Apify actor
 */

import { ApifyBulkProcessor, ApprovalRule } from './ApifyBulkProcessor';

export interface ApolloSearchConfig {
  searchQuery: string;
  maxLeads: number;
  filters: {
    titles: string[];
    companySizes: string[];
    industries: string[];
    locations: string[];
  };
  dataOptions: {
    includeEmails: boolean;
    includePhones: boolean;
    includeLinkedIn: boolean;
    skipBounced: boolean;
    onlyVerified: boolean;
  };
  qualitySettings: {
    minRelevanceScore: number;
    maxCostPerLead: number;
    autoApprovalThreshold: number;
  };
}

export interface ApolloLead {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  location: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  company_size?: string;
  relevance_score: number;
  profile_completeness: number;
  apollo_verified: boolean;
  last_activity?: string;
  technologies?: string[];
  company_revenue?: string;
}

export interface ApolloScrapingResult {
  scraping_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_leads: number;
  processed_leads: number;
  leads: ApolloLead[];
  cost_breakdown: {
    total_cost: number;
    cost_per_lead: number;
    api_credits_used: number;
  };
  quality_metrics: {
    avg_relevance_score: number;
    email_coverage: number;
    phone_coverage: number;
    linkedin_coverage: number;
  };
  execution_time: number;
  error_message?: string;
}

export class ApolloIntegrationService {
  private apifyApiKey: string;
  private actorId: string = 'QFep6oXsM3bt9Z2rH/jljBwyyQakqrL1wae';
  private baseUrl: string = 'https://api.apify.com/v2';

  constructor(apiKey: string) {
    this.apifyApiKey = apiKey;
  }

  /**
   * Start Apollo lead scraping with intelligent approval
   */
  async startLeadScraping(config: ApolloSearchConfig): Promise<ApolloScrapingResult> {
    try {
      console.log('🚀 Starting Apollo lead scraping with config:', config);

      // Prepare Apify actor input
      const actorInput = this.prepareActorInput(config);
      
      // Call your custom Apify actor
      const runResponse = await this.callApifyActor(actorInput);
      
      // Process the results with intelligent approval
      const processedResult = await this.processWithIntelligentApproval(
        runResponse, 
        config.qualitySettings
      );

      return processedResult;

    } catch (error) {
      console.error('❌ Apollo scraping failed:', error);
      throw new Error(`Apollo scraping failed: ${error.message}`);
    }
  }

  /**
   * Monitor scraping progress
   */
  async getScrapingProgress(scrapingId: string): Promise<{
    status: string;
    progress: number;
    leads_processed: number;
    estimated_time_remaining: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/acts/${this.actorId}/runs/${scrapingId}`, {
        headers: {
          'Authorization': `Bearer ${this.apifyApiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const runData = await response.json();
      
      return {
        status: runData.data.status,
        progress: this.calculateProgress(runData.data),
        leads_processed: runData.data.stats?.itemCount || 0,
        estimated_time_remaining: this.estimateTimeRemaining(runData.data)
      };

    } catch (error) {
      console.error('❌ Failed to get scraping progress:', error);
      throw error;
    }
  }

  /**
   * Prepare input for your custom Apollo actor
   */
  private prepareActorInput(config: ApolloSearchConfig): any {
    return {
      // Core search parameters
      searchQuery: config.searchQuery,
      maxResults: config.maxLeads,
      
      // Filters
      jobTitles: config.filters.titles,
      industries: config.filters.industries,
      locations: config.filters.locations,
      companySizes: config.filters.companySizes,
      
      // Data options
      includeEmails: config.dataOptions.includeEmails,
      includePhones: config.dataOptions.includePhones,
      includeLinkedInUrls: config.dataOptions.includeLinkedIn,
      skipBouncedEmails: config.dataOptions.skipBounced,
      verifiedContactsOnly: config.dataOptions.onlyVerified,
      
      // Quality settings
      minRelevanceScore: config.qualitySettings.minRelevanceScore / 100,
      maxCostPerLead: config.qualitySettings.maxCostPerLead,
      
      // SAM AI specific settings
      enableSmartFiltering: true,
      outputFormat: 'sam_ai_optimized',
      includeCompanyMetadata: true,
      includeTechnologies: true,
      
      // Performance settings
      concurrency: 5,
      retryFailedRequests: true,
      respectRateLimits: true
    };
  }

  /**
   * Call your custom Apify actor
   */
  private async callApifyActor(input: any): Promise<any> {
    try {
      // Start the actor run
      const startResponse = await fetch(`${this.baseUrl}/acts/${this.actorId}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apifyApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      if (!startResponse.ok) {
        throw new Error(`Failed to start actor: ${startResponse.status}`);
      }

      const runData = await startResponse.json();
      const runId = runData.data.id;

      console.log(`✅ Apollo actor started with run ID: ${runId}`);

      // Wait for completion (or implement polling)
      return await this.waitForCompletion(runId);

    } catch (error) {
      console.error('❌ Apify actor call failed:', error);
      throw error;
    }
  }

  /**
   * Wait for actor completion with polling
   */
  private async waitForCompletion(runId: string): Promise<any> {
    const maxWaitTime = 30 * 60 * 1000; // 30 minutes
    const pollInterval = 10000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await fetch(`${this.baseUrl}/acts/${this.actorId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${this.apifyApiKey}`
          }
        });

        const runData = await response.json();
        const status = runData.data.status;

        console.log(`📊 Apollo scraping status: ${status}`);

        if (status === 'SUCCEEDED') {
          // Get the results
          const resultsResponse = await fetch(`${this.baseUrl}/acts/${this.actorId}/runs/${runId}/dataset/items`, {
            headers: {
              'Authorization': `Bearer ${this.apifyApiKey}`
            }
          });

          return await resultsResponse.json();
        }

        if (status === 'FAILED' || status === 'ABORTED') {
          throw new Error(`Apollo actor run failed with status: ${status}`);
        }

        // Still running, wait and poll again
        await new Promise(resolve => setTimeout(resolve, pollInterval));

      } catch (error) {
        console.error('❌ Polling error:', error);
        throw error;
      }
    }

    throw new Error('Apollo scraping timeout - exceeded 30 minutes');
  }

  /**
   * Process results with intelligent approval
   */
  private async processWithIntelligentApproval(
    rawResults: any[], 
    qualitySettings: ApolloSearchConfig['qualitySettings']
  ): Promise<ApolloScrapingResult> {
    
    // Transform raw Apollo data to SAM AI format
    const leads: ApolloLead[] = rawResults.map(this.transformApolloLead);
    
    // Create approval rules based on quality settings
    const approvalRules: ApprovalRule[] = [
      {
        id: 'high_relevance_auto_approve',
        name: 'High Relevance Auto-Approval',
        description: `Auto-approve leads with ${qualitySettings.autoApprovalThreshold}%+ relevance`,
        enabled: true,
        criteria: {
          min_relevance_score: qualitySettings.autoApprovalThreshold / 100,
          max_cost_per_record: qualitySettings.maxCostPerLead
        }
      },
      {
        id: 'verified_contacts_priority',
        name: 'Verified Contacts Priority',
        description: 'Prioritize Apollo-verified contacts',
        enabled: true,
        criteria: {
          min_relevance_score: 0.7,
          required_fields: ['email', 'company', 'title']
        }
      }
    ];

    // Process with bulk approval system
    const bulkProcessor = new ApifyBulkProcessor(
      approvalRules, 
      leads.length * qualitySettings.maxCostPerLead, 
      leads.length
    );

    const approvalResult = await bulkProcessor.processBulkApproval(leads);

    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(leads);

    return {
      scraping_id: `apollo_${Date.now()}`,
      status: 'completed',
      total_leads: leads.length,
      processed_leads: leads.length,
      leads: leads,
      cost_breakdown: {
        total_cost: approvalResult.total_records * qualitySettings.maxCostPerLead,
        cost_per_lead: qualitySettings.maxCostPerLead,
        api_credits_used: leads.length * 2 // Estimate: 2 credits per lead
      },
      quality_metrics: qualityMetrics,
      execution_time: Date.now()
    };
  }

  /**
   * Transform raw Apollo data to SAM AI lead format
   */
  private transformApolloLead(rawLead: any): ApolloLead {
    return {
      id: rawLead.id || `apollo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: rawLead.name || rawLead.full_name || 'Unknown',
      title: rawLead.title || rawLead.job_title || 'Unknown',
      company: rawLead.company || rawLead.organization || 'Unknown',
      industry: rawLead.industry || 'Unknown',
      location: rawLead.location || rawLead.city || 'Unknown',
      email: rawLead.email,
      phone: rawLead.phone,
      linkedin_url: rawLead.linkedin_url,
      company_size: rawLead.company_size,
      relevance_score: this.calculateRelevanceScore(rawLead),
      profile_completeness: this.calculateProfileCompleteness(rawLead),
      apollo_verified: rawLead.verified || false,
      last_activity: rawLead.last_activity,
      technologies: rawLead.technologies || [],
      company_revenue: rawLead.company_revenue
    };
  }

  /**
   * Calculate relevance score based on data quality and completeness
   */
  private calculateRelevanceScore(lead: any): number {
    let score = 0.5; // Base score
    
    // Title relevance
    if (lead.title && !lead.title.toLowerCase().includes('unknown')) score += 0.15;
    
    // Company relevance
    if (lead.company && !lead.company.toLowerCase().includes('unknown')) score += 0.15;
    
    // Contact information
    if (lead.email) score += 0.1;
    if (lead.phone) score += 0.05;
    if (lead.linkedin_url) score += 0.05;
    
    // Verification status
    if (lead.verified) score += 0.1;
    
    // Industry and location
    if (lead.industry && lead.industry !== 'Unknown') score += 0.05;
    if (lead.location && lead.location !== 'Unknown') score += 0.05;
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate profile completeness
   */
  private calculateProfileCompleteness(lead: any): number {
    const fields = ['name', 'title', 'company', 'email', 'phone', 'linkedin_url', 'location', 'industry'];
    const filledFields = fields.filter(field => lead[field] && lead[field] !== 'Unknown').length;
    return filledFields / fields.length;
  }

  /**
   * Calculate quality metrics for the entire dataset
   */
  private calculateQualityMetrics(leads: ApolloLead[]): ApolloScrapingResult['quality_metrics'] {
    if (leads.length === 0) {
      return {
        avg_relevance_score: 0,
        email_coverage: 0,
        phone_coverage: 0,
        linkedin_coverage: 0
      };
    }

    const avgRelevance = leads.reduce((sum, lead) => sum + lead.relevance_score, 0) / leads.length;
    const emailCoverage = leads.filter(lead => lead.email).length / leads.length;
    const phoneCoverage = leads.filter(lead => lead.phone).length / leads.length;
    const linkedinCoverage = leads.filter(lead => lead.linkedin_url).length / leads.length;

    return {
      avg_relevance_score: avgRelevance,
      email_coverage: emailCoverage,
      phone_coverage: phoneCoverage,
      linkedin_coverage: linkedinCoverage
    };
  }

  /**
   * Calculate progress percentage
   */
  private calculateProgress(runData: any): number {
    if (runData.status === 'SUCCEEDED') return 100;
    if (runData.status === 'FAILED' || runData.status === 'ABORTED') return 0;
    
    // Estimate based on processing time
    const startedAt = new Date(runData.startedAt).getTime();
    const now = Date.now();
    const elapsed = now - startedAt;
    const estimatedTotal = 300000; // 5 minutes estimate
    
    return Math.min((elapsed / estimatedTotal) * 100, 95);
  }

  /**
   * Estimate time remaining
   */
  private estimateTimeRemaining(runData: any): number {
    if (runData.status === 'SUCCEEDED') return 0;
    
    const startedAt = new Date(runData.startedAt).getTime();
    const now = Date.now();
    const elapsed = now - startedAt;
    const estimatedTotal = 300000; // 5 minutes estimate
    
    return Math.max(estimatedTotal - elapsed, 30000); // At least 30 seconds
  }
}

/**
 * Default Apollo search templates for common use cases
 */
export const APOLLO_SEARCH_TEMPLATES = {
  'saas-executives': {
    name: 'SaaS Executives',
    searchQuery: 'VP Sales, VP Marketing, CRO at SaaS companies with 50-500 employees',
    filters: {
      titles: ['VP Sales', 'VP Marketing', 'Chief Revenue Officer', 'Head of Sales'],
      industries: ['Software', 'SaaS', 'Technology'],
      companySizes: ['51-100', '101-250', '251-500'],
      locations: []
    }
  },
  'fintech-decision-makers': {
    name: 'Fintech Decision Makers',
    searchQuery: 'CTOs, VPs of Engineering, Product Managers at fintech startups',
    filters: {
      titles: ['CTO', 'VP Engineering', 'Product Manager', 'Head of Product'],
      industries: ['Financial Services', 'Fintech', 'Banking'],
      companySizes: ['11-50', '51-100', '101-250'],
      locations: ['San Francisco', 'New York', 'London']
    }
  },
  'ecommerce-marketers': {
    name: 'E-commerce Marketers',
    searchQuery: 'Digital Marketing Directors, CMOs at e-commerce companies',
    filters: {
      titles: ['CMO', 'Marketing Director', 'Digital Marketing Manager', 'VP Marketing'],
      industries: ['E-commerce', 'Retail', 'Consumer Goods'],
      companySizes: ['51-100', '101-250', '251-500', '501-1000'],
      locations: []
    }
  }
};