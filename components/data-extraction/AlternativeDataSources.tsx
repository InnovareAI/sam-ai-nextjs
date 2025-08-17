/**
 * Alternative Data Sources Component
 * Provides LinkedIn-safe alternatives for high-volume lead generation
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Shield, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Info,
  Target,
  Globe
} from 'lucide-react';

interface DataSourceRecommendation {
  strategy: string;
  primarySource: string;
  dailyVolume: number;
  costPerLead: number;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  description: string;
  pros: string[];
  setup: string[];
}

export default function AlternativeDataSources() {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('apollo_api');
  const [volumeRequirement, setVolumeRequirement] = useState<number>(1000);

  const dataSourceOptions: DataSourceRecommendation[] = [
    {
      strategy: 'apollo_api',
      primarySource: 'Apollo.io API',
      dailyVolume: 10000,
      costPerLead: 0.01,
      riskLevel: 'none',
      description: 'Official Apollo API with 275M+ verified contacts - no scraping risks',
      pros: [
        'Official API - no rate limit concerns',
        '275M+ verified contacts',
        'Real-time data enrichment',
        'Phone numbers and emails included',
        'No risk of account bans',
        'Can handle 10,000+ leads per day'
      ],
      setup: [
        'Sign up for Apollo API access',
        'Get API key and configure rate limits',
        'Integrate with SAM AI Apollo service',
        'Set up intelligent bulk approval',
        'Test with small batch first'
      ]
    },
    {
      strategy: 'people_data_labs',
      primarySource: 'People Data Labs API',
      dailyVolume: 20000,
      costPerLead: 0.008,
      riskLevel: 'none',
      description: '3B+ profiles with comprehensive search capabilities - enterprise grade',
      pros: [
        'Massive dataset (3B+ profiles)',
        'Flexible search and filtering',
        'Real-time API access',
        'Cost-effective for high volume',
        'Multiple data points per profile',
        'No LinkedIn dependency'
      ],
      setup: [
        'Get People Data Labs API access',
        'Configure search parameters',
        'Set up data enrichment pipeline',
        'Implement deduplication logic',
        'Add email verification step'
      ]
    },
    {
      strategy: 'bright_data_datasets',
      primarySource: 'Bright Data Public Datasets',
      dailyVolume: 100000,
      costPerLead: 0.001,
      riskLevel: 'none',
      description: 'Pre-scraped datasets updated regularly - massive volume at low cost',
      pros: [
        'No scraping required',
        'Unlimited daily volume',
        'Very cost-effective',
        'Multiple industry datasets',
        'No rate limits',
        'Perfect for bulk prospecting'
      ],
      setup: [
        'Browse Bright Data dataset catalog',
        'Purchase relevant datasets',
        'Set up data processing pipeline',
        'Implement filtering and enrichment',
        'Schedule regular dataset updates'
      ]
    },
    {
      strategy: 'hybrid_approach',
      primarySource: 'Apollo + ZoomInfo + Hunter.io',
      dailyVolume: 15000,
      costPerLead: 0.015,
      riskLevel: 'none',
      description: 'Combine multiple premium sources for maximum coverage and quality',
      pros: [
        'Best data quality and coverage',
        'Multiple verification sources',
        'Comprehensive contact info',
        'Enterprise-grade reliability',
        'Backup sources if one fails',
        'Premium prospect intelligence'
      ],
      setup: [
        'Set up Apollo API integration',
        'Configure ZoomInfo access',
        'Add Hunter.io for email verification',
        'Create unified data pipeline',
        'Implement smart source routing'
      ]
    }
  ];

  const linkedinAlternativeComparison = {
    linkedin_scraping: {
      dailyLimit: 400,
      riskLevel: 'high',
      cost: '$25/month + risk',
      dataQuality: 'high',
      issues: ['Account ban risk', 'Low daily limits', 'IP blocking', 'Legal concerns']
    },
    recommended_alternative: {
      dailyLimit: 10000,
      riskLevel: 'none',
      cost: '$200-500/month',
      dataQuality: 'high',
      benefits: ['No ban risk', '25x higher volume', 'Official APIs', 'Legal compliance']
    }
  };

  const handleStrategySelect = (strategy: string) => {
    setSelectedStrategy(strategy);
  };

  const selectedOption = dataSourceOptions.find(option => option.strategy === selectedStrategy);

  return (
    <div className="space-y-6">
      {/* Warning Card */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-6 w-6" />
            LinkedIn Scraping Rate Limit Warning
          </CardTitle>
          <CardDescription className="text-red-700">
            LinkedIn scrapers limited to 300-400 profiles/day - insufficient for serious lead generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-100 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Current LinkedIn Scraping</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Max 400 profiles/day</li>
                <li>• $25/month + risk of bans</li>
                <li>• Account suspension risk</li>
                <li>• Legal compliance concerns</li>
              </ul>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Recommended Alternative</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• 10,000+ leads/day possible</li>
                <li>• Official APIs, no ban risk</li>
                <li>• Better data quality</li>
                <li>• Legally compliant</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Alternative Data Source Strategies
          </CardTitle>
          <CardDescription>
            Choose a LinkedIn-safe alternative that meets your volume requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="apollo_api">Apollo API</TabsTrigger>
              <TabsTrigger value="people_data_labs">People Data Labs</TabsTrigger>
              <TabsTrigger value="bright_data_datasets">Bright Data</TabsTrigger>
              <TabsTrigger value="hybrid_approach">Hybrid Approach</TabsTrigger>
            </TabsList>

            {dataSourceOptions.map((option) => (
              <TabsContent key={option.strategy} value={option.strategy} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          {option.primarySource}
                        </CardTitle>
                        <CardDescription>{option.description}</CardDescription>
                      </div>
                      <Badge variant={option.riskLevel === 'none' ? 'default' : 'destructive'}>
                        Risk: {option.riskLevel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {option.dailyVolume.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Leads/Day</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${option.costPerLead.toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-600">Cost/Lead</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          ${(option.costPerLead * volumeRequirement).toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Daily Cost</div>
                      </div>
                    </div>

                    {/* Pros */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Key Benefits
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm text-gray-700">
                        {option.pros.map((pro, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-600 rounded-full"></div>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Setup Steps */}
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        Implementation Steps
                      </h4>
                      <ol className="space-y-1 text-sm text-gray-700">
                        {option.setup.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              {index + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Volume Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Volume & Cost Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Daily Lead Volume Required</label>
            <input
              type="range"
              min="100"
              max="50000"
              step="100"
              value={volumeRequirement}
              onChange={(e) => setVolumeRequirement(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-lg font-bold">{volumeRequirement.toLocaleString()} leads/day</div>
          </div>

          {selectedOption && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">${(selectedOption.costPerLead * volumeRequirement).toFixed(0)}</div>
                <div className="text-sm text-gray-600">Daily Cost</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">${(selectedOption.costPerLead * volumeRequirement * 30).toFixed(0)}</div>
                <div className="text-sm text-gray-600">Monthly Cost</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold">
                  {selectedOption.dailyVolume >= volumeRequirement ? '✅' : '❌'}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedOption.dailyVolume >= volumeRequirement ? 'Volume OK' : 'Volume Exceeded'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Scraping vs Recommended Alternative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Metric</th>
                  <th className="border border-gray-300 p-3 text-left">LinkedIn Scraping</th>
                  <th className="border border-gray-300 p-3 text-left">Recommended Alternative</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Daily Volume</td>
                  <td className="border border-gray-300 p-3 text-red-600">300-400 profiles</td>
                  <td className="border border-gray-300 p-3 text-green-600">10,000+ leads</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Risk Level</td>
                  <td className="border border-gray-300 p-3 text-red-600">High (ban risk)</td>
                  <td className="border border-gray-300 p-3 text-green-600">None (official APIs)</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Cost</td>
                  <td className="border border-gray-300 p-3">$25/month + risks</td>
                  <td className="border border-gray-300 p-3">$200-500/month</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Data Quality</td>
                  <td className="border border-gray-300 p-3">High (when working)</td>
                  <td className="border border-gray-300 p-3">High + verified</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Scalability</td>
                  <td className="border border-gray-300 p-3 text-red-600">Limited</td>
                  <td className="border border-gray-300 p-3 text-green-600">Enterprise-grade</td>
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
            <Button className="flex-1">
              Implement {selectedOption?.primarySource}
            </Button>
            <Button variant="outline">
              Get Implementation Guide
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Next Steps</h4>
                <p className="text-sm text-blue-700 mt-1">
                  The recommended approach eliminates LinkedIn scraping risks while providing 
                  25x higher daily volume at enterprise-grade reliability. Your SAM AI system 
                  will be able to process {selectedOption?.dailyVolume.toLocaleString()} leads per day 
                  with the intelligent bulk approval system we built.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}