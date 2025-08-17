/**
 * Bright Data Integration for SAM AI
 * Access pre-scraped datasets instead of expensive Apollo API
 */

export interface BrightDataDataset {
  id: string;
  name: string;
  description: string;
  recordCount: number;
  lastUpdated: string;
  costPerRecord: number;
  categories: string[];
  dataPoints: string[];
  sampleData?: any[];
}

export interface BrightDataLead {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  location: string;
  industry: string;
  company_size?: string;
  revenue?: string;
  technologies?: string[];
  website?: string;
  social_media?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  enrichment_score: number;
  data_source: string;
  last_verified: string;
}

export interface BrightDataSearchResult {
  query_id: string;
  total_records: number;
  processed_records: number;
  leads: BrightDataLead[];
  cost_breakdown: {
    dataset_cost: number;
    processing_cost: number;
    total_cost: number;
  };
  data_sources: string[];
  execution_time: number;
}

/**
 * Available Bright Data datasets for B2B prospecting
 */
export const BRIGHT_DATA_DATASETS: BrightDataDataset[] = [
  {
    id: 'linkedin_professionals_us',
    name: 'LinkedIn Professionals - US',
    description: 'US-based LinkedIn professionals with comprehensive profile data',
    recordCount: 15000000,
    lastUpdated: '2025-01-15',
    costPerRecord: 0.001,
    categories: ['professionals', 'b2b', 'linkedin'],
    dataPoints: ['name', 'title', 'company', 'location', 'industry', 'connections', 'experience']
  },
  {
    id: 'saas_executives_global',
    name: 'SaaS Executives - Global',
    description: 'C-level and VP executives from SaaS companies worldwide',
    recordCount: 500000,
    lastUpdated: '2025-01-10',
    costPerRecord: 0.002,
    categories: ['executives', 'saas', 'c-level'],
    dataPoints: ['name', 'title', 'company', 'email', 'phone', 'linkedin', 'company_size', 'revenue']
  },
  {
    id: 'startup_founders_2024',
    name: 'Startup Founders 2024',
    description: 'Founders and co-founders from startups with recent funding',
    recordCount: 75000,
    lastUpdated: '2025-01-05',
    costPerRecord: 0.003,
    categories: ['founders', 'startups', 'funding'],
    dataPoints: ['name', 'title', 'company', 'email', 'funding_round', 'investors', 'technologies']
  },
  {
    id: 'tech_decision_makers',
    name: 'Tech Decision Makers',
    description: 'CTOs, VP Engineering, Tech Directors across all industries',
    recordCount: 800000,
    lastUpdated: '2025-01-08',
    costPerRecord: 0.0015,
    categories: ['technology', 'decision-makers', 'engineering'],
    dataPoints: ['name', 'title', 'company', 'email', 'technologies', 'team_size', 'budget_authority']
  },
  {
    id: 'ecommerce_companies',
    name: 'E-commerce Companies Database',
    description: 'E-commerce companies with contact information and tech stack',
    recordCount: 200000,
    lastUpdated: '2025-01-12',
    costPerRecord: 0.002,
    categories: ['ecommerce', 'companies', 'retail'],
    dataPoints: ['company', 'contacts', 'revenue', 'technologies', 'platform', 'traffic', 'employees']
  },
  {
    id: 'marketing_professionals',
    name: 'Marketing Professionals',
    description: 'Marketing directors, managers, and specialists with contact info',
    recordCount: 1200000,
    lastUpdated: '2025-01-14',
    costPerRecord: 0.0012,
    categories: ['marketing', 'professionals', 'contacts'],
    dataPoints: ['name', 'title', 'company', 'email', 'specializations', 'tools', 'budget']
  }
];

export class BrightDataService {
  private apiToken: string;
  private baseUrl: string = 'https://api.brightdata.com/datasets/v1';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  /**
   * Browse available datasets with filtering
   */
  async listDatasets(category?: string): Promise<BrightDataDataset[]> {
    try {
      console.log('🔍 Browsing Bright Data datasets...');
      
      // In production, this would call the actual Bright Data API
      let datasets = BRIGHT_DATA_DATASETS;
      
      if (category) {
        datasets = datasets.filter(dataset => 
          dataset.categories.includes(category.toLowerCase())
        );
      }

      return datasets.map(dataset => ({
        ...dataset,
        costPerRecord: dataset.costPerRecord,
        recordCount: dataset.recordCount
      }));

    } catch (error) {
      console.error('❌ Failed to list datasets:', error);
      throw new Error('Failed to retrieve dataset catalog');
    }
  }

