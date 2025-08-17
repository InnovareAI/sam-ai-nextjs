/**
 * Data Preview Validation Component
 * Shows actual Bright Data sample results for client validation before full scraping
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Building2,
  Mail,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Play
} from 'lucide-react';
import BrightDataPreviewService, { ICPCriteria, PreviewResults, BrightDataPreviewProfile } from '@/services/BrightDataPreviewService';

interface DataPreviewValidationProps {
  icp: ICPCriteria;
  onApprove: (approved: boolean, feedback?: string) => void;
  onAdjustCriteria: (adjustedICP: ICPCriteria) => void;
}

export default function DataPreviewValidation({ icp, onApprove, onAdjustCriteria }: DataPreviewValidationProps) {
  const [previewResults, setPreviewResults] = useState<PreviewResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clientFeedback, setClientFeedback] = useState('');
  const [showDetailedView, setShowDetailedView] = useState(false);

  const previewService = new BrightDataPreviewService();

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      const results = await previewService.generateDataPreview(icp);
      setPreviewResults(results);
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    onApprove(true, clientFeedback);
  };

  const handleReject = () => {
    onApprove(false, clientFeedback);
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 65) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    if (score >= 65) return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const ProfileCard = ({ profile }: { profile: BrightDataPreviewProfile }) => (
    <Card className="border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {profile.profile_image_url && (
            <img 
              src={profile.profile_image_url} 
              alt={profile.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">{profile.name}</h4>
            <p className="text-sm text-blue-600 truncate">{profile.title}</p>
            <p className="text-sm text-gray-600 truncate flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {profile.company}
            </p>
            <p className="text-sm text-gray-500 truncate flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {profile.location}
            </p>
            
            {profile.about && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {profile.about.substring(0, 120)}...
              </p>
            )}
            
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              {profile.connections_count && (
                <span>{profile.connections_count} connections</span>
              )}
              {profile.recent_posts && profile.recent_posts.length > 0 && (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {profile.recent_posts.length} recent posts
                </span>
              )}
              {profile.company_details?.size && (
                <span>{profile.company_details.size}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Data Preview Validation
          </CardTitle>
          <CardDescription>
            Review actual sample data from Bright Data to ensure it matches your requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-4 gap-4 flex-1">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">Real Data</div>
                <div className="text-sm text-gray-600">From Bright Data</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">Quality Check</div>
                <div className="text-sm text-gray-600">Validate Matches</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">Free Preview</div>
                <div className="text-sm text-gray-600">No Cost</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">Your Choice</div>
                <div className="text-sm text-gray-600">Approve or Adjust</div>
              </div>
            </div>
            
            <Button 
              onClick={generatePreview}
              disabled={isLoading}
              className="ml-6 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Preview...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Data Preview
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      {previewResults && (
        <>
          {/* Quality Metrics Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Data Quality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${getQualityColor(previewResults.quality_metrics.overall_quality_score)}`}>
                    {getQualityIcon(previewResults.quality_metrics.overall_quality_score)}
                    {previewResults.quality_metrics.overall_quality_score}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Quality</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {previewResults.quality_metrics.title_relevance}%
                  </div>
                  <div className="text-sm text-gray-600">Title Match</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {previewResults.quality_metrics.location_match}%
                  </div>
                  <div className="text-sm text-gray-600">Location Match</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {previewResults.quality_metrics.seniority_level}%
                  </div>
                  <div className="text-sm text-gray-600">Senior Level</div>
                </div>
              </div>

              {/* Recommendation */}
              <div className={`p-4 rounded-lg border ${
                previewResults.preview_summary.recommendation === 'proceed' 
                  ? 'bg-green-50 border-green-200' 
                  : previewResults.preview_summary.recommendation === 'adjust_criteria'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {previewResults.preview_summary.recommendation === 'proceed' && 
                    <CheckCircle className="h-5 w-5 text-green-600" />}
                  {previewResults.preview_summary.recommendation !== 'proceed' && 
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                  <span className="font-medium">
                    Recommendation: {previewResults.preview_summary.recommendation.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Search Effectiveness: {previewResults.preview_summary.search_effectiveness} | 
                  Data Quality: {previewResults.preview_summary.data_quality}
                </p>
                
                {previewResults.preview_summary.suggested_adjustments && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Suggested Improvements:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {previewResults.preview_summary.suggested_adjustments.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-yellow-600">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sample Profiles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sample Profiles ({previewResults.sample_profiles.length} of {previewResults.estimated_full_results.expected_profiles} expected)
              </CardTitle>
              <CardDescription>
                Actual profiles found using your ICP criteria - review for relevance and quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {previewResults.sample_profiles.slice(0, showDetailedView ? 15 : 5).map((profile, index) => (
                  <ProfileCard key={index} profile={profile} />
                ))}
              </div>
              
              {previewResults.sample_profiles.length > 5 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailedView(!showDetailedView)}
                  >
                    {showDetailedView ? 'Show Less' : `Show All ${previewResults.sample_profiles.length} Profiles`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Search Queries Used */}
          <Card>
            <CardHeader>
              <CardTitle>Search Queries Used</CardTitle>
              <CardDescription>
                These are the optimized queries used to find your sample data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {previewResults.search_queries_used.map((query, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm font-mono">
                    {query}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Found {previewResults.total_urls_found} total LinkedIn URLs from these searches
              </div>
            </CardContent>
          </Card>

          {/* Client Feedback and Decision */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle>Review and Decision</CardTitle>
              <CardDescription>
                Based on this sample data, would you like to proceed with the full scraping?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your feedback on the sample data (optional):
                </label>
                <Textarea
                  value={clientFeedback}
                  onChange={(e) => setClientFeedback(e.target.value)}
                  placeholder="e.g., 'Profiles look good but I'd prefer more C-level executives' or 'Companies seem too small, need larger enterprises'"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h4 className="font-medium">Full Scraping Estimate</h4>
                  <p className="text-sm text-gray-600">
                    Expected {previewResults.estimated_full_results.expected_profiles} profiles 
                    at {previewResults.estimated_full_results.expected_quality}% quality
                  </p>
                  <p className="text-sm text-gray-600">
                    Estimated cost: ${(previewResults.estimated_full_results.expected_profiles * 0.0015).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Need Adjustments
                  </Button>
                  
                  <Button
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    disabled={previewResults.preview_summary.recommendation === 'refine_search'}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Proceed with Full Scraping
                  </Button>
                </div>
              </div>

              {previewResults.preview_summary.recommendation === 'refine_search' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Data quality is below recommended threshold. Please adjust your ICP criteria before proceeding.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ICP Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Current ICP Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Industry:</span>
              <div className="font-medium">{icp.industry}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Job Titles:</span>
              <div className="font-medium">{icp.jobTitles.join(', ')}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Location:</span>
              <div className="font-medium">{icp.location || 'Any'}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Company Size:</span>
              <div className="font-medium">{icp.companySize || 'Any'}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Company Stage:</span>
              <div className="font-medium">{icp.companyStage || 'Any'}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Target Count:</span>
              <div className="font-medium">{icp.targetCount}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}