/**
 * Google Search Lead Generator for SAM AI
 * Uses Google Search to find prospects without LinkedIn scraping limitations
 */

export interface GoogleSearchQuery {
  id: string;
  name: string;
  searchTerms: string[];
  targetData: string[];
  estimatedResults: number;
  description: string;
}

export interface GoogleSearchResult {
  title: string;
  url: string;
  snippet: string;
  extractedData: {
    name?: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  relevanceScore: number;
  source: string;
}

export interface GoogleLeadGenerationResult {
  query_id: string;
  total_results: number;
  processed_results: number;
  leads: GoogleSearchResult[];
  cost_breakdown: {
    search_costs: number;
    processing_costs: number;
    total_cost: number;
  };
  execution_time: number;
  data_sources: string[];
}

/**
 * Pre-built Google search strategies for different prospect types
 */
export const GOOGLE_SEARCH_STRATEGIES: GoogleSearchQuery[] = [
  {
    id: 'linkedin_profiles',
    name: 'LinkedIn Profiles via Google',
    searchTerms: [
      'site:linkedin.com/in/ "VP Sales" OR "Sales Director" OR "Head of Sales"',
      'site:linkedin.com/in/ "CTO" OR "Chief Technology Officer" "SaaS"',
      'site:linkedin.com/in/ "Marketing Director" OR "CMO" "fintech"',
      'site:linkedin.com/in/ "Founder" OR "CEO" "startup" "series A"'
    ],
    targetData: ['name', 'title', 'company', 'location', 'linkedin_url'],
    estimatedResults: 50000,
    description: 'Find LinkedIn profiles through Google search - bypasses LinkedIn rate limits'
  },
  {
    id: 'company_websites',
    name: 'Company Team Pages',
    searchTerms: [
      '"about us" OR "team" OR "leadership" "VP Sales" OR "Sales Director"',
      '"our team" "CTO" OR "Chief Technology Officer" site:*.com',
      '"management team" "CMO" OR "Marketing Director" "SaaS company"',
      '"leadership" "Head of" OR "Director of" "contact" OR "email"'
    ],
    targetData: ['name', 'title', 'company', 'email', 'bio', 'website'],
    estimatedResults: 25000,
    description: 'Extract prospect data from company About/Team pages'
  },
  {
    id: 'directory_sites',
    name: 'Professional Directories',
    searchTerms: [
      'site:crunchbase.com "founder" OR "CEO" "SaaS" email',
      'site:apollo.io OR site:zoominfo.com "VP Sales" contact',
      'site:rocketreach.com OR site:hunter.io email "CTO"',
      'site:pitchbook.com "startup" "Series A" "founder" contact'
    ],
    targetData: ['name', 'title', 'company', 'email', 'phone', 'funding'],
    estimatedResults: 15000,
    description: 'Leverage professional directories and databases'
  },
  {
    id: 'press_releases',
    name: 'Press Release Mining',
    searchTerms: [
      '"press release" "announces" "VP" OR "Director" OR "Head of" email',
      '"new hire" OR "promotion" "CTO" OR "CMO" "contact" OR "email"',
      '"joins" OR "appointed" "Chief" OR "Vice President" company',
      'site:prnewswire.com OR site:businesswire.com "executive" email'
    ],
    targetData: ['name', 'title', 'company', 'announcement', 'email', 'date'],
    estimatedResults: 10000,
    description: 'Find newly appointed executives from press releases'
  },
  {
    id: 'conference_speakers',
    name: 'Conference & Event Speakers',
    searchTerms: [
      '"speaker" OR "keynote" "conference" "CTO" OR "VP" email contact',
      '"webinar" OR "summit" "SaaS" "speaker bio" email',
      '"industry conference" "panel" "executive" contact information',
      'site:eventbrite.com OR site:meetup.com "speaker" email "VP"'
    ],
    targetData: ['name', 'title', 'company', 'email', 'speaking_topics', 'bio'],
    estimatedResults: 8000,
    description: 'Target industry speakers and thought leaders'
  },
  {
    id: 'podcast_guests',
    name: 'Podcast Guest Mining',
    searchTerms: [
      '"podcast guest" "CEO" OR "founder" "SaaS" email contact',
      '"interview" "startup founder" contact email linkedin',
      '"podcast" "guest bio" "CTO" OR "VP" "email" OR "contact"',
      'site:spotify.com OR site:apple.com "podcast" "guest" "startup"'
    ],
    targetData: ['name', 'title', 'company', 'email', 'podcast_appearances', 'bio'],
    estimatedResults: 5000,
    description: 'Find executives who appear on podcasts'
  },
  {
    id: 'github_profiles',
    name: 'GitHub Developer Profiles',
    searchTerms: [
      'site:github.com "CTO" OR "VP Engineering" email company',
      'site:github.com "founder" OR "CEO" "startup" contact',
      'site:github.com bio "Head of Engineering" OR "Tech Lead" email',
      'site:github.com "Senior Engineer" OR "Principal" "SaaS" contact'
    ],
    targetData: ['name', 'title', 'company', 'email', 'github_url', 'skills'],
    estimatedResults: 20000,
    description: 'Target technical decision makers via GitHub'
  },
  {
    id: 'job_postings',
    name: 'Job Posting Contact Mining',
    searchTerms: [
      'site:linkedin.com/jobs "contact" OR "apply" "hiring manager" email',
      'site:indeed.com OR site:glassdoor.com "VP" OR "Director" hiring email',
      '"job posting" "contact hiring manager" "SaaS company" email',
      'site:angel.co OR site:builtin.com startup "contact" OR "apply" email'
    ],
    targetData: ['hiring_manager', 'title', 'company', 'email', 'job_description'],
    estimatedResults: 12000,
    description: 'Extract hiring manager contacts from job postings'
  }
];

export class GoogleSearchLeadGenerator {
  private searchApiKey: string;
  private searchEngineId: string;
  private requestsPerDay: number = 10000; // Google Custom Search API limit

