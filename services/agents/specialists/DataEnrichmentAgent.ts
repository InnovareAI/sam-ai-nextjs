/**
 * Data Enrichment Agent - Enriches prospect and company data using Apify MCP
 * Specializes in LinkedIn profile enrichment and comprehensive website analysis
 * 
 * This agent handles:
 * - LinkedIn profile enrichment and social signals
 * - Website intelligence and technology stack detection
 * - Contact information verification and expansion
 * - Company growth signals and news monitoring
 * - Cross-platform data consolidation
 */

import { BaseAgent } from '../types/AgentTypes';
import { 
  AgentConfig, 
  AgentType, 
  TaskRequest, 
  TaskResponse, 
  AgentCapability,
  ConversationContext 
} from '../types/AgentTypes';
import { ApifyScrapingAgent, LinkedInProfileData, CompanyData, WebsiteContent } from './ApifyScrapingAgent';

export interface EnrichmentRequest {
  type: 'prospect_enrichment' | 'company_enrichment' | 'contact_verification' | 'competitive_intelligence';
  target_data: {
    name?: string;
    email?: string;
    company?: string;
    linkedin_url?: string;
    website_url?: string;
    phone?: string;
  };
  enrichment_depth: 'basic' | 'standard' | 'comprehensive';
  data_sources?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface EnrichmentResult {
  enrichment_id: string;
  original_data: any;
  enriched_data: EnrichedProspectData;
  enrichment_score: number;
  data_confidence: number;
  sources_used: string[];
  processing_time: number;
  suggestions: EnrichmentSuggestion[];
}

export interface EnrichedProspectData {
  // Basic Information
  personal_info: {
    full_name: string;
    preferred_name?: string;
    title: string;
    email: string;
    phone?: string;
    location: string;
    timezone?: string;
    profile_image?: string;
  };
  
  // Professional Information  
  professional_info: {
    current_company: string;
    current_role: string;
    seniority_level: 'individual_contributor' | 'manager' | 'director' | 'vp' | 'c_level';
    department: string;
    years_experience: number;
    years_current_role: number;
    career_trajectory: Array<{
      company: string;
      title: string;
      duration: string;
      progression_type: 'promotion' | 'lateral' | 'career_change';
    }>;
    skills: string[];
    certifications?: string[];
  };

  // Company Information
  company_info: {
    name: string;
    website: string;
    industry: string;
    company_size: string;
    revenue_range?: string;
    funding_stage?: string;
    headquarters: string;
    technology_stack: string[];
    growth_signals: GrowthSignal[];
    competitive_landscape: string[];
  };

  // Social & Digital Presence
  digital_footprint: {
    linkedin_profile: LinkedInProfileData;
    social_activity: Array<{
      platform: string;
      activity_level: 'low' | 'medium' | 'high';
      recent_posts: Array<{
        content: string;
        date: string;
        engagement: number;
      }>;
    }>;
    content_preferences: string[];
    communication_style: 'formal' | 'casual' | 'technical';
  };

  // Engagement Intelligence
  engagement_intel: {
    best_contact_methods: string[];
    optimal_timing: {
      days: string[];
      hours: string[];
      timezone: string;
    };
    personalization_hooks: PersonalizationHook[];
    pain_points: string[];
    interests: string[];
    recent_triggers: TriggerEvent[];
  };

  // Sales Intelligence
  sales_intel: {
    buyer_persona: string;
    decision_making_role: 'decision_maker' | 'influencer' | 'user' | 'gatekeeper';
    budget_authority: 'high' | 'medium' | 'low' | 'unknown';
    buying_stage: 'unaware' | 'awareness' | 'consideration' | 'decision' | 'retention';
    competitor_usage: string[];
    technology_adoption: 'early_adopter' | 'mainstream' | 'late_adopter';
    likelihood_to_respond: number;
  };
}

export interface GrowthSignal {
  type: 'hiring' | 'funding' | 'expansion' | 'product_launch' | 'partnership';
  description: string;
  date: string;
  impact_score: number;
  relevance_to_outreach: number;
}

export interface PersonalizationHook {
  type: 'shared_connection' | 'alma_mater' | 'industry_event' | 'mutual_interest' | 'recent_achievement';
  description: string;
  strength: number;
  usage_suggestion: string;
}

export interface TriggerEvent {
  type: 'job_change' | 'company_news' | 'industry_trend' | 'content_engagement' | 'network_activity';
  description: string;
  date: string;
  urgency: 'low' | 'medium' | 'high';
  outreach_angle: string;
}

export interface EnrichmentSuggestion {
  action: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_impact: number;
  implementation_effort: 'low' | 'medium' | 'high';
}

export class DataEnrichmentAgent extends BaseAgent {
  private apifyScrapingAgent: ApifyScrapingAgent;
  private enrichmentCache: Map<string, EnrichmentResult> = new Map();
  private processingQueue: Map<string, EnrichmentRequest> = new Map();

