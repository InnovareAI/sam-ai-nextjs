/**
 * Apify vs Bright Data MCP Comparison
 * Determine if we need both or can consolidate to Bright Data MCP
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Database, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Shield,
  Code,
  Globe
} from 'lucide-react';

export default function ApifyVsBrightDataComparison() {
  const [selectedScenario, setSelectedScenario] = useState<string>('apollo_scraping');

  const scenarios = [
    {
      id: 'apollo_scraping',
      name: 'Apollo.io Lead Scraping',
      description: 'Extract leads from Apollo search results',
      volume: '10,000 leads/day',
      complexity: 'High'
    },
    {
      id: 'linkedin_profiles',
      name: 'LinkedIn Profile Extraction',
      description: 'Scrape LinkedIn profiles for lead data',
      volume: '1,000 profiles/day',
      complexity: 'Very High'
    },
    {
      id: 'company_websites',
      name: 'Company Website Crawling',
      description: 'Extract team/contact info from websites',
      volume: '5,000 pages/day',
      complexity: 'Medium'
    },
    {
      id: 'search_based_leads',
      name: 'Search-Based Lead Generation',
      description: 'Find leads through Google/Bing searches',
      volume: '2,000 leads/day',
      complexity: 'Low'
    }
  ];

  const comparisonMatrix = {
    apollo_scraping: {
      apify: {
        capability: 'Excellent',
        cost: '$45-120/month',
        setup: 'Pre-built actors available',
        reliability: 'High',
        pros: ['Dedicated Apollo actors', 'Handles anti-bot measures', 'Proven at scale'],
        cons: ['Additional service cost', 'Separate platform', 'Actor dependency']
      },
      brightdata_mcp: {
        capability: 'Good',
        cost: 'Free (5K requests/month)',
        setup: 'Custom implementation needed',
        reliability: 'Medium',
        pros: ['Free tier available', 'Direct MCP integration', 'No external dependency'],
        cons: ['No Apollo-specific optimization', 'Manual anti-bot handling', 'Limited free requests']
      },
      recommendation: 'Apify (specialized Apollo actors)'
    },
    linkedin_profiles: {
      apify: {
        capability: 'Excellent',
        cost: '$120-300/month',
        setup: 'Multiple LinkedIn actors',
        reliability: 'High',
        pros: ['LinkedIn-specific actors', 'Profile parsing', 'Scale proven'],
        cons: ['Higher cost', 'Still has LinkedIn limits', 'External platform']
      },
      brightdata_mcp: {
        capability: 'Poor',
        cost: 'Free tier insufficient',
        setup: 'Very complex',
        reliability: 'Low',
        pros: ['MCP integration', 'No external service'],
        cons: ['LinkedIn actively blocks', 'No specialized tools', 'High failure rate']
      },
      recommendation: 'Neither (use alternatives like Apollo API instead)'
    },
    company_websites: {
      apify: {
        capability: 'Good',
        cost: '$45-120/month',
        setup: 'Generic web scraping actors',
        reliability: 'High',
        pros: ['Reliable infrastructure', 'Multiple actors available', 'Good scaling'],
        cons: ['Generic solutions', 'Additional cost', 'Not contact-optimized']
      },
      brightdata_mcp: {
        capability: 'Excellent',
        cost: 'Free (5K requests/month)',
        setup: 'Native MCP integration',
        reliability: 'High',
        pros: ['Perfect for web crawling', 'Free tier sufficient', 'Native integration'],
        cons: ['May need custom parsing', 'Request limits']
      },
      recommendation: 'Bright Data MCP (ideal use case)'
    },
    search_based_leads: {
      apify: {
        capability: 'Good',
        cost: '$45-120/month',
        setup: 'Search result actors',
        reliability: 'High',
        pros: ['Reliable search scraping', 'Multiple search engines', 'Proven scaling'],
        cons: ['Overkill for simple searches', 'Additional cost', 'External dependency']
      },
      brightdata_mcp: {
        capability: 'Excellent',
        cost: 'Free (5K requests/month)',
        setup: 'Built-in search functionality',
        reliability: 'High',
        pros: ['Perfect for web search', 'Free tier covers needs', 'Direct integration'],
        cons: ['Limited free requests', 'Manual result parsing']
      },
      recommendation: 'Bright Data MCP (designed for this)'
    }
  };

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);
  const selectedComparison = comparisonMatrix[selectedScenario];

  const overallAnalysis = {
    brightDataMCP: {
      bestFor: [
        'Web search and crawling',
        'General website data extraction', 
        'Company website scraping',
        'Search-based lead generation'
      ],
      limitations: [
        'Not optimized for specific platforms',
        'Limited free tier (5K requests/month)',
        'Requires custom implementation',
        'No specialized anti-bot measures'
      ],
      cost: 'Free tier: 5K requests/month, then paid plans',
      integration: 'Native MCP - seamless with SAM AI'
    },
    apify: {
      bestFor: [
        'Apollo.io lead scraping',
        'Platform-specific scraping',
        'Large-scale data extraction',
        'Specialized use cases'
      ],
      limitations: [
        'Additional service cost ($45-300/month)',
        'External platform dependency',
        'Separate billing and management',
        'Generic actors may not fit needs'
      ],
      cost: '$45-300/month depending on usage',
      integration: 'API integration - requires additional setup'
    }
  };

  const recommendedApproach = {
    phase1: {
      title: 'Start with Bright Data MCP Only',
      description: 'Use MCP for web search, crawling, and general data extraction',
      cost: 'Free (5K requests/month)',
      coverage: '80% of use cases',
      timeline: 'Immediate implementation'
    },
    phase2: {
      title: 'Add Apify for Specialized Cases',
      description: 'Only add Apify if you need Apollo scraping or platform-specific extraction',
      cost: '+$45-120/month',
      coverage: '100% of use cases',
      timeline: 'Add when free tier insufficient'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            Apify vs Bright Data MCP - Do We Need Both?
          </CardTitle>
          <CardDescription>
            Analysis of whether Bright Data MCP can replace Apify for SAM AI lead generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">80%</div>
              <div className="text-sm text-gray-600">Use Cases Covered by MCP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$300+</div>
              <div className="text-sm text-gray-600">Monthly Savings vs Apify</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5K</div>
              <div className="text-sm text-gray-600">Free MCP Requests/Month</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Use Case Analysis</CardTitle>
          <CardDescription>
            Compare Apify vs Bright Data MCP for different lead generation scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedScenario} onValueChange={setSelectedScenario}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              {scenarios.map((scenario) => (
                <TabsTrigger key={scenario.id} value={scenario.id} className="text-xs">
                  {scenario.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {scenarios.map((scenario) => (
              <TabsContent key={scenario.id} value={scenario.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      {scenario.name}
                    </CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-sm">
                        <span className="font-medium">Expected Volume:</span> {scenario.volume}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Complexity:</span> {scenario.complexity}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      {selectedComparison && (
        <Card>
          <CardHeader>
            <CardTitle>
              Detailed Comparison: {selectedScenarioData?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apify */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Code className="h-5 w-5" />
                    Apify Solution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Capability:</span>
                      <Badge className="ml-2" variant={selectedComparison.apify.capability === 'Excellent' ? 'default' : 'secondary'}>
                        {selectedComparison.apify.capability}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span>
                      <span className="ml-2 font-bold">{selectedComparison.apify.cost}</span>
                    </div>
                    <div>
                      <span className="font-medium">Setup:</span>
                      <span className="ml-2">{selectedComparison.apify.setup}</span>
                    </div>
                    <div>
                      <span className="font-medium">Reliability:</span>
                      <Badge className="ml-2" variant={selectedComparison.apify.reliability === 'High' ? 'default' : 'secondary'}>
                        {selectedComparison.apify.reliability}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-800 mb-2">✅ Pros:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {selectedComparison.apify.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-800 mb-2">❌ Cons:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {selectedComparison.apify.cons.map((con, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <XCircle className="h-3 w-3" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Bright Data MCP */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Zap className="h-5 w-5" />
                    Bright Data MCP
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Capability:</span>
                      <Badge className="ml-2" variant={selectedComparison.brightdata_mcp.capability === 'Excellent' ? 'default' : 'secondary'}>
                        {selectedComparison.brightdata_mcp.capability}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Cost:</span>
                      <span className="ml-2 font-bold text-green-600">{selectedComparison.brightdata_mcp.cost}</span>
                    </div>
                    <div>
                      <span className="font-medium">Setup:</span>
                      <span className="ml-2">{selectedComparison.brightdata_mcp.setup}</span>
                    </div>
                    <div>
                      <span className="font-medium">Reliability:</span>
                      <Badge className="ml-2" variant={selectedComparison.brightdata_mcp.reliability === 'High' ? 'default' : 'secondary'}>
                        {selectedComparison.brightdata_mcp.reliability}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-green-800 mb-2">✅ Pros:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {selectedComparison.brightdata_mcp.pros.map((pro, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-800 mb-2">❌ Cons:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      {selectedComparison.brightdata_mcp.cons.map((con, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <XCircle className="h-3 w-3" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendation */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                🎯 Recommendation for {selectedScenarioData?.name}:
              </h4>
              <p className="text-blue-700 text-sm">
                <strong>{selectedComparison.recommendation}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Platform Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-3">Bright Data MCP Strengths:</h4>
              <ul className="space-y-2 text-sm">
                {overallAnalysis.brightDataMCP.bestFor.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    {strength}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-sm">
                <span className="font-medium">Cost:</span> {overallAnalysis.brightDataMCP.cost}
              </div>
              <div className="text-sm">
                <span className="font-medium">Integration:</span> {overallAnalysis.brightDataMCP.integration}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-orange-800 mb-3">Apify Strengths:</h4>
              <ul className="space-y-2 text-sm">
                {overallAnalysis.apify.bestFor.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2 text-orange-700">
                    <CheckCircle className="h-4 w-4" />
                    {strength}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-sm">
                <span className="font-medium">Cost:</span> {overallAnalysis.apify.cost}
              </div>
              <div className="text-sm">
                <span className="font-medium">Integration:</span> {overallAnalysis.apify.integration}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Implementation Strategy */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TrendingUp className="h-6 w-6" />
            Recommended Implementation Strategy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge className="bg-green-600 text-white">Phase 1</Badge>
              <div className="flex-1">
                <h4 className="font-medium text-green-800">{recommendedApproach.phase1.title}</h4>
                <p className="text-sm text-green-700 mt-1">{recommendedApproach.phase1.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                  <div>
                    <span className="font-medium">Cost:</span> {recommendedApproach.phase1.cost}
                  </div>
                  <div>
                    <span className="font-medium">Coverage:</span> {recommendedApproach.phase1.coverage}
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span> {recommendedApproach.phase1.timeline}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-blue-600 text-white">Phase 2</Badge>
              <div className="flex-1">
                <h4 className="font-medium text-blue-800">{recommendedApproach.phase2.title}</h4>
                <p className="text-sm text-blue-700 mt-1">{recommendedApproach.phase2.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm">
                  <div>
                    <span className="font-medium">Cost:</span> {recommendedApproach.phase2.cost}
                  </div>
                  <div>
                    <span className="font-medium">Coverage:</span> {recommendedApproach.phase2.coverage}
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span> {recommendedApproach.phase2.timeline}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">💡 Key Insight:</h4>
            <p className="text-sm text-gray-700">
              Start with <strong>Bright Data MCP only</strong> - it covers 80% of use cases for free (5K requests/month). 
              Only add Apify later if you need specialized Apollo scraping or exceed the free tier. 
              This saves $300+/month while providing native SAM AI integration.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Implement Bright Data MCP First
            </Button>
            <Button variant="outline" className="flex-1">
              Setup Hybrid Approach (MCP + Apify)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}