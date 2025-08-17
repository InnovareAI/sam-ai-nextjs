/**
 * ScrapingBee Analysis for SAM AI
 * Evaluate ScrapingBee as an alternative to direct LinkedIn scraping
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Code
} from 'lucide-react';

export default function ScrapingBeeAnalysis() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'business'>('growth');

  const scrapingBeePlans = {
    starter: {
      name: 'Starter',
      monthlyPrice: 49,
      credits: 250000,
      costPerCredit: 0.000196,
      estimatedLeads: 2500, // Assuming 100 credits per LinkedIn profile
      dailyVolume: 83,
      features: ['Rotating Proxies', 'JavaScript Rendering', 'AI Extraction']
    },
    growth: {
      name: 'Growth',
      monthlyPrice: 149,
      credits: 1000000,
      costPerCredit: 0.000149,
      estimatedLeads: 10000,
      dailyVolume: 333,
      features: ['All Starter features', 'Priority Support', 'Custom Headers', 'Screenshots']
    },
    business: {
      name: 'Business',
      monthlyPrice: 599,
      credits: 8000000,
      costPerCredit: 0.000075,
      estimatedLeads: 80000,
      dailyVolume: 2667,
      features: ['All Growth features', 'Dedicated Support', 'Custom JS Scenarios', 'Webhooks']
    }
  };

  const comparisonMatrix = {
    scrapingbee_vs_alternatives: [
      {
        metric: 'Daily Volume Capacity',
        scrapingbee: '2,667 profiles/day (Business plan)',
        apollo: '10,000+ leads/day',
        linkedin_direct: '300-400 profiles/day',
        winner: 'Apollo'
      },
      {
        metric: 'Account Risk',
        scrapingbee: 'Medium (still LinkedIn ToS violation)',
        apollo: 'None (official API)',
        linkedin_direct: 'High (account bans)',
        winner: 'Apollo'
      },
      {
        metric: 'Setup Complexity',
        scrapingbee: 'Medium (custom development)',
        apollo: 'Easy (ready-made integration)',
        linkedin_direct: 'Hard (profile management)',
        winner: 'Apollo'
      },
      {
        metric: 'Cost per Lead',
        scrapingbee: '$0.0075-0.02/lead',
        apollo: '$0.01/lead',
        linkedin_direct: '$0.06/lead + risks',
        winner: 'ScrapingBee'
      },
      {
        metric: 'Data Quality',
        scrapingbee: 'High (if working)',
        apollo: 'High + verified',
        linkedin_direct: 'High (if working)',
        winner: 'Tie'
      },
      {
        metric: 'Reliability',
        scrapingbee: 'Medium (subject to blocking)',
        apollo: 'High (enterprise SLA)',
        linkedin_direct: 'Low (frequent blocks)',
        winner: 'Apollo'
      }
    ]
  };

  const linkedinScrapingChallenges = [
    {
      challenge: 'LinkedIn Anti-Bot Detection',
      difficulty: 'High',
      scrapingbeeHelps: 'Partially',
      description: 'LinkedIn has sophisticated detection systems that can identify automated behavior patterns',
      solution: 'Rotating proxies and AI-powered extraction help, but detection is still possible'
    },
    {
      challenge: 'Rate Limiting',
      difficulty: 'High',
      scrapingbeeHelps: 'Yes',
      description: 'LinkedIn enforces strict rate limits on profile viewing',
      solution: 'Proxy rotation can help distribute requests across IP addresses'
    },
    {
      challenge: 'JavaScript-Heavy Pages',
      difficulty: 'Medium',
      scrapingbeeHelps: 'Yes',
      description: 'LinkedIn pages require JavaScript rendering for full content',
      solution: 'ScrapingBee handles JavaScript rendering automatically'
    },
    {
      challenge: 'Dynamic Content Loading',
      difficulty: 'Medium',
      scrapingbeeHelps: 'Yes',
      description: 'Profile content loads dynamically as you scroll',
      solution: 'Custom JavaScript scenarios can handle dynamic loading'
    },
    {
      challenge: 'Terms of Service Violation',
      difficulty: 'Legal Risk',
      scrapingbeeHelps: 'No',
      description: 'Scraping LinkedIn violates their Terms of Service regardless of method',
      solution: 'No technical solution - remains a legal/compliance risk'
    }
  ];

  const selectedPlanData = scrapingBeePlans[selectedPlan];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-6 w-6 text-orange-600" />
            ScrapingBee Analysis for LinkedIn Data
          </CardTitle>
          <CardDescription>
            Evaluating ScrapingBee as a LinkedIn scraping alternative - better than direct scraping but still has risks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">8M</div>
              <div className="text-sm text-gray-600">Max Monthly Credits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">2,667</div>
              <div className="text-sm text-gray-600">Max Daily Profiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">6.7x</div>
              <div className="text-sm text-gray-600">vs Direct LinkedIn</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">Medium</div>
              <div className="text-sm text-gray-600">Risk Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ScrapingBee Plans */}
      <Card>
        <CardHeader>
          <CardTitle>ScrapingBee Pricing Plans</CardTitle>
          <CardDescription>
            Choose a plan based on your LinkedIn scraping volume needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="starter">Starter ($49)</TabsTrigger>
              <TabsTrigger value="growth">Growth ($149)</TabsTrigger>
              <TabsTrigger value="business">Business ($599)</TabsTrigger>
            </TabsList>

            {Object.entries(scrapingBeePlans).map(([planId, plan]) => (
              <TabsContent key={planId} value={planId} className="space-y-4">
                <Card className={planId === 'growth' ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{plan.name} Plan</CardTitle>
                      {planId === 'growth' && <Badge>Recommended</Badge>}
                    </div>
                    <CardDescription>
                      ${plan.monthlyPrice}/month • {plan.credits.toLocaleString()} credits
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">${plan.monthlyPrice}</div>
                        <div className="text-xs text-gray-600">Monthly Cost</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">{plan.estimatedLeads.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">LinkedIn Profiles</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">{plan.dailyVolume}</div>
                        <div className="text-xs text-gray-600">Profiles/Day</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">${(plan.monthlyPrice / plan.estimatedLeads).toFixed(3)}</div>
                        <div className="text-xs text-gray-600">Cost/Profile</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Included Features:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Comparison Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>ScrapingBee vs Alternatives</CardTitle>
          <CardDescription>
            Head-to-head comparison across key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Metric</th>
                  <th className="border border-gray-300 p-3 text-center">ScrapingBee</th>
                  <th className="border border-gray-300 p-3 text-center">Apollo API</th>
                  <th className="border border-gray-300 p-3 text-center">Direct LinkedIn</th>
                  <th className="border border-gray-300 p-3 text-center">Winner</th>
                </tr>
              </thead>
              <tbody>
                {comparisonMatrix.scrapingbee_vs_alternatives.map((row, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-3 font-medium">{row.metric}</td>
                    <td className="border border-gray-300 p-3 text-center">{row.scrapingbee}</td>
                    <td className="border border-gray-300 p-3 text-center">{row.apollo}</td>
                    <td className="border border-gray-300 p-3 text-center">{row.linkedin_direct}</td>
                    <td className="border border-gray-300 p-3 text-center">
                      <Badge variant={row.winner === 'Apollo' ? 'default' : row.winner === 'ScrapingBee' ? 'secondary' : 'outline'}>
                        {row.winner}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* LinkedIn Scraping Challenges */}
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn Scraping Challenges</CardTitle>
          <CardDescription>
            How ScrapingBee addresses (or doesn't address) LinkedIn's anti-scraping measures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {linkedinScrapingChallenges.map((challenge, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{challenge.challenge}</h4>
                  <div className="flex gap-2">
                    <Badge variant={challenge.difficulty === 'Legal Risk' ? 'destructive' : challenge.difficulty === 'High' ? 'destructive' : 'secondary'}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant={challenge.scrapingbeeHelps === 'Yes' ? 'default' : challenge.scrapingbeeHelps === 'Partially' ? 'secondary' : 'destructive'}>
                      {challenge.scrapingbeeHelps === 'Yes' ? 'Helps' : challenge.scrapingbeeHelps === 'Partially' ? 'Partial' : 'No Help'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                <p className="text-sm font-medium">ScrapingBee Solution: {challenge.solution}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            ScrapingBee Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-3">✅ ScrapingBee Advantages:</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Better rate limits than direct scraping
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Rotating proxy infrastructure
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  JavaScript rendering support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  AI-powered data extraction
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  No CSS selector maintenance
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-800 mb-3">⚠️ Remaining Risks:</h4>
              <ul className="space-y-2 text-sm text-red-700">
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Still violates LinkedIn Terms of Service
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  LinkedIn can still detect and block
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Custom development required
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  No guaranteed uptime
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Higher cost than official APIs
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Recommendation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Final Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border-l-4 border-green-500">
              <h4 className="font-medium text-green-800">Best Choice: Apollo.io API</h4>
              <p className="text-sm text-green-700 mt-1">
                <strong>10,000+ leads/day</strong> with <strong>zero risk</strong> at <strong>$0.01/lead</strong>. 
                Official API with enterprise reliability and legal compliance.
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border-l-4 border-yellow-500">
              <h4 className="font-medium text-yellow-800">Alternative: ScrapingBee</h4>
              <p className="text-sm text-yellow-700 mt-1">
                <strong>2,667 profiles/day</strong> with <strong>medium risk</strong> at <strong>$0.0075-0.02/lead</strong>. 
                Better than direct scraping but still has ToS violation risks.
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border-l-4 border-red-500">
              <h4 className="font-medium text-red-800">Avoid: Direct LinkedIn Scraping</h4>
              <p className="text-sm text-red-700 mt-1">
                <strong>300-400 profiles/day</strong> with <strong>high risk</strong> of account bans and profile burning.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="flex-1">
              Setup Apollo API (Recommended)
            </Button>
            <Button variant="outline">
              Explore ScrapingBee Option
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}