  constructor(config: AgentConfig) {
    super('data-enrichment' as AgentType, config);
    this.apifyScrapingAgent = new ApifyScrapingAgent(config);
  }

  async initialize(): Promise<void> {
    try {
      // Initialize the Apify scraping agent
      await this.apifyScrapingAgent.initialize();
      
      this.capabilities = [
        {
          name: 'prospect_enrichment',
          description: 'Comprehensive enrichment of prospect data using multiple data sources',
          supportedComplexity: ['moderate', 'complex', 'expert'],
          estimatedDuration: 120, // seconds
          requiredParameters: ['target_data'],
          optionalParameters: ['enrichment_depth', 'data_sources']
        },
        {
          name: 'company_enrichment', 
          description: 'Deep company intelligence gathering and analysis',
          supportedComplexity: ['complex', 'expert'],
          estimatedDuration: 180,
          requiredParameters: ['company_name', 'website'],
          optionalParameters: ['include_employees', 'competitor_analysis']
        },
        {
          name: 'contact_verification',
          description: 'Verify and expand contact information across platforms',
          supportedComplexity: ['simple', 'moderate'],
          estimatedDuration: 60,
          requiredParameters: ['email_or_name'],
          optionalParameters: ['company_context', 'social_verification']
        },
        {
          name: 'competitive_intelligence',
          description: 'Analyze competitive landscape and positioning opportunities',
          supportedComplexity: ['complex', 'expert'],
          estimatedDuration: 300,
          requiredParameters: ['company_name', 'industry'],
          optionalParameters: ['competitor_list', 'market_analysis_depth']
        }
      ];

      this.isInitialized = true;
      console.log('✅ Data Enrichment Agent initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Data Enrichment Agent:', error);
      throw error;
    }
  }

  async processTask(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    try {
      console.log(`🔍 Data Enrichment Agent processing: ${task.type}`);
      
      // Validate task parameters
      if (!this.validateTask(task)) {
        throw new Error('Invalid task parameters for data enrichment');
      }

      // Extract enrichment request
      const enrichmentRequest = this.extractEnrichmentRequest(task);
      
      // Check cache for recent enrichment
      const cacheKey = this.generateCacheKey(enrichmentRequest);
      const cachedResult = this.enrichmentCache.get(cacheKey);
      
      if (cachedResult && this.isCacheValid(cachedResult)) {
        console.log('📦 Using cached enrichment data');
        return this.createTaskResponse(
          task.id,
          { type: 'enrichment_result', data: cachedResult },
          true
        );
      }

      // Add to processing queue
      const enrichmentId = this.generateEnrichmentId();
      this.processingQueue.set(enrichmentId, enrichmentRequest);

      // Execute enrichment based on type
      let result: EnrichmentResult;
      
      switch (enrichmentRequest.type) {
        case 'prospect_enrichment':
          result = await this.enrichProspectData(enrichmentRequest, enrichmentId);
          break;
        case 'company_enrichment':
          result = await this.enrichCompanyData(enrichmentRequest, enrichmentId);
          break;
        case 'contact_verification':
          result = await this.verifyContactData(enrichmentRequest, enrichmentId);
          break;
        case 'competitive_intelligence':
          result = await this.gatherCompetitiveIntelligence(enrichmentRequest, enrichmentId);
          break;
        default:
          throw new Error(`Unsupported enrichment type: ${enrichmentRequest.type}`);
      }

      // Cache the result
      this.enrichmentCache.set(cacheKey, result);

      // Generate actionable insights
      const insights = await this.generateActionableInsights(result, context);

      return this.createTaskResponse(
        task.id,
        {
          type: 'enrichment_result',
          data: {
            ...result,
            actionable_insights: insights
          }
        },
        true,
        undefined,
        {
          processingTime: result.processing_time,
          confidence: result.data_confidence,
          sources: result.sources_used
        }
      );

    } catch (error) {
      console.error('Data enrichment error:', error);
      return this.createTaskResponse(
        task.id,
        { type: 'error', data: { error: error.message } },
        false,
        error.message
      );
    } finally {
      // Clean up processing queue
      const enrichmentId = task.id;
      this.processingQueue.delete(enrichmentId);
    }
  }

