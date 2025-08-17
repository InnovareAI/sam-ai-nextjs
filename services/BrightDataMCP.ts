/**
 * Bright Data MCP Integration for SAM AI
 * Using Bright Data's official MCP server for web data extraction
 */

export interface BrightDataMCPConfig {
  apiToken: string;
  baseUrl: string;
  maxConcurrentRequests: number;
  retryAttempts: number;
}

export interface WebSearchRequest {
  query: string;
  searchEngine: 'google' | 'bing' | 'yahoo';
  country?: string;
  resultsCount?: number;
  safeSearch?: boolean;
}

export interface WebCrawlRequest {
  url: string;
  maxPages?: number;
  includeSubdomains?: boolean;
  extractData?: string[];
  renderJavaScript?: boolean;
}

export interface ExtractedLead {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  location?: string;
  bio?: string;
  website?: string;
  source_url: string;
  extraction_confidence: number;
  extracted_at: string;
}

export interface BrightDataMCPResult {
  request_id: string;
  success: boolean;
  data: any[];
  extracted_leads: ExtractedLead[];
  cost: number;
  execution_time: number;
  error?: string;
}

/**
 * Pre-built search strategies optimized for lead generation
 */
export const LEAD_GENERATION_STRATEGIES = {
  linkedin_executives: {
    searchQueries: [
      'site:linkedin.com/in/ "CEO" OR "Chief Executive Officer" "{industry}"',
      'site:linkedin.com/in/ "CTO" OR "Chief Technology Officer" "{industry}"',
      'site:linkedin.com/in/ "VP Sales" OR "Vice President Sales" "{industry}"',
      'site:linkedin.com/in/ "CMO" OR "Chief Marketing Officer" "{industry}"'
    ],
    extractData: ['name', 'title', 'company', 'location', 'linkedin_url'],
    renderJavaScript: true
  },
  company_team_pages: {
    searchQueries: [
      '"{company}" "about us" OR "team" OR "leadership" site:*.com',
      '"{company}" "our team" OR "management" contact OR email',
      '"{company}" "executive team" OR "leadership team" email'
    ],
    extractData: ['name', 'title', 'email', 'phone', 'bio'],
    renderJavaScript: true
  },
  startup_directories: {
    searchQueries: [
      'site:crunchbase.com "{industry}" founder OR CEO email',
      'site:angel.co "{industry}" startup founder contact',
      'site:f6s.com "{industry}" startup team contact'
    ],
    extractData: ['name', 'title', 'company', 'email', 'funding'],
    renderJavaScript: true
  },
  conference_speakers: {
    searchQueries: [
      '"{industry}" conference speaker 2024 OR 2025 email contact',
      'keynote speaker "{industry}" summit email bio',
      'webinar speaker "{industry}" contact information'
    ],
    extractData: ['name', 'title', 'company', 'email', 'bio', 'speaking_topics'],
    renderJavaScript: false
  }
};

export class BrightDataMCPService {
  private config: BrightDataMCPConfig;
  private requestCount: number = 0;
  private monthlyLimit: number = 5000; // Free tier limit

  constructor(config: Partial<BrightDataMCPConfig> = {}) {
    this.config = {
      apiToken: config.apiToken || process.env.VITE_BRIGHT_DATA_TOKEN || '',
      baseUrl: config.baseUrl || 'https://api.brightdata.com/mcp/v1',
      maxConcurrentRequests: config.maxConcurrentRequests || 5,
      retryAttempts: config.retryAttempts || 3,
      ...config
    };
  }

