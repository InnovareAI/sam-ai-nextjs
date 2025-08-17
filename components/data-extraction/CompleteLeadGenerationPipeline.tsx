/**
 * Complete Lead Generation Pipeline
 * Google Discovery → Profile Enrichment → Final Leads
 * Complete workflow: ICP → LinkedIn URLs → Detailed Profiles → Export
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  Search, 
  Zap, 
  Download, 
  CheckCircle,
  Clock,
  Users,
  Building2,
  Globe,
  Target,
  TrendingUp,
  FileText,
  MessageCircle
} from 'lucide-react';

// Import our services and components
import GoogleLinkedInInterface from './GoogleLinkedInInterface';
import ProfileEnrichmentInterface from './ProfileEnrichmentInterface';
import { DiscoveredProfile } from '@/services/GoogleLinkedInDiscoveryService';
import { EnrichedProfile } from '@/services/ProfileEnrichmentService';

export default function CompleteLeadGenerationPipeline() {
  const [currentStep, setCurrentStep] = useState(1);
  const [discoveredProfiles, setDiscoveredProfiles] = useState<DiscoveredProfile[]>([]);
  const [enrichedProfiles, setEnrichedProfiles] = useState<EnrichedProfile[]>([]);
  const [pipelineStats, setPipelineStats] = useState({
    totalCost: 0,
    processingTime: 0,
    qualityScore: 0
  });

  const handleDiscoveryComplete = (profiles: DiscoveredProfile[]) => {
    console.log(`✅ Discovery completed: ${profiles.length} profiles found`);
    setDiscoveredProfiles(profiles);
    setCurrentStep(2);
  };

  const handleEnrichmentComplete = (profiles: EnrichedProfile[]) => {
    console.log(`🔥 Enrichment completed: ${profiles.length} profiles enriched`);
    setEnrichedProfiles(profiles);
    setCurrentStep(3);
    
    // Calculate final stats
    const totalCost = profiles.reduce((sum, p) => sum + p.enrichment_cost, 0);
    const avgConfidence = profiles.reduce((sum, p) => sum + p.enrichment_status.total_confidence, 0) / profiles.length;
    
    setPipelineStats({
      totalCost,
      processingTime: 180, // Mock processing time
      qualityScore: avgConfidence
    });
  };

  const getStepStatus = (step: number) => {
    if (currentStep > step) return 'completed';
    if (currentStep === step) return 'active';
    return 'pending';
  };

  const getStepIcon = (step: number) => {
    switch (getStepStatus(step)) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'active':
        return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />;
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
    }
  };

  const exportLeads = () => {
    const csvData = enrichedProfiles.map(profile => ({
      name: profile.name,
      title: profile.title,
      company: profile.company,
      location: profile.location,
      email: profile.contact_info.email || '',
      phone: profile.contact_info.phone || '',
      linkedin_url: profile.linkedin_url,
      about: profile.about,
      experience_count: profile.experience.length,
      recent_posts_count: profile.recent_posts.length,
      connections: profile.connections_count,
      confidence_score: profile.enrichment_status.total_confidence,
      company_website: profile.company_details.website,
      company_size: profile.company_details.size,
      industry: profile.company_details.industry,
      technologies: profile.company_details.technologies.join(', '),
      service_offerings: profile.company_details.service_offerings?.map(s => s.name).join(', ') || '',
      recent_blog_posts: profile.company_details.recent_blog_posts?.map(b => b.title).join('; ') || ''
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enriched-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-600" />
            Complete Lead Generation Pipeline
          </CardTitle>
          <CardDescription>
            End-to-end process: ICP Description → Google Discovery → LinkedIn Enrichment → Export Ready Leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{discoveredProfiles.length}</div>
              <div className="text-sm text-gray-600">Profiles Discovered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{enrichedProfiles.length}</div>
              <div className="text-sm text-gray-600">Profiles Enriched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${pipelineStats.totalCost.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pipelineStats.qualityScore.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Avg Quality Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {/* Step 1: Discovery */}
            <div className="flex items-center gap-3">
              {getStepIcon(1)}
              <div>
                <h4 className="font-medium">Google Discovery</h4>
                <p className="text-sm text-gray-600">Find LinkedIn profiles</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />

            {/* Step 2: Enrichment */}
            <div className="flex items-center gap-3">
              {getStepIcon(2)}
              <div>
                <h4 className="font-medium">Profile Enrichment</h4>
                <p className="text-sm text-gray-600">LinkedIn + website data</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />

            {/* Step 3: Export */}
            <div className="flex items-center gap-3">
              {getStepIcon(3)}
              <div>
                <h4 className="font-medium">Export & Use</h4>
                <p className="text-sm text-gray-600">Ready for outreach</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              getStepStatus(1) === 'active' ? 'border-blue-200 bg-blue-50' : 
              getStepStatus(1) === 'completed' ? 'border-green-200 bg-green-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <Search className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-medium">Step 1: Discovery</h4>
              <p className="text-sm text-gray-600">
                Use Google's comprehensive LinkedIn indexing to find all matching profiles
              </p>
              <Badge variant="outline" className="mt-2">FREE</Badge>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              getStepStatus(2) === 'active' ? 'border-blue-200 bg-blue-50' : 
              getStepStatus(2) === 'completed' ? 'border-green-200 bg-green-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <Zap className="h-8 w-8 text-purple-600 mb-2" />
              <h4 className="font-medium">Step 2: Enrichment</h4>
              <p className="text-sm text-gray-600">
                Extract detailed LinkedIn profiles, job history, posts, and website data
              </p>
              <Badge variant="outline" className="mt-2">$1.50/1K profiles</Badge>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              getStepStatus(3) === 'active' ? 'border-blue-200 bg-blue-50' : 
              getStepStatus(3) === 'completed' ? 'border-green-200 bg-green-50' : 
              'border-gray-200 bg-gray-50'
            }`}>
              <Download className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-medium">Step 3: Export</h4>
              <p className="text-sm text-gray-600">
                Complete lead database ready for scoring, personalization, and outreach
              </p>
              <Badge variant="outline" className="mt-2">CSV/API/CRM</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Content */}
      <Tabs value={`step${currentStep}`} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="step1" 
            onClick={() => setCurrentStep(1)}
            disabled={currentStep < 1}
          >
            Discovery
          </TabsTrigger>
          <TabsTrigger 
            value="step2" 
            onClick={() => setCurrentStep(2)}
            disabled={discoveredProfiles.length === 0}
          >
            Enrichment
          </TabsTrigger>
          <TabsTrigger 
            value="step3" 
            onClick={() => setCurrentStep(3)}
            disabled={enrichedProfiles.length === 0}
          >
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="step1">
          <GoogleLinkedInInterface 
            onProfilesDiscovered={handleDiscoveryComplete}
            onProceedToScraping={(profiles) => {
              setDiscoveredProfiles(profiles);
              setCurrentStep(2);
            }}
          />
        </TabsContent>

        <TabsContent value="step2">
          <ProfileEnrichmentInterface 
            discoveredProfiles={discoveredProfiles}
            onEnrichmentComplete={handleEnrichmentComplete}
          />
        </TabsContent>

        <TabsContent value="step3">
          <div className="space-y-6">
            {/* Final Results */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Pipeline Complete! {enrichedProfiles.length} Leads Ready
                </CardTitle>
                <CardDescription>
                  Complete lead intelligence extracted and ready for outreach campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{enrichedProfiles.length}</div>
                    <div className="text-sm text-gray-600">Complete Profiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {enrichedProfiles.filter(p => p.contact_info.email).length}
                    </div>
                    <div className="text-sm text-gray-600">Email Addresses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {enrichedProfiles.reduce((sum, p) => sum + p.recent_posts.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">LinkedIn Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {enrichedProfiles.filter(p => p.company_details.service_offerings?.length > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Service Profiles</div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={exportLeads} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Complete Database
                  </Button>
                  <Button variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Lead Scoring Analysis
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Generate Outreach Messages
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Data Quality Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Data Quality & Intelligence Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">LinkedIn Profile Data</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Complete Job History</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.experience.length >= 3).length} profiles
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Recent Posts & Activity</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.recent_posts.length > 0).length} profiles
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills & Certifications</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.skills.length >= 5).length} profiles
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Education Details</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.education.length > 0).length} profiles
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Company Intelligence</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Website Scraped</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.enrichment_status.website_crawled).length} companies
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Service Offerings Identified</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.company_details.service_offerings?.length > 0).length} companies
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Blog Posts Found</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.company_details.recent_blog_posts?.length > 0).length} companies
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Technology Stack</span>
                        <Badge variant="outline">
                          {enrichedProfiles.filter(p => p.company_details.technologies.length >= 5).length} companies
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pipeline Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Lead Intelligence Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800">Deep Profile Intelligence</h4>
              <p className="text-sm text-blue-700">
                Complete LinkedIn job history, recent posts, skills, education, and activity insights
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Building2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800">Company Intelligence</h4>
              <p className="text-sm text-green-700">
                Service offerings, blog posts, technology stack, company culture, and business insights
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-800">Outreach Ready</h4>
              <p className="text-sm text-purple-700">
                Comprehensive data for lead scoring, personalized messaging, and campaign optimization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}