  constructor(apiKey: string, engineId: string) {
    this.searchApiKey = apiKey;
    this.searchEngineId = engineId;
  }

  /**
   * Execute a lead generation campaign using Google Search
   */
  async generateLeads(
    strategy: string, 
    maxResults: number = 1000,
    additionalFilters?: string[]
  ): Promise<GoogleLeadGenerationResult> {
    
    const searchStrategy = GOOGLE_SEARCH_STRATEGIES.find(s => s.id === strategy);
    if (!searchStrategy) {
      throw new Error(`Search strategy '${strategy}' not found`);
    }

    console.log(`🔍 Starting Google search lead generation: ${searchStrategy.name}`);
    
    const startTime = Date.now();
    const allResults: GoogleSearchResult[] = [];
    const dataSources: string[] = [];

    // Execute searches for each search term
    for (const searchTerm of searchStrategy.searchTerms) {
      try {
        const results = await this.executeGoogleSearch(searchTerm, maxResults / searchStrategy.searchTerms.length);
        const processedResults = await this.processSearchResults(results, searchStrategy.targetData);
        
        allResults.push(...processedResults);
        dataSources.push(this.extractDomainFromSearchTerm(searchTerm));
        
        // Rate limiting - pause between searches
        await this.delay(1000);
        
      } catch (error) {
        console.error(`❌ Search failed for term: ${searchTerm}`, error);
        continue;
      }
    }

    // Remove duplicates and apply scoring
    const uniqueLeads = this.deduplicateAndScore(allResults);
    
    // Calculate costs
    const searchRequests = searchStrategy.searchTerms.length * Math.ceil(maxResults / 10);
    const costBreakdown = {
      search_costs: searchRequests * 0.005, // $5 per 1000 requests
      processing_costs: uniqueLeads.length * 0.001, // Processing cost
      total_cost: searchRequests * 0.005 + uniqueLeads.length * 0.001
    };

    return {
      query_id: `google_${strategy}_${Date.now()}`,
      total_results: uniqueLeads.length,
      processed_results: uniqueLeads.length,
      leads: uniqueLeads.slice(0, maxResults),
      cost_breakdown: costBreakdown,
      execution_time: Date.now() - startTime,
      data_sources: [...new Set(dataSources)]
    };
  }

