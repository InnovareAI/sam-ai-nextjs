/**
 * ICP to Complete Leads Service
 * Connects SAM AI frontend to N8N workflow for complete lead generation
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

export interface LeadGenerationJob {
  id: string;
  status: 'pending' | 'searching' | 'scraping' | 'completed' | 'failed';
  icp: ICPCriteria;
  searchQueries: string[];
  linkedinUrls: string[];
  profiles: LeadProfile[];
  cost: number;
  urls_found: number;
  profiles_scraped: number;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export interface LeadProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  industry: string;
  about: string;
  linkedin_url: string;
  email?: string;
  phone?: string;
  company_website?: string;
  posts: LinkedInPost[];
  extracted_at: string;
  data_source: string;
  quality_score: number;
}

export interface LinkedInPost {
  id: string;
  title?: string;
  headline?: string;
  text: string;
  date_posted: string;
  url: string;
}

export interface ProgressUpdate {
  jobId: string;
  status: string;
  urlsFound?: number;
  profilesScraped?: number;
  cost?: number;
  error?: string;
}

export class ICPToLeadsService {
  private n8nWebhookUrl: string;
  private supabaseUrl: string;
  private supabaseKey: string;
  private progressCallbacks: Map<string, (update: ProgressUpdate) => void> = new Map();

  constructor() {
    this.n8nWebhookUrl = `${import.meta.env.VITE_N8N_URL}/webhook/icp-to-leads`;
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }

  /**
   * Start complete ICP-to-leads generation process
   */
  async generateLeads(
    icp: ICPCriteria,
    onProgress?: (update: ProgressUpdate) => void
  ): Promise<{ success: boolean; jobId: string; message: string }> {
    
    console.log('🎯 Starting ICP-to-leads generation:', icp);

    try {
      // Validate ICP data
      this.validateICP(icp);

      // Register progress callback
      if (onProgress) {
        const jobId = `job_${Date.now()}`;
        this.progressCallbacks.set(jobId, onProgress);
      }

      // Trigger N8N workflow
      const response = await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...icp,
          progressWebhook: `${window.location.origin}/api/progress`
        })
      });

      if (!response.ok) {
        throw new Error(`N8N workflow failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      console.log('✅ Lead generation started:', result);

      return {
        success: true,
        jobId: result.jobId,
        message: `Lead generation started with ${result.searchQueries} search queries`
      };

    } catch (error) {
      console.error('❌ Lead generation failed:', error);
      throw new Error(`Failed to start lead generation: ${error.message}`);
    }
  }

  /**
   * Get job status and progress from Supabase
   */
  async getJobStatus(jobId: string): Promise<LeadGenerationJob | null> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/lead_generation_jobs?job_id=eq.${jobId}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch job status: ${response.statusText}`);
      }

      const jobs = await response.json();
      
      if (jobs.length === 0) {
        return null;
      }

      const job = jobs[0];

      return {
        id: job.job_id,
        status: job.status,
        icp: job.icp_data,
        searchQueries: job.search_queries || [],
        linkedinUrls: job.linkedin_urls || [],
        profiles: [], // Will be loaded separately
        cost: parseFloat(job.total_cost) || 0,
        urls_found: job.urls_found || 0,
        profiles_scraped: job.profiles_scraped || 0,
        started_at: job.created_at,
        completed_at: job.completed_at
      };

    } catch (error) {
      console.error('❌ Failed to get job status:', error);
      return null;
    }
  }

  /**
   * Get generated leads for a job
   */
  async getJobLeads(jobId: string, limit: number = 100): Promise<LeadProfile[]> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/leads?job_id=eq.${jobId}&limit=${limit}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }

      const leads = await response.json();

      return leads.map(lead => ({
        id: lead.id,
        name: lead.name || 'Unknown',
        title: lead.title || '',
        company: lead.company || '',
        location: lead.location || '',
        industry: lead.industry || '',
        about: lead.about || '',
        linkedin_url: lead.linkedin_url || '',
        email: lead.email,
        phone: lead.phone,
        company_website: lead.company_website,
        posts: lead.posts || [],
        extracted_at: lead.extracted_at,
        data_source: lead.data_source || 'bright_data_linkedin',
        quality_score: lead.quality_score || 0
      }));

    } catch (error) {
      console.error('❌ Failed to get job leads:', error);
      return [];
    }
  }

  /**
   * Get recent lead generation jobs
   */
  async getRecentJobs(limit: number = 10): Promise<LeadGenerationJob[]> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/lead_generation_summary?order=created_at.desc&limit=${limit}`,
        {
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch recent jobs: ${response.statusText}`);
      }

      const jobs = await response.json();

      return jobs.map(job => ({
        id: job.job_id,
        status: job.status,
        icp: job.icp_data,
        searchQueries: [],
        linkedinUrls: [],
        profiles: [],
        cost: parseFloat(job.total_cost) || 0,
        urls_found: job.urls_found || 0,
        profiles_scraped: job.profiles_scraped || 0,
        started_at: job.created_at,
        completed_at: job.completed_at
      }));

    } catch (error) {
      console.error('❌ Failed to get recent jobs:', error);
      return [];
    }
  }

  /**
   * Export leads to CSV
   */
  async exportLeadsToCSV(jobId: string): Promise<string> {
    const leads = await this.getJobLeads(jobId, 10000);
    
    if (leads.length === 0) {
      throw new Error('No leads found for export');
    }

    const headers = [
      'Name', 'Title', 'Company', 'Location', 'Industry', 
      'LinkedIn URL', 'Email', 'Phone', 'Company Website', 
      'About', 'Recent Posts', 'Extracted Date', 'Quality Score'
    ];

    const csvRows = [headers.join(',')];

    leads.forEach(lead => {
      const row = [
        this.escapeCSV(lead.name),
        this.escapeCSV(lead.title),
        this.escapeCSV(lead.company),
        this.escapeCSV(lead.location),
        this.escapeCSV(lead.industry),
        this.escapeCSV(lead.linkedin_url),
        this.escapeCSV(lead.email || ''),
        this.escapeCSV(lead.phone || ''),
        this.escapeCSV(lead.company_website || ''),
        this.escapeCSV(lead.about.substring(0, 200)),
        this.escapeCSV(lead.posts.map(p => p.text).join(' | ')),
        lead.extracted_at,
        lead.quality_score
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Handle progress updates from N8N workflow
   */
  handleProgressUpdate(update: ProgressUpdate) {
    const callback = this.progressCallbacks.get(update.jobId);
    if (callback) {
      callback(update);
    }
  }

  /**
   * Estimate cost for ICP parameters
   */
  estimateCost(targetCount: number): {
    search_cost: number;
    scraping_cost: number;
    total_cost: number;
    breakdown: string;
  } {
    const searchCost = 0; // Free tier MCP
    const scrapingCost = targetCount * 0.0015; // $1.50 per 1,000
    const totalCost = searchCost + scrapingCost;

    return {
      search_cost: searchCost,
      scraping_cost: scrapingCost,
      total_cost: totalCost,
      breakdown: `Search: FREE + Scraping: $${scrapingCost.toFixed(2)} = $${totalCost.toFixed(2)}`
    };
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    total_jobs: number;
    completed_jobs: number;
    total_profiles: number;
    total_cost: number;
    average_processing_time: number;
  }> {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/rest/v1/rpc/get_processing_stats`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        return await response.json();
      }

      // Fallback stats
      return {
        total_jobs: 0,
        completed_jobs: 0,
        total_profiles: 0,
        total_cost: 0,
        average_processing_time: 0
      };

    } catch (error) {
      console.error('❌ Failed to get processing stats:', error);
      return {
        total_jobs: 0,
        completed_jobs: 0,
        total_profiles: 0,
        total_cost: 0,
        average_processing_time: 0
      };
    }
  }

  // Private helper methods
  private validateICP(icp: ICPCriteria) {
    if (!icp.industry?.trim()) {
      throw new Error('Industry is required');
    }
    
    if (!icp.jobTitles || icp.jobTitles.length === 0) {
      throw new Error('At least one job title is required');
    }

    if (!icp.targetCount || icp.targetCount < 1) {
      throw new Error('Target count must be at least 1');
    }

    if (icp.targetCount > 50000) {
      throw new Error('Target count cannot exceed 50,000 profiles');
    }
  }

  private escapeCSV(value: string): string {
    if (!value) return '';
    
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    const escaped = value.replace(/"/g, '""');
    
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')) {
      return `"${escaped}"`;
    }
    
    return escaped;
  }
}

export default ICPToLeadsService;