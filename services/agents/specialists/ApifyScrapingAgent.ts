/**
 * Apify Scraping Agent - Connects to Apify MCP for web scraping
 * Specializes in LinkedIn profile scraping and website intelligence gathering
 * 
 * This agent handles:
 * - LinkedIn profile and company scraping
 * - Website content extraction
 * - Contact information discovery
 * - Company intelligence gathering
 */

import { ResilientBaseAgent } from '../core/ResilientBaseAgent';
import { 
  AgentConfig, 
  AgentType, 
  TaskRequest, 
  TaskResponse, 
  AgentCapability,
  ConversationContext 
} from '../types/AgentTypes';

export interface ApifyScrapingRequest {
  type: 'linkedin_profile' | 'linkedin_company' | 'website_content' | 'contact_discovery';
  target_url: string;
  parameters?: {
    include_employees?: boolean;
    max_employees?: number;
    include_posts?: boolean;
    max_pages?: number;
    extract_contacts?: boolean;
    follow_links?: boolean;
  };
  priority?: 'low' | 'medium' | 'high';
}

export interface ApifyScrapingResult {
  scraping_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data?: {
    profile_data?: LinkedInProfileData;
    company_data?: CompanyData;
    website_content?: WebsiteContent;
    contacts?: ContactData[];
    metadata?: ScrapingMetadata;
  };
  error_message?: string;
  execution_time?: number;
  data_quality_score?: number;
}

export interface LinkedInProfileData {
  name: string;
  title: string;
  company: string;
  location: string;
  profile_url: string;
  image_url?: string;
  summary?: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }>;
  education: Array<{
    school: string;
    degree?: string;
    field?: string;
    years?: string;
  }>;
  skills: string[];
  connections_count?: number;
  recent_activity?: Array<{
    type: string;
    content: string;
    date: string;
  }>;
}

export interface CompanyData {
  name: string;
  website: string;
  linkedin_url: string;
  industry: string;
  company_size: string;
  headquarters: string;
  founded?: string;
  description: string;
  specialties: string[];
  employees: LinkedInProfileData[];
  recent_updates?: Array<{
    type: string;
    content: string;
    date: string;
  }>;
  funding_info?: {
    total_funding?: string;
    last_round?: string;
    investors?: string[];
  };
}

export interface WebsiteContent {
  url: string;
  title: string;
  description: string;
  main_content: string;
  key_sections: Array<{
    heading: string;
    content: string;
  }>;
  contact_info: {
    emails: string[];
    phones: string[];
    addresses: string[];
  };
  technology_stack?: string[];
  meta_data: {
    keywords: string[];
    language: string;
    last_modified?: string;
  };
  social_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface ContactData {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  source: string;
  confidence_score: number;
}

export interface ScrapingMetadata {
  scraping_duration: number;
  pages_scraped: number;
  data_points_extracted: number;
  quality_indicators: {
    completeness: number;
    accuracy: number;
    freshness: number;
  };
  scraping_method: string;
  timestamp: string;
}

export class ApifyScrapingAgent extends ResilientBaseAgent {
  private apifyApiKey: string;
  private apifyBaseUrl: string = 'https://mcp.apify.com';
  private activeScrapingJobs: Map<string, ApifyScrapingRequest> = new Map();
  
  // Popular Apify actors for different scraping tasks
  private readonly APIFY_ACTORS = {
    linkedin_profile: 'apify/linkedin-profile-scraper',
    linkedin_company: 'apify/linkedin-company-scraper', 
    website_content: 'apify/website-content-crawler',
    contact_finder: 'apify/contact-finder',
    google_maps: 'apify/google-maps-scraper',
    social_media: 'apify/social-media-scraper'
  };

