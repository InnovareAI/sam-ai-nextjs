/**
 * Enhanced Onboarding Wizard - Comprehensive SAM AI Setup
 * Based on the training document's 5-7 business understanding questions
 * and knowledge base construction process
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Building2,
  Users,
  Target,
  DollarSign,
  MessageSquare,
  FileText,
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Upload,
  Brain,
  Zap,
  Award,
  TrendingUp,
  Shield,
  Clock,
  Lightbulb
} from 'lucide-react';

interface OnboardingData {
  // Step 1: Company Overview
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  
  // Step 2: Business Understanding
  products: string[];
  targetMarket: string;
  uniqueValueProp: string;
  mainCompetitors: string[];
  
  // Step 3: ICP Definition
  idealCustomerTitle: string[];
  idealCustomerIndustry: string[];
  companyRevenueRange: string;
  geographicMarkets: string[];
  
  // Step 4: Pain Points & Solutions
  customerPainPoints: string[];
  solutionOffering: string;
  successMetrics: string[];
  
  // Step 5: Sales Process
  currentSalesProcess: string;
  salesCycleLength: string;
  averageDealSize: string;
  conversionMetrics: string;
  
  // Step 6: Knowledge Base
  uploadedDocuments: File[];
  competitorUrls: string[];
  websiteUrl: string;
  
  // Step 7: Success Criteria
  primaryGoals: string[];
  successKPIs: string[];
  timeframe: string;
}

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
  isComplete: boolean;
}

export default function EnhancedOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    products: [],
    targetMarket: '',
    uniqueValueProp: '',
    mainCompetitors: [],
    idealCustomerTitle: [],
    idealCustomerIndustry: [],
    companyRevenueRange: '',
    geographicMarkets: [],
    customerPainPoints: [],
    solutionOffering: '',
    successMetrics: [],
    currentSalesProcess: '',
    salesCycleLength: '',
    averageDealSize: '',
    conversionMetrics: '',
    uploadedDocuments: [],
    competitorUrls: [],
    websiteUrl: '',
    primaryGoals: [],
    successKPIs: [],
    timeframe: ''
  });
  
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: "Company Overview",
      description: "Tell us about your company and industry",
      icon: Building2,
      fields: ['companyName', 'industry', 'companySize', 'website'],
      isComplete: false
    },
    {
      id: 2,
      title: "Business Understanding",
      description: "Help us understand your products and market position",
      icon: Target,
      fields: ['products', 'targetMarket', 'uniqueValueProp', 'mainCompetitors'],
      isComplete: false
    },
    {
      id: 3,
      title: "Ideal Customer Profile",
      description: "Define your perfect customer and target market",
      icon: Users,
      fields: ['idealCustomerTitle', 'idealCustomerIndustry', 'companyRevenueRange', 'geographicMarkets'],
      isComplete: false
    },
    {
      id: 4,
      title: "Pain Points & Solutions",
      description: "What problems do you solve and how do you measure success?",
      icon: Lightbulb,
      fields: ['customerPainPoints', 'solutionOffering', 'successMetrics'],
      isComplete: false
    },
    {
      id: 5,
      title: "Sales Process",
      description: "Current sales methodology and performance metrics",
      icon: TrendingUp,
      fields: ['currentSalesProcess', 'salesCycleLength', 'averageDealSize', 'conversionMetrics'],
      isComplete: false
    },
    {
      id: 6,
      title: "Knowledge Base Construction",
      description: "Upload documents and provide competitive intelligence",
      icon: Brain,
      fields: ['uploadedDocuments', 'competitorUrls', 'websiteUrl'],
      isComplete: false
    },
    {
      id: 7,
      title: "Success Criteria",
      description: "Define your goals and success metrics",
      icon: Award,
      fields: ['primaryGoals', 'successKPIs', 'timeframe'],
      isComplete: false
    }
  ];

  // Calculate progress
  useEffect(() => {
    const totalSteps = steps.length;
    const currentProgress = ((currentStep - 1) / totalSteps) * 100;
    setProgress(currentProgress);
  }, [currentStep, steps.length]);

  // Check if current step is complete
  const isCurrentStepComplete = (): boolean => {
    const step = steps[currentStep - 1];
    return step.fields.every(field => {
      const value = onboardingData[field as keyof OnboardingData];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return Boolean(value);
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: string, value: string | string[] | File[]) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInput = (field: string, value: string) => {
    if (value.trim()) {
      const currentArray = onboardingData[field as keyof OnboardingData] as string[];
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
      }
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentArray = onboardingData[field as keyof OnboardingData] as string[];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      handleInputChange('uploadedDocuments', [...onboardingData.uploadedDocuments, ...newFiles]);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Here you would save the onboarding data and initialize SAM AI
    console.log('Onboarding completed:', onboardingData);
    
    // Redirect to main workspace
    window.location.href = '/workspace';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Company Name</label>
                <Input
                  value={onboardingData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Industry</label>
                <Input
                  value={onboardingData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  placeholder="e.g., SaaS, FinTech, Healthcare"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Company Size</label>
                <select
                  value={onboardingData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Website URL</label>
                <Input
                  value={onboardingData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Products/Services</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a product or service (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('products', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.products.map((product, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-900 text-blue-200">
                      {product}
                      <button
                        onClick={() => removeArrayItem('products', index)}
                        className="ml-2 text-blue-400 hover:text-blue-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Target Market</label>
              <Textarea
                value={onboardingData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                placeholder="Describe your primary target market and customer segments"
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Unique Value Proposition</label>
              <Textarea
                value={onboardingData.uniqueValueProp}
                onChange={(e) => handleInputChange('uniqueValueProp', e.target.value)}
                placeholder="What makes your company unique? What's your competitive advantage?"
                className="bg-gray-700 border-gray-600 text-white"
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Main Competitors</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a competitor (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('mainCompetitors', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.mainCompetitors.map((competitor, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-900 text-red-200">
                      {competitor}
                      <button
                        onClick={() => removeArrayItem('mainCompetitors', index)}
                        className="ml-2 text-red-400 hover:text-red-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Ideal Customer Job Titles</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a job title (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('idealCustomerTitle', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.idealCustomerTitle.map((title, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-900 text-green-200">
                      {title}
                      <button
                        onClick={() => removeArrayItem('idealCustomerTitle', index)}
                        className="ml-2 text-green-400 hover:text-green-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Target Industries</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add an industry (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('idealCustomerIndustry', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.idealCustomerIndustry.map((industry, index) => (
                    <Badge key={index} variant="secondary" className="bg-purple-900 text-purple-200">
                      {industry}
                      <button
                        onClick={() => removeArrayItem('idealCustomerIndustry', index)}
                        className="ml-2 text-purple-400 hover:text-purple-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Company Revenue Range</label>
              <select
                value={onboardingData.companyRevenueRange}
                onChange={(e) => handleInputChange('companyRevenueRange', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="">Select revenue range</option>
                <option value="<$1M">Less than $1M</option>
                <option value="$1M-$5M">$1M - $5M</option>
                <option value="$5M-$25M">$5M - $25M</option>
                <option value="$25M-$100M">$25M - $100M</option>
                <option value="$100M+">$100M+</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Geographic Markets</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a geographic market (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('geographicMarkets', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.geographicMarkets.map((market, index) => (
                    <Badge key={index} variant="secondary" className="bg-orange-900 text-orange-200">
                      {market}
                      <button
                        onClick={() => removeArrayItem('geographicMarkets', index)}
                        className="ml-2 text-orange-400 hover:text-orange-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Customer Pain Points</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a pain point (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('customerPainPoints', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.customerPainPoints.map((pain, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-900 text-red-200">
                      {pain}
                      <button
                        onClick={() => removeArrayItem('customerPainPoints', index)}
                        className="ml-2 text-red-400 hover:text-red-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Solution Offering</label>
              <Textarea
                value={onboardingData.solutionOffering}
                onChange={(e) => handleInputChange('solutionOffering', e.target.value)}
                placeholder="How does your product/service solve customer problems? What specific benefits do you provide?"
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Success Metrics</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a success metric (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('successMetrics', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.successMetrics.map((metric, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-900 text-green-200">
                      {metric}
                      <button
                        onClick={() => removeArrayItem('successMetrics', index)}
                        className="ml-2 text-green-400 hover:text-green-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Current Sales Process</label>
              <Textarea
                value={onboardingData.currentSalesProcess}
                onChange={(e) => handleInputChange('currentSalesProcess', e.target.value)}
                placeholder="Describe your current sales methodology, stages, and process"
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Sales Cycle Length</label>
                <select
                  value={onboardingData.salesCycleLength}
                  onChange={(e) => handleInputChange('salesCycleLength', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="">Select cycle length</option>
                  <option value="<1 month">Less than 1 month</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="12+ months">12+ months</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Average Deal Size</label>
                <Input
                  value={onboardingData.averageDealSize}
                  onChange={(e) => handleInputChange('averageDealSize', e.target.value)}
                  placeholder="e.g., $25,000"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Current Win Rate</label>
                <Input
                  value={onboardingData.conversionMetrics}
                  onChange={(e) => handleInputChange('conversionMetrics', e.target.value)}
                  placeholder="e.g., 15%"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Upload Documents</label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer bg-gray-700">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-white">Upload knowledge documents</h3>
                <p className="text-gray-400 mb-4">PDFs, presentations, case studies, sales materials</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  Choose Files
                </Button>
              </div>
              
              {onboardingData.uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Uploaded Files:</h4>
                  {onboardingData.uploadedDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">{file.name}</span>
                      </div>
                      <Badge variant="secondary">Uploaded</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Website URL for Crawling</label>
              <Input
                value={onboardingData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="https://yourcompany.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Competitor URLs</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add competitor URL (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('competitorUrls', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="space-y-1">
                  {onboardingData.competitorUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white">{url}</span>
                      </div>
                      <button
                        onClick={() => removeArrayItem('competitorUrls', index)}
                        className="text-red-400 hover:text-red-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Primary Goals</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a primary goal (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('primaryGoals', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.primaryGoals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-900 text-blue-200">
                      {goal}
                      <button
                        onClick={() => removeArrayItem('primaryGoals', index)}
                        className="ml-2 text-blue-400 hover:text-blue-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Success KPIs</label>
              <div className="space-y-2">
                <Input
                  placeholder="Add a KPI (press Enter)"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleArrayInput('successKPIs', (e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {onboardingData.successKPIs.map((kpi, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-900 text-green-200">
                      {kpi}
                      <button
                        onClick={() => removeArrayItem('successKPIs', index)}
                        className="ml-2 text-green-400 hover:text-green-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-white mb-2 block">Timeframe for Success</label>
              <select
                value={onboardingData.timeframe}
                onChange={(e) => handleInputChange('timeframe', e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="">Select timeframe</option>
                <option value="30 days">30 days</option>
                <option value="90 days">90 days</option>
                <option value="6 months">6 months</option>
                <option value="12 months">12 months</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            SAM AI Onboarding
          </h1>
          <p className="text-gray-300 text-lg">
            Let's set up your personalized AI sales assistant
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-white">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex space-x-2">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              const StepIcon = step.icon;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  {isCompleted && <CheckCircle className="w-4 h-4" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              {React.createElement(steps[currentStep - 1].icon, { className: "w-6 h-6 text-purple-400" })}
              <div>
                <h2 className="text-xl">{steps[currentStep - 1].title}</h2>
                <p className="text-gray-400 text-sm font-normal">
                  {steps[currentStep - 1].description}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-96">
              {renderStepContent()}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-gray-600 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-400">
              {currentStep} of {steps.length} steps
            </span>
          </div>

          {currentStep === steps.length ? (
            <Button
              onClick={handleComplete}
              disabled={!isCurrentStepComplete() || isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white"
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Setting up SAM AI...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepComplete()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-600/50">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-200 mb-1">Pro Tip</h3>
              <p className="text-sm text-blue-300">
                The more detailed information you provide, the better SAM AI will be at helping you with personalized outreach and sales automation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}