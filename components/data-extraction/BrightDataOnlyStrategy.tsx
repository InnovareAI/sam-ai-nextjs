/**
 * Bright Data Only Strategy for SAM AI
 * LinkedIn profiles + Website scraping using only Bright Data solutions
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Globe, 
  DollarSign, 
  CheckCircle, 
  Star,
  TrendingUp,
  Zap,
  Users,
  Code,
  Shield
} from 'lucide-react';

export default function BrightDataOnlyStrategy() {
  const [volumeNeeds, setVolumeNeeds] = useState<number>(1000);

  const brightDataSolutions = {
    linkedin_profiles: {
      mcp_scraping: {
        name: 'Bright Data MCP - LinkedIn Scraping',
        capability: 'Good',
        cost: 'Free tier + paid scaling',
        dailyLimit: 166, // 5K free requests / 30 days
        costPerProfile: 0.02, // Estimated for paid tier
        pros: [
          'Native SAM AI integration via MCP',
          'No external platform dependency',
          'Free tier: 5K requests/month',
          'Can extract profile + posts',
          'Residential proxy infrastructure'
        ],
        cons: [
          'LinkedIn actively blocks scrapers',
          'Requires custom anti-bot handling',
          'Limited free tier volume',
          'No specialized LinkedIn optimization'
        ],
        dataPoints: ['name', 'title', 'company', 'location', 'bio', 'posts', 'connections']
      },
      datasets: {
        name: 'Bright Data Pre-scraped Datasets',
        capability: 'Excellent',
        cost: '$0.001-0.003 per profile',
        dailyLimit: 'Unlimited',
        costPerProfile: 0.002,
        pros: [
          'Massive LinkedIn datasets available',
          'No scraping risks - pre-collected',
          'Unlimited volume instantly',
          '100x cheaper than real-time',
          'Perfect data quality'
        ],
        cons: [
          'Data may be 1-3 months old',
          'No real-time posts',
          'Static snapshots only',
          'Cannot get latest activity'
        ],
        dataPoints: ['name', 'title', 'company', 'location', 'bio', 'experience', 'education']
      }
    },
    website_scraping: {
      mcp_crawling: {
        name: 'Bright Data MCP - Website Crawling',
        capability: 'Excellent',
        cost: 'Free tier covers needs',
        dailyLimit: 166, // 5K requests / 30 days
        costPerWebsite: 0.05,
        pros: [
          'Perfect for website crawling',
          'Free tier sufficient for websites',
          'Native MCP integration',
          'JavaScript rendering support',
          'Custom extraction rules'
        ],
        cons: [
          'Requires implementation time',
          'Manual parsing setup needed',
          'Limited free tier requests'
        ],
        dataPoints: ['team_members', 'contact_info', 'emails', 'phone_numbers', 'leadership']
      },
      datasets: {
        name: 'Bright Data Website Datasets',
        capability: 'Good',
        cost: '$0.002-0.005 per website',
        dailyLimit: 'Unlimited',
        costPerWebsite: 0.003,
        pros: [
          'Pre-scraped company websites',
          'Bulk website data available',
          'No crawling needed',
          'Fast implementation'
        ],
        cons: [
          'Limited website coverage',
          'May miss smaller companies',
          'Static data snapshots',
          'Less customizable extraction'
        ],
        dataPoints: ['company_info', 'basic_contact', 'industry', 'size']
      }
    }
  };

  const implementationOptions = [
    {
      id: 'datasets_only',
      name: 'Datasets Only (Fastest)',
      description: 'Use pre-scraped datasets for both LinkedIn and websites',
      timeline: '1-2 days',
      linkedin: 'Pre-scraped LinkedIn datasets',
      website: 'Pre-scraped website datasets',
      pros: [
        'Instant access to millions of profiles',
        'Unlimited volume',
        'Lowest cost ($0.002-0.003/profile)',
        'No scraping risks',
        'Fast implementation'
      ],
      cons: [
        'Data 1-3 months old',
        'No real-time posts',
        'Static snapshots only'
      ],
      cost: {
        setup: 0,
        monthly: volumeNeeds * 30 * 0.003, // Dataset cost
        perProfile: 0.003
      }
    },
    {
      id: 'mcp_only', 
      name: 'MCP Real-time Only',
      description: 'Use MCP for real-time LinkedIn + website scraping',
      timeline: '3-5 days',
      linkedin: 'MCP LinkedIn scraping',
      website: 'MCP website crawling',
      pros: [
        'Real-time data',
        'Can get latest posts',
        'Native SAM AI integration',
        'Custom extraction rules',
        'Free tier available'
      ],
      cons: [
        'LinkedIn blocking risks',
        'Limited free tier volume',
        'Requires anti-bot development',
        'Higher failure rates'
      ],
      cost: {
        setup: 0,
        monthly: Math.max(0, (volumeNeeds * 30 - 5000) * 0.02), // Free tier + overage
        perProfile: 0.02
      }
    },
    {
      id: 'hybrid',
      name: 'Hybrid Approach (Recommended)',
      description: 'Datasets for bulk + MCP for fresh data',
      timeline: '3-7 days',
      linkedin: 'Datasets (bulk) + MCP (fresh profiles)',
      website: 'MCP website crawling',
      pros: [
        'Best of both worlds',
        'Bulk data + fresh updates',
        'Cost optimized',
        'Scalable approach',
        'Real-time when needed'
      ],
      cons: [
        'More complex implementation',
        'Dual data sources to manage',
        'Higher setup time'
      ],
      cost: {
        setup: 0,
        monthly: (volumeNeeds * 30 * 0.7 * 0.003) + (volumeNeeds * 30 * 0.3 * 0.02), // 70% datasets, 30% MCP
        perProfile: 0.008 // Blended rate
      }
    }
  ];

  const brightDataAdvantages = [
    {
      category: 'Cost Efficiency',
      benefits: [
        '100x cheaper than Apollo API ($0.003 vs $0.20)',
        'Free MCP tier: 5K requests/month',
        'Datasets: Unlimited volume at low cost',
        'No subscription lock-in'
      ]
    },
    {
      category: 'Data Quality',
      benefits: [
        '20,000+ customers trust Bright Data',
        'Enterprise-grade infrastructure',
        'Residential proxy network',
        'High success rates for web data'
      ]
    },
    {
      category: 'Integration',
      benefits: [
        'Native MCP integration with SAM AI',
        'No external platform dependencies',
        'Single vendor for all scraping needs',
        'Unified billing and management'
      ]
    },
    {
      category: 'Scale & Reliability',
      benefits: [
        'Unlimited volume with datasets',
        'Global proxy infrastructure',
        'JavaScript rendering support',
        'Anti-bot detection handling'
      ]
    }
  ];

  const monthlyEstimate = (option: typeof implementationOptions[0]) => {
    return option.cost.monthly;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-green-600" />
            Bright Data Only Strategy - Complete Solution
          </CardTitle>
          <CardDescription>
            LinkedIn profiles + Website scraping using only Bright Data infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">1</div>
              <div className="text-sm text-gray-600">Single Vendor</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$0.003</div>
              <div className="text-sm text-gray-600">Min Cost/Profile</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">MCP</div>
              <div className="text-sm text-gray-600">Native Integration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">5K</div>
              <div className="text-sm text-gray-600">Free Requests/Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configure Your Volume</CardTitle>
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

      {/* Implementation Options */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Options</CardTitle>
          <CardDescription>
            Choose the best Bright Data approach for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {implementationOptions.map((option, index) => (
              <Card key={option.id} className={option.id === 'hybrid' ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {option.id === 'hybrid' && <Star className="h-5 w-5 text-green-600" />}
                        {option.name}
                        {option.id === 'hybrid' && <Badge className="bg-green-600 text-white">Recommended</Badge>}
                      </CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{option.timeline}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        ${monthlyEstimate(option).toFixed(0)}/month
                      </div>
                      <div className="text-xs text-gray-600">Total Cost</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        ${option.cost.perProfile.toFixed(3)}
                      </div>
                      <div className="text-xs text-gray-600">Per Profile</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round(0.20 / option.cost.perProfile)}x
                      </div>
                      <div className="text-xs text-gray-600">Cheaper than Apollo</div>
                    </div>
                  </div>

                  {/* Solution Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">LinkedIn Strategy:</h4>
                      <p className="text-sm text-gray-600">{option.linkedin}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Website Strategy:</h4>
                      <p className="text-sm text-gray-600">{option.website}</p>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">✅ Pros:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        {option.pros.slice(0, 4).map((pro, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-800 mb-2">⚠️ Considerations:</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        {option.cons.map((con, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-orange-600">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bright Data Advantages */}
      <Card>
        <CardHeader>
          <CardTitle>Why Bright Data for Everything?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {brightDataAdvantages.map((advantage, index) => (
              <div key={index}>
                <h4 className="font-medium text-blue-800 mb-3">{advantage.category}:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  {advantage.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Comparison: Bright Data vs Alternatives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Solution</th>
                  <th className="border border-gray-300 p-3 text-center">Cost/Profile</th>
                  <th className="border border-gray-300 p-3 text-center">Monthly Cost*</th>
                  <th className="border border-gray-300 p-3 text-center">vs Bright Data</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3 font-medium">Bright Data Datasets</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">$0.003</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">${(volumeNeeds * 30 * 0.003).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center">Baseline</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3 font-medium">Bright Data MCP</td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-bold">$0.020</td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-bold">${(volumeNeeds * 30 * 0.020).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center">7x more</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Apollo API</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600 font-bold">$0.200</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600 font-bold">${(volumeNeeds * 30 * 0.200).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600">67x more</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Apify + LinkedIn</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600 font-bold">$0.270</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600 font-bold">${(volumeNeeds * 30 * 0.270).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600">90x more</td>
                </tr>
              </tbody>
            </table>
            <div className="text-xs text-gray-500 mt-2">
              *Monthly cost for {volumeNeeds.toLocaleString()} profiles/day
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Steps */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-6 w-6" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🎯 Start with Hybrid Approach:</h4>
              <ol className="text-sm text-green-700 space-y-1">
                <li>1. Setup Bright Data datasets for bulk LinkedIn profiles (70% of volume)</li>
                <li>2. Implement MCP for real-time profiles and website crawling (30% of volume)</li>
                <li>3. Use MCP free tier (5K requests) for fresh data updates</li>
                <li>4. Scale datasets for volume, MCP for freshness</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium">Immediate Benefits:</h4>
                <ul className="text-sm text-gray-700 space-y-1 mt-2">
                  <li>• 67x cheaper than Apollo</li>
                  <li>• Unlimited volume capability</li>
                  <li>• Single vendor simplicity</li>
                  <li>• Native SAM AI integration</li>
                </ul>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <h4 className="font-medium">Timeline:</h4>
                <ul className="text-sm text-gray-700 space-y-1 mt-2">
                  <li>• Week 1: Setup datasets</li>
                  <li>• Week 2: Implement MCP</li>
                  <li>• Week 3: Test hybrid approach</li>
                  <li>• Week 4: Full production</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Implement Hybrid Bright Data Strategy
            </Button>
            <Button variant="outline" className="flex-1">
              Start with Datasets Only
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">💡 Why Bright Data Only?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Single vendor, native MCP integration, 67x cost savings vs Apollo, unlimited scale with datasets, 
              and enterprise-grade infrastructure. Perfect for SAM AI's needs without external dependencies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}