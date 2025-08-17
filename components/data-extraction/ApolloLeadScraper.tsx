/**
 * Apollo Lead Scraper Integration for SAM AI
 * Connects to your custom Apollo actor with intelligent bulk approval
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Target, 
  Filter, 
  DollarSign, 
  Users, 
  MapPin, 
  Building,
  Mail,
  Phone,
  Linkedin,
  Play,
  Settings
} from 'lucide-react';

interface ApolloSearchConfig {
  searchQuery: string;
  maxLeads: number;
  filters: {
    titles: string[];
    companySizes: string[];
    industries: string[];
    locations: string[];
  };
  dataOptions: {
    includeEmails: boolean;
    includePhones: boolean;
    includeLinkedIn: boolean;
    skipBounced: boolean;
    onlyVerified: boolean;
  };
  qualitySettings: {
    minRelevanceScore: number;
    maxCostPerLead: number;
    autoApprovalThreshold: number;
  };
}

interface ApolloLeadScraperProps {
  onStartScraping: (config: ApolloSearchConfig) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export default function ApolloLeadScraper({ 
  onStartScraping, 
  onCancel, 
  isProcessing = false 
}: ApolloLeadScraperProps) {
  const [config, setConfig] = useState<ApolloSearchConfig>({
    searchQuery: '',
    maxLeads: 1000,
    filters: {
      titles: [],
      companySizes: [],
      industries: [],
      locations: []
    },
    dataOptions: {
      includeEmails: true,
      includePhones: true,
      includeLinkedIn: true,
      skipBounced: true,
      onlyVerified: true
    },
    qualitySettings: {
      minRelevanceScore: 70,
      maxCostPerLead: 0.03,
      autoApprovalThreshold: 85
    }
  });

  const [titleInput, setTitleInput] = useState('');
  const [industryInput, setIndustryInput] = useState('');
  const [locationInput, setLocationInput] = useState('');

  const estimatedCost = config.maxLeads * config.qualitySettings.maxCostPerLead;
  const estimatedTime = Math.ceil(config.maxLeads / 100) * 3; // 3 minutes per 100 leads

  const addFilter = (type: keyof typeof config.filters, value: string) => {
    if (value.trim()) {
      setConfig(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          [type]: [...prev.filters[type], value.trim()]
        }
      }));
    }
  };

  const removeFilter = (type: keyof typeof config.filters, index: number) => {
    setConfig(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [type]: prev.filters[type].filter((_, i) => i !== index)
      }
    }));
  };

  const handleStartScraping = () => {
    if (!config.searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }
    onStartScraping(config);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-6 w-6 text-blue-600" />
            Apollo Lead Scraper - SAM AI Integration
          </CardTitle>
          <CardDescription>
            Extract high-quality leads from Apollo.io with intelligent filtering and auto-approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{config.maxLeads.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Max Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${estimatedCost.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Estimated Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{estimatedTime}m</div>
              <div className="text-sm text-gray-600">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{config.qualitySettings.autoApprovalThreshold}%</div>
              <div className="text-sm text-gray-600">Auto-Approval</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search Query</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="data">Data Options</TabsTrigger>
          <TabsTrigger value="quality">Quality Settings</TabsTrigger>
        </TabsList>

        {/* Search Query Tab */}
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Apollo Search Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="searchQuery">Search Query *</Label>
                <Textarea
                  id="searchQuery"
                  placeholder="e.g., 'VP Sales at SaaS companies in San Francisco' or 'CTOs at fintech startups'"
                  value={config.searchQuery}
                  onChange={(e) => setConfig(prev => ({ ...prev, searchQuery: e.target.value }))}
                  rows={3}
                />
                <p className="text-xs text-gray-600">
                  Use natural language to describe your ideal prospects. Apollo will interpret this query.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLeads">Maximum Leads</Label>
                <Input
                  id="maxLeads"
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={config.maxLeads}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxLeads: parseInt(e.target.value) || 1000 }))}
                />
                <p className="text-xs text-gray-600">
                  Recommended: Start with 1000 leads for testing, scale up based on results
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Filters Tab */}
        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </CardTitle>
              <CardDescription>
                Refine your search with specific criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Titles */}
              <div className="space-y-2">
                <Label>Target Job Titles</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., VP Sales, Account Executive, Sales Director"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFilter('titles', titleInput);
                        setTitleInput('');
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => { addFilter('titles', titleInput); setTitleInput(''); }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.filters.titles.map((title, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                           onClick={() => removeFilter('titles', index)}>
                      {title} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div className="space-y-2">
                <Label>Target Industries</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., SaaS, Fintech, Healthcare, E-commerce"
                    value={industryInput}
                    onChange={(e) => setIndustryInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFilter('industries', industryInput);
                        setIndustryInput('');
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => { addFilter('industries', industryInput); setIndustryInput(''); }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.filters.industries.map((industry, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                           onClick={() => removeFilter('industries', index)}>
                      {industry} ×
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-2">
                <Label>Target Locations</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., San Francisco, New York, United States, Remote"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addFilter('locations', locationInput);
                        setLocationInput('');
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => { addFilter('locations', locationInput); setLocationInput(''); }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.filters.locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                           onClick={() => removeFilter('locations', index)}>
                      {location} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Options Tab */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Data Collection Options
              </CardTitle>
              <CardDescription>
                Choose what information to extract for each lead
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Include Email Addresses</Label>
                  </div>
                  <Switch
                    checked={config.dataOptions.includeEmails}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        dataOptions: { ...prev.dataOptions, includeEmails: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <Label>Include Phone Numbers</Label>
                  </div>
                  <Switch
                    checked={config.dataOptions.includePhones}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        dataOptions: { ...prev.dataOptions, includePhones: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    <Label>Include LinkedIn Profiles</Label>
                  </div>
                  <Switch
                    checked={config.dataOptions.includeLinkedIn}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        dataOptions: { ...prev.dataOptions, includeLinkedIn: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Skip Bounced Emails</Label>
                    <p className="text-xs text-gray-600">Exclude emails that have bounced previously</p>
                  </div>
                  <Switch
                    checked={config.dataOptions.skipBounced}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        dataOptions: { ...prev.dataOptions, skipBounced: checked }
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Verified Contacts Only</Label>
                    <p className="text-xs text-gray-600">Include only Apollo-verified contact information</p>
                  </div>
                  <Switch
                    checked={config.dataOptions.onlyVerified}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        dataOptions: { ...prev.dataOptions, onlyVerified: checked }
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Settings Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Quality & Cost Controls
              </CardTitle>
              <CardDescription>
                Set automatic approval thresholds to avoid approval fatigue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Auto-Approval Threshold: {config.qualitySettings.autoApprovalThreshold}%</Label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={config.qualitySettings.autoApprovalThreshold}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    qualitySettings: {
                      ...prev.qualitySettings,
                      autoApprovalThreshold: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Leads with {config.qualitySettings.autoApprovalThreshold}%+ relevance will be auto-approved
                </p>
              </div>

              <div className="space-y-2">
                <Label>Max Cost per Lead: ${config.qualitySettings.maxCostPerLead.toFixed(3)}</Label>
                <input
                  type="range"
                  min="0.01"
                  max="0.10"
                  step="0.005"
                  value={config.qualitySettings.maxCostPerLead}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    qualitySettings: {
                      ...prev.qualitySettings,
                      maxCostPerLead: parseFloat(e.target.value)
                    }
                  }))}
                  className="w-full"
                />
                <p className="text-xs text-gray-600">
                  Reject leads costing more than ${config.qualitySettings.maxCostPerLead.toFixed(3)} each
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Estimated Results</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Auto-Approved:</span>
                    <span className="font-bold ml-2">~{Math.floor(config.maxLeads * 0.7).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Manual Review:</span>
                    <span className="font-bold ml-2">~{Math.floor(config.maxLeads * 0.2).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Auto-Rejected:</span>
                    <span className="font-bold ml-2">~{Math.floor(config.maxLeads * 0.1).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Est. Savings:</span>
                    <span className="font-bold ml-2">${(config.maxLeads * 0.1 * config.qualitySettings.maxCostPerLead).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button 
              onClick={handleStartScraping}
              disabled={!config.searchQuery.trim() || isProcessing}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Starting Apollo Scraper...' : 'Start Lead Extraction'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Next:</strong> Once started, SAM AI will use your custom Apollo actor 
              ({config.qualitySettings.autoApprovalThreshold}% auto-approval) to extract {config.maxLeads} leads 
              for approximately ${estimatedCost.toFixed(2)} in ~{estimatedTime} minutes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}