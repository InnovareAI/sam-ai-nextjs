/**
 * Bright Data Dashboard for SAM AI
 * Browse, purchase, and manage Bright Data datasets
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  DollarSign, 
  Download, 
  Filter, 
  TrendingUp,
  CheckCircle,
  Star,
  Calendar,
  Users,
  Globe,
  Zap
} from 'lucide-react';

import BrightDataService, { BrightDataDataset, BRIGHT_DATA_DATASETS } from '@/services/BrightDataIntegration';

export default function BrightDataDashboard() {
  const [selectedDataset, setSelectedDataset] = useState<string>('saas_executives_global');
  const [volumeNeeds, setVolumeNeeds] = useState<number>(10000);
  const [selectedUseCase, setSelectedUseCase] = useState<string>('saas_prospecting');
  const [isLoading, setIsLoading] = useState(false);
  const [datasets, setDatasets] = useState<BrightDataDataset[]>(BRIGHT_DATA_DATASETS);

  const brightDataService = new BrightDataService(process.env.VITE_BRIGHT_DATA_TOKEN || 'demo_token');

  const useCases = [
    {
      id: 'saas_prospecting',
      name: 'SaaS Prospecting',
      description: 'Find SaaS executives and decision makers',
      icon: '💼',
      estimatedLeads: 500000
    },
    {
      id: 'startup_outreach',
      name: 'Startup Outreach', 
      description: 'Connect with founders and startup teams',
      icon: '🚀',
      estimatedLeads: 75000
    },
    {
      id: 'enterprise_sales',
      name: 'Enterprise Sales',
      description: 'Target large company executives',
      icon: '🏢',
      estimatedLeads: 800000
    },
    {
      id: 'tech_recruitment',
      name: 'Tech Recruitment',
      description: 'Find technical professionals',
      icon: '👨‍💻',
      estimatedLeads: 1200000
    }
  ];

  const selectedDatasetData = datasets.find(d => d.id === selectedDataset);
  const selectedUseCaseData = useCases.find(u => u.id === selectedUseCase);

  const calculateCosts = (datasetId: string, records: number) => {
    try {
      return brightDataService.estimateCosts(datasetId, records);
    } catch (error) {
      return {
        dataset_cost: 0,
        processing_cost: 0,
        total_cost: 0,
        cost_per_lead: 0,
        vs_apollo_savings: 0
      };
    }
  };

  const costAnalysis = selectedDatasetData ? calculateCosts(selectedDatasetData.id, volumeNeeds) : null;

  const handlePurchaseDataset = async () => {
    if (!selectedDatasetData) return;
    
    setIsLoading(true);
    try {
      console.log(`🛒 Purchasing ${selectedDatasetData.name} - ${volumeNeeds} records`);
      
      const result = await brightDataService.purchaseDataset(
        selectedDatasetData.id,
        volumeNeeds,
        {
          location: ['United States', 'Canada'],
          industry: ['Technology', 'SaaS', 'Software'],
          title_keywords: ['CEO', 'CTO', 'VP', 'Director', 'Head']
        }
      );

      console.log('✅ Dataset purchased successfully:', result);
      alert(`Successfully purchased ${result.leads.length} leads for $${result.cost_breakdown.total_cost.toFixed(2)}`);
      
    } catch (error) {
      console.error('❌ Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendedDatasets = () => {
    return brightDataService.getRecommendedDatasets(selectedUseCase as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6 text-green-600" />
            Bright Data Integration - 100x Cheaper than Apollo
          </CardTitle>
          <CardDescription>
            Access massive pre-scraped datasets instead of expensive API credits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">17M+</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">$0.001</div>
              <div className="text-sm text-gray-600">Min Cost/Lead</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100x</div>
              <div className="text-sm text-gray-600">Cheaper than Apollo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">Zero</div>
              <div className="text-sm text-gray-600">Rate Limits</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Use Case Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Use Case</CardTitle>
          <CardDescription>
            Select your prospecting goal to see recommended datasets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {useCases.map((useCase) => (
              <Card 
                key={useCase.id} 
                className={`cursor-pointer transition-all ${
                  selectedUseCase === useCase.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setSelectedUseCase(useCase.id)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{useCase.icon}</div>
                  <h4 className="font-medium">{useCase.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{useCase.description}</p>
                  <div className="text-xs text-blue-600 font-medium mt-2">
                    {useCase.estimatedLeads.toLocaleString()} leads available
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
          <CardTitle>Configure Your Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Number of Leads Needed</label>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={volumeNeeds}
                onChange={(e) => setVolumeNeeds(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-center text-lg font-bold mt-2">
                {volumeNeeds.toLocaleString()} leads
              </div>
            </div>

            {costAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-600">
                    ${costAnalysis.total_cost.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">Total Cost</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-600">
                    ${costAnalysis.cost_per_lead.toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-600">Cost/Lead</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-purple-600">
                    ${costAnalysis.vs_apollo_savings.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-600">vs Apollo Savings</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(costAnalysis.vs_apollo_savings / costAnalysis.total_cost)}x
                  </div>
                  <div className="text-xs text-gray-600">Cheaper</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dataset Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Datasets</CardTitle>
          <CardDescription>
            {selectedUseCaseData ? `Recommended for ${selectedUseCaseData.name}` : 'All datasets'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDataset} onValueChange={setSelectedDataset}>
            <TabsList className="grid w-full grid-cols-3">
              {getRecommendedDatasets().slice(0, 3).map((dataset) => (
                <TabsTrigger key={dataset.id} value={dataset.id} className="text-xs">
                  {dataset.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {datasets.map((dataset) => (
              <TabsContent key={dataset.id} value={dataset.id} className="space-y-4">
                <Card className={dataset.id === selectedDataset ? 'border-blue-200 bg-blue-50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          {dataset.name}
                        </CardTitle>
                        <CardDescription>{dataset.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-600 text-white">
                        ${dataset.costPerRecord.toFixed(3)}/lead
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Dataset Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-blue-600">
                          {dataset.recordCount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Total Records</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-green-600">
                          ${dataset.costPerRecord.toFixed(3)}
                        </div>
                        <div className="text-xs text-gray-600">Per Record</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          {dataset.lastUpdated}
                        </div>
                        <div className="text-xs text-gray-600">Last Updated</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-lg font-bold text-orange-600">
                          {dataset.dataPoints.length}
                        </div>
                        <div className="text-xs text-gray-600">Data Points</div>
                      </div>
                    </div>

                    {/* Data Points */}
                    <div>
                      <h4 className="font-medium mb-2">Available Data Points:</h4>
                      <div className="flex flex-wrap gap-2">
                        {dataset.dataPoints.map((point, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <h4 className="font-medium mb-2">Categories:</h4>
                      <div className="flex flex-wrap gap-2">
                        {dataset.categories.map((category, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Cost Analysis */}
                    {dataset.id === selectedDataset && costAnalysis && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-3">Cost Analysis for {volumeNeeds.toLocaleString()} leads:</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Dataset Cost:</span>
                            <span className="font-bold ml-2">${costAnalysis.dataset_cost.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Processing:</span>
                            <span className="font-bold ml-2">${costAnalysis.processing_cost.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Cost:</span>
                            <span className="font-bold ml-2 text-green-600">${costAnalysis.total_cost.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Apollo Would Cost:</span>
                            <span className="font-bold ml-2 text-red-600">${(volumeNeeds * 0.20).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Purchase Section */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-5 w-5" />
            Ready to Purchase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Your Selection:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Dataset: {selectedDatasetData?.name}</li>
                  <li>• Volume: {volumeNeeds.toLocaleString()} leads</li>
                  <li>• Total Cost: ${costAnalysis?.total_cost.toFixed(2)}</li>
                  <li>• Apollo Savings: ${costAnalysis?.vs_apollo_savings.toFixed(0)}</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">What You Get:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Instant CSV download</li>
                  <li>• {selectedDatasetData?.dataPoints.length}+ data points per lead</li>
                  <li>• No rate limits or restrictions</li>
                  <li>• Compatible with SAM AI workflows</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handlePurchaseDataset}
                disabled={isLoading}
              >
                {isLoading ? (
                  'Processing Purchase...'
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Purchase Dataset - ${costAnalysis?.total_cost.toFixed(2)}
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1">
                Preview Sample Data
              </Button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Next Steps</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    After purchase, the dataset will be automatically imported into SAM AI's intelligent 
                    bulk approval system. You can immediately start prospecting with {volumeNeeds.toLocaleString()} 
                    high-quality leads at 100x lower cost than Apollo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bright Data vs Apollo API</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">Metric</th>
                  <th className="border border-gray-300 p-3 text-center">Bright Data</th>
                  <th className="border border-gray-300 p-3 text-center">Apollo API</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Cost per Lead</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">$0.001-0.003</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600 font-bold">$0.200</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Daily Volume Limit</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">Unlimited</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600">833 leads</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Rate Limits</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">None</td>
                  <td className="border border-gray-300 p-3 text-center text-red-600">Fixed by plan</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Account Risk</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600 font-bold">Zero</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600">Zero</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-3 font-medium">Data Freshness</td>
                  <td className="border border-gray-300 p-3 text-center text-orange-600">1-3 months old</td>
                  <td className="border border-gray-300 p-3 text-center text-green-600">Real-time</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}