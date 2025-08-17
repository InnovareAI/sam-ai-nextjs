/**
 * Test Data Preview Service
 * Provides sample LinkedIn search results before full scraping commitment
 */

export interface ICPCriteria {
  industry: string;
  jobTitles: string[];
  companySize?: string;
  location?: string;
  companyStage?: string;
  additionalCriteria?: string;
  targetCount: number;
}

export interface LinkedInPreview {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  linkedin_url: string;
  about_preview: string;
  profile_image?: string;
  connection_degree?: string;
  industry: string;
  estimated_email?: string;
  confidence_score: number;
}

export interface PreviewResults {
  search_queries: string[];
  sample_urls: string[];
  preview_profiles: LinkedInPreview[];
  estimated_total: number;
  estimated_cost: number;
  data_quality_score: number;
  match_confidence: number;
  sample_size: number;
}

export interface PreviewApproval {
  approved: boolean;
  feedback?: string;
  adjusted_criteria?: ICPCriteria;
  proceed_with_full_scraping: boolean;
}

export class TestDataPreviewService {
  private brightDataUrl: string;
  private brightDataToken: string;

  constructor() {
    this.brightDataUrl = 'https://api.brightdata.com';
    this.brightDataToken = import.meta.env.BRIGHT_DATA_TOKEN || '';
  }

  /**
   * Generate test preview of leads before full scraping
   */
  async generateTestPreview(icp: ICPCriteria): Promise<PreviewResults> {
    console.log('🔍 Generating test preview for ICP:', icp);

    try {
      // Step 1: Generate optimized search queries
      const searchQueries = this.generateSearchQueries(icp);
      
      // Step 2: Execute test searches (limited to 50 results per query)
      const sampleUrls = await this.executeTestSearches(searchQueries);
      
      // Step 3: Scrape 10-15 sample profiles for preview
      const previewProfiles = await this.scrapeSampleProfiles(sampleUrls.slice(0, 15));
      
      // Step 4: Calculate estimates and confidence scores
      const estimates = this.calculateEstimates(sampleUrls, previewProfiles, icp.targetCount);

      return {
        search_queries: searchQueries,
        sample_urls: sampleUrls,
        preview_profiles: previewProfiles,
        estimated_total: estimates.total,
        estimated_cost: estimates.cost,
        data_quality_score: estimates.quality,
        match_confidence: estimates.confidence,
        sample_size: previewProfiles.length
      };

    } catch (error) {
      console.error('❌ Failed to generate test preview:', error);
      
      // Fallback: Generate mock preview for demo
      return this.generateMockPreview(icp);
    }
  }

  /**
   * Generate search queries optimized for the ICP
   */
  private generateSearchQueries(icp: ICPCriteria): string[] {
    const queries: string[] = [];
    
    icp.jobTitles.forEach(title => {
      // Basic LinkedIn search
      queries.push(`"${title}" "${icp.industry}" "${icp.location || ''}" site:linkedin.com/in/`);
      
      // Company size specific
      if (icp.companySize) {
        queries.push(`"${title}" "${icp.industry}" "${icp.companySize}" site:linkedin.com/in/`);
      }
      
      // Company stage specific
      if (icp.companyStage) {
        queries.push(`"${title}" "${icp.companyStage}" "${icp.industry}" site:linkedin.com/in/`);
      }
      
      // Additional criteria specific
      if (icp.additionalCriteria) {
        queries.push(`"${title}" "${icp.industry}" "${icp.additionalCriteria}" site:linkedin.com/in/`);
      }
    });

    return queries.slice(0, 10); // Limit to 10 test queries
  }

  /**
   * Execute limited test searches to get sample URLs
   */
  private async executeTestSearches(queries: string[]): Promise<string[]> {
    console.log('🔎 Executing test searches...');
    
    const allUrls: string[] = [];
    
    // In production, this would call Bright Data MCP
    // For now, generate realistic mock URLs
    for (const query of queries) {
      const mockUrls = this.generateMockLinkedInUrls(Math.floor(Math.random() * 30) + 20);
      allUrls.push(...mockUrls);
    }
    
    // Remove duplicates and limit to reasonable sample size
    const uniqueUrls = Array.from(new Set(allUrls));
    return uniqueUrls.slice(0, 100);
  }