  /**
   * Execute Google Custom Search API request
   */
  private async executeGoogleSearch(query: string, maxResults: number): Promise<any[]> {
    const results: any[] = [];
    const resultsPerPage = 10; // Google CSE limit
    const pages = Math.ceil(Math.min(maxResults, 100) / resultsPerPage); // Max 100 results per query

    for (let page = 0; page < pages; page++) {
      const startIndex = page * resultsPerPage + 1;
      
      try {
        const response = await fetch(
          `https://www.googleapis.com/customsearch/v1?key=${this.searchApiKey}&cx=${this.searchEngineId}&q=${encodeURIComponent(query)}&start=${startIndex}&num=${resultsPerPage}`
        );

        if (!response.ok) {
          throw new Error(`Google search API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.items) {
          results.push(...data.items);
        }

        // Rate limiting between pages
        await this.delay(100);

      } catch (error) {
        console.error(`❌ Google search page ${page + 1} failed:`, error);
        break;
      }
    }

    return results;
  }

  /**
   * Process raw Google search results and extract lead data
   */
  private async processSearchResults(
    rawResults: any[], 
    targetData: string[]
  ): Promise<GoogleSearchResult[]> {
    
    const processedResults: GoogleSearchResult[] = [];

    for (const result of rawResults) {
      try {
        const extractedData = await this.extractLeadData(result, targetData);
        const relevanceScore = this.calculateRelevanceScore(extractedData, result);

        processedResults.push({
          title: result.title || '',
          url: result.link || '',
          snippet: result.snippet || '',
          extractedData,
          relevanceScore,
          source: this.extractDomain(result.link || '')
        });

      } catch (error) {
        console.error('❌ Failed to process search result:', error);
        continue;
      }
    }

    return processedResults;
  }

  /**
   * Extract lead data from search result using pattern matching
   */
  private async extractLeadData(result: any, targetData: string[]): Promise<any> {
    const extracted: any = {};
    const text = `${result.title} ${result.snippet}`.toLowerCase();

    // Name extraction patterns
    if (targetData.includes('name')) {
      const nameMatch = text.match(/(?:^|\s)([A-Z][a-z]+ [A-Z][a-z]+)(?:\s|$|,)/);
      if (nameMatch) extracted.name = nameMatch[1];
    }

    // Title extraction patterns
    if (targetData.includes('title')) {
      const titlePatterns = [
        /(?:VP|Vice President|Director|Head of|Chief|Manager|Senior|Lead)\s+[A-Za-z\s]+/gi,
        /(CEO|CTO|CMO|CFO|COO)/gi,
        /(Founder|Co-founder)/gi
      ];
      
      for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match) {
          extracted.title = match[0];
          break;
        }
      }
    }

    // Email extraction
    if (targetData.includes('email')) {
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) extracted.email = emailMatch[1];
    }

    // Company extraction
    if (targetData.includes('company')) {
      // Extract from URL domain or title
      const domain = this.extractDomain(result.link);
      if (domain && !['linkedin', 'github', 'twitter'].some(social => domain.includes(social))) {
        extracted.company = this.formatCompanyName(domain);
      }
    }

    // LinkedIn URL
    if (targetData.includes('linkedin_url') && result.link.includes('linkedin.com')) {
      extracted.linkedin_url = result.link;
    }

    // Phone number extraction
    if (targetData.includes('phone')) {
      const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
      if (phoneMatch) extracted.phone = phoneMatch[0];
    }

    return extracted;
  }

  /**
   * Calculate relevance score based on extracted data quality
   */
  private calculateRelevanceScore(extractedData: any, result: any): number {
    let score = 0.3; // Base score

    // Bonus for having key data points
    if (extractedData.name) score += 0.2;
    if (extractedData.title) score += 0.2;
    if (extractedData.email) score += 0.15;
    if (extractedData.company) score += 0.1;
    if (extractedData.phone) score += 0.05;

    // Bonus for high-quality sources
    const domain = this.extractDomain(result.link);
    if (['linkedin', 'crunchbase', 'apollo', 'zoominfo'].some(source => domain.includes(source))) {
      score += 0.1;
    }

    // Penalty for low-quality indicators
    if (result.snippet.includes('404') || result.snippet.includes('not found')) {
      score -= 0.2;
    }

    return Math.min(Math.max(score, 0), 1);
  }

  /**
   * Remove duplicates and apply intelligent scoring
   */
  private deduplicateAndScore(results: GoogleSearchResult[]): GoogleSearchResult[] {
    const uniqueMap = new Map<string, GoogleSearchResult>();

    for (const result of results) {
      // Create unique key based on email, LinkedIn URL, or name+company
      let key = '';
      if (result.extractedData.email) {
        key = result.extractedData.email;
      } else if (result.extractedData.linkedin_url) {
        key = result.extractedData.linkedin_url;
      } else if (result.extractedData.name && result.extractedData.company) {
        key = `${result.extractedData.name}_${result.extractedData.company}`;
      } else {
        key = result.url; // Fallback to URL
      }

      // Keep the result with higher relevance score
      if (!uniqueMap.has(key) || uniqueMap.get(key)!.relevanceScore < result.relevanceScore) {
        uniqueMap.set(key, result);
      }
    }

    return Array.from(uniqueMap.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Utility methods
   */
  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return '';
    }
  }

  private extractDomainFromSearchTerm(searchTerm: string): string {
    const siteMatch = searchTerm.match(/site:([^\s]+)/);
    return siteMatch ? siteMatch[1] : 'google_search';
  }

  private formatCompanyName(domain: string): string {
    return domain
      .split('.')[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get estimated daily capacity based on API limits
   */
  getDailyCapacity(): {
    max_searches: number;
    max_results: number;
    estimated_leads: number;
    cost_estimate: number;
  } {
    return {
      max_searches: 100, // Google CSE daily limit
      max_results: 10000, // 100 searches * 100 results each
      estimated_leads: 5000, // Estimated unique leads after processing
      cost_estimate: 50 // $50 for 10,000 search requests
    };
  }
}

/**
 * Quick setup templates for common use cases
 */
export const GOOGLE_SEARCH_TEMPLATES = {
  'saas_executives': {
    strategies: ['linkedin_profiles', 'company_websites', 'conference_speakers'],
    maxResults: 2000,
    estimatedCost: 20,
    estimatedLeads: 1500
  },
  'technical_leaders': {
    strategies: ['github_profiles', 'conference_speakers', 'linkedin_profiles'],
    maxResults: 1500,
    estimatedCost: 15,
    estimatedLeads: 1000
  },
  'startup_founders': {
    strategies: ['press_releases', 'podcast_guests', 'directory_sites'],
    maxResults: 1000,
    estimatedCost: 10,
    estimatedLeads: 800
  },
  'high_volume_prospecting': {
    strategies: ['linkedin_profiles', 'company_websites', 'directory_sites', 'job_postings'],
    maxResults: 5000,
    estimatedCost: 50,
    estimatedLeads: 3000
  }
};

export default GoogleSearchLeadGenerator;