  /**
   * Enrich prospect data comprehensively
   */
  private async enrichProspectData(request: EnrichmentRequest, enrichmentId: string): Promise<EnrichmentResult> {
    const startTime = Date.now();
    const sourcesUsed: string[] = [];
    const targetData = request.target_data;

    try {
      // Step 1: LinkedIn Profile Enrichment
      let linkedinData: LinkedInProfileData | null = null;
      if (targetData.linkedin_url) {
        console.log('🔗 Enriching LinkedIn profile data...');
        const linkedinResult = await this.apifyScrapingAgent.processTask({
          id: `${enrichmentId}_linkedin`,
          type: 'lead-generation',
          description: 'Scrape LinkedIn profile',
          parameters: {
            scraping_type: 'linkedin_profile',
            target_url: targetData.linkedin_url,
            scraping_parameters: {
              include_posts: true,
              include_connections: request.enrichment_depth === 'comprehensive'
            }
          },
          complexity: 'moderate',
          priority: 1,
          context: {} as any
        }, {} as ConversationContext);

        if (linkedinResult.success) {
          linkedinData = linkedinResult.result.data.profile_data;
          sourcesUsed.push('linkedin');
        }
      }

      // Step 2: Company Website Analysis
      let websiteData: WebsiteContent | null = null;
      if (targetData.website_url) {
        console.log('🌐 Analyzing company website...');
        const websiteResult = await this.apifyScrapingAgent.processTask({
          id: `${enrichmentId}_website`,
          type: 'lead-generation',
          description: 'Scrape website content',
          parameters: {
            scraping_type: 'website_content',
            target_url: targetData.website_url,
            scraping_parameters: {
              max_pages: request.enrichment_depth === 'comprehensive' ? 20 : 10,
              extract_contacts: true,
              follow_links: true
            }
          },
          complexity: 'moderate',
          priority: 1,
          context: {} as any
        }, {} as ConversationContext);

        if (websiteResult.success) {
          websiteData = websiteResult.result.data.website_content;
          sourcesUsed.push('website');
        }
      }

      // Step 3: Company Intelligence Gathering
      let companyData: CompanyData | null = null;
      if (linkedinData?.company || targetData.company) {
        console.log('🏢 Gathering company intelligence...');
        const companyLinkedInUrl = await this.findCompanyLinkedInUrl(
          linkedinData?.company || targetData.company || ''
        );
        
        if (companyLinkedInUrl) {
          const companyResult = await this.apifyScrapingAgent.processTask({
            id: `${enrichmentId}_company`,
            type: 'lead-generation',
            description: 'Scrape company data',
            parameters: {
              scraping_type: 'linkedin_company',
              target_url: companyLinkedInUrl,
              scraping_parameters: {
                include_employees: request.enrichment_depth === 'comprehensive',
                max_employees: 50
              }
            },
            complexity: 'complex',
            priority: 1,
            context: {} as any
          }, {} as ConversationContext);

          if (companyResult.success) {
            companyData = companyResult.result.data.company_data;
            sourcesUsed.push('company_linkedin');
          }
        }
      }

      // Step 4: Consolidate and Enrich Data
      const enrichedData = await this.consolidateEnrichmentData(
        linkedinData,
        websiteData,
        companyData,
        targetData,
        request.enrichment_depth
      );

      // Step 5: Generate Growth Signals and Triggers
      const growthSignals = await this.identifyGrowthSignals(companyData, websiteData);
      const triggerEvents = await this.identifyTriggerEvents(linkedinData, companyData);
      const personalizationHooks = await this.generatePersonalizationHooks(linkedinData, websiteData);

      // Step 6: Calculate Enrichment Metrics
      const enrichmentScore = this.calculateEnrichmentScore(enrichedData, sourcesUsed);
      const dataConfidence = this.calculateDataConfidence(sourcesUsed, enrichedData);

      // Step 7: Generate Suggestions
      const suggestions = await this.generateEnrichmentSuggestions(enrichedData, sourcesUsed);

      const processingTime = Date.now() - startTime;

      return {
        enrichment_id: enrichmentId,
        original_data: targetData,
        enriched_data: {
          ...enrichedData,
          company_info: {
            ...enrichedData.company_info,
            growth_signals: growthSignals
          },
          engagement_intel: {
            ...enrichedData.engagement_intel,
            personalization_hooks: personalizationHooks,
            recent_triggers: triggerEvents
          }
        },
        enrichment_score,
        data_confidence,
        sources_used: sourcesUsed,
        processing_time,
        suggestions
      };

    } catch (error) {
      console.error('Prospect enrichment error:', error);
      throw error;
    }
  }