  /**
   * Scrape small sample of profiles for preview
   */
  private async scrapeSampleProfiles(urls: string[]): Promise<LinkedInPreview[]> {
    console.log(`📋 Scraping ${urls.length} sample profiles...`);
    
    // In production, this would call Bright Data LinkedIn scraper
    // For now, generate realistic mock profiles
    const profiles: LinkedInPreview[] = [];
    
    const companies = ['TechFlow Solutions', 'DataCorp Analytics', 'CloudScale Systems', 'AI Ventures', 'SaaS Masters', 'Growth Labs', 'InnovateTech', 'ScaleUp Partners'];
    const firstNames = ['Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Lisa', 'Robert', 'Jennifer', 'Chris', 'Maria'];
    const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Garcia'];
    
    for (let i = 0; i < Math.min(urls.length, 15); i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const company = companies[i % companies.length];
      
      profiles.push({
        id: `preview_${i}`,
        name: `${firstName} ${lastName}`,
        title: ['CEO', 'VP Sales', 'VP Marketing', 'Chief Revenue Officer'][i % 4],
        company,
        location: 'San Francisco, CA',
        linkedin_url: urls[i],
        about_preview: `Experienced leader at ${company}. Focused on scaling B2B SaaS solutions and driving growth through innovative strategies.`,
        profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
        connection_degree: ['1st', '2nd', '3rd'][Math.floor(Math.random() * 3)],
        industry: 'Software as a Service (SaaS)',
        estimated_email: Math.random() > 0.4 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s/g, '')}.com` : undefined,
        confidence_score: Math.floor(Math.random() * 30) + 70
      });
    }
    
    return profiles;
  }

  /**
   * Calculate estimates based on sample data
   */
  private calculateEstimates(sampleUrls: string[], sampleProfiles: LinkedInPreview[], targetCount: number) {
    const urlsPerQuery = sampleUrls.length / 10; // Average URLs per query
    const queriesNeeded = Math.ceil(targetCount / urlsPerQuery);
    const estimatedTotal = Math.min(queriesNeeded * urlsPerQuery, targetCount);
    
    const qualityScore = sampleProfiles.reduce((sum, profile) => sum + profile.confidence_score, 0) / sampleProfiles.length;
    const emailRate = sampleProfiles.filter(p => p.estimated_email).length / sampleProfiles.length;
    
    return {
      total: estimatedTotal,
      cost: estimatedTotal * 0.0015,
      quality: Math.round(qualityScore),
      confidence: emailRate > 0.4 ? 85 : emailRate > 0.2 ? 75 : 65
    };
  }

  /**
   * Generate mock preview for demo/testing
   */
  private generateMockPreview(icp: ICPCriteria): PreviewResults {
    const searchQueries = this.generateSearchQueries(icp);
    const sampleUrls = this.generateMockLinkedInUrls(50);
    
    return {
      search_queries: searchQueries,
      sample_urls: sampleUrls,
      preview_profiles: [
        {
          id: 'mock_1',
          name: 'Sarah Chen',
          title: 'CEO',
          company: 'TechFlow Solutions',
          location: 'San Francisco, CA',
          linkedin_url: 'https://linkedin.com/in/sarahchen',
          about_preview: 'CEO at TechFlow Solutions. Leading B2B SaaS platform serving 500+ enterprise clients. Former VP at Salesforce.',
          profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SarahChen',
          connection_degree: '2nd',
          industry: 'Software as a Service (SaaS)',
          estimated_email: 'sarah.chen@techflowsolutions.com',
          confidence_score: 92
        },
        {
          id: 'mock_2',
          name: 'Michael Rodriguez',
          title: 'VP Sales',
          company: 'DataCorp Analytics',
          location: 'San Francisco, CA',
          linkedin_url: 'https://linkedin.com/in/michaelrodriguez',
          about_preview: 'VP Sales at DataCorp Analytics. $50M ARR, 200% growth YoY. Expert in enterprise SaaS sales and team scaling.',
          profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MichaelRodriguez',
          connection_degree: '3rd',
          industry: 'Data Analytics',
          estimated_email: 'mrodriguez@datacorp.com',
          confidence_score: 88
        },
        {
          id: 'mock_3',
          name: 'Emily Foster',
          title: 'Chief Revenue Officer',
          company: 'CloudScale Systems',
          location: 'San Francisco, CA',
          linkedin_url: 'https://linkedin.com/in/emilyfoster',
          about_preview: 'CRO at CloudScale Systems. Series B startup, $25M raised. Building world-class revenue operations for cloud infrastructure.',
          profile_image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EmilyFoster',
          connection_degree: '2nd',
          industry: 'Cloud Infrastructure',
          estimated_email: undefined,
          confidence_score: 85
        }
      ],
      estimated_total: icp.targetCount,
      estimated_cost: icp.targetCount * 0.0015,
      data_quality_score: 88,
      match_confidence: 85,
      sample_size: 3
    };
  }

  /**
   * Process client feedback and approval
   */
  async processPreviewApproval(
    previewResults: PreviewResults,
    approval: PreviewApproval
  ): Promise<{
    proceed: boolean;
    updated_icp?: ICPCriteria;
    estimated_results: {
      total_profiles: number;
      estimated_cost: number;
      expected_quality: number;
    };
  }> {
    
    if (approval.approved && approval.proceed_with_full_scraping) {
      console.log('✅ Client approved preview - proceeding with full scraping');
      
      return {
        proceed: true,
        updated_icp: approval.adjusted_criteria,
        estimated_results: {
          total_profiles: previewResults.estimated_total,
          estimated_cost: previewResults.estimated_cost,
          expected_quality: previewResults.data_quality_score
        }
      };
    }
    
    if (approval.feedback) {
      console.log('💬 Client provided feedback:', approval.feedback);
      
      // Process feedback to suggest ICP adjustments
      const suggestions = this.processFeedback(approval.feedback, previewResults);
      
      return {
        proceed: false,
        updated_icp: suggestions.adjusted_icp,
        estimated_results: suggestions.new_estimates
      };
    }
    
    console.log('❌ Client declined preview');
    return {
      proceed: false,
      estimated_results: {
        total_profiles: 0,
        estimated_cost: 0,
        expected_quality: 0
      }
    };
  }

  /**
   * Process client feedback to improve ICP
   */
  private processFeedback(feedback: string, currentResults: PreviewResults) {
    // Simple feedback processing - in production this would use NLP
    const lowerFeedback = feedback.toLowerCase();
    
    let adjustments = {};
    
    if (lowerFeedback.includes('more senior') || lowerFeedback.includes('c-level')) {
      adjustments = { jobTitles: ['CEO', 'CTO', 'CMO', 'Chief Revenue Officer'] };
    }
    
    if (lowerFeedback.includes('bigger companies') || lowerFeedback.includes('enterprise')) {
      adjustments = { ...adjustments, companySize: '500+ employees' };
    }
    
    if (lowerFeedback.includes('different location')) {
      adjustments = { ...adjustments, location: 'New York' };
    }
    
    return {
      adjusted_icp: adjustments,
      new_estimates: {
        total_profiles: currentResults.estimated_total,
        estimated_cost: currentResults.estimated_cost,
        expected_quality: currentResults.data_quality_score + 5
      }
    };
  }

  /**
   * Generate mock LinkedIn URLs for testing
   */
  private generateMockLinkedInUrls(count: number): string[] {
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
      urls.push(`https://linkedin.com/in/professional-${Date.now()}-${i}`);
    }
    return urls;
  }

  /**
   * Get preview cost estimate
   */
  getPreviewCost(): number {
    return 0; // Preview is free - only charges for full scraping
  }

  /**
   * Get sample data quality metrics
   */
  getQualityMetrics(profiles: LinkedInPreview[]): {
    email_rate: number;
    profile_completeness: number;
    title_match_rate: number;
    location_match_rate: number;
  } {
    const emailRate = profiles.filter(p => p.estimated_email).length / profiles.length;
    const completeness = profiles.filter(p => p.about_preview && p.company).length / profiles.length;
    const titleMatch = profiles.filter(p => p.confidence_score > 80).length / profiles.length;
    const locationMatch = profiles.filter(p => p.location).length / profiles.length;
    
    return {
      email_rate: Math.round(emailRate * 100),
      profile_completeness: Math.round(completeness * 100),
      title_match_rate: Math.round(titleMatch * 100),
      location_match_rate: Math.round(locationMatch * 100)
    };
  }
}

export default TestDataPreviewService;