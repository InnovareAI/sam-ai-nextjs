/**
 * Google LinkedIn Discovery Interface
 * Primary lead generation using Google's comprehensive LinkedIn indexing
 * FREE discovery of 100-3000+ profiles based on client needs
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Users, 
  DollarSign, 
  Play, 
  CheckCircle, 
  Clock,
  Download,
  Zap,
  Globe,
  Target,
  TrendingUp
} from 'lucide-react';
import GoogleLinkedInDiscoveryService, { ICPCriteria, GoogleDiscoveryResults } from '@/services/GoogleLinkedInDiscoveryService';

interface GoogleLinkedInInterfaceProps {
  onProfilesDiscovered?: (profiles: any[]) => void;
  onProceedToScraping?: (discoveredProfiles: any[]) => void;
}

export default function GoogleLinkedInInterface({ 
  onProfilesDiscovered, 
  onProceedToScraping 
}: GoogleLinkedInInterfaceProps) {
  const [icp, setIcp] = useState<ICPCriteria>({
    industry: '',
    jobTitles: [],
    companySize: '',
    location: '',
    companyStage: '',
    additionalCriteria: '',
    targetCount: 1000
  });

  const [jobTitlesInput, setJobTitlesInput] = useState('');
  const [targetCount, setTargetCount] = useState(1000);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState<GoogleDiscoveryResults | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);

  const discoveryService = new GoogleLinkedInDiscoveryService();

  const handleStartDiscovery = async () => {
    if (!icp.industry || !jobTitlesInput) {
      alert('Please fill in at least Industry and Job Titles');
      return;
    }

    setIsDiscovering(true);
    
    const icpData: ICPCriteria = {
      ...icp,
      jobTitles: jobTitlesInput.split(',').map(title => title.trim()),
      targetCount
    };

    try {
      console.log('🚀 Starting Google LinkedIn Discovery...');
      const results = await discoveryService.discoverLinkedInProfiles(icpData, {
        targetCount,
        prioritizeSeniority: true,
        includeAnalytics: true
      });

      setDiscoveryResults(results);
      
      if (onProfilesDiscovered) {
        onProfilesDiscovered(results.discovered_profiles);
      }

      console.log('✅ Discovery completed successfully!');
      
    } catch (error) {
      console.error('❌ Discovery failed:', error);
      alert(`Discovery failed: ${error.message}`);
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleProceedToScraping = () => {
    if (discoveryResults && onProceedToScraping) {
      onProceedToScraping(discoveryResults.discovered_profiles);
    }
  };

  const getCostEstimate = () => {
    const estimate = discoveryService.getCostEstimate(targetCount);
    return estimate;
  };

  const getScaleDescription = (count: number) => {
    if (count <= 100) return 'Quick Target List';
    if (count <= 1500) return 'Comprehensive Campaign';
    return 'Enterprise Database';
  };

  const costEstimate = getCostEstimate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            Google LinkedIn Discovery - FREE Lead Generation
          </CardTitle>
          <CardDescription>
            Use Google's comprehensive LinkedIn indexing to discover profiles matching your ICP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
                <DollarSign className="h-5 w-5" />
                $0.00
              </div>
              <div className="text-sm text-gray-600">Discovery Cost</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-600">
                <Search className="h-5 w-5" />
                {costEstimate.estimated_queries}
              </div>
              <div className="text-sm text-gray-600">Google Queries</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-purple-600">
                <Users className="h-5 w-5" />
                {targetCount}
              </div>
              <div className="text-sm text-gray-600">Target Profiles</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-600">
                <Clock className="h-5 w-5" />
                {costEstimate.estimated_time}
              </div>
              <div className="text-sm text-gray-600">Discovery Time</div>
            </div>
          </div>

          <Alert>
            <Search className="h-4 w-4" />
            <AlertDescription>
              <strong>Google's Advantage:</strong> Google indexes ALL public LinkedIn profiles, giving us 
              comprehensive coverage that LinkedIn's API restrictions can't match. 100% free discovery!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* ICP Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configure Your Ideal Customer Profile
          </CardTitle>
          <CardDescription>
            Google will search ALL LinkedIn profiles for matches to these criteria
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
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 1000;
                  setTargetCount(count);
                  setIcp({...icp, targetCount: count});
                }}
                placeholder="1000"
              />
              <div className="text-xs text-gray-500 mt-1">{getScaleDescription(targetCount)}</div>
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

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium">Ready to Discover LinkedIn Profiles</h4>
              <p className="text-sm text-gray-600">
                Free discovery of {targetCount} profiles using Google's comprehensive indexing
              </p>
            </div>
            <Button 
              onClick={handleStartDiscovery}
              disabled={!icp.industry || !jobTitlesInput || isDiscovering}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isDiscovering ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Discover {targetCount} Profiles
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Discovery Results */}
      {discoveryResults && (
        <>
          {/* Summary Stats */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Discovery Complete! Found {discoveryResults.unique_profiles_found} Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{discoveryResults.unique_profiles_found}</div>
                  <div className="text-sm text-gray-600">Profiles Found</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{discoveryResults.total_queries_executed}</div>
                  <div className="text-sm text-gray-600">Google Queries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{discoveryResults.discovery_rate.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Profiles/Query</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{discoveryResults.cost_analysis.profiles_per_hour}</div>
                  <div className="text-sm text-gray-600">Profiles/Hour</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Processing Time: {discoveryResults.cost_analysis.time_investment} | 
                    Cost: $0.00 (Free) | 
                    Next Step: LinkedIn Scraping (${(discoveryResults.unique_profiles_found * 0.0015).toFixed(2)})
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailedResults(!showDetailedResults)}
                  >
                    {showDetailedResults ? 'Hide Details' : 'View Details'}
                  </Button>
                  <Button
                    onClick={handleProceedToScraping}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Scrape {discoveryResults.unique_profiles_found} Profiles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          {showDetailedResults && (
            <>
              {/* Coverage Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Discovery Coverage Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Job Title Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(discoveryResults.coverage_analysis.job_title_coverage).map(([title, count]) => (
                          <div key={title} className="flex justify-between items-center">
                            <span className="text-sm">{title}</span>
                            <Badge variant="outline">{count} profiles</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Seniority Levels</h4>
                      <div className="space-y-2">
                        {Object.entries(discoveryResults.coverage_analysis.seniority_distribution).map(([level, count]) => (
                          <div key={level} className="flex justify-between items-center">
                            <span className="text-sm">{level}</span>
                            <Badge variant="outline">{count} profiles</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sample Profiles */}
              <Card>
                <CardHeader>
                  <CardTitle>Sample Discovered Profiles</CardTitle>
                  <CardDescription>
                    Preview of profiles found via Google Search (showing first 6)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discoveryResults.discovered_profiles.slice(0, 6).map((profile, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{profile.name}</h4>
                            <p className="text-sm text-blue-600">{profile.title}</p>
                            <p className="text-sm text-gray-600">{profile.company}</p>
                          </div>
                          <Badge variant="outline">{profile.estimated_seniority}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{profile.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Google Ranking: #{profile.google_ranking}</span>
                          <span className="text-xs font-medium text-green-600">{profile.confidence_score}% match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {discoveryResults.discovered_profiles.length > 6 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export All {discoveryResults.discovered_profiles.length} Profiles
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {/* How Google Discovery Works */}
      <Card>
        <CardHeader>
          <CardTitle>Why Google Discovery is Superior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800">Complete Coverage</h4>
              <p className="text-sm text-blue-700">Google indexes ALL public LinkedIn profiles, not just API-accessible ones</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800">100% Free</h4>
              <p className="text-sm text-green-700">No API costs, no rate limits, no profile burning - just comprehensive discovery</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-800">Instant Scale</h4>
              <p className="text-sm text-purple-700">Can discover 100-3000+ profiles in minutes, regardless of LinkedIn restrictions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}