  /**
   * Enrich company data and competitive landscape
   */
  private async enrichCompanyData(request: EnrichmentRequest, enrichmentId: string): Promise<EnrichmentResult> {
    const startTime = Date.now();
    const sourcesUsed: string[] = [];
    const targetData = request.target_data;

    try {
      // Company website analysis
      let websiteData: WebsiteContent | null = null;
      if (targetData.website_url) {
        const websiteResult = await this.apifyScrapingAgent.processTask({
          id: `${enrichmentId}_website`,
          type: 'lead-generation',
          description: 'Analyze company website',
          parameters: {
            scraping_type: 'website_content',
            target_url: targetData.website_url,
            scraping_parameters: {
              max_pages: 25,
              extract_contacts: true,
              follow_links: true
            }
          },
          complexity: 'complex',
          priority: 1,
          context: {} as any
        }, {} as ConversationContext);

        if (websiteResult.success) {
          websiteData = websiteResult.result.data.website_content;
          sourcesUsed.push('company_website');
        }
      }

      // LinkedIn company analysis
      let companyData: CompanyData | null = null;
      const companyLinkedInUrl = await this.findCompanyLinkedInUrl(targetData.company || '');
      if (companyLinkedInUrl) {
        const companyResult = await this.apifyScrapingAgent.processTask({
          id: `${enrichmentId}_linkedin_company`,
          type: 'lead-generation',
          description: 'Analyze LinkedIn company',
          parameters: {
            scraping_type: 'linkedin_company',
            target_url: companyLinkedInUrl,
            scraping_parameters: {
              include_employees: true,
              max_employees: 100
            }
          },
          complexity: 'complex',
          priority: 1,
          context: {} as any
        }, {} as ConversationContext);

        if (companyResult.success) {
          companyData = companyResult.result.data.company_data;
          sourcesUsed.push('linkedin_company');
        }
      }

      // News and growth signals
      const growthSignals = await this.identifyGrowthSignals(companyData, websiteData);
      sourcesUsed.push('news_analysis');

      // Competitive analysis
      const competitorAnalysis = await this.performCompetitorAnalysis(
        targetData.company || '',
        websiteData?.meta_data.keywords || []
      );
      sourcesUsed.push('competitive_analysis');

      // Technology stack analysis
      const techStack = await this.analyzeTechnologyStack(websiteData);
      sourcesUsed.push('technology_analysis');

      // Consolidate company enrichment data
      const enrichedData = await this.consolidateCompanyEnrichmentData(
        companyData,
        websiteData,
        competitorAnalysis,
        techStack,
        growthSignals
      );

      const enrichmentScore = this.calculateEnrichmentScore(enrichedData, sourcesUsed);
      const dataConfidence = this.calculateDataConfidence(sourcesUsed, enrichedData);
      const suggestions = await this.generateCompanyEnrichmentSuggestions(enrichedData);

      const processingTime = Date.now() - startTime;

      return {
        enrichment_id: enrichmentId,
        original_data: targetData,
        enriched_data,
        enrichment_score,
        data_confidence,
        sources_used: sourcesUsed,
        processing_time,
        suggestions
      };

    } catch (error) {
      console.error('Company enrichment error:', error);
      throw error;
    }
  }

  /**
   * Verify and expand contact information
   */
  private async verifyContactData(request: EnrichmentRequest, enrichmentId: string): Promise<EnrichmentResult> {
    const startTime = Date.now();
    const sourcesUsed: string[] = [];
    const targetData = request.target_data;

    try {
      // Contact discovery and verification
      const contactResult = await this.apifyScrapingAgent.processTask({
        id: `${enrichmentId}_contacts`,
        type: 'lead-generation',
        description: 'Discover and verify contacts',
        parameters: {
          scraping_type: 'contact_discovery',
          target_url: targetData.website_url || '',
          scraping_parameters: {
            include_employees: true,
            target_roles: ['sales', 'marketing', 'executive'],
            include_social_profiles: true
          }
        },
        complexity: 'moderate',
        priority: 1,
        context: {} as any
      }, {} as ConversationContext);

      let verifiedContacts: any[] = [];
      if (contactResult.success) {
        verifiedContacts = contactResult.result.data.contacts || [];
        sourcesUsed.push('contact_discovery');
      }

      // Cross-reference with provided data
      const enrichedContactData = await this.crossReferenceContactData(
        targetData,
        verifiedContacts
      );

      const enrichmentScore = this.calculateContactEnrichmentScore(enrichedContactData);
      const dataConfidence = this.calculateContactDataConfidence(enrichedContactData);
      const suggestions = await this.generateContactVerificationSuggestions(enrichedContactData);

      const processingTime = Date.now() - startTime;

      return {
        enrichment_id: enrichmentId,
        original_data: targetData,
        enriched_data: enrichedContactData,
        enrichment_score,
        data_confidence,
        sources_used: sourcesUsed,
        processing_time,
        suggestions
      };

    } catch (error) {
      console.error('Contact verification error:', error);
      throw error;
    }
  }

  /**
   * Gather competitive intelligence
   */
  private async gatherCompetitiveIntelligence(request: EnrichmentRequest, enrichmentId: string): Promise<EnrichmentResult> {
    const startTime = Date.now();
    const sourcesUsed: string[] = [];

    try {
      // This would involve analyzing multiple competitor websites and LinkedIn pages
      // For now, provide a structured framework for competitive analysis
      
      const competitiveData = await this.performComprehensiveCompetitorAnalysis(
        request.target_data.company || '',
        request.target_data.website_url || ''
      );

      sourcesUsed.push('competitive_analysis', 'market_research');

      const enrichmentScore = 0.85; // High confidence in competitive analysis
      const dataConfidence = 0.8;
      const suggestions = await this.generateCompetitiveIntelligenceSuggestions(competitiveData);

      const processingTime = Date.now() - startTime;

      return {
        enrichment_id: enrichmentId,
        original_data: request.target_data,
        enriched_data: competitiveData,
        enrichment_score,
        data_confidence,
        sources_used: sourcesUsed,
        processing_time,
        suggestions
      };

    } catch (error) {
      console.error('Competitive intelligence error:', error);
      throw error;
    }
  }

