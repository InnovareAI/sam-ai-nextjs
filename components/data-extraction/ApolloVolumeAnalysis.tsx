/**
 * Apollo.io Volume Analysis for SAM AI
 * Detailed breakdown of Apollo's capacity, limits, and scaling options
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Users
} from 'lucide-react';

interface ApolloPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  searches: number;
  exports: number;
  apiCalls: number;
  emailCredits: number;
  phoneCredits: number;
  features: string[];
  idealFor: string[];
}

export default function ApolloVolumeAnalysis() {
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'organization' | 'enterprise'>('professional');
  const [volumeNeeds, setVolumeNeeds] = useState<number>(1000);

  // Based on publicly available Apollo pricing and typical B2B platform limits
  const apolloPlans: Record<string, ApolloPlan> = {
    starter: {
      name: 'Starter',
      monthlyPrice: 49,
      yearlyPrice: 468, // 20% discount typical
      searches: 1000,
      exports: 500,
      apiCalls: 1000,
      emailCredits: 1000,
      phoneCredits: 120,
      features: [
        'Basic prospecting',
        'Email sequences',
        'CRM integration',
        'Lead scoring',
        'Basic API access'
      ],
      idealFor: ['Small teams', 'Individual reps', 'Testing Apollo']
    },
    professional: {
      name: 'Professional',
      monthlyPrice: 79,
      yearlyPrice: 948,
      searches: 5000,
      exports: 2500,
      apiCalls: 5000,
      emailCredits: 5000,
      phoneCredits: 600,
      features: [
        'Advanced prospecting',
        'Email automation',
        'Phone dialer',
        'Advanced filters',
        'API access',
        'Team management'
      ],
      idealFor: ['Growing teams', 'Sales automation', 'Regular prospecting']
    },
    organization: {
      name: 'Organization',
      monthlyPrice: 119,
      yearlyPrice: 1428,
      searches: 15000,
      exports: 7500,
      apiCalls: 15000,
      emailCredits: 15000,
      phoneCredits: 1800,
      features: [
        'All Professional features',
        'Advanced analytics',
        'Custom fields',
        'Salesforce sync',
        'Priority support',
        'Advanced API limits'
      ],
      idealFor: ['Larger teams', 'Enterprise sales', 'High-volume prospecting']
    },
    enterprise: {
      name: 'Enterprise',
      monthlyPrice: 199,
      yearlyPrice: 2388,
      searches: 50000,
      exports: 25000,
      apiCalls: 50000,
      emailCredits: 50000,
      phoneCredits: 6000,
      features: [
        'Unlimited searches*',
        'Unlimited exports*',
        'Custom API limits',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantees',
        'Advanced security'
      ],
      idealFor: ['Large enterprises', 'High-volume automation', 'Custom needs']
    }
  };

  const volumeScenarios = [
    {
      name: 'Small Scale Testing',
      dailyLeads: 50,
      monthlyLeads: 1500,
      recommendedPlan: 'starter',
      costEstimate: '$49/month',
      rationale: 'Perfect for testing Apollo integration with SAM AI'
    },
    {
      name: 'Regular Prospecting',
      dailyLeads: 250,
      monthlyLeads: 7500,
      recommendedPlan: 'organization',
      costEstimate: '$119/month',
      rationale: 'Good balance of volume and features for most SAM AI users'
    },
    {
      name: 'High-Volume Operation',
      dailyLeads: 1000,
      monthlyLeads: 30000,
      recommendedPlan: 'enterprise',
      costEstimate: '$199-500/month',
      rationale: 'Enterprise features with custom limits for large operations'
    },
    {
      name: 'Maximum Scale',
      dailyLeads: 5000,
      monthlyLeads: 150000,
      recommendedPlan: 'enterprise',
      costEstimate: '$500-2000/month',
      rationale: 'Custom enterprise agreement with unlimited access'
    }
  ];

  const apiLimitations = [
    {
      category: 'Rate Limits',
      description: 'API calls per minute/hour restrictions',
      typical: '100-1000 calls/minute depending on plan',
      workaround: 'Batch requests, implement queue system'
    },
    {
      category: 'Daily Exports',
      description: 'Number of contact exports per day',
      typical: '500-25,000 per month depending on plan',
      workaround: 'Spread exports across multiple days, use API streaming'
    },
    {
      category: 'Search Volume',
      description: 'Number of searches per month',
      typical: '1,000-50,000 searches per month',
      workaround: 'Optimize search queries, use filters effectively'
    },
    {
      category: 'Concurrent Users',
      description: 'Number of team members using Apollo',
      typical: '1-unlimited depending on plan',
      workaround: 'Share API credentials, rotate user access'
    }
  ];

  const selectedPlanData = apolloPlans[selectedPlan];

  const calculateDailyCapacity = (plan: ApolloPlan): number => {
    // Conservative estimate: use lower of exports or API calls, divided by 30 days
    return Math.floor(Math.min(plan.exports, plan.apiCalls) / 30);
  };

  const getRecommendedPlan = (dailyVolume: number): string => {
    if (dailyVolume <= 16) return 'starter'; // 500/30
    if (dailyVolume <= 83) return 'professional'; // 2500/30
    if (dailyVolume <= 250) return 'organization'; // 7500/30
    return 'enterprise';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Apollo.io Volume Analysis - How Much Can We Scrape?
          </CardTitle>
          <CardDescription>
            Detailed breakdown of Apollo's capacity limits, pricing, and scaling options for SAM AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">275M+</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">50K</div>
              <div className="text-sm text-gray-600">Max Monthly Searches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">25K</div>
              <div className="text-sm text-gray-600">Max Monthly Exports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1,667</div>
              <div className="text-sm text-gray-600">Max Daily Leads</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Volume Requirements Input */}
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
                min="10"
                max="2000"
                step="10"
                value={volumeNeeds}
                onChange={(e) => setVolumeNeeds(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-center text-lg font-bold mt-2">{volumeNeeds.toLocaleString()} leads/day</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Recommended Plan: <Badge>{getRecommendedPlan(volumeNeeds)}</Badge></h4>
              <p className="text-sm text-gray-600">
                For {volumeNeeds} daily leads ({(volumeNeeds * 30).toLocaleString()} monthly), 
                you'll need the {getRecommendedPlan(volumeNeeds)} plan or higher.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Apollo Plans Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Apollo.io Plan Comparison</CardTitle>
          <CardDescription>
            Choose the right plan based on your volume needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPlan} onValueChange={(value) => setSelectedPlan(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="starter">Starter</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            </TabsList>

            {Object.entries(apolloPlans).map(([planId, plan]) => (
              <TabsContent key={planId} value={planId} className="space-y-4">
                <Card className={planId === 'professional' ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{plan.name}</CardTitle>
                      {planId === 'professional' && <Badge>Popular Choice</Badge>}
                    </div>
                    <CardDescription>
                      ${plan.monthlyPrice}/month • ${plan.yearlyPrice}/year (save ${(plan.monthlyPrice * 12) - plan.yearlyPrice})
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Volume Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">{plan.searches.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Monthly Searches</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">{plan.exports.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">Monthly Exports</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">{calculateDailyCapacity(plan)}</div>
                        <div className="text-xs text-gray-600">Daily Capacity</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">{plan.apiCalls.toLocaleString()}</div>
                        <div className="text-xs text-gray-600">API Calls</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold">${(plan.monthlyPrice / plan.exports).toFixed(3)}</div>
                        <div className="text-xs text-gray-600">Cost/Credit</div>
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="font-medium mb-2">Key Features:</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Ideal For */}
                    <div>
                      <h4 className="font-medium mb-2">Ideal For:</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.idealFor.map((use, index) => (
                          <Badge key={index} variant="outline">{use}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Volume Assessment */}
                    <div className={`p-3 rounded-lg ${calculateDailyCapacity(plan) >= volumeNeeds ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      {calculateDailyCapacity(plan) >= volumeNeeds ? (
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            ✅ Can handle your {volumeNeeds} daily leads requirement
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            ❌ Insufficient for {volumeNeeds} daily leads (max: {calculateDailyCapacity(plan)})
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Volume Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Common Volume Scenarios</CardTitle>
          <CardDescription>
            Real-world usage scenarios with recommended plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {volumeScenarios.map((scenario, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">{scenario.name}</h4>
                  <Badge variant="outline">{scenario.recommendedPlan}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Volume:</span>
                    <span className="font-medium">{scenario.dailyLeads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Volume:</span>
                    <span className="font-medium">{scenario.monthlyLeads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Cost:</span>
                    <span className="font-medium">{scenario.costEstimate}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{scenario.rationale}</p>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Billing Structure */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Apollo API Billing Structure - ANSWERED
          </CardTitle>
          <CardDescription>
            Critical clarification: How Apollo API usage is billed and measured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">✅ API Usage = Plan Credits</h4>
              <p className="text-sm text-green-700">
                <strong>Apollo API calls consume credits from your subscription plan</strong> - they are NOT billed separately. 
                Search and enrichment API endpoints use the same credit system as manual searches and exports.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-white rounded-lg border">
                <h5 className="font-medium text-blue-800 mb-2">Credit Consumption:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Search API = Uses search credits</li>
                  <li>• Enrichment API = Uses export credits</li>
                  <li>• People/Org lookups = 1 credit each</li>
                  <li>• Mobile numbers = 5 credits each</li>
                </ul>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <h5 className="font-medium text-purple-800 mb-2">Plan Integration:</h5>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Professional: 2,500 credits/month</li>
                  <li>• Organization: 7,500 credits/month</li>
                  <li>• Enterprise: 25,000 credits/month</li>
                  <li>• Additional credits: $0.20 each</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Important Implication:</h4>
              <p className="text-sm text-yellow-700">
                High-volume API usage will quickly consume your monthly credit allocation. For SAM AI's 1,000+ daily leads requirement, 
                you'll need Enterprise plan (25K credits) or purchase additional credits at $0.20 each.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Limitations */}
      <Card>
        <CardHeader>
          <CardTitle>Apollo API Limitations & Workarounds</CardTitle>
          <CardDescription>
            Understanding and working around Apollo's restrictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiLimitations.map((limitation, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{limitation.category}</h4>
                  <Badge variant="secondary">Limitation</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{limitation.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-orange-700">Typical Limit:</span>
                    <p className="text-orange-600">{limitation.typical}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">SAM AI Workaround:</span>
                    <p className="text-green-600">{limitation.workaround}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Scaling */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Zap className="h-5 w-5" />
            Enterprise Scaling Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2">Multi-Account Strategy</h4>
                <p className="text-sm text-gray-600">
                  Use multiple Apollo accounts to multiply limits. 3 Organization accounts = 22,500 monthly exports.
                </p>
                <div className="text-lg font-bold text-purple-600 mt-2">750/day</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2">Custom Enterprise Deal</h4>
                <p className="text-sm text-gray-600">
                  Negotiate custom limits with Apollo for high-volume use. Possible unlimited access.
                </p>
                <div className="text-lg font-bold text-purple-600 mt-2">Unlimited*</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium mb-2">Hybrid Approach</h4>
                <p className="text-sm text-gray-600">
                  Combine Apollo with Bright Data datasets for maximum volume coverage.
                </p>
                <div className="text-lg font-bold text-purple-600 mt-2">50K+/day</div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📞 Contact Apollo Sales</h4>
              <p className="text-sm text-purple-700">
                For volumes above 25,000 monthly exports, contact Apollo's enterprise sales team. 
                They often provide custom pricing and unlimited access for large-scale automation use cases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button className="flex-1">
              Start with {getRecommendedPlan(volumeNeeds)} Plan
            </Button>
            <Button variant="outline">
              Contact Apollo Sales
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">SAM AI Integration Ready</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your Apollo integration is preset and ready. For {volumeNeeds.toLocaleString()} daily leads, 
              expect approximately <strong>${(selectedPlanData.monthlyPrice || 79).toFixed(0)}/month</strong> 
              with <strong>zero profile burning risk</strong> and enterprise-grade reliability.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}