/**
 * ICP Description → Complete Lead Data
 * Step 1: User describes ICP, Bright Data delivers complete lead profiles
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Target, 
  Search, 
  Users, 
  Building2, 
  MapPin, 
  DollarSign,
  Play,
  Clock,
  CheckCircle,
  Download,
  Sparkles
} from 'lucide-react';

interface ICPCriteria {
  industry: string;
  jobTitles: string[];
  companySize: string;
  location: string;
  companyStage: string;
  additionalCriteria: string;
}

interface LeadGenerationJob {
  id: string;
  status: 'searching' | 'scraping' | 'completed' | 'failed';
  icp: ICPCriteria;
  searchQueries: string[];
  linkedinUrls: string[];
  profiles: any[];
  cost: number;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export default function ICPToLeadsInterface() {
  const [icp, setIcp] = useState<ICPCriteria>({
    industry: '',
    jobTitles: [],
    companySize: '',
    location: '',
    companyStage: '',
    additionalCriteria: ''
  });

  const [jobTitlesInput, setJobTitlesInput] = useState<string>('');
  const [targetCount, setTargetCount] = useState<number>(1000);
  const [jobs, setJobs] = useState<LeadGenerationJob[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Cost calculations
  const searchCost = 0; // Free tier MCP
  const scrapingCost = targetCount * 0.0015; // $1.50 per 1,000
  const totalCost = searchCost + scrapingCost;

  const handleStartLeadGeneration = async () => {
    if (!icp.industry || !jobTitlesInput) {
      alert('Please fill in at least Industry and Job Titles');
      return;
    }

    setIsProcessing(true);

    const newJob: LeadGenerationJob = {
      id: `job_${Date.now()}`,
      status: 'searching',
      icp: {
        ...icp,
        jobTitles: jobTitlesInput.split(',').map(title => title.trim())
      },
      searchQueries: [],
      linkedinUrls: [],
      profiles: [],
      cost: 0,
      started_at: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);

    try {
      await simulateLeadGeneration(newJob);
    } catch (error) {
      console.error('Lead generation failed:', error);
      updateJobStatus(newJob.id, 'failed', error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateLeadGeneration = async (job: LeadGenerationJob) => {
    // Step 1: Generate search queries
    updateJobData(job.id, { status: 'searching' });
    const searchQueries = generateSearchQueries(job.icp);
    updateJobData(job.id, { searchQueries });
    await delay(2000);

    // Step 2: Execute searches and collect LinkedIn URLs
    let allLinkedInUrls: string[] = [];
    for (let i = 0; i < searchQueries.length; i++) {
      const mockUrls = generateMockLinkedInUrls(Math.floor(targetCount / searchQueries.length));
      allLinkedInUrls.push(...mockUrls);
      updateJobData(job.id, { linkedinUrls: allLinkedInUrls });
      await delay(1500);
    }

    // Step 3: Start LinkedIn profile scraping
    updateJobData(job.id, { status: 'scraping' });
    await delay(1000);

    // Step 4: Progressive profile scraping
    const profiles: any[] = [];
    const batchSize = 50;
    
    for (let i = 0; i < allLinkedInUrls.length; i += batchSize) {
      const batch = allLinkedInUrls.slice(i, i + batchSize);
      const batchProfiles = generateMockProfiles(batch);
      profiles.push(...batchProfiles);
      
      const currentCost = profiles.length * 0.0015;
      updateJobData(job.id, { 
        profiles: [...profiles], 
        cost: currentCost 
      });
      
      await delay(2000);
    }

    // Step 5: Complete
    updateJobData(job.id, { 
      status: 'completed',
      completed_at: new Date().toISOString()
    });
  };

  const generateSearchQueries = (icpData: ICPCriteria): string[] => {
    const queries: string[] = [];
    const jobTitles = icpData.jobTitles;
    
    // GOOGLE CUSTOM SEARCH: PRIMARY DISCOVERY METHOD
    // Google indexes ALL public LinkedIn profiles - this is our core search strategy
    jobTitles.forEach(title => {
      // Core precision queries using Google's comprehensive LinkedIn indexing
      queries.push(`"${title}" "${icpData.industry}" site:linkedin.com/in/`);
      queries.push(`"${title}" "${icpData.location}" site:linkedin.com/in/`);
      
      // Multi-criteria combinations for better targeting
      if (icpData.location && icpData.industry) {
        queries.push(`"${title}" "${icpData.industry}" "${icpData.location}" site:linkedin.com/in/`);
      }
      
      // Company size targeting (LinkedIn profiles often mention company size)
      if (icpData.companySize) {
        queries.push(`"${title}" "${icpData.companySize}" site:linkedin.com/in/`);
        queries.push(`"${title}" "${icpData.industry}" "${icpData.companySize}" site:linkedin.com/in/`);
      }
      
      // Company stage/funding specific (Google indexes this from LinkedIn profiles)
      if (icpData.companyStage) {
        queries.push(`"${title}" "${icpData.companyStage}" site:linkedin.com/in/`);
        queries.push(`"${title}" "${icpData.companyStage}" "${icpData.industry}" site:linkedin.com/in/`);
      }
    });

    // Broad industry searches for comprehensive coverage
    queries.push(`"CEO" "${icpData.industry}" site:linkedin.com/in/`);
    queries.push(`"VP" "${icpData.industry}" site:linkedin.com/in/`);
    queries.push(`"Director" "${icpData.industry}" site:linkedin.com/in/`);
    queries.push(`"Chief" "${icpData.industry}" site:linkedin.com/in/`);
    
    // Location-specific executive searches
    if (icpData.location) {
      queries.push(`"CEO" "${icpData.location}" site:linkedin.com/in/`);
      queries.push(`"VP" "${icpData.location}" site:linkedin.com/in/`);
    }

    console.log(`🔍 Generated ${queries.length} Google Search queries for comprehensive LinkedIn discovery`);
    return queries.slice(0, 40); // Optimize for Google's free tier (100 queries/day)
  };

  const generateMockLinkedInUrls = (count: number): string[] => {
    const urls: string[] = [];
    for (let i = 0; i < count; i++) {
      urls.push(`https://linkedin.com/in/professional-${Date.now()}-${i}`);
    }
    return urls;
  };

  const generateMockProfiles = (urls: string[]): any[] => {
    return urls.map((url, index) => ({
      id: `profile_${Date.now()}_${index}`,
      name: `Professional Name ${index}`,
      title: ['CEO', 'VP Sales', 'CTO', 'Head of Marketing'][index % 4],
      company: `TechCorp ${index}`,
      location: 'San Francisco, CA',
      industry: icp.industry,
      linkedin_url: url,
      email: `professional${index}@techcorp${index}.com`,
      company_website: `https://techcorp${index}.com`,
      extracted_at: new Date().toISOString()
    }));
  };

  const updateJobData = (jobId: string, updates: Partial<LeadGenerationJob>) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, ...updates } : job
    ));
  };

  const updateJobStatus = (jobId: string, status: string, error?: string) => {
    updateJobData(jobId, { status: status as any, error });
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'searching': return <Search className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'scraping': return <Users className="h-4 w-4 text-purple-600 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <div className="h-4 w-4 bg-red-600 rounded-full" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'searching': return 'bg-blue-100 text-blue-800';
      case 'scraping': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            ICP → Complete Lead Profiles
          </CardTitle>
          <CardDescription>
            Describe your Ideal Customer Profile, get complete LinkedIn + website data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">FREE</div>
              <div className="text-sm text-gray-600">Google Search Discovery</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">$1.50</div>
              <div className="text-sm text-gray-600">Per 1K Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{targetCount}</div>
              <div className="text-sm text-gray-600">Target Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${totalCost.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ICP Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Describe Your Ideal Customer Profile
          </CardTitle>
          <CardDescription>
            SAM AI will automatically find and scrape matching LinkedIn profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Industry/Vertical *</label>
              <Input
                value={icp.industry}
                onChange={(e) => setIcp({...icp, industry: e.target.value})}
                placeholder="e.g., SaaS, FinTech, Healthcare, E-commerce"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Target Job Titles *</label>
              <Input
                value={jobTitlesInput}
                onChange={(e) => setJobTitlesInput(e.target.value)}
                placeholder="CEO, VP Sales, CTO, Head of Marketing"
              />
              <div className="text-xs text-gray-500 mt-1">Separate multiple titles with commas</div>
            </div>

            <div>
              <label className="text-sm font-medium">Company Size</label>
              <Input
                value={icp.companySize}
                onChange={(e) => setIcp({...icp, companySize: e.target.value})}
                placeholder="e.g., 50-200 employees, Series A-C"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={icp.location}
                onChange={(e) => setIcp({...icp, location: e.target.value})}
                placeholder="e.g., San Francisco, NYC, US, Global"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Company Stage</label>
              <Input
                value={icp.companyStage}
                onChange={(e) => setIcp({...icp, companyStage: e.target.value})}
                placeholder="e.g., Startup, Growth, Enterprise"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Target Profile Count</label>
              <Input
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1000)}
                placeholder="1000"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Additional Criteria</label>
            <Textarea
              value={icp.additionalCriteria}
              onChange={(e) => setIcp({...icp, additionalCriteria: e.target.value})}
              placeholder="Any additional criteria like technology stack, funding stage, specific keywords..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium">Ready to Generate Leads</h4>
              <p className="text-sm text-gray-600">
                Cost: ${totalCost.toFixed(2)} for {targetCount} complete profiles
              </p>
            </div>
            <Button 
              onClick={handleStartLeadGeneration}
              disabled={!icp.industry || !jobTitlesInput || isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Generate {targetCount} Leads
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lead Generation Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium">
                        {job.icp.industry} - {job.icp.jobTitles.join(', ')}
                      </span>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium text-gray-600">
                      ${job.cost.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Search Queries:</span>
                      <div className="font-medium">{job.searchQueries.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">LinkedIn URLs:</span>
                      <div className="font-medium">{job.linkedinUrls.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Profiles Scraped:</span>
                      <div className="font-medium">{job.profiles.length}</div>
                    </div>
                    <div>
                      {job.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export {job.profiles.length} Leads
                        </Button>
                      )}
                    </div>
                  </div>

                  {(job.status === 'searching' || job.status === 'scraping') && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                          style={{ 
                            width: job.status === 'searching' ? '25%' : 
                                   `${25 + (job.profiles.length / targetCount) * 75}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {job.status === 'searching' ? 'Finding LinkedIn URLs...' : 
                         `Scraping profiles: ${job.profiles.length}/${targetCount}`}
                      </div>
                    </div>
                  )}

                  {job.error && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      Error: {job.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Search className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800">1. Google Discovery</h4>
              <p className="text-sm text-blue-700">Find ALL public LinkedIn profiles via Google Search</p>
              <div className="text-xs text-blue-600 mt-1">FREE (100 searches/day)</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-800">2. Profile Scraping</h4>
              <p className="text-sm text-purple-700">Extract complete LinkedIn profile data</p>
              <div className="text-xs text-purple-600 mt-1">$1.50 per 1,000 profiles</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800">3. Website Enrichment</h4>
              <p className="text-sm text-green-700">Add company website contact data</p>
              <div className="text-xs text-green-600 mt-1">FREE (Website crawling)</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Download className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium text-orange-800">4. Export Data</h4>
              <p className="text-sm text-orange-700">Download complete lead database</p>
              <div className="text-xs text-orange-600 mt-1">CSV, JSON, CRM sync</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}