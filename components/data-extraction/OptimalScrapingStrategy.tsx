/**
 * Optimal Scraping Strategy for SAM AI
 * LinkedIn profiles + Website scraping with cost optimization
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Globe, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Zap,
  Database,
  Clock,
  Shield
} from 'lucide-react';

export default function OptimalScrapingStrategy() {
  const [volumeNeeds, setVolumeNeeds] = useState<number>(1000);

  const scrapingRequirements = [
    {
      id: 'linkedin_profiles',
      name: 'LinkedIn Profile Scraping',
      description: 'Individual profiles: name, title, company, bio, last 3 posts',
      priority: 'High',
      volume: '1,000 profiles/day',
      complexity: 'Very High',
      dataPoints: ['name', 'title', 'company', 'location', 'bio', 'experience', 'last_3_posts', 'connection_count']
    },
    {
      id: 'website_scraping',
      name: 'Website/Company Pages',
      description: 'Team pages, about us, contact information',
      priority: 'High', 
      volume: '500 websites/day',
      complexity: 'Medium',
      dataPoints: ['team_members', 'contact_info', 'company_info', 'leadership', 'emails', 'phone_numbers']
    }
  ];

  const solutionOptions = {
    linkedin_profiles: {
      apify: {
        name: 'Apify LinkedIn Scrapers',
        capability: 'Excellent',
        cost: '$120-300/month',
        pros: [
          'Dedicated LinkedIn profile actors',
          'Handles anti-bot detection well',
          'Can extract posts and activity',
          'Proven at scale (1000+ profiles/day)',
          'Multiple actor options available'
        ],
        cons: [
          'Still subject to LinkedIn rate limits',
          'Higher cost for volume',
          'External platform dependency'
        ],
        actors: [
          {
            name: 'LinkedIn Profile Scraper',
            id: 'apify/linkedin-profile-scraper',
            cost: '$0.12 per profile',
            features: ['Basic profile data', 'Experience', 'Education']
          },
          {
            name: 'LinkedIn Posts Scraper', 
            id: 'apify/linkedin-posts-scraper',
            cost: '$0.05 per post',
            features: ['Recent posts', 'Engagement data', 'Post content']
          }
        ],
        dailyCost: (volumeNeeds * 0.12) + (volumeNeeds * 3 * 0.05), // Profile + 3 posts
        recommendation: 'Best option for LinkedIn profiles'
      },
      brightdata_mcp: {
        name: 'Bright Data MCP',
        capability: 'Poor',
        cost: 'Free tier insufficient',
        pros: [
          'Free tier available',
          'Native MCP integration',
          'No external dependencies'
        ],
        cons: [
          'LinkedIn actively blocks generic scrapers',
          'No specialized LinkedIn handling',
          'High failure rate for profiles',
          'Cannot reliably get posts'
        ],
        dailyCost: 0,
        recommendation: 'Not suitable for LinkedIn profiles'
      },
      apollo_api: {
        name: 'Apollo API (Alternative)',
        capability: 'Good',
        cost: '$0.20 per profile',
        pros: [
          'Official API - no blocking',
          'Reliable profile data',
          'No rate limit concerns',
          'High data quality'
        ],
        cons: [
          'No post data available',
          'Higher cost per profile',
          'Limited to basic profile info'
        ],
        dailyCost: volumeNeeds * 0.20,
        recommendation: 'Good alternative if posts not critical'
      }
    },
    website_scraping: {
      apollo_free: {
        name: 'Apollo Website Scraping (Free)',
        capability: 'Good',
        cost: 'Free with Apollo plan',
        pros: [
          'Completely free with Apollo subscription',
          'Good for basic company info',
          'Integrated with Apollo data',
          'No additional setup needed'
        ],
        cons: [
          'Limited to basic company data',
          'May not get detailed team info',
          'Not optimized for contact extraction'
        ],
        dailyCost: 0,
        recommendation: 'Start here - it\'s free!'
      },
      brightdata_mcp: {
        name: 'Bright Data MCP Website Crawling',
        capability: 'Excellent',
        cost: 'Free (5K requests/month)',
        pros: [
          'Perfect for website crawling',
          'Can extract detailed team info',
          'Free tier covers needs',
          'Native SAM AI integration',
          'Custom extraction rules'
        ],
        cons: [
          'Requires custom implementation',
          'Limited free requests',
          'Manual parsing needed'
        ],
        dailyCost: 0, // Free tier
        recommendation: 'Best for detailed website scraping'
      },
      apify: {
        name: 'Apify Website Scrapers',
        capability: 'Good',
        cost: '$45-120/month',
        pros: [
          'Reliable web scraping infrastructure',
          'Multiple website scraping actors',
          'Good for scale',
          'Handles JavaScript rendering'
        ],
        cons: [
          'Unnecessary cost (free alternatives available)',
          'Generic actors not contact-optimized',
          'External platform dependency'
        ],
        dailyCost: 50, // Estimated monthly cost / 30
        recommendation: 'Overkill when free options available'
      }
    }
  };

  const optimalStrategy = {
    phase1: {
      title: 'Immediate Setup (Free + Low Cost)',
      linkedin: 'Apollo API (basic profiles)',
      website: 'Apollo free website scraping',
      monthlyCost: volumeNeeds * 30 * 0.20, // Apollo API for profiles
      coverage: 'Basic profile data + free website scraping',
      timeline: '1-2 days'
    },
    phase2: {
      title: 'Enhanced Setup (with Posts)',
      linkedin: 'Apify LinkedIn Profile + Posts Scrapers',
      website: 'Bright Data MCP (detailed crawling)',
      monthlyCost: (volumeNeeds * 0.12 + volumeNeeds * 3 * 0.05) * 30 + 120, // Apify cost
      coverage: 'Full profile data + posts + detailed website scraping',
      timeline: '3-5 days'
    }
  };

  const calculateMonthlyCost = (solution: string, scrapeType: 'linkedin_profiles' | 'website_scraping') => {
    const solutionData = solutionOptions[scrapeType][solution];
    if (!solutionData) return 0;
    return solutionData.dailyCost * 30;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Optimal Scraping Strategy for Your Needs
          </CardTitle>
          <CardDescription>
            LinkedIn profiles + Website scraping with cost optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2</div>
              <div className="text-sm text-gray-600">Scraping Targets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$0</div>
              <div className="text-sm text-gray-600">Website Scraping (Free)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Posts</div>
              <div className="text-sm text-gray-600">LinkedIn Activity Needed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1K/day</div>
              <div className="text-sm text-gray-600">Target Volume</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Your Scraping Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scrapingRequirements.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {req.id === 'linkedin_profiles' ? <Users className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                        {req.name}
                      </CardTitle>
                      <CardDescription>{req.description}</CardDescription>
                    </div>
                    <Badge variant={req.priority === 'High' ? 'default' : 'secondary'}>
                      {req.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Volume:</span> {req.volume}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Complexity:</span> {req.complexity}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Data Points:</span> {req.dataPoints.length}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Required Data Points:</h4>
                    <div className="flex flex-wrap gap-2">
                      {req.dataPoints.map((point, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volume Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Daily LinkedIn Profiles Needed</label>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={volumeNeeds}
                onChange={(e) => setVolumeNeeds(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-center text-lg font-bold mt-2">
                {volumeNeeds.toLocaleString()} profiles/day
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solution Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Solution Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="linkedin_profiles">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="linkedin_profiles">LinkedIn Profiles</TabsTrigger>
              <TabsTrigger value="website_scraping">Website Scraping</TabsTrigger>
            </TabsList>

            <TabsContent value="linkedin_profiles" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(solutionOptions.linkedin_profiles).map(([key, solution]) => (
                  <Card key={key} className={key === 'apify' ? 'border-green-200 bg-green-50' : ''}>
                    <CardHeader>
                      <CardTitle className="text-lg">{solution.name}</CardTitle>
                      {key === 'apify' && <Badge className="bg-green-600 text-white">Recommended</Badge>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          ${(solution.dailyCost * 30).toFixed(0)}/month
                        </div>
                        <div className="text-xs text-gray-600">For {volumeNeeds} profiles/day</div>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-800 mb-2">✅ Pros:</h4>
                        <ul className="text-xs text-green-700 space-y-1">
                          {solution.pros.slice(0, 3).map((pro, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2 bg-gray-50 rounded text-xs">
                        <strong>{solution.recommendation}</strong>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="website_scraping" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(solutionOptions.website_scraping).map(([key, solution]) => (
                  <Card key={key} className={key === 'apollo_free' ? 'border-green-200 bg-green-50' : ''}>
                    <CardHeader>
                      <CardTitle className="text-lg">{solution.name}</CardTitle>
                      {key === 'apollo_free' && <Badge className="bg-green-600 text-white">Start Here</Badge>}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          ${solution.dailyCost === 0 ? 'FREE' : (solution.dailyCost * 30).toFixed(0) + '/month'}
                        </div>
                        <div className="text-xs text-gray-600">Website scraping cost</div>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-800 mb-2">✅ Pros:</h4>
                        <ul className="text-xs text-green-700 space-y-1">
                          {solution.pros.slice(0, 3).map((pro, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2 bg-gray-50 rounded text-xs">
                        <strong>{solution.recommendation}</strong>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Optimal Strategy */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-6 w-6" />
            Recommended Implementation Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge className="bg-blue-600 text-white">Phase 1</Badge>
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">{optimalStrategy.phase1.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                  <div>
                    <span className="font-medium">LinkedIn:</span> {optimalStrategy.phase1.linkedin}
                  </div>
                  <div>
                    <span className="font-medium">Website:</span> {optimalStrategy.phase1.website}
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span> ${optimalStrategy.phase1.monthlyCost.toFixed(0)}/month
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span> {optimalStrategy.phase1.timeline}
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  <strong>Coverage:</strong> {optimalStrategy.phase1.coverage}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-green-600 text-white">Phase 2</Badge>
              <div className="flex-1">
                <h4 className="font-medium text-green-800">{optimalStrategy.phase2.title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                  <div>
                    <span className="font-medium">LinkedIn:</span> {optimalStrategy.phase2.linkedin}
                  </div>
                  <div>
                    <span className="font-medium">Website:</span> {optimalStrategy.phase2.website}
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span> ${optimalStrategy.phase2.monthlyCost.toFixed(0)}/month
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span> {optimalStrategy.phase2.timeline}
                  </div>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <strong>Coverage:</strong> {optimalStrategy.phase2.coverage}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Summary for {volumeNeeds.toLocaleString()} profiles/day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Strategy</th>
                  <th className="border border-gray-300 p-3 text-center">LinkedIn Profiles</th>
                  <th className="border border-gray-300 p-3 text-center">Website Scraping</th>
                  <th className="border border-gray-300 p-3 text-center">Total Monthly</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Phase 1 (Basic)</td>
                  <td className="border border-gray-300 p-3 text-center">${(volumeNeeds * 30 * 0.20).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">FREE</td>
                  <td className="border border-gray-300 p-3 text-center font-bold">${(volumeNeeds * 30 * 0.20).toFixed(0)}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Phase 2 (Enhanced)</td>
                  <td className="border border-gray-300 p-3 text-center">${((volumeNeeds * 0.12 + volumeNeeds * 3 * 0.05) * 30).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">FREE</td>
                  <td className="border border-gray-300 p-3 text-center font-bold">${((volumeNeeds * 0.12 + volumeNeeds * 3 * 0.05) * 30).toFixed(0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
              Start Phase 1: Apollo API + Free Website
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Implement Phase 2: Apify + Enhanced Scraping
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">🎯 Recommendation:</h4>
            <p className="text-sm text-blue-700 mt-1">
              Start with <strong>Phase 1</strong> to get basic LinkedIn profiles + free website scraping. 
              Then upgrade to <strong>Phase 2</strong> when you need LinkedIn posts and detailed team extraction.
              Website scraping stays free with Apollo, so focus budget on LinkedIn data quality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}