  // Helper methods for data consolidation and analysis
  private async consolidateEnrichmentData(
    linkedinData: LinkedInProfileData | null,
    websiteData: WebsiteContent | null,
    companyData: CompanyData | null,
    originalData: any,
    depth: string
  ): Promise<EnrichedProspectData> {
    
    // Consolidate all data sources into enriched prospect data structure
    return {
      personal_info: {
        full_name: linkedinData?.name || originalData.name || 'N/A',
        title: linkedinData?.title || 'N/A',
        email: originalData.email || 'N/A',
        phone: originalData.phone,
        location: linkedinData?.location || 'N/A',
        profile_image: linkedinData?.image_url
      },
      professional_info: {
        current_company: linkedinData?.company || companyData?.name || originalData.company || 'N/A',
        current_role: linkedinData?.title || 'N/A',
        seniority_level: this.determineSeniorityLevel(linkedinData?.title || ''),
        department: this.determineDepartment(linkedinData?.title || ''),
        years_experience: this.calculateYearsExperience(linkedinData?.experience || []),
        years_current_role: this.calculateCurrentRoleDuration(linkedinData?.experience || []),
        career_trajectory: this.analyzeCareerTrajectory(linkedinData?.experience || []),
        skills: linkedinData?.skills || [],
        certifications: []
      },
      company_info: {
        name: companyData?.name || linkedinData?.company || originalData.company || 'N/A',
        website: companyData?.website || websiteData?.url || originalData.website_url || '',
        industry: companyData?.industry || 'N/A',
        company_size: companyData?.company_size || 'N/A',
        headquarters: companyData?.headquarters || 'N/A',
        technology_stack: websiteData?.technology_stack || [],
        growth_signals: [], // Will be populated by calling method
        competitive_landscape: []
      },
      digital_footprint: {
        linkedin_profile: linkedinData || {} as LinkedInProfileData,
        social_activity: [],
        content_preferences: this.analyzeContentPreferences(linkedinData?.recent_activity || []),
        communication_style: this.determineCommunicationStyle(linkedinData?.summary || '')
      },
      engagement_intel: {
        best_contact_methods: this.determineBestContactMethods(originalData),
        optimal_timing: {
          days: ['Tuesday', 'Wednesday', 'Thursday'],
          hours: ['9:00', '10:00', '14:00', '15:00'],
          timezone: this.determineTimezone(linkedinData?.location || '')
        },
        personalization_hooks: [], // Will be populated by calling method
        pain_points: this.identifyPainPoints(linkedinData?.title || '', companyData?.industry || ''),
        interests: this.extractInterests(linkedinData?.summary || ''),
        recent_triggers: [] // Will be populated by calling method
      },
      sales_intel: {
        buyer_persona: this.determineBuyerPersona(linkedinData?.title || '', companyData?.industry || ''),
        decision_making_role: this.determineDecisionMakingRole(linkedinData?.title || ''),
        budget_authority: this.assessBudgetAuthority(linkedinData?.title || ''),
        buying_stage: 'unaware',
        competitor_usage: [],
        technology_adoption: this.assessTechnologyAdoption(websiteData?.technology_stack || []),
        likelihood_to_respond: this.calculateResponseLikelihood(linkedinData, companyData)
      }
    };
  }

  // Analysis helper methods
  private determineSeniorityLevel(title: string): 'individual_contributor' | 'manager' | 'director' | 'vp' | 'c_level' {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('ceo') || titleLower.includes('cto') || titleLower.includes('cfo') || titleLower.includes('chief')) {
      return 'c_level';
    }
    if (titleLower.includes('vp') || titleLower.includes('vice president')) {
      return 'vp';
    }
    if (titleLower.includes('director')) {
      return 'director';
    }
    if (titleLower.includes('manager') || titleLower.includes('lead') || titleLower.includes('head')) {
      return 'manager';
    }
    return 'individual_contributor';
  }

