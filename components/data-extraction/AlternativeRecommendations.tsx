/**
 * Alternative Data Source Recommendations
 * Quick analysis of best alternatives now that Apollo API is expensive
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  Database, 
  Star, 
  CheckCircle,
  AlertTriangle,
  Zap
} from 'lucide-react';

export default function AlternativeRecommendations() {
  const alternatives = [
    {
      rank: 1,
      name: 'Bright Data Datasets',
      costPerLead: 0.002,
      dailyVolume: 50000,
      monthlyBudget: '$100-500',
      savings: '100x cheaper than Apollo',
      pros: [
        'Massive pre-scraped datasets (no scraping needed)',
        'Unlimited daily volume - no rate limits',
        'Very cost-effective: $0.002/lead vs Apollo $0.20/lead',
        'Multiple industry datasets available',
        'Regular updates, bulk download',
        'Zero account risk, zero API limits'
      ],
      cons: [
        'Data may be 1-3 months old',
        'Requires data processing pipeline',
        'One-time snapshots vs real-time'
      ],
      recommendation: 'BEST for high-volume prospecting',
      color: 'green'
    },
    {
      rank: 2,
      name: 'People Data Labs',
      costPerLead: 0.008,
      dailyVolume: 20000,
      monthlyBudget: '$300-1000',
      savings: '25x cheaper than Apollo',
      pros: [
        '3B+ person profiles in database',
        'Real-time API access (vs static datasets)',
        'Comprehensive search and filtering',
        'Good balance of volume and freshness',
        'Multiple data sources combined',
        'Enterprise-grade infrastructure'
      ],
      cons: [
        'More expensive than Bright Data',
        'Complex API integration',
        'Enterprise pricing model'
      ],
      recommendation: 'BEST for real-time data needs',
      color: 'blue'
    },
    {
      rank: 3,
      name: 'Google Search API',
      costPerLead: 0.01,
      dailyVolume: 5000,
      monthlyBudget: '$50-200',
      savings: '20x cheaper than Apollo',
      pros: [
        'Very low cost per search',
        'Access to unlimited data sources',
        'Real-time information',
        'Custom search strategies possible',
        'Official Google API - reliable',
        'Great for niche targeting'
      ],
      cons: [
        'Requires custom data extraction logic',
        'Variable data quality',
        'Lower daily volume limits',
        'Needs post-processing pipeline'
      ],
      recommendation: 'BEST for custom search strategies',
      color: 'orange'
    }
  ];

  const apolloComparison = {
    apollo: {
      realCost: '$6000/month',
      dailyVolume: 833,
      calculation: '30,000 leads × $0.20 = $6,000/month'
    },
    brightData: {
      realCost: '$60/month',
      dailyVolume: 50000,
      calculation: '30,000 leads × $0.002 = $60/month'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Alert */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-6 w-6" />
            Apollo API Reality Check - EXPENSIVE!
          </CardTitle>
          <CardDescription className="text-red-700">
            Apollo API uses plan credits: 30,000 monthly leads = $6,000/month vs alternatives at $60-300/month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-100 rounded-lg">
              <h4 className="font-medium text-red-800">Apollo API Reality:</h4>
              <div className="text-2xl font-bold text-red-600">$6,000/month</div>
              <div className="text-sm text-red-700">30,000 leads × $0.20/credit</div>
            </div>
            <div className="p-4 bg-green-100 rounded-lg">
              <h4 className="font-medium text-green-800">Bright Data Alternative:</h4>
              <div className="text-2xl font-bold text-green-600">$60/month</div>
              <div className="text-sm text-green-700">30,000 leads × $0.002/lead</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Alternatives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Top 3 Apollo Alternatives - Ranked by Value
          </CardTitle>
          <CardDescription>
            Best options for high-volume lead generation without breaking the bank
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {alternatives.map((alt) => (
              <Card key={alt.rank} className={`border-${alt.color}-200 bg-${alt.color}-50`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={`bg-${alt.color}-600 text-white`}>#{alt.rank}</Badge>
                      <CardTitle className="text-lg">{alt.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {alt.savings}
                    </Badge>
                  </div>
                  <CardDescription className={`text-${alt.color}-700 font-medium`}>
                    {alt.recommendation}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-green-600">${alt.costPerLead.toFixed(3)}</div>
                      <div className="text-xs text-gray-600">Per Lead</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{alt.dailyVolume.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">Daily Volume</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-purple-600">{alt.monthlyBudget}</div>
                      <div className="text-xs text-gray-600">Monthly Cost</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{Math.round(0.20 / alt.costPerLead)}x</div>
                      <div className="text-xs text-gray-600">Cheaper</div>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-800 mb-2">✅ Key Benefits:</h4>
                      <ul className="space-y-1 text-sm text-green-700">
                        {alt.pros.slice(0, 3).map((pro, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-orange-800 mb-2">⚠️ Considerations:</h4>
                      <ul className="space-y-1 text-sm text-orange-700">
                        {alt.cons.map((con, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-orange-600 mt-0.5">•</span>
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

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Real Cost Comparison (30,000 leads/month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Data Source</th>
                  <th className="border border-gray-300 p-3 text-center">Cost/Lead</th>
                  <th className="border border-gray-300 p-3 text-center">Monthly Cost</th>
                  <th className="border border-gray-300 p-3 text-center">Annual Cost</th>
                  <th className="border border-gray-300 p-3 text-center">vs Apollo</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-red-50">
                  <td className="border border-gray-300 p-3 font-medium">Apollo API</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600 font-bold">$0.200</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600 font-bold">$6,000</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600 font-bold">$72,000</td>
                  <td className="border border-gray-300 p-3 text-center">Baseline</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border border-gray-300 p-3 font-medium">Bright Data</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">$0.002</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">$60</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">$720</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600">100x cheaper</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-3 font-medium">People Data Labs</td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-bold">$0.008</td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-bold">$240</td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600 font-bold">$2,880</td>
                  <td className="border border-gray-300 p-3 text-center text-blue-600">25x cheaper</td>
                </tr>
                <tr className="bg-orange-50">
                  <td className="border border-gray-300 p-3 font-medium">Google Search</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600 font-bold">$0.010</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600 font-bold">$300</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600 font-bold">$3,600</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600">20x cheaper</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">💰 Annual Savings with Bright Data:</h4>
            <div className="text-2xl font-bold text-green-600 mt-1">$71,280/year</div>
            <div className="text-sm text-green-700">Apollo: $72,000 vs Bright Data: $720</div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Priority */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-6 w-6" />
            Recommended Implementation Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 text-white">1st</Badge>
              <div>
                <h4 className="font-medium text-green-800">Start with Bright Data Datasets</h4>
                <p className="text-sm text-green-700">
                  Immediate access to massive datasets, 100x cost savings, unlimited volume. 
                  Perfect for bulk prospecting and building your initial lead database.
                </p>
                <div className="mt-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Setup Bright Data Integration
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-blue-600 text-white">2nd</Badge>
              <div>
                <h4 className="font-medium text-blue-800">Add People Data Labs for Real-Time</h4>
                <p className="text-sm text-blue-700">
                  Layer in real-time API access for fresh data and custom searches. 
                  Use for high-priority prospects and new market segments.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-orange-600 text-white">3rd</Badge>
              <div>
                <h4 className="font-medium text-orange-800">Google Search for Niche Targeting</h4>
                <p className="text-sm text-orange-700">
                  Implement custom search strategies for specific verticals and hard-to-find prospects.
                  Great for conference speakers, podcast guests, GitHub developers.
                </p>
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
              Implement Bright Data (Save $71K/year)
            </Button>
            <Button variant="outline" className="flex-1">
              Compare All Alternatives
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}