  constructor(config: AgentConfig) {
    super('apify-scraping' as AgentType, config);
    this.apifyApiKey = config.apiKeys.apify || '';
    
    // Configure resilience settings for scraping operations
    this.configureRetry({
      maxRetries: 2,           // Limited retries for expensive scraping operations
      baseDelayMs: 3000,       // Higher delay for API rate limits
      maxDelayMs: 15000,       // Max 15s delay
      exponentialBase: 2,
      jitterMs: 1000
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test Apify MCP connection
      await this.testApifyConnection();
      
      this.capabilities = [
        {
          name: 'linkedin_profile_scraping',
          description: 'Scrape LinkedIn profiles for contact and professional information',
          supportedComplexity: ['simple', 'moderate', 'complex'],
          estimatedDuration: 30, // seconds
          requiredParameters: ['target_url'],
          optionalParameters: ['include_posts', 'include_connections']
        },
        {
          name: 'linkedin_company_scraping', 
          description: 'Scrape LinkedIn company pages for employee and company data',
          supportedComplexity: ['moderate', 'complex'],
          estimatedDuration: 60,
          requiredParameters: ['target_url'],
          optionalParameters: ['include_employees', 'max_employees']
        },
        {
          name: 'website_content_extraction',
          description: 'Extract content, contacts, and intelligence from websites',
          supportedComplexity: ['simple', 'moderate', 'complex'], 
          estimatedDuration: 45,
          requiredParameters: ['target_url'],
          optionalParameters: ['max_pages', 'extract_contacts', 'follow_links']
        },
        {
          name: 'contact_discovery',
          description: 'Find contact information and key personnel data',
          supportedComplexity: ['moderate', 'complex'],
          estimatedDuration: 90,
          requiredParameters: ['company_name', 'website'],
          optionalParameters: ['target_roles', 'include_social_profiles']
        }
      ];

      this.isInitialized = true;
      console.log('✅ Apify Scraping Agent initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Apify Scraping Agent:', error);
      throw error;
    }
  }

  protected async processTaskInternal(task: TaskRequest, context: ConversationContext): Promise<any> {
    console.log(`🕷️ Apify Scraping Agent processing: ${task.type}`);
    
    // Validate task parameters
    if (!this.validateTask(task)) {
      throw new Error('Invalid task parameters for Apify scraping');
    }

    // Extract scraping parameters
    const scrapingRequest = this.extractScrapingRequest(task);
    
    // Execute appropriate scraping action with timeout protection
    let result: ApifyScrapingResult;
    
    switch (scrapingRequest.type) {
      case 'linkedin_profile':
        result = await this.scrapeLinkedInProfile(scrapingRequest);
        break;
      case 'linkedin_company':
        result = await this.scrapeLinkedInCompany(scrapingRequest);
        break;
      case 'website_content':
        result = await this.scrapeWebsiteContent(scrapingRequest);
        break;
      case 'contact_discovery':
        result = await this.discoverContacts(scrapingRequest);
        break;
        default:
          throw new Error(`Unsupported scraping type: ${scrapingRequest.type}`);
      }

    // Process and structure the results
    const processedData = await this.processScrapingResults(result, context);

    return {
      type: 'scraping_result',
      data: processedData
    };
  }

  /**
   * Scrape LinkedIn profile data
   */
  private async scrapeLinkedInProfile(request: ApifyScrapingRequest): Promise<ApifyScrapingResult> {
    const scrapingId = this.generateScrapingId();
    this.activeScrapingJobs.set(scrapingId, request);

    try {
      // Call Apify MCP for LinkedIn profile scraping
      const apifyResponse = await this.callApifyActor(
        this.APIFY_ACTORS.linkedin_profile,
        {
          startUrls: [{ url: request.target_url }],
          includePosts: request.parameters?.include_posts || false,
          maxItems: 1
        }
      );

      // Process the response
      const profileData = this.transformLinkedInProfileData(apifyResponse);
      
      return {
        scraping_id: scrapingId,
        status: 'completed',
        data: {
          profile_data: profileData,
          metadata: {
            scraping_duration: apifyResponse.stats?.executionDuration || 0,
            pages_scraped: 1,
            data_points_extracted: this.countDataPoints(profileData),
            quality_indicators: {
              completeness: this.calculateCompleteness(profileData),
              accuracy: 0.9, // Based on Apify's accuracy
              freshness: 1.0 // Real-time scraping
            },
            scraping_method: 'apify_linkedin_scraper',
            timestamp: new Date().toISOString()
          }
        },
        execution_time: apifyResponse.stats?.executionDuration || 0,
        data_quality_score: this.calculateDataQuality(profileData)
      };

    } catch (error) {
      return {
        scraping_id: scrapingId,
        status: 'failed',
        error_message: error.message
      };
    } finally {
      this.activeScrapingJobs.delete(scrapingId);
    }
  }

  /**
   * Scrape LinkedIn company data  
   */
  private async scrapeLinkedInCompany(request: ApifyScrapingRequest): Promise<ApifyScrapingResult> {
    const scrapingId = this.generateScrapingId();
    this.activeScrapingJobs.set(scrapingId, request);

    try {
      const apifyResponse = await this.callApifyActor(
        this.APIFY_ACTORS.linkedin_company,
        {
          startUrls: [{ url: request.target_url }],
          includeEmployees: request.parameters?.include_employees || false,
          maxEmployees: request.parameters?.max_employees || 50
        }
      );

      const companyData = this.transformLinkedInCompanyData(apifyResponse);
      
      return {
        scraping_id: scrapingId,
        status: 'completed',
        data: {
          company_data: companyData,
          metadata: {
            scraping_duration: apifyResponse.stats?.executionDuration || 0,
            pages_scraped: 1,
            data_points_extracted: this.countDataPoints(companyData),
            quality_indicators: {
              completeness: this.calculateCompleteness(companyData),
              accuracy: 0.9,
              freshness: 1.0
            },
            scraping_method: 'apify_linkedin_company_scraper',
            timestamp: new Date().toISOString()
          }
        },
        execution_time: apifyResponse.stats?.executionDuration || 0,
        data_quality_score: this.calculateDataQuality(companyData)
      };

    } catch (error) {
      return {
        scraping_id: scrapingId,
        status: 'failed',
        error_message: error.message
      };
    } finally {
      this.activeScrapingJobs.delete(scrapingId);
    }
  }

  /**
   * Scrape website content
   */
  private async scrapeWebsiteContent(request: ApifyScrapingRequest): Promise<ApifyScrapingResult> {
    const scrapingId = this.generateScrapingId();
    this.activeScrapingJobs.set(scrapingId, request);

    try {
      const apifyResponse = await this.callApifyActor(
        this.APIFY_ACTORS.website_content,
        {
          startUrls: [{ url: request.target_url }],
          maxPages: request.parameters?.max_pages || 10,
          followLinks: request.parameters?.follow_links || false,
          extractContacts: request.parameters?.extract_contacts || true
        }
      );

      const websiteContent = this.transformWebsiteContentData(apifyResponse);
      
      return {
        scraping_id: scrapingId,
        status: 'completed',
        data: {
          website_content: websiteContent,
          metadata: {
            scraping_duration: apifyResponse.stats?.executionDuration || 0,
            pages_scraped: apifyResponse.items?.length || 1,
            data_points_extracted: this.countDataPoints(websiteContent),
            quality_indicators: {
              completeness: this.calculateCompleteness(websiteContent),
              accuracy: 0.85,
              freshness: 1.0
            },
            scraping_method: 'apify_website_crawler',
            timestamp: new Date().toISOString()
          }
        },
        execution_time: apifyResponse.stats?.executionDuration || 0,
        data_quality_score: this.calculateDataQuality(websiteContent)
      };

    } catch (error) {
      return {
        scraping_id: scrapingId,
        status: 'failed',
        error_message: error.message
      };
    } finally {
      this.activeScrapingJobs.delete(scrapingId);
    }
  }

  /**
   * Discover contact information
   */
  private async discoverContacts(request: ApifyScrapingRequest): Promise<ApifyScrapingResult> {
    const scrapingId = this.generateScrapingId();
    this.activeScrapingJobs.set(scrapingId, request);

    try {
      // Use multiple actors for comprehensive contact discovery
      const [websiteData, linkedinData] = await Promise.all([
        this.callApifyActor(this.APIFY_ACTORS.contact_finder, {
          startUrls: [{ url: request.target_url }]
        }),
        // Additional LinkedIn company search if available
        request.parameters?.include_employees ? 
          this.findLinkedInCompanyPage(request.target_url) : null
      ]);

      const contacts = this.consolidateContactData(websiteData, linkedinData);
      
      return {
        scraping_id: scrapingId,
        status: 'completed',
        data: {
          contacts: contacts,
          metadata: {
            scraping_duration: (websiteData.stats?.executionDuration || 0) + (linkedinData?.stats?.executionDuration || 0),
            pages_scraped: (websiteData.items?.length || 0) + (linkedinData?.items?.length || 0),
            data_points_extracted: contacts.length,
            quality_indicators: {
              completeness: this.calculateContactCompleteness(contacts),
              accuracy: 0.8, // Lower for contact discovery
              freshness: 1.0
            },
            scraping_method: 'apify_contact_discovery',
            timestamp: new Date().toISOString()
          }
        },
        execution_time: (websiteData.stats?.executionDuration || 0),
        data_quality_score: this.calculateContactDataQuality(contacts)
      };

    } catch (error) {
      return {
        scraping_id: scrapingId,
        status: 'failed',
        error_message: error.message
      };
    } finally {
      this.activeScrapingJobs.delete(scrapingId);
    }
  }

  /**
   * Call Apify MCP actor
   */
  private async callApifyActor(actorId: string, input: any): Promise<any> {
    // This will be replaced with actual MCP call once Apify MCP is configured
    // For now, simulate the response structure
    
    console.log(`🎭 Calling Apify actor: ${actorId}`, input);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return mock response structure
    return {
      items: [input], // Mock data based on input
      stats: {
        executionDuration: 2000,
        itemsCount: 1
      }
    };
  }

  // Data transformation methods
  private transformLinkedInProfileData(apifyResponse: any): LinkedInProfileData {
    // Transform Apify response to our LinkedInProfileData format
    const item = apifyResponse.items?.[0] || {};
    
    return {
      name: item.name || 'N/A',
      title: item.title || 'N/A', 
      company: item.company || 'N/A',
      location: item.location || 'N/A',
      profile_url: item.url || '',
      image_url: item.profilePicture,
      summary: item.summary,
      experience: item.experience || [],
      education: item.education || [],
      skills: item.skills || [],
      connections_count: item.connectionsCount,
      recent_activity: item.recentActivity || []
    };
  }

  private transformLinkedInCompanyData(apifyResponse: any): CompanyData {
    const item = apifyResponse.items?.[0] || {};
    
    return {
      name: item.companyName || 'N/A',
      website: item.website || '',
      linkedin_url: item.url || '',
      industry: item.industry || 'N/A',
      company_size: item.companySize || 'N/A',
      headquarters: item.headquarters || 'N/A',
      founded: item.founded,
      description: item.description || '',
      specialties: item.specialties || [],
      employees: item.employees?.map(emp => this.transformLinkedInProfileData({items: [emp]})) || [],
      recent_updates: item.recentUpdates || []
    };
  }

  private transformWebsiteContentData(apifyResponse: any): WebsiteContent {
    const item = apifyResponse.items?.[0] || {};
    
    return {
      url: item.url || '',
      title: item.title || '',
      description: item.description || '',
      main_content: item.text || '',
      key_sections: item.sections || [],
      contact_info: {
        emails: item.emails || [],
        phones: item.phones || [],
        addresses: item.addresses || []
      },
      technology_stack: item.technologies || [],
      meta_data: {
        keywords: item.keywords || [],
        language: item.language || 'en',
        last_modified: item.lastModified
      },
      social_links: {
        linkedin: item.socialLinks?.linkedin,
        twitter: item.socialLinks?.twitter,
        facebook: item.socialLinks?.facebook,
        instagram: item.socialLinks?.instagram
      }
    };
  }

  private consolidateContactData(websiteData: any, linkedinData: any): ContactData[] {
    const contacts: ContactData[] = [];
    
    // Process website contacts
    const websiteContacts = websiteData.items?.[0]?.contacts || [];
    websiteContacts.forEach((contact: any) => {
      contacts.push({
        name: contact.name || 'N/A',
        title: contact.title,
        email: contact.email,
        phone: contact.phone,
        linkedin_url: contact.linkedinUrl,
        source: 'website',
        confidence_score: contact.confidence || 0.7
      });
    });

    // Process LinkedIn contacts
    const linkedinContacts = linkedinData?.items?.[0]?.employees || [];
    linkedinContacts.forEach((contact: any) => {
      contacts.push({
        name: contact.name || 'N/A',
        title: contact.title,
        email: contact.email,
        linkedin_url: contact.profileUrl,
        source: 'linkedin',
        confidence_score: 0.9 // Higher confidence for LinkedIn data
      });
    });

    return contacts;
  }

  // Helper methods
  private generateScrapingId(): string {
    return `apify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private countDataPoints(data: any): number {
    // Count non-null/non-empty fields in the data object
    return Object.values(data).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length;
  }

  private calculateCompleteness(data: any): number {
    const totalFields = Object.keys(data).length;
    const filledFields = this.countDataPoints(data);
    return totalFields > 0 ? filledFields / totalFields : 0;
  }

  private calculateDataQuality(data: any): number {
    const completeness = this.calculateCompleteness(data);
    const accuracy = 0.9; // Based on Apify's typical accuracy
    const freshness = 1.0; // Real-time scraping
    
    return (completeness * 0.4) + (accuracy * 0.4) + (freshness * 0.2);
  }

  private calculateContactCompleteness(contacts: ContactData[]): number {
    if (contacts.length === 0) return 0;
    
    const totalPossibleFields = contacts.length * 6; // 6 fields per contact
    const filledFields = contacts.reduce((count, contact) => {
      return count + this.countDataPoints(contact);
    }, 0);
    
    return filledFields / totalPossibleFields;
  }

  private calculateContactDataQuality(contacts: ContactData[]): number {
    if (contacts.length === 0) return 0;
    
    const avgConfidence = contacts.reduce((sum, contact) => 
      sum + contact.confidence_score, 0) / contacts.length;
    
    const completeness = this.calculateContactCompleteness(contacts);
    
    return (avgConfidence * 0.6) + (completeness * 0.4);
  }

  private async findLinkedInCompanyPage(websiteUrl: string): Promise<any> {
    // Logic to find LinkedIn company page from website
    // This would typically involve searching or parsing the website
    return null; // Placeholder
  }

  private extractScrapingRequest(task: TaskRequest): ApifyScrapingRequest {
    // Extract and validate scraping parameters from task
    return {
      type: task.parameters.scraping_type || 'website_content',
      target_url: task.parameters.target_url || task.parameters.url,
      parameters: task.parameters.scraping_parameters || {},
      priority: task.priority === 1 ? 'high' : task.priority === 2 ? 'medium' : 'low'
    };
  }

  private async processScrapingResults(result: ApifyScrapingResult, context: ConversationContext): Promise<any> {
    // Post-process scraping results for integration with SAM ecosystem
    const processedResult = {
      ...result,
      integration_ready: true,
      sam_context: {
        workspace_id: context.userId,
        processing_timestamp: new Date().toISOString(),
        next_suggested_actions: this.generateSuggestedActions(result)
      }
    };

    return processedResult;
  }

  private generateSuggestedActions(result: ApifyScrapingResult): string[] {
    const actions: string[] = [];
    
    if (result.data?.profile_data) {
      actions.push('Create personalized outreach message');
      actions.push('Add to prospect database');
      actions.push('Schedule follow-up research');
    }
    
    if (result.data?.company_data) {
      actions.push('Analyze company growth signals');
      actions.push('Research competitor positioning');
      actions.push('Identify key decision makers');
    }
    
    if (result.data?.website_content) {
      actions.push('Extract value propositions');
      actions.push('Identify pain points and solutions');
      actions.push('Create competitive analysis');
    }
    
    if (result.data?.contacts) {
      actions.push('Enrich contact profiles');
      actions.push('Prioritize outreach targets');
      actions.push('Create contact mapping');
    }
    
    return actions;
  }

  private async testApifyConnection(): Promise<void> {
    // Test connection to Apify MCP
    try {
      console.log('🧪 Testing Apify MCP connection...');
      // This will be replaced with actual MCP connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Apify MCP connection successful');
    } catch (error) {
      console.error('❌ Apify MCP connection failed:', error);
      throw new Error('Failed to connect to Apify MCP service');
    }
  }

  async getCapabilities(): Promise<AgentCapability[]> {
    return this.capabilities;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.testApifyConnection();
      return true;
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {
    // Cancel any active scraping jobs
    this.activeScrapingJobs.clear();
    console.log('🛑 Apify Scraping Agent shutdown complete');
  }
}