/**
 * Profile Enrichment Interface
 * Complete LinkedIn + website data extraction for scoring and personalization
 * Features: Job history, experience, posts, website scraping, service offerings, blog posts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Users, 
  Building2, 
  Globe, 
  FileText, 
  MessageCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Briefcase,
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Award,
  BookOpen,
  Newspaper
} from 'lucide-react';
import ProfileEnrichmentService, { 
  DiscoveredProfile, 
  EnrichedProfile, 
  EnrichmentJob 
} from '@/services/ProfileEnrichmentService';

interface ProfileEnrichmentInterfaceProps {
  discoveredProfiles: DiscoveredProfile[];
  onEnrichmentComplete?: (enrichedProfiles: EnrichedProfile[]) => void;
}

export default function ProfileEnrichmentInterface({ 
  discoveredProfiles, 
  onEnrichmentComplete 
}: ProfileEnrichmentInterfaceProps) {
  const [enrichmentJob, setEnrichmentJob] = useState<EnrichmentJob | null>(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<EnrichedProfile | null>(null);
  const [enrichmentOptions, setEnrichmentOptions] = useState({
    includeLinkedInData: true,
    includeJobHistory: true,
    includeRecentPosts: true,
    includeCompanyData: true,
    includeWebsiteScraping: true,
    includeBlogPosts: true,
    includeServiceOfferings: true,
    includeContactData: true,
    prioritizeExecutives: true
  });

  const enrichmentService = new ProfileEnrichmentService();

  const handleStartEnrichment = async () => {
    if (!discoveredProfiles.length) {
      alert('No profiles to enrich');
      return;
    }

    setIsEnriching(true);
    
    try {
      console.log(`🔥 Starting comprehensive enrichment of ${discoveredProfiles.length} profiles`);
      const job = await enrichmentService.enrichProfiles(discoveredProfiles, enrichmentOptions);
      setEnrichmentJob(job);
      
      if (onEnrichmentComplete && job.enriched_profiles.length > 0) {
        onEnrichmentComplete(job.enriched_profiles);
      }
      
    } catch (error) {
      console.error('❌ Enrichment failed:', error);
      alert(`Enrichment failed: ${error.message}`);
    } finally {
      setIsEnriching(false);
    }
  };

  const getEnrichmentProgress = () => {
    if (!enrichmentJob) return 0;
    return Math.round((enrichmentJob.progress.processed / enrichmentJob.progress.total) * 100);
  };

  const getEnrichmentStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const costEstimate = enrichmentService.getEnrichmentCostEstimate(discoveredProfiles.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            Complete Profile Enrichment - LinkedIn + Website Data
          </CardTitle>
          <CardDescription>
            Extract detailed LinkedIn profiles + website scraping for comprehensive lead intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{discoveredProfiles.length}</div>
              <div className="text-sm text-gray-600">Profiles to Enrich</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">${costEstimate.total.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Cost</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {enrichmentJob?.progress.linkedin_scraped || 0}
              </div>
              <div className="text-sm text-gray-600">LinkedIn Enriched</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {enrichmentJob?.progress.company_enriched || 0}
              </div>
              <div className="text-sm text-gray-600">Websites Scraped</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrichment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Enrichment Configuration
          </CardTitle>
          <CardDescription>
            Configure what data to extract for comprehensive lead intelligence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LinkedIn Data Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-blue-800">LinkedIn Profile Data</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enrichmentOptions.includeLinkedInData}
                    onChange={(e) => setEnrichmentOptions({
                      ...enrichmentOptions,
                      includeLinkedInData: e.target.checked
                    })}
                  />
                  <span className="text-sm">Complete LinkedIn Profile</span>
                  <Badge variant="outline">$1.50/1K</Badge>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enrichmentOptions.includeJobHistory}
                    onChange={(e) => setEnrichmentOptions({
                      ...enrichmentOptions,
                      includeJobHistory: e.target.checked
                    })}
                  />
                  <span className="text-sm">Detailed Job History & Experience</span>
                  <Badge variant="outline">Included</Badge>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enrichmentOptions.includeRecentPosts}
                    onChange={(e) => setEnrichmentOptions({
                      ...enrichmentOptions,
                      includeRecentPosts: e.target.checked
                    })}
                  />
                  <span className="text-sm">Recent LinkedIn Posts & Activity</span>
                  <Badge variant="outline">Included</Badge>
                </label>
              </div>
            </div>

            {/* Website Scraping Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-green-800">Website & Content Data</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enrichmentOptions.includeWebsiteScraping}
                    onChange={(e) => setEnrichmentOptions({
                      ...enrichmentOptions,
                      includeWebsiteScraping: e.target.checked
                    })}
                  />
                  <span className="text-sm">Company Website Scraping</span>
                  <Badge variant="outline">FREE</Badge>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enrichmentOptions.includeServiceOfferings}
                    onChange={(e) => setEnrichmentOptions({
                      ...enrichmentOptions,
                      includeServiceOfferings: e.target.checked
                    })}
                  />
                  <span className="text-sm">Service Offerings & Products</span>
                  <Badge variant="outline">FREE</Badge>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enrichmentOptions.includeBlogPosts}
                    onChange={(e) => setEnrichmentOptions({
                      ...enrichmentOptions,
                      includeBlogPosts: e.target.checked
                    })}
                  />
                  <span className="text-sm">Recent Blog Posts & News</span>
                  <Badge variant="outline">FREE</Badge>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={enrichmentOptions.includeContactData}
                    onChange={(e) => setEnrichmentOptions({
                      ...enrichmentOptions,
                      includeContactData: e.target.checked
                    })}
                  />
                  <span className="text-sm">Contact Information Discovery</span>
                  <Badge variant="outline">FREE</Badge>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg mt-6">
            <div>
              <h4 className="font-medium">Ready for Comprehensive Enrichment</h4>
              <p className="text-sm text-gray-600">
                Extract complete LinkedIn profiles + website data for {discoveredProfiles.length} leads
              </p>
            </div>
            <Button 
              onClick={handleStartEnrichment}
              disabled={!discoveredProfiles.length || isEnriching}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isEnriching ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  Enriching...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Enrich {discoveredProfiles.length} Profiles
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enrichment Progress */}
      {enrichmentJob && (
        <Card className={enrichmentJob.status === 'completed' ? 'border-green-200 bg-green-50' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {enrichmentJob.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                )}
                Enrichment Progress
              </div>
              <Badge className={getEnrichmentStatusColor(enrichmentJob.status)}>
                {enrichmentJob.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{enrichmentJob.progress.processed}/{enrichmentJob.progress.total}</span>
                </div>
                <Progress value={getEnrichmentProgress()} className="w-full" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{enrichmentJob.progress.linkedin_scraped}</div>
                  <div className="text-xs text-gray-600">LinkedIn Profiles</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{enrichmentJob.progress.company_enriched}</div>
                  <div className="text-xs text-gray-600">Company Websites</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{enrichmentJob.progress.contact_found}</div>
                  <div className="text-xs text-gray-600">Contact Info Found</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">${enrichmentJob.cost_breakdown.total.toFixed(2)}</div>
                  <div className="text-xs text-gray-600">Total Cost</div>
                </div>
              </div>

              {enrichmentJob.status === 'completed' && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export {enrichmentJob.enriched_profiles.length} Enriched Profiles
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enriched Profiles Results */}
      {enrichmentJob?.enriched_profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Enriched Profiles ({enrichmentJob.enriched_profiles.length})</CardTitle>
            <CardDescription>
              Complete LinkedIn + website data for lead scoring and personalization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrichmentJob.enriched_profiles.slice(0, 9).map((profile, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{profile.name}</h4>
                      <p className="text-sm text-blue-600">{profile.title}</p>
                      <p className="text-sm text-gray-600">{profile.company}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {profile.enrichment_status.total_confidence}% confidence
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Briefcase className="h-3 w-3" />
                      <span>{profile.experience.length} positions</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <MessageCircle className="h-3 w-3" />
                      <span>{profile.recent_posts.length} recent posts</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Globe className="h-3 w-3" />
                      <span>{profile.company_details.website ? 'Website scraped' : 'No website'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3" />
                      <span>{profile.contact_info.email ? 'Email found' : 'No email'}</span>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {profile.enrichment_status.linkedin_scraped && (
                      <Badge variant="outline" className="text-xs bg-blue-50">LinkedIn ✓</Badge>
                    )}
                    {profile.enrichment_status.company_enriched && (
                      <Badge variant="outline" className="text-xs bg-green-50">Company ✓</Badge>
                    )}
                    {profile.enrichment_status.contact_found && (
                      <Badge variant="outline" className="text-xs bg-purple-50">Contact ✓</Badge>
                    )}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                </div>
              ))}
            </div>

            {enrichmentJob.enriched_profiles.length > 9 && (
              <div className="text-center mt-4">
                <Button variant="outline">
                  View All {enrichmentJob.enriched_profiles.length} Enriched Profiles
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detailed Profile Modal */}
      {selectedProfile && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedProfile.name} - Complete Profile</CardTitle>
              <CardDescription>
                Enriched on {new Date(selectedProfile.enriched_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedProfile(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="linkedin" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="linkedin">LinkedIn Profile</TabsTrigger>
                <TabsTrigger value="experience">Job History</TabsTrigger>
                <TabsTrigger value="company">Company Data</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
              </TabsList>

              <TabsContent value="linkedin" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Profile Summary</h4>
                    <p className="text-sm text-gray-700">{selectedProfile.about}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Current Position</h4>
                    <p className="text-sm font-medium">{selectedProfile.title}</p>
                    <p className="text-sm text-gray-600">{selectedProfile.company}</p>
                    <p className="text-sm text-gray-500">{selectedProfile.location}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Recent LinkedIn Posts</h4>
                  <div className="space-y-2">
                    {selectedProfile.recent_posts.map((post, idx) => (
                      <div key={idx} className="border-l-2 border-blue-200 pl-3">
                        <p className="text-sm">{post.text}</p>
                        <p className="text-xs text-gray-500">
                          {post.date} • {post.engagement} engagements
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedProfile.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Network</h4>
                    <p className="text-sm">
                      {selectedProfile.connections_count} connections • {selectedProfile.followers_count} followers
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <h4 className="font-medium">Professional Experience</h4>
                <div className="space-y-4">
                  {selectedProfile.experience.map((exp, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{exp.title}</h5>
                          <p className="text-sm text-blue-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.duration}</p>
                        </div>
                        <Badge variant="outline">Experience</Badge>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                <h4 className="font-medium">Education</h4>
                <div className="space-y-2">
                  {selectedProfile.education.map((edu, idx) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <h5 className="font-medium">{edu.school}</h5>
                      <p className="text-sm text-gray-600">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </p>
                      {edu.years && <p className="text-sm text-gray-500">{edu.years}</p>}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="company" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Company Overview</h4>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedProfile.company_details.name}</p>
                      <p><strong>Industry:</strong> {selectedProfile.company_details.industry}</p>
                      <p><strong>Size:</strong> {selectedProfile.company_details.size}</p>
                      <p><strong>Location:</strong> {selectedProfile.company_details.headquarters}</p>
                      {selectedProfile.company_details.founded_year && (
                        <p><strong>Founded:</strong> {selectedProfile.company_details.founded_year}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Company Details</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {selectedProfile.company_details.description}
                    </p>
                    {selectedProfile.company_details.website && (
                      <a 
                        href={selectedProfile.company_details.website} 
                        target="_blank" 
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Technology Stack</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.company_details.technologies.map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      {selectedProfile.contact_info.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedProfile.contact_info.email}</span>
                        </div>
                      )}
                      {selectedProfile.contact_info.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{selectedProfile.contact_info.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <a 
                          href={selectedProfile.linkedin_url} 
                          target="_blank" 
                          className="text-sm text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Enrichment Sources</h4>
                    <div className="space-y-1">
                      {selectedProfile.data_sources.map((source, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs mr-1">
                          {source}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Enrichment cost: ${selectedProfile.enrichment_cost.toFixed(3)}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Enrichment Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Profile Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800">LinkedIn Deep Dive</h4>
              <p className="text-sm text-blue-700">
                Complete job history, experience, recent posts, skills, education
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800">Website Intelligence</h4>
              <p className="text-sm text-green-700">
                Service offerings, blog posts, company news, technology stack
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-800">Scoring & Personalization</h4>
              <p className="text-sm text-purple-700">
                Lead qualification, engagement insights, personalized outreach data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}