  /**
   * Search for leads using Bright Data MCP web search
   */
  async searchForLeads(
    strategy: keyof typeof LEAD_GENERATION_STRATEGIES,
    targetData: {
      industry?: string;
      company?: string;
      location?: string;
    },
    maxResults: number = 100
  ): Promise<BrightDataMCPResult> {
    
    console.log(`🔍 Starting lead search with strategy: ${strategy}`);
    
    const searchStrategy = LEAD_GENERATION_STRATEGIES[strategy];
    if (!searchStrategy) {
      throw new Error(`Strategy ${strategy} not found`);
    }

    const startTime = Date.now();
    const allLeads: ExtractedLead[] = [];
    let totalCost = 0;

    try {
      // Process each search query in the strategy
      for (const queryTemplate of searchStrategy.searchQueries) {
        const query = this.interpolateQuery(queryTemplate, targetData);
        
        console.log(`🌐 Executing search: ${query}`);
        
        const searchResult = await this.executeWebSearch({
          query,
          searchEngine: 'google',
          country: targetData.location || 'US',
          resultsCount: Math.ceil(maxResults / searchStrategy.searchQueries.length)
        });

        if (searchResult.success) {
          // Extract leads from search results
          const extractedLeads = await this.extractLeadsFromResults(
            searchResult.data,
            searchStrategy.extractData
          );
          
          allLeads.push(...extractedLeads);
          totalCost += searchResult.cost;
        }

        // Rate limiting - respect the MCP limits
        await this.delay(1000);
      }

      // Remove duplicates and apply scoring
      const uniqueLeads = this.deduplicateLeads(allLeads);
      const scoredLeads = this.scoreLeads(uniqueLeads);

      return {
        request_id: `bright_mcp_${Date.now()}`,
        success: true,
        data: [],
        extracted_leads: scoredLeads.slice(0, maxResults),
        cost: totalCost,
        execution_time: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ Bright Data MCP search failed:', error);
      return {
        request_id: `bright_mcp_error_${Date.now()}`,
        success: false,
        data: [],
        extracted_leads: [],
        cost: totalCost,
        execution_time: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Crawl specific websites for lead data
   */
  async crawlWebsiteForLeads(
    url: string,
    extractionRules: string[] = ['name', 'title', 'email', 'phone']
  ): Promise<BrightDataMCPResult> {
    
    console.log(`🕷️ Crawling website: ${url}`);
    
    const startTime = Date.now();

    try {
      const crawlResult = await this.executeWebCrawl({
        url,
        maxPages: 10,
        includeSubdomains: false,
        extractData: extractionRules,
        renderJavaScript: true
      });

      if (crawlResult.success) {
        const extractedLeads = await this.extractLeadsFromResults(
          crawlResult.data,
          extractionRules
        );

        return {
          request_id: `bright_crawl_${Date.now()}`,
          success: true,
          data: crawlResult.data,
          extracted_leads: extractedLeads,
          cost: crawlResult.cost,
          execution_time: Date.now() - startTime
        };
      }

      throw new Error('Crawl operation failed');

    } catch (error) {
      console.error('❌ Website crawl failed:', error);
      return {
        request_id: `bright_crawl_error_${Date.now()}`,
        success: false,
        data: [],
        extracted_leads: [],
        cost: 0,
        execution_time: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Execute web search using Bright Data MCP
   */
  private async executeWebSearch(request: WebSearchRequest): Promise<BrightDataMCPResult> {
    if (this.requestCount >= this.monthlyLimit) {
      throw new Error('Monthly MCP request limit reached');
    }

    try {
      // This would be the actual MCP call to Bright Data
      const response = await this.callBrightDataMCP('/search', {
        query: request.query,
        search_engine: request.searchEngine,
        country: request.country || 'US',
        num_results: request.resultsCount || 10,
        safe_search: request.safeSearch !== false
      });

      this.requestCount++;

      return {
        request_id: `search_${Date.now()}`,
        success: true,
        data: response.results || [],
        extracted_leads: [],
        cost: this.calculateSearchCost(request.resultsCount || 10),
        execution_time: response.execution_time || 0
      };

    } catch (error) {
      console.error('❌ MCP search failed:', error);
      throw error;
    }
  }

  /**
   * Execute web crawl using Bright Data MCP
   */
  private async executeWebCrawl(request: WebCrawlRequest): Promise<BrightDataMCPResult> {
    try {
      const response = await this.callBrightDataMCP('/crawl', {
        url: request.url,
        max_pages: request.maxPages || 5,
        include_subdomains: request.includeSubdomains || false,
        extract_data: request.extractData || [],
        render_javascript: request.renderJavaScript !== false
      });

      this.requestCount++;

      return {
        request_id: `crawl_${Date.now()}`,
        success: true,
        data: response.pages || [],
        extracted_leads: [],
        cost: this.calculateCrawlCost(request.maxPages || 5),
        execution_time: response.execution_time || 0
      };

    } catch (error) {
      console.error('❌ MCP crawl failed:', error);
      throw error;
    }
  }

  /**
   * Extract lead information from web results
   */
  private async extractLeadsFromResults(
    results: any[],
    extractionFields: string[]
  ): Promise<ExtractedLead[]> {
    
    const extractedLeads: ExtractedLead[] = [];

    for (const result of results) {
      try {
        const lead = await this.parseResultForLead(result, extractionFields);
        if (lead && this.validateLead(lead)) {
          extractedLeads.push(lead);
        }
      } catch (error) {
        console.error('❌ Failed to extract lead from result:', error);
        continue;
      }
    }

    return extractedLeads;
  }

  /**
   * Parse individual search result for lead data
   */
  private async parseResultForLead(
    result: any,
    extractionFields: string[]
  ): Promise<ExtractedLead | null> {
    
    const text = `${result.title || ''} ${result.snippet || ''} ${result.content || ''}`.toLowerCase();
    const url = result.url || result.link || '';

    const lead: Partial<ExtractedLead> = {
      source_url: url,
      extracted_at: new Date().toISOString(),
      extraction_confidence: 0.5
    };

    // Extract name
    if (extractionFields.includes('name')) {
      const nameMatch = text.match(/(?:^|\s)([A-Z][a-z]+ [A-Z][a-z]+)(?:\s|$|,)/);
      if (nameMatch) {
        lead.name = nameMatch[1];
        lead.extraction_confidence += 0.15;
      }
    }

    // Extract title
    if (extractionFields.includes('title')) {
      const titlePatterns = [
        /(?:CEO|Chief Executive Officer)/gi,
        /(?:CTO|Chief Technology Officer)/gi,
        /(?:VP|Vice President)\s+\w+/gi,
        /(?:Director|Head)\s+of\s+\w+/gi
      ];
      
      for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match) {
          lead.title = match[0];
          lead.extraction_confidence += 0.2;
          break;
        }
      }
    }

    // Extract email
    if (extractionFields.includes('email')) {
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        lead.email = emailMatch[1];
        lead.extraction_confidence += 0.25;
      }
    }

    // Extract company
    if (extractionFields.includes('company')) {
      const domain = this.extractDomain(url);
      if (domain && !['linkedin', 'facebook', 'twitter'].some(social => domain.includes(social))) {
        lead.company = this.formatCompanyName(domain);
        lead.extraction_confidence += 0.1;
      }
    }

    // Extract LinkedIn URL
    if (extractionFields.includes('linkedin_url') && url.includes('linkedin.com')) {
      lead.linkedin_url = url;
      lead.extraction_confidence += 0.15;
    }

    // Only return if we have minimum confidence and required fields
    if (lead.extraction_confidence >= 0.6 && (lead.name || lead.email || lead.linkedin_url)) {
      return lead as ExtractedLead;
    }

    return null;
  }

  /**
   * Remove duplicate leads based on email, LinkedIn, or name+company
   */
  private deduplicateLeads(leads: ExtractedLead[]): ExtractedLead[] {
    const uniqueMap = new Map<string, ExtractedLead>();

    for (const lead of leads) {
      let key = '';
      
      if (lead.email) {
        key = lead.email;
      } else if (lead.linkedin_url) {
        key = lead.linkedin_url;
      } else if (lead.name && lead.company) {
        key = `${lead.name}_${lead.company}`;
      } else {
        key = lead.source_url;
      }

      if (!uniqueMap.has(key) || uniqueMap.get(key)!.extraction_confidence < lead.extraction_confidence) {
        uniqueMap.set(key, lead);
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * Score and rank leads by quality
   */
  private scoreLeads(leads: ExtractedLead[]): ExtractedLead[] {
    return leads
      .map(lead => ({
        ...lead,
        extraction_confidence: this.calculateFinalScore(lead)
      }))
      .sort((a, b) => b.extraction_confidence - a.extraction_confidence);
  }

  private calculateFinalScore(lead: ExtractedLead): number {
    let score = 0.3; // Base score

    if (lead.name) score += 0.2;
    if (lead.title) score += 0.2;
    if (lead.email) score += 0.2;
    if (lead.company) score += 0.1;
    if (lead.linkedin_url) score += 0.15;
    if (lead.phone) score += 0.05;

    return Math.min(score, 1.0);
  }

  /**
   * Utility methods
   */
  private interpolateQuery(template: string, data: any): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => data[key] || '');
  }

  private validateLead(lead: ExtractedLead): boolean {
    return !!(lead.name || lead.email || lead.linkedin_url);
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  private formatCompanyName(domain: string): string {
    return domain
      .split('.')[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private calculateSearchCost(results: number): number {
    return results * 0.01; // $0.01 per search result
  }

  private calculateCrawlCost(pages: number): number {
    return pages * 0.05; // $0.05 per page crawled
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Mock MCP API call (replace with actual MCP client)
   */
  private async callBrightDataMCP(endpoint: string, data: any): Promise<any> {
    console.log(`📡 MCP Call: ${endpoint}`, data);
    
    // Simulate API delay
    await this.delay(1500);

    // Mock response based on endpoint
    if (endpoint === '/search') {
      return {
        results: this.generateMockSearchResults(data.num_results),
        execution_time: 1500
      };
    } else if (endpoint === '/crawl') {
      return {
        pages: this.generateMockCrawlResults(data.max_pages),
        execution_time: 2000
      };
    }

    throw new Error(`Unknown endpoint: ${endpoint}`);
  }

  private generateMockSearchResults(count: number): any[] {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push({
        title: `John Doe - CEO at TechCorp ${i}`,
        snippet: `John Doe is the CEO of TechCorp ${i}, a leading SaaS company. Contact: john.doe${i}@techcorp${i}.com`,
        url: `https://linkedin.com/in/johndoe${i}`,
        content: `Professional profile for John Doe, Chief Executive Officer at TechCorp ${i}. Experience in SaaS and technology.`
      });
    }
    return results;
  }

  private generateMockCrawlResults(pages: number): any[] {
    const results = [];
    for (let i = 0; i < pages; i++) {
      results.push({
        url: `https://example${i}.com/team`,
        title: `Team - Company ${i}`,
        content: `Our leadership team includes CEO Jane Smith (jane.smith@company${i}.com) and CTO Bob Johnson.`,
        extracted_data: {
          emails: [`jane.smith@company${i}.com`, `bob.johnson@company${i}.com`],
          names: ['Jane Smith', 'Bob Johnson'],
          titles: ['CEO', 'CTO']
        }
      });
    }
    return results;
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): {
    requests_used: number;
    requests_remaining: number;
    monthly_limit: number;
    cost_this_month: number;
  } {
    return {
      requests_used: this.requestCount,
      requests_remaining: this.monthlyLimit - this.requestCount,
      monthly_limit: this.monthlyLimit,
      cost_this_month: this.requestCount * 0.01 // Estimated cost
    };
  }
}

export default BrightDataMCPService;