/**
 * Scraping-Free Strategy for SAM AI
 * Avoid scraping risks with pre-scraped datasets and official APIs
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Database, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Star,
  TrendingUp,
  AlertTriangle,
  Zap,
  Globe
} from 'lucide-react';

export default function ScrapingFreeStrategy() {
  const [volumeNeeds, setVolumeNeeds] = useState<number>(30000);

  const scrapingFreeOptions = [
    {
      id: 'bright_data_datasets',
      name: 'Bright Data Pre-scraped Datasets',
      type: 'Datasets',
      riskLevel: 'Zero Risk',
      description: 'Massive pre-scraped LinkedIn and company datasets - no scraping needed',
      pros: [
        'ZERO scraping risks - data already collected',
        'Unlimited volume instantly available',
        'LinkedIn profiles: 15M+ records',
        'Company data: 200K+ businesses',
        '100x cheaper than Apollo API',
        'No rate limits or blocking concerns'
      ],
      cons: [
        'Data is 1-3 months old (not real-time)',
        'Cannot get latest posts/activity',
        'Static snapshots only'
      ],
      coverage: {
        linkedin_profiles: 'Excellent (15M+ profiles)',
        company_data: 'Good (200K+ companies)',
        contact_info: 'Good (emails, phones)',
        real_time_posts: 'Not available'
      },
      cost: {
        perProfile: 0.002,
        monthly: volumeNeeds * 0.002,
        setup: 0
      },
      implementation: 'Immediate - bulk download',
      dataPoints: ['name', 'title', 'company', 'location', 'industry', 'experience', 'education', 'emails', 'phones']
    },
    {
      id: 'apollo_api_only',
      name: 'Apollo API (Official)',
      type: 'API',
      riskLevel: 'Zero Risk',
      description: 'Official Apollo API - no scraping, verified data access',
      pros: [
        'Official API - zero account risks',
        '275M+ verified contacts',
        'Real-time data access',
        'Phone numbers and emails verified',
        'Enterprise-grade reliability',
        'Email verification included'
      ],
      cons: [
        'EXPENSIVE: $0.20 per profile credit',
        'API usage consumes plan credits',
        'No social posts/activity data',
        'Rate limits based on plan'
      ],
      coverage: {
        linkedin_profiles: 'Excellent (275M+ contacts)',
        company_data: 'Excellent (comprehensive)',
        contact_info: 'Excellent (verified)',
        real_time_posts: 'Not available'
      },
      cost: {
        perProfile: 0.20,
        monthly: volumeNeeds * 0.20,
        setup: 0
      },
      implementation: 'Immediate - API integration',
      dataPoints: ['name', 'title', 'company', 'email', 'phone', 'linkedin', 'location', 'industry', 'company_size']
    },
    {
      id: 'hybrid_datasets_api',
      name: 'Hybrid: Datasets + Apollo API',
      type: 'Hybrid',
      riskLevel: 'Zero Risk',
      description: 'Bright Data datasets for bulk + Apollo API for fresh/priority contacts',
      pros: [
        'Best of both worlds - volume + freshness',
        'Cost optimized (90% datasets, 10% API)',
        'Zero scraping risks',
        'Scalable approach',
        'Use API only for high-priority leads'
      ],
      cons: [
        'Two data sources to manage',
        'More complex implementation',
        'Some data duplication possible'
      ],
      coverage: {
        linkedin_profiles: 'Excellent (combined coverage)',
        company_data: 'Excellent (comprehensive)',
        contact_info: 'Excellent (verified + bulk)',
        real_time_posts: 'Not available'
      },
      cost: {
        perProfile: 0.022, // 90% datasets (0.002) + 10% API (0.20)
        monthly: (volumeNeeds * 0.9 * 0.002) + (volumeNeeds * 0.1 * 0.20),
        setup: 0
      },
      implementation: 'Quick - combine existing solutions',
      dataPoints: ['name', 'title', 'company', 'email', 'phone', 'linkedin', 'location', 'industry', 'experience']
    }
  ];

  const scrapingRisks = [
    {
      risk: 'Account Bans',
      description: 'LinkedIn can ban accounts for automated access',
      severity: 'High',
      impact: 'Complete loss of access to LinkedIn data'
    },
    {
      risk: 'IP Blocking',
      description: 'Websites block IP addresses that scrape too aggressively',
      severity: 'Medium',
      impact: 'Temporary or permanent loss of access'
    },
    {
      risk: 'Legal Issues',
      description: 'Scraping can violate Terms of Service and data protection laws',
      severity: 'High',
      impact: 'Legal liability and compliance issues'
    },
    {
      risk: 'Data Quality Issues',
      description: 'Scraped data can be incomplete, outdated, or incorrectly parsed',
      severity: 'Medium',
      impact: 'Poor lead quality and conversion rates'
    },
    {
      risk: 'Maintenance Overhead',
      description: 'Scrapers break when websites change their structure',
      severity: 'High',
      impact: 'Constant development and maintenance costs'
    }
  ];

  const scrapingFreeAdvantages = [
    {
      category: 'Risk Elimination',
      benefits: [
        'Zero account ban risks',
        'No IP blocking concerns', 
        'Legal compliance guaranteed',
        'No Terms of Service violations'
      ]
    },
    {
      category: 'Reliability',
      benefits: [
        'Enterprise-grade data access',
        'Guaranteed uptime and availability',
        'No scraper maintenance needed',
        'Predictable data quality'
      ]
    },
    {
      category: 'Cost Efficiency',
      benefits: [
        'No scraper development costs',
        'No ongoing maintenance expenses',
        'Bulk pricing for datasets',
        'Transparent pricing models'
      ]
    },
    {
      category: 'Scale & Performance',
      benefits: [
        'Instant access to millions of records',
        'No rate limits with datasets',
        'Unlimited concurrent access',
        'Fast implementation timeline'
      ]
    }
  ];

  const recommendedPath = {
    immediate: {
      title: 'Start Immediately: Bright Data Datasets',
      description: 'Get instant access to 15M+ LinkedIn profiles and 200K+ companies',
      cost: `$${(volumeNeeds * 0.002).toFixed(0)}/month`,
      timeline: '1-2 days',
      volume: 'Unlimited (30K+ monthly)',
      risk: 'Zero'
    },
    growth: {
      title: 'Scale with Hybrid Approach',
      description: 'Add Apollo API for fresh data on high-priority prospects',
      cost: `$${((volumeNeeds * 0.9 * 0.002) + (volumeNeeds * 0.1 * 0.20)).toFixed(0)}/month`,
      timeline: '3-5 days',
      volume: 'Unlimited + Real-time (30K+ monthly)',
      risk: 'Zero'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Scraping-Free Strategy - Zero Risk Lead Generation
          </CardTitle>
          <CardDescription>
            Avoid all scraping risks with pre-scraped datasets and official APIs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-600">Scraping Risk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15M+</div>
              <div className="text-sm text-gray-600">Pre-scraped Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">30K+</div>
              <div className="text-sm text-gray-600">Monthly Capacity</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">$60</div>
              <div className="text-sm text-gray-600">Monthly Cost @ 30K</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraping Risks to Avoid */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-6 w-6" />
            Scraping Risks We're Avoiding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scrapingRisks.map((risk, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-red-800">{risk.risk}</h4>
                  <Badge variant={risk.severity === 'High' ? 'destructive' : 'secondary'}>
                    {risk.severity}
                  </Badge>
                </div>
                <p className="text-sm text-red-700 mb-2">{risk.description}</p>
                <p className="text-xs text-red-600"><strong>Impact:</strong> {risk.impact}</p>
              </div>
            ))}
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
              <label className="text-sm font-medium">Monthly Profile Volume Needed</label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="1000"
                value={volumeNeeds}
                onChange={(e) => setVolumeNeeds(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-center text-lg font-bold mt-2">
                {volumeNeeds.toLocaleString()} profiles/month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraping-Free Solutions */}
      <Card>
        <CardHeader>
          <CardTitle>Scraping-Free Solutions</CardTitle>
          <CardDescription>
            All options eliminate scraping risks while providing comprehensive data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {scrapingFreeOptions.map((option, index) => (
              <Card key={option.id} className={option.id === 'bright_data_datasets' ? 'border-green-200 bg-green-50' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {option.id === 'bright_data_datasets' && <Star className="h-5 w-5 text-green-600" />}
                        {option.name}
                        {option.id === 'bright_data_datasets' && <Badge className="bg-green-600 text-white">Recommended</Badge>}
                      </CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {option.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cost Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        ${option.cost.monthly.toFixed(0)}/month
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
                        {option.implementation}
                      </div>
                      <div className="text-xs text-gray-600">Timeline</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {Math.round(0.20 / option.cost.perProfile)}x
                      </div>
                      <div className="text-xs text-gray-600">Cheaper than Apollo</div>
                    </div>
                  </div>

                  {/* Coverage Analysis */}
                  <div>
                    <h4 className="font-medium mb-2">Data Coverage:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(option.coverage).map(([key, value]) => (
                        <div key={key} className="p-2 bg-gray-50 rounded">
                          <div className="font-medium text-xs text-gray-600">{key.replace('_', ' ')}</div>
                          <div className="text-xs">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">✅ Advantages:</h4>
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
                      <h4 className="font-medium text-orange-800 mb-2">⚠️ Limitations:</h4>
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

      {/* Scraping-Free Advantages */}
      <Card>
        <CardHeader>
          <CardTitle>Why Go Scraping-Free?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scrapingFreeAdvantages.map((advantage, index) => (
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
          <CardTitle>Scraping-Free Cost Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Solution</th>
                  <th className="border border-gray-300 p-3 text-center">Risk Level</th>
                  <th className="border border-gray-300 p-3 text-center">Cost/Profile</th>
                  <th className="border border-gray-300 p-3 text-center">Monthly Cost*</th>
                  <th className="border border-gray-300 p-3 text-center">Data Age</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3 font-medium">Bright Data Datasets</td>
                  <td className="border border-gray-300 p-3 text-center">
                    <Badge className="bg-green-100 text-green-800">Zero Risk</Badge>
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">$0.002</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">${(volumeNeeds * 0.002).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center">1-3 months</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Apollo API Official</td>
                  <td className="border border-gray-300 p-3 text-center">
                    <Badge className="bg-green-100 text-green-800">Zero Risk</Badge>
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-bold">$0.200</td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-bold">${(volumeNeeds * 0.200).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center">Real-time</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3 font-medium">Hybrid Approach</td>
                  <td className="border border-gray-300 p-3 text-center">
                    <Badge className="bg-green-100 text-green-800">Zero Risk</Badge>
                  </td>
                  <td className="border border-gray-300 p-3 text-center text-purple-600 font-bold">$0.022</td>
                  <td className="border border-gray-300 p-3 text-center text-purple-600 font-bold">${((volumeNeeds * 0.9 * 0.002) + (volumeNeeds * 0.1 * 0.20)).toFixed(0)}</td>
                  <td className="border border-gray-300 p-3 text-center">Mixed</td>
                </tr>
              </tbody>
            </table>
            <div className="text-xs text-gray-500 mt-2">
              *Monthly cost for {volumeNeeds.toLocaleString()} profiles/month
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Path */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-6 w-6" />
            Recommended Scraping-Free Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge className="bg-green-600 text-white">Phase 1</Badge>
              <div className="flex-1">
                <h4 className="font-medium text-green-800">{recommendedPath.immediate.title}</h4>
                <p className="text-sm text-green-700 mt-1">{recommendedPath.immediate.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                  <div><span className="font-medium">Cost:</span> {recommendedPath.immediate.cost}</div>
                  <div><span className="font-medium">Timeline:</span> {recommendedPath.immediate.timeline}</div>
                  <div><span className="font-medium">Volume:</span> {recommendedPath.immediate.volume}</div>
                  <div><span className="font-medium">Risk:</span> {recommendedPath.immediate.risk}</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-blue-600 text-white">Phase 2</Badge>
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">{recommendedPath.growth.title}</h4>
                <p className="text-sm text-blue-700 mt-1">{recommendedPath.growth.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                  <div><span className="font-medium">Cost:</span> {recommendedPath.growth.cost}</div>
                  <div><span className="font-medium">Timeline:</span> {recommendedPath.growth.timeline}</div>
                  <div><span className="font-medium">Volume:</span> {recommendedPath.growth.volume}</div>
                  <div><span className="font-medium">Risk:</span> {recommendedPath.growth.risk}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">💡 Key Benefit at 30K Monthly Scale:</h4>
            <p className="text-sm text-gray-700">
              <strong>Zero scraping risks</strong> while processing 30,000+ profiles monthly from 15M+ LinkedIn dataset. 
              $60/month vs $6,000/month with Apollo API (100x cost savings). 
              Perfect scalability for growing teams without compliance concerns or rate limits.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Start with Bright Data Datasets (Zero Risk)
            </Button>
            <Button variant="outline" className="flex-1">
              Compare All Scraping-Free Options
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}