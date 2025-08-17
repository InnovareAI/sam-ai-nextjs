/**
 * Bright Data LinkedIn Scraper Interface for SAM AI
 * Pay-as-you-go LinkedIn profile and company scraping
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Building2, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';

interface LinkedInScrapingJob {
  id: string;
  type: 'profiles' | 'companies' | 'bulk';
  status: 'pending' | 'running' | 'completed' | 'failed';
  urls_count: number;
  processed_count: number;
  cost: number;
  started_at: string;
  completed_at?: string;
  error?: string;
}

export default function BrightDataLinkedInInterface() {
  const [profileUrls, setProfileUrls] = useState<string>('');
  const [companyUrls, setCompanyUrls] = useState<string>('');
  const [includePosts, setIncludePosts] = useState<boolean>(true);
  const [maxPosts, setMaxPosts] = useState<number>(5);
  const [jobs, setJobs] = useState<LinkedInScrapingJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Cost calculations
  const costPerRecord = 0.0015; // $1.50 per 1,000
  const profileUrlsList = profileUrls.split('\n').filter(url => url.trim());
  const companyUrlsList = companyUrls.split('\n').filter(url => url.trim());
  const estimatedCost = (profileUrlsList.length + companyUrlsList.length) * costPerRecord;

  const handleStartScraping = async (type: 'profiles' | 'companies' | 'bulk') => {
    setIsLoading(true);
    
    const newJob: LinkedInScrapingJob = {
      id: `job_${Date.now()}`,
      type,
      status: 'running',
      urls_count: type === 'profiles' ? profileUrlsList.length : 
                  type === 'companies' ? companyUrlsList.length : 
                  profileUrlsList.length + companyUrlsList.length,
      processed_count: 0,
      cost: 0,
      started_at: new Date().toISOString()
    };

    setJobs(prev => [newJob, ...prev]);

    try {
      // Simulate scraping process
      await simulateScraping(newJob, type);
    } catch (error) {
      console.error('Scraping failed:', error);
      updateJobStatus(newJob.id, 'failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateScraping = async (job: LinkedInScrapingJob, type: string) => {
    // Simulate progressive processing
    const totalUrls = job.urls_count;
    const batchSize = 10;
    
    for (let processed = 0; processed < totalUrls; processed += batchSize) {
      const currentBatch = Math.min(batchSize, totalUrls - processed);
      const newProcessed = processed + currentBatch;
      const newCost = newProcessed * costPerRecord;
      
      // Update progress
      setJobs(prev => prev.map(j => 
        j.id === job.id 
          ? { ...j, processed_count: newProcessed, cost: newCost }
          : j
      ));
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Complete the job
    updateJobStatus(job.id, 'completed');
  };

  const updateJobStatus = (jobId: string, status: 'completed' | 'failed', error?: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            status, 
            completed_at: new Date().toISOString(),
            error 
          }
        : job
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Bright Data LinkedIn Scraper - Pay-as-you-go
          </CardTitle>
          <CardDescription>
            Real-time LinkedIn profile and company data extraction at $1.50 per 1,000 records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$1.50</div>
              <div className="text-sm text-gray-600">Per 1,000 Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Real-time</div>
              <div className="text-sm text-gray-600">Fresh Data + Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5K</div>
              <div className="text-sm text-gray-600">Bulk Processing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">${estimatedCost.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Current Estimate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn Profiles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              LinkedIn Profiles
            </CardTitle>
            <CardDescription>
              Enter LinkedIn profile URLs (one per line)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={profileUrls}
              onChange={(e) => setProfileUrls(e.target.value)}
              placeholder={`https://linkedin.com/in/johndoe
https://linkedin.com/in/janedoe
https://linkedin.com/in/ceotech`}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{profileUrlsList.length} URLs</span>
              <span>Cost: ${(profileUrlsList.length * costPerRecord).toFixed(2)}</span>
            </div>
            
            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includePosts}
                  onChange={(e) => setIncludePosts(e.target.checked)}
                />
                <span className="text-sm">Include recent posts</span>
              </label>
              
              {includePosts && (
                <div className="ml-6">
                  <label className="text-sm text-gray-600">
                    Max posts per profile:
                    <select 
                      value={maxPosts} 
                      onChange={(e) => setMaxPosts(parseInt(e.target.value))}
                      className="ml-2 border rounded px-2 py-1"
                    >
                      <option value={3}>3</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <Button 
              onClick={() => handleStartScraping('profiles')}
              disabled={profileUrlsList.length === 0 || isLoading}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Scrape Profiles (${(profileUrlsList.length * costPerRecord).toFixed(2)})
            </Button>
          </CardContent>
        </Card>

        {/* LinkedIn Companies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              LinkedIn Companies
            </CardTitle>
            <CardDescription>
              Enter LinkedIn company URLs (one per line)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={companyUrls}
              onChange={(e) => setCompanyUrls(e.target.value)}
              placeholder={`https://linkedin.com/company/microsoft
https://linkedin.com/company/google
https://linkedin.com/company/apple`}
              rows={6}
              className="font-mono text-sm"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{companyUrlsList.length} URLs</span>
              <span>Cost: ${(companyUrlsList.length * costPerRecord).toFixed(2)}</span>
            </div>

            <Button 
              onClick={() => handleStartScraping('companies')}
              disabled={companyUrlsList.length === 0 || isLoading}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Scrape Companies (${(companyUrlsList.length * costPerRecord).toFixed(2)})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Action */}
      {(profileUrlsList.length > 0 || companyUrlsList.length > 0) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800">Bulk Scraping</h3>
                <p className="text-sm text-green-700">
                  Process {profileUrlsList.length} profiles + {companyUrlsList.length} companies together
                </p>
              </div>
              <Button 
                onClick={() => handleStartScraping('bulk')}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Bulk Scrape (${estimatedCost.toFixed(2)})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scraping Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Scraping Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-medium capitalize">{job.type} Scraping</span>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${job.cost.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Progress:</span>
                      <div className="font-medium">
                        {job.processed_count}/{job.urls_count} URLs
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Started:</span>
                      <div className="font-medium">
                        {new Date(job.started_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <div className="font-medium">
                        {job.completed_at 
                          ? `${Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)}s`
                          : 'Running...'
                        }
                      </div>
                    </div>
                    <div>
                      {job.status === 'completed' && (
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      )}
                    </div>
                  </div>

                  {job.status === 'running' && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${(job.processed_count / job.urls_count) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {job.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      Error: {job.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">${(1000 * costPerRecord).toFixed(0)}</div>
              <div className="text-sm text-gray-600">1,000 records</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">${(10000 * costPerRecord).toFixed(0)}</div>
              <div className="text-sm text-gray-600">10,000 records</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold">${(30000 * costPerRecord).toFixed(0)}</div>
              <div className="text-sm text-gray-600">30,000 records</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Pay-as-you-go Benefits:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• No monthly fees or commitments</li>
              <li>• Pay only for successful extractions</li>
              <li>• Real-time LinkedIn data with recent posts</li>
              <li>• Scale up or down as needed</li>
              <li>• Perfect for testing and variable volume</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}