/**
 * Data Source Evaluation Component
 * Compare all alternatives to LinkedIn scraping for SAM AI lead generation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Star,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  Search,
  Globe
} from 'lucide-react';

interface DataSourceOption {
  id: string;
  name: string;
  type: 'API' | 'Database' | 'Search' | 'Scraping';
  dailyVolume: number;
  costPerLead: number;
  dataQuality: number; // 1-5 scale
  setupComplexity: 'Easy' | 'Medium' | 'Hard';
  riskLevel: 'None' | 'Low' | 'Medium' | 'High';
  pros: string[];
  cons: string[];
  bestFor: string[];
  monthlyEstimate: string;
  apiAvailable: boolean;
  dataPoints: string[];
}

export default function DataSourceEvaluation() {
  const [selectedMetric, setSelectedMetric] = useState<'volume' | 'cost' | 'quality' | 'risk'>('volume');
  const [volumeNeeds, setVolumeNeeds] = useState<number>(1000);

  const dataSourceOptions: DataSourceOption[] = [
    {
      id: 'apollo_api',
      name: 'Apollo.io API',
      type: 'API',
      dailyVolume: 833,
      costPerLead: 0.20,
      dataQuality: 5,
      setupComplexity: 'Easy',
      riskLevel: 'None',
      pros: [
        'Official API - zero ban risk',
        '275M+ verified contacts',
        'Real-time data access',
        'Phone numbers included',
        'High data accuracy',
        'Excellent API documentation',
        'Built-in email verification'
      ],
      cons: [
        'EXPENSIVE: API uses plan credits',
        'Additional credits $0.20 each',
        'High volume quickly exceeds plans',
        'Enterprise plan needed for scale'
      ],
      bestFor: ['Small-scale prospecting', 'Quality over quantity', 'When budget allows'],
      monthlyEstimate: '$200-2000/month',
      apiAvailable: true,
      dataPoints: ['Name', 'Title', 'Company', 'Email', 'Phone', 'LinkedIn', 'Location', 'Industry']
    },
    {
      id: 'bright_data',
      name: 'Bright Data Datasets',
      type: 'Database',
      dailyVolume: 50000,
      costPerLead: 0.002,
      dataQuality: 4,
      setupComplexity: 'Medium',
      riskLevel: 'None',
      pros: [
        'Massive pre-scraped datasets',
        'No scraping required',
        'Very cost-effective',
        'No rate limits',
        'Multiple data sources',
        'Regular updates',
        'Bulk download available'
      ],
      cons: [
        'Data may be 1-3 months old',
        'Limited customization',
        'One-time snapshots',
        'Requires data processing'
      ],
      bestFor: ['Bulk prospecting', 'Market research', 'Database building'],
      monthlyEstimate: '$100-500/month',
      apiAvailable: true,
      dataPoints: ['Name', 'Title', 'Company', 'Email', 'Phone', 'Social Media', 'Website']
    },
    {
      id: 'google_search',
      name: 'Google Search API',
      type: 'Search',
      dailyVolume: 5000,
      costPerLead: 0.01,
      dataQuality: 3,
      setupComplexity: 'Medium',
      riskLevel: 'None',
      pros: [
        'Unlimited data sources',
        'Real-time information',
        'No account risks',
        'Official Google API',
        'Custom search strategies',
        'Low cost per search'
      ],
      cons: [
        'Data extraction complexity',
        'Variable data quality',
        'Requires post-processing',
        'Daily API limits'
      ],
      bestFor: ['Research', 'Contact discovery', 'Niche targeting'],
      monthlyEstimate: '$50-200/month',
      apiAvailable: true,
      dataPoints: ['Name', 'Title', 'Company', 'Email', 'Website', 'Bio']
    },
    {
      id: 'people_data_labs',
      name: 'People Data Labs',
      type: 'Database',
      dailyVolume: 20000,
      costPerLead: 0.008,
      dataQuality: 4,
      setupComplexity: 'Medium',
      riskLevel: 'None',
      pros: [
        '3B+ person profiles',
        'Comprehensive search',
        'Real-time API',
        'Good price for volume',
        'Multiple data sources',
        'Flexible filtering'
      ],
      cons: [
        'Data quality varies',
        'Complex API',
        'Some stale data',
        'Enterprise pricing'
      ],
      bestFor: ['Enterprise prospecting', 'Data enrichment', 'Large campaigns'],
      monthlyEstimate: '$300-1000/month',
      apiAvailable: true,
      dataPoints: ['Name', 'Title', 'Company', 'Email', 'Phone', 'Location', 'Education', 'Experience']
    },
    {
      id: 'zoominfo_api',
      name: 'ZoomInfo API',
      type: 'Database',
      dailyVolume: 25000,
      costPerLead: 0.02,
      dataQuality: 5,
      setupComplexity: 'Hard',
      riskLevel: 'None',
      pros: [
        'Highest data quality',
        'Comprehensive B2B database',
        'Intent data included',
        'Technographic data',
        'Sales intelligence',
        'Enterprise-grade'
      ],
      cons: [
        'Very expensive',
        'Annual contracts required',
        'Complex integration',
        'Enterprise sales process'
      ],
      bestFor: ['Enterprise sales', 'Account-based marketing', 'High-value prospects'],
      monthlyEstimate: '$1000-3000/month',
      apiAvailable: true,
      dataPoints: ['Name', 'Title', 'Company', 'Email', 'Phone', 'Intent Data', 'Technographics', 'Org Chart']
    },
    {
      id: 'hunter_io',
      name: 'Hunter.io',
      type: 'API',
      dailyVolume: 2000,
      costPerLead: 0.005,
      dataQuality: 4,
      setupComplexity: 'Easy',
      riskLevel: 'None',
      pros: [
        'Excellent email finding',
        'High accuracy rates',
        'Email verification',
        'Domain search',
        'Affordable pricing',
        'Simple API'
      ],
      cons: [
        'Email-focused only',
        'Limited profile data',
        'Monthly usage limits',
        'No phone numbers'
      ],
      bestFor: ['Email finding', 'Contact verification', 'Small campaigns'],
      monthlyEstimate: '$50-200/month',
      apiAvailable: true,
      dataPoints: ['Name', 'Email', 'Title', 'Company', 'Domain']
    },
    {
      id: 'scrapingbee',
      name: 'ScrapingBee',
      type: 'Scraping',
      dailyVolume: 8000,
      costPerLead: 0.01,
      dataQuality: 4,
      setupComplexity: 'Medium',
      riskLevel: 'Medium',
      pros: [
        'AI-powered data extraction',
        'JavaScript rendering support',
        'Rotating proxy infrastructure',
        'No CSS selectors needed',
        'Handles dynamic websites',
        'Pay per successful request',
        'Good rate limits'
      ],
      cons: [
        'Still subject to LinkedIn blocking',
        'Custom development required',
        'No LinkedIn-specific API',
        'May violate LinkedIn ToS',
        'Need proxy rotation strategy'
      ],
      bestFor: ['General web scraping', 'E-commerce data', 'Public websites'],
      monthlyEstimate: '$49-599/month',
      apiAvailable: true,
      dataPoints: ['Name', 'Title', 'Company', 'Custom extracted data']
    },
    {
      id: 'linkedin_scraping',
      name: 'LinkedIn Scraping (Direct)',
      type: 'Scraping',
      dailyVolume: 400,
      costPerLead: 0.06,
      dataQuality: 5,
      setupComplexity: 'Hard',
      riskLevel: 'High',
      pros: [
        'High data quality',
        'Real-time LinkedIn data',
        'Comprehensive profiles'
      ],
      cons: [
        'MAJOR RISK: Account bans',
        'Very low daily limits (300-400)',
        'Legal compliance issues',
        'IP blocking risks',
        'Profile burning',
        'Expensive per lead',
        'Unreliable access'
      ],
      bestFor: ['Not recommended due to risks'],
      monthlyEstimate: '$25/month + risk costs',
      apiAvailable: false,
      dataPoints: ['Name', 'Title', 'Company', 'Experience', 'Education', 'Skills']
    }
  ];

  const getScoreColor = (score: number, max: number = 5) => {
    const percentage = score / max;
    if (percentage >= 0.8) return 'text-green-600';
    if (percentage >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'None': return 'bg-green-100 text-green-800';
      case 'Low': return 'bg-yellow-100 text-yellow-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMonthlyBudget = (option: DataSourceOption, volume: number) => {
    const monthlyCost = option.costPerLead * volume * 30;
    return monthlyCost;
  };

  const topRecommendations = dataSourceOptions
    .filter(option => option.riskLevel === 'None' && option.dailyVolume >= volumeNeeds)
    .sort((a, b) => (b.dataQuality / b.costPerLead) - (a.dataQuality / a.costPerLead))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Data Source Evaluation - LinkedIn Alternatives
          </CardTitle>
          <CardDescription>
            Comprehensive comparison of lead generation alternatives to avoid LinkedIn profile burning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dataSourceOptions.length}</div>
              <div className="text-sm text-gray-600">Options Evaluated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dataSourceOptions.filter(opt => opt.riskLevel === 'None').length}
              </div>
              <div className="text-sm text-gray-600">Zero Risk Options</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">400</div>
              <div className="text-sm text-gray-600">LinkedIn Daily Limit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">25x</div>
              <div className="text-sm text-gray-600">Volume Improvement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Your Volume Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Daily Lead Volume Needed</label>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={volumeNeeds}
                onChange={(e) => setVolumeNeeds(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-center text-lg font-bold mt-2">{volumeNeeds.toLocaleString()} leads/day</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Suitable Options for {volumeNeeds.toLocaleString()} daily leads:</h4>
              <div className="flex flex-wrap gap-2">
                {dataSourceOptions
                  .filter(opt => opt.dailyVolume >= volumeNeeds && opt.riskLevel === 'None')
                  .map(opt => (
                    <Badge key={opt.id} variant="secondary">{opt.name}</Badge>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
          <CardDescription>
            Compare all data sources across key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Source</th>
                  <th className="border border-gray-300 p-3 text-center">Daily Volume</th>
                  <th className="border border-gray-300 p-3 text-center">Cost/Lead</th>
                  <th className="border border-gray-300 p-3 text-center">Quality</th>
                  <th className="border border-gray-300 p-3 text-center">Risk Level</th>
                  <th className="border border-gray-300 p-3 text-center">Setup</th>
                  <th className="border border-gray-300 p-3 text-center">Monthly Cost*</th>
                </tr>
              </thead>
              <tbody>
                {dataSourceOptions.map((option) => (
                  <tr key={option.id} className={option.riskLevel === 'High' ? 'bg-red-50' : ''}>
                    <td className="border border-gray-300 p-3">
                      <div>
                        <div className="font-medium">{option.name}</div>
                        <div className="text-xs text-gray-500">{option.type}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <div className={`font-bold ${option.dailyVolume >= volumeNeeds ? 'text-green-600' : 'text-red-600'}`}>
                        {option.dailyVolume.toLocaleString()}
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <div className="font-bold">${option.costPerLead.toFixed(3)}</div>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <div className={`font-bold ${getScoreColor(option.dataQuality)}`}>
                        {option.dataQuality}/5
                      </div>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">
                      <Badge className={getRiskColor(option.riskLevel)}>
                        {option.riskLevel}
                      </Badge>
                    </td>
                    <td className="border border-gray-300 p-3 text-center">{option.setupComplexity}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <div className="font-bold">
                        ${calculateMonthlyBudget(option, volumeNeeds).toFixed(0)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-gray-500 mt-2">
              *Monthly cost calculated for {volumeNeeds.toLocaleString()} leads/day
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Top Recommendations
          </CardTitle>
          <CardDescription>
            Best alternatives based on your volume needs and zero-risk requirement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRecommendations.map((option, index) => (
              <Card key={option.id} className={index === 0 ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                    {index === 0 && <Badge className="bg-green-600">Best Choice</Badge>}
                  </div>
                  <div className="text-sm text-gray-600">{option.monthlyEstimate}</div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Volume:</span>
                      <div className="font-bold">{option.dailyVolume.toLocaleString()}/day</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Quality:</span>
                      <div className={`font-bold ${getScoreColor(option.dataQuality)}`}>
                        {option.dataQuality}/5
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Best for:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {option.bestFor.slice(0, 2).map((use, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{use}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-600">Key pros:</span>
                    <ul className="text-xs text-gray-700 mt-1 space-y-1">
                      {option.pros.slice(0, 3).map((pro, i) => (
                        <li key={i} className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Risk Warning */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Why LinkedIn Scraping Should Be Avoided
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-red-800 mb-3">Major Risks:</h4>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Account bans and profile burning
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Very low daily limits (300-400 profiles)
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  IP blocking and detection systems
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Legal compliance concerns
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Unreliable access and downtime
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-800 mb-3">Alternative Benefits:</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  25x higher daily volume possible
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Zero account risk with official APIs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Better data quality and verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Legal compliance guaranteed
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Reliable, enterprise-grade access
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button className="flex-1">
              Setup Recommended: {topRecommendations[0]?.name}
            </Button>
            <Button variant="outline">
              Compare All Options
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">Recommendation Summary</h4>
            <p className="text-sm text-blue-700 mt-1">
              For {volumeNeeds.toLocaleString()} daily leads, we recommend <strong>{topRecommendations[0]?.name}</strong> 
              at approximately <strong>${calculateMonthlyBudget(topRecommendations[0] || dataSourceOptions[0], volumeNeeds).toFixed(0)}/month</strong>. 
              This provides {Math.round((topRecommendations[0]?.dailyVolume || 1000) / 400)}x higher volume than LinkedIn scraping 
              with zero profile burning risk.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}