  /**
   * Purchase and download dataset
   */
  async purchaseDataset(
    datasetId: string,
    maxRecords: number = 10000,
    filters?: {
      location?: string[];
      industry?: string[];
      company_size?: string[];
      title_keywords?: string[];
    }
  ): Promise<BrightDataSearchResult> {
    
    console.log(`📦 Purchasing Bright Data dataset: ${datasetId}`);
    
    const dataset = BRIGHT_DATA_DATASETS.find(d => d.id === datasetId);
    if (!dataset) {
      throw new Error(`Dataset ${datasetId} not found`);
    }

    const startTime = Date.now();

    try {
      // Simulate API call to Bright Data
      const response = await this.callBrightDataAPI('/purchase', {
        dataset_id: datasetId,
        max_records: maxRecords,
        filters: filters
      });

      // Process the dataset
      const leads = await this.processDatasetRecords(response.data, dataset);
      
      // Apply filters if provided
      const filteredLeads = this.applyFilters(leads, filters);
      
      const costBreakdown = {
        dataset_cost: filteredLeads.length * dataset.costPerRecord,
        processing_cost: filteredLeads.length * 0.0001, // Processing fee
        total_cost: filteredLeads.length * (dataset.costPerRecord + 0.0001)
      };

      return {
        query_id: `bright_data_${datasetId}_${Date.now()}`,
        total_records: filteredLeads.length,
        processed_records: filteredLeads.length,
        leads: filteredLeads.slice(0, maxRecords),
        cost_breakdown: costBreakdown,
        data_sources: [dataset.name],
        execution_time: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ Dataset purchase failed:', error);
      throw new Error(`Failed to purchase dataset: ${error.message}`);
    }
  }

  /**
   * Process raw dataset records into SAM AI format
   */
  private async processDatasetRecords(
    rawData: any[], 
    dataset: BrightDataDataset
  ): Promise<BrightDataLead[]> {
    
    const processedLeads: BrightDataLead[] = [];

    for (const record of rawData) {
      try {
        const lead: BrightDataLead = {
          id: record.id || `bd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: this.cleanName(record.name || record.full_name),
          title: record.title || record.position || '',
          company: record.company || record.company_name || '',
          email: this.validateEmail(record.email),
          phone: this.cleanPhone(record.phone),
          linkedin_url: record.linkedin_url || record.linkedin_profile,
          location: record.location || record.city || '',
          industry: record.industry || record.sector || '',
          company_size: record.company_size || record.employees,
          revenue: record.revenue || record.annual_revenue,
          technologies: record.technologies || record.tech_stack || [],
          website: record.website || record.company_website,
          social_media: {
            twitter: record.twitter_url,
            facebook: record.facebook_url,
            instagram: record.instagram_url
          },
          enrichment_score: this.calculateEnrichmentScore(record),
          data_source: dataset.name,
          last_verified: dataset.lastUpdated
        };

        // Only include leads with minimum data quality
        if (lead.name && lead.company && (lead.email || lead.linkedin_url)) {
          processedLeads.push(lead);
        }

      } catch (error) {
        console.error('❌ Failed to process record:', error);
        continue;
      }
    }

    return processedLeads;
  }

  /**
   * Apply filters to dataset results
   */
  private applyFilters(
    leads: BrightDataLead[], 
    filters?: {
      location?: string[];
      industry?: string[];
      company_size?: string[];
      title_keywords?: string[];
    }
  ): BrightDataLead[] {
    
    if (!filters) return leads;

    return leads.filter(lead => {
      // Location filter
      if (filters.location && filters.location.length > 0) {
        const matchesLocation = filters.location.some(loc => 
          lead.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      // Industry filter
      if (filters.industry && filters.industry.length > 0) {
        const matchesIndustry = filters.industry.some(ind => 
          lead.industry.toLowerCase().includes(ind.toLowerCase())
        );
        if (!matchesIndustry) return false;
      }

      // Company size filter
      if (filters.company_size && filters.company_size.length > 0) {
        const matchesSize = filters.company_size.some(size => 
          lead.company_size?.toLowerCase().includes(size.toLowerCase())
        );
        if (!matchesSize) return false;
      }

      // Title keywords filter
      if (filters.title_keywords && filters.title_keywords.length > 0) {
        const matchesTitle = filters.title_keywords.some(keyword => 
          lead.title.toLowerCase().includes(keyword.toLowerCase())
        );
        if (!matchesTitle) return false;
      }

      return true;
    });
  }

  /**
   * Calculate enrichment score based on available data points
   */
  private calculateEnrichmentScore(record: any): number {
    let score = 0.2; // Base score

    // Essential data points
    if (record.name) score += 0.15;
    if (record.title) score += 0.15;
    if (record.company) score += 0.1;
    if (record.email) score += 0.2;
    if (record.phone) score += 0.1;
    if (record.linkedin_url) score += 0.1;

    return Math.min(score, 1.0);
  }

  /**
   * Data cleaning utilities
   */
  private cleanName(name: string): string {
    if (!name) return '';
    return name.replace(/[^\w\s.-]/g, '').trim();
  }

  private validateEmail(email: string): string | undefined {
    if (!email) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email.toLowerCase() : undefined;
  }

  private cleanPhone(phone: string): string | undefined {
    if (!phone) return undefined;
    return phone.replace(/[^\d+()-\s]/g, '').trim();
  }

  /**
   * Mock API call (replace with actual Bright Data API)
   */
  private async callBrightDataAPI(endpoint: string, data: any): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock response based on dataset
    const mockData = this.generateMockDatasetResponse(data.dataset_id, data.max_records);
    
    return {
      status: 'success',
      data: mockData
    };
  }

  /**
   * Generate mock dataset response for testing
   */
  private generateMockDatasetResponse(datasetId: string, maxRecords: number): any[] {
    const mockRecords = [];
    const recordCount = Math.min(maxRecords, 100); // Limit for demo

    for (let i = 0; i < recordCount; i++) {
      const mockRecord = {
        id: `bd_${datasetId}_${i}`,
        name: `John Doe ${i}`,
        title: ['CEO', 'CTO', 'VP Sales', 'Director Marketing'][i % 4],
        company: `Company ${i} Inc`,
        email: `john.doe${i}@company${i}.com`,
        phone: `+1-555-${String(i).padStart(4, '0')}`,
        linkedin_url: `https://linkedin.com/in/johndoe${i}`,
        location: ['New York, NY', 'San Francisco, CA', 'Boston, MA', 'Austin, TX'][i % 4],
        industry: ['Technology', 'SaaS', 'Fintech', 'Healthcare'][i % 4],
        company_size: ['1-10', '11-50', '51-200', '201-500'][i % 4],
        website: `https://company${i}.com`
      };
      mockRecords.push(mockRecord);
    }

    return mockRecords;
  }

  /**
   * Get dataset recommendations based on SAM AI use case
   */
  getRecommendedDatasets(useCase: 'saas_prospecting' | 'startup_outreach' | 'enterprise_sales' | 'tech_recruitment'): BrightDataDataset[] {
    const recommendations = {
      saas_prospecting: ['saas_executives_global', 'tech_decision_makers', 'marketing_professionals'],
      startup_outreach: ['startup_founders_2024', 'saas_executives_global', 'tech_decision_makers'],
      enterprise_sales: ['saas_executives_global', 'tech_decision_makers', 'linkedin_professionals_us'],
      tech_recruitment: ['tech_decision_makers', 'linkedin_professionals_us', 'startup_founders_2024']
    };

    const recommendedIds = recommendations[useCase] || [];
    return BRIGHT_DATA_DATASETS.filter(dataset => recommendedIds.includes(dataset.id));
  }

  /**
   * Estimate costs for different volume scenarios
   */
  estimateCosts(datasetId: string, recordCount: number): {
    dataset_cost: number;
    processing_cost: number;
    total_cost: number;
    cost_per_lead: number;
    vs_apollo_savings: number;
  } {
    const dataset = BRIGHT_DATA_DATASETS.find(d => d.id === datasetId);
    if (!dataset) throw new Error('Dataset not found');

    const datasetCost = recordCount * dataset.costPerRecord;
    const processingCost = recordCount * 0.0001;
    const totalCost = datasetCost + processingCost;
    const costPerLead = totalCost / recordCount;
    const apolloCost = recordCount * 0.20; // Apollo's $0.20/credit
    const savings = apolloCost - totalCost;

    return {
      dataset_cost: datasetCost,
      processing_cost: processingCost,
      total_cost: totalCost,
      cost_per_lead: costPerLead,
      vs_apollo_savings: savings
    };
  }
}

export default BrightDataService;