  private determineDepartment(title: string): string {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('sales') || titleLower.includes('business development')) return 'Sales';
    if (titleLower.includes('marketing')) return 'Marketing';
    if (titleLower.includes('engineer') || titleLower.includes('developer') || titleLower.includes('technical')) return 'Engineering';
    if (titleLower.includes('product')) return 'Product';
    if (titleLower.includes('finance') || titleLower.includes('accounting')) return 'Finance';
    if (titleLower.includes('hr') || titleLower.includes('human resources')) return 'Human Resources';
    if (titleLower.includes('operations') || titleLower.includes('ops')) return 'Operations';
    return 'Other';
  }

  private calculateYearsExperience(experience: any[]): number {
    // Estimate based on number of roles and typical role durations
    return Math.min(experience.length * 2.5, 30); // Cap at 30 years
  }

  private calculateCurrentRoleDuration(experience: any[]): number {
    // Extract duration from most recent role
    if (experience.length === 0) return 0;
    const currentRole = experience[0];
    // Parse duration string and convert to years
    return this.parseDurationToYears(currentRole.duration || '');
  }

  private parseDurationToYears(duration: string): number {
    // Simple parsing logic for duration strings like "2 years 3 months"
    const years = duration.match(/(\d+)\s*year/);
    const months = duration.match(/(\d+)\s*month/);
    
    let totalYears = 0;
    if (years) totalYears += parseInt(years[1]);
    if (months) totalYears += parseInt(months[1]) / 12;
    
    return totalYears;
  }

  private analyzeCareerTrajectory(experience: any[]): Array<{
    company: string;
    title: string;
    duration: string;
    progression_type: 'promotion' | 'lateral' | 'career_change';
  }> {
    return experience.map((exp, index) => ({
      company: exp.company,
      title: exp.title,
      duration: exp.duration,
      progression_type: index === 0 ? 'career_change' : 
        this.determineProgressionType(experience[index - 1], exp)
    }));
  }

  private determineProgressionType(prevRole: any, currentRole: any): 'promotion' | 'lateral' | 'career_change' {
    if (prevRole.company === currentRole.company) {
      return this.determineSeniorityLevel(currentRole.title) > this.determineSeniorityLevel(prevRole.title) ? 
        'promotion' : 'lateral';
    }
    return 'career_change';
  }

  private analyzeContentPreferences(recentActivity: any[]): string[] {
    // Analyze types of content the person engages with
    const preferences: string[] = [];
    
    recentActivity.forEach(activity => {
      const content = activity.content?.toLowerCase() || '';
      if (content.includes('industry') || content.includes('trend')) preferences.push('Industry Insights');
      if (content.includes('product') || content.includes('innovation')) preferences.push('Product Updates');
      if (content.includes('team') || content.includes('hiring')) preferences.push('Company Culture');
      if (content.includes('thought leadership')) preferences.push('Thought Leadership');
    });
    
    return [...new Set(preferences)];
  }

  private determineCommunicationStyle(summary: string): 'formal' | 'casual' | 'technical' {
    if (!summary) return 'formal';
    
    const summaryLower = summary.toLowerCase();
    const technicalTerms = ['api', 'algorithm', 'framework', 'architecture', 'implementation'];
    const casualIndicators = ['passionate', 'love', 'excited', 'awesome'];
    
    if (technicalTerms.some(term => summaryLower.includes(term))) return 'technical';
    if (casualIndicators.some(term => summaryLower.includes(term))) return 'casual';
    return 'formal';
  }

  // Additional helper methods for data processing...
  private async findCompanyLinkedInUrl(companyName: string): Promise<string | null> {
    // Logic to find LinkedIn company page URL
    // This would typically involve search functionality
    return `https://linkedin.com/company/${companyName.toLowerCase().replace(/\s+/g, '-')}`;
  }

  private async identifyGrowthSignals(companyData: CompanyData | null, websiteData: WebsiteContent | null): Promise<GrowthSignal[]> {
    const signals: GrowthSignal[] = [];
    
    // Analyze for growth indicators
    if (companyData?.recent_updates) {
      companyData.recent_updates.forEach(update => {
        if (update.content.toLowerCase().includes('hiring') || update.content.toLowerCase().includes('team')) {
          signals.push({
            type: 'hiring',
            description: update.content,
            date: update.date,
            impact_score: 0.8,
            relevance_to_outreach: 0.9
          });
        }
      });
    }

    return signals;
  }

  private async identifyTriggerEvents(linkedinData: LinkedInProfileData | null, companyData: CompanyData | null): Promise<TriggerEvent[]> {
    const triggers: TriggerEvent[] = [];
    
    // Analyze for recent trigger events
    if (linkedinData?.recent_activity) {
      linkedinData.recent_activity.forEach(activity => {
        if (activity.content.toLowerCase().includes('new role') || activity.content.toLowerCase().includes('joined')) {
          triggers.push({
            type: 'job_change',
            description: activity.content,
            date: activity.date,
            urgency: 'high',
            outreach_angle: 'Congratulate on new role and explore new initiatives'
          });
        }
      });
    }

    return triggers;
  }

  private async generatePersonalizationHooks(linkedinData: LinkedInProfileData | null, websiteData: WebsiteContent | null): Promise<PersonalizationHook[]> {
    const hooks: PersonalizationHook[] = [];
    
    // Generate personalization opportunities
    if (linkedinData?.education) {
      linkedinData.education.forEach(edu => {
        hooks.push({
          type: 'alma_mater',
          description: `Graduated from ${edu.school}`,
          strength: 0.7,
          usage_suggestion: `Mention shared alma mater or school pride`
        });
      });
    }

    return hooks;
  }

  private generateCacheKey(request: EnrichmentRequest): string {
    return `${request.type}_${JSON.stringify(request.target_data)}_${request.enrichment_depth}`;
  }

  private isCacheValid(cachedResult: EnrichmentResult): boolean {
    const cacheAge = Date.now() - cachedResult.processing_time;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return cacheAge < maxAge;
  }

  private generateEnrichmentId(): string {
    return `enrich_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractEnrichmentRequest(task: TaskRequest): EnrichmentRequest {
    return {
      type: task.parameters.enrichment_type || 'prospect_enrichment',
      target_data: task.parameters.target_data || {},
      enrichment_depth: task.parameters.enrichment_depth || 'standard',
      data_sources: task.parameters.data_sources || ['linkedin', 'website'],
      priority: task.priority === 1 ? 'high' : task.priority === 2 ? 'medium' : 'low'
    };
  }

  private calculateEnrichmentScore(enrichedData: any, sourcesUsed: string[]): number {
    // Calculate based on data completeness and source diversity
    const sourceScore = Math.min(sourcesUsed.length * 0.2, 1.0);
    const dataCompleteness = this.calculateDataCompleteness(enrichedData);
    return (sourceScore * 0.4) + (dataCompleteness * 0.6);
  }

  private calculateDataConfidence(sourcesUsed: string[], enrichedData: any): number {
    // Higher confidence with more reliable sources
    const sourceReliability = {
      'linkedin': 0.9,
      'website': 0.8,
      'company_linkedin': 0.9,
      'news_analysis': 0.7,
      'contact_discovery': 0.6
    };
    
    const avgReliability = sourcesUsed.reduce((sum, source) => 
      sum + (sourceReliability[source] || 0.5), 0) / sourcesUsed.length;
    
    const dataQuality = this.calculateDataCompleteness(enrichedData);
    
    return (avgReliability * 0.6) + (dataQuality * 0.4);
  }

  private calculateDataCompleteness(data: any): number {
    // Recursively calculate how complete the data structure is
    if (typeof data !== 'object' || data === null) {
      return data ? 1 : 0;
    }
    
    if (Array.isArray(data)) {
      return data.length > 0 ? 1 : 0;
    }
    
    const keys = Object.keys(data);
    if (keys.length === 0) return 0;
    
    const completeness = keys.reduce((sum, key) => {
      return sum + this.calculateDataCompleteness(data[key]);
    }, 0);
    
    return completeness / keys.length;
  }

  // Placeholder methods for additional functionality
  private async generateActionableInsights(result: EnrichmentResult, context: ConversationContext): Promise<any> {
    return {
      recommended_actions: [
        'Create personalized outreach message',
        'Schedule optimal follow-up timing',
        'Identify mutual connections'
      ],
      personalization_suggestions: [
        'Reference recent company growth',
        'Mention shared industry challenges',
        'Highlight relevant case studies'
      ]
    };
  }

  // Implement other helper methods as needed...
  private async performCompetitorAnalysis(companyName: string, keywords: string[]): Promise<any> {
    return { competitors: [], market_position: 'unknown' };
  }

  private async analyzeTechnologyStack(websiteData: WebsiteContent | null): Promise<string[]> {
    return websiteData?.technology_stack || [];
  }

  // Additional methods for other enrichment types...
  private async consolidateCompanyEnrichmentData(companyData: any, websiteData: any, competitorAnalysis: any, techStack: any, growthSignals: any): Promise<EnrichedProspectData> {
    // Implement company-specific data consolidation
    return {} as EnrichedProspectData;
  }

  private async crossReferenceContactData(targetData: any, verifiedContacts: any[]): Promise<EnrichedProspectData> {
    // Implement contact verification and cross-referencing
    return {} as EnrichedProspectData;
  }

  private async performComprehensiveCompetitorAnalysis(companyName: string, websiteUrl: string): Promise<EnrichedProspectData> {
    // Implement comprehensive competitive analysis
    return {} as EnrichedProspectData;
  }

  // Suggestion generation methods
  private async generateEnrichmentSuggestions(enrichedData: EnrichedProspectData, sourcesUsed: string[]): Promise<EnrichmentSuggestion[]> {
    return [
      {
        action: 'Create personalized outreach sequence',
        description: 'Use enriched data to create highly personalized messaging',
        priority: 'high',
        estimated_impact: 0.8,
        implementation_effort: 'medium'
      }
    ];
  }

  private async generateCompanyEnrichmentSuggestions(enrichedData: EnrichedProspectData): Promise<EnrichmentSuggestion[]> {
    return [];
  }

  private async generateContactVerificationSuggestions(enrichedData: EnrichedProspectData): Promise<EnrichmentSuggestion[]> {
    return [];
  }

  private async generateCompetitiveIntelligenceSuggestions(competitiveData: EnrichedProspectData): Promise<EnrichmentSuggestion[]> {
    return [];
  }

  // Additional calculation methods
  private calculateContactEnrichmentScore(enrichedData: any): number {
    return 0.8;
  }

  private calculateContactDataConfidence(enrichedData: any): number {
    return 0.7;
  }

  // Additional determination methods
  private determineBestContactMethods(originalData: any): string[] {
    const methods = [];
    if (originalData.email) methods.push('email');
    if (originalData.linkedin_url) methods.push('linkedin');
    if (originalData.phone) methods.push('phone');
    return methods;
  }

  private determineTimezone(location: string): string {
    // Simple timezone determination based on location
    if (location.includes('New York') || location.includes('Boston')) return 'EST';
    if (location.includes('Los Angeles') || location.includes('San Francisco')) return 'PST';
    if (location.includes('Chicago')) return 'CST';
    return 'UTC';
  }

  private identifyPainPoints(title: string, industry: string): string[] {
    const painPoints = [];
    
    if (title.toLowerCase().includes('sales')) {
      painPoints.push('Lead generation challenges', 'Pipeline visibility', 'Sales process efficiency');
    }
    
    if (title.toLowerCase().includes('marketing')) {
      painPoints.push('Attribution tracking', 'Content personalization', 'Lead quality');
    }
    
    return painPoints;
  }

  private extractInterests(summary: string): string[] {
    const interests = [];
    const summaryLower = summary.toLowerCase();
    
    if (summaryLower.includes('innovation')) interests.push('Innovation');
    if (summaryLower.includes('technology')) interests.push('Technology');
    if (summaryLower.includes('growth')) interests.push('Business Growth');
    
    return interests;
  }

  private determineBuyerPersona(title: string, industry: string): string {
    const seniority = this.determineSeniorityLevel(title);
    const department = this.determineDepartment(title);
    
    return `${seniority}_${department.toLowerCase()}_${industry.toLowerCase().replace(/\s+/g, '_')}`;
  }

  private determineDecisionMakingRole(title: string): 'decision_maker' | 'influencer' | 'user' | 'gatekeeper' {
    const seniority = this.determineSeniorityLevel(title);
    
    if (seniority === 'c_level' || seniority === 'vp') return 'decision_maker';
    if (seniority === 'director' || seniority === 'manager') return 'influencer';
    return 'user';
  }

  private assessBudgetAuthority(title: string): 'high' | 'medium' | 'low' | 'unknown' {
    const seniority = this.determineSeniorityLevel(title);
    
    if (seniority === 'c_level') return 'high';
    if (seniority === 'vp' || seniority === 'director') return 'medium';
    if (seniority === 'manager') return 'low';
    return 'unknown';
  }

  private assessTechnologyAdoption(techStack: string[]): 'early_adopter' | 'mainstream' | 'late_adopter' {
    // Assess based on technology stack modernity
    const modernTechnologies = ['react', 'vue', 'angular', 'node.js', 'docker', 'kubernetes'];
    const modernCount = techStack.filter(tech => 
      modernTechnologies.some(modern => tech.toLowerCase().includes(modern))
    ).length;
    
    if (modernCount >= 3) return 'early_adopter';
    if (modernCount >= 1) return 'mainstream';
    return 'late_adopter';
  }

  private calculateResponseLikelihood(linkedinData: LinkedInProfileData | null, companyData: CompanyData | null): number {
    let likelihood = 0.5; // Base likelihood
    
    // Adjust based on LinkedIn activity
    if (linkedinData?.recent_activity && linkedinData.recent_activity.length > 0) {
      likelihood += 0.2;
    }
    
    // Adjust based on company growth signals
    if (companyData?.recent_updates && companyData.recent_updates.length > 0) {
      likelihood += 0.1;
    }
    
    // Adjust based on seniority level
    const seniority = this.determineSeniorityLevel(linkedinData?.title || '');
    if (seniority === 'c_level' || seniority === 'vp') {
      likelihood += 0.1;
    }
    
    return Math.min(likelihood, 1.0);
  }

  async getCapabilities(): Promise<AgentCapability[]> {
    return this.capabilities;
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await this.apifyScrapingAgent.healthCheck();
    } catch {
      return false;
    }
  }

  async shutdown(): Promise<void> {
    // Clean up processing queue and cache
    this.processingQueue.clear();
    this.enrichmentCache.clear();
    
    await this.apifyScrapingAgent.shutdown();
    console.log('🛑 Data Enrichment Agent shutdown complete');
  }
}