/**
 * Sustainable Preview Interface
 * Production-ready preview system that works reliably regardless of trial status
 * Addresses client concern: "once the trial is over we won't see preview data anymore"
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Infinity, 
  Target, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Building2,
  DollarSign,
  Play,
  RefreshCw,
  Eye,
  Zap,
  Clock
} from 'lucide-react';
import ProductionPreviewService, { ICPCriteria, ProductionPreviewResults } from '@/services/ProductionPreviewService';

interface SustainablePreviewInterfaceProps {
  icp: ICPCriteria;
  onPreviewApproval: (approved: boolean, feedback?: string) => void;
  onAdjustCriteria: (adjustedICP: ICPCriteria) => void;
}

export default function SustainablePreviewInterface({ 
  icp, 
  onPreviewApproval, 
  onAdjustCriteria 
}: SustainablePreviewInterfaceProps) {
  const [previewResults, setPreviewResults] = useState<ProductionPreviewResults | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sustainabilityCheck, setSustainabilityCheck] = useState(null);
  const [clientFeedback, setClientFeedback] = useState('');
  const [showDetailedView, setShowDetailedView] = useState(false);

  const previewService = new ProductionPreviewService();

  const checkSustainability = async () => {
    const sustainability = await previewService.checkProductionSustainability();
    setSustainabilityCheck(sustainability);
  };

  React.useEffect(() => {
    checkSustainability();
  }, []);

  const generateSustainablePreview = async () => {
    setIsGenerating(true);
    try {
      const results = await previewService.generateProductionPreview(icp);
      setPreviewResults(results);
      console.log('✅ Sustainable preview generated successfully');
    } catch (error) {
      console.error('Preview generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproval = () => {
    onPreviewApproval(true, clientFeedback);
  };

  const handleRejection = () => {
    onPreviewApproval(false, clientFeedback);
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 65) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const ProfileCard = ({ profile }: { profile: any }) => (
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
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">{profile.name}</h4>
              <Badge variant="outline" className="text-xs">
                {profile.data_source.replace('_', ' ')}
              </Badge>
            </div>
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
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {profile.connections_count && (
                  <span>{profile.connections_count} connections</span>
                )}
                {profile.company_details?.size && (
                  <span>{profile.company_details.size}</span>
                )}
              </div>
              <div className="text-xs font-medium text-blue-600">
                {profile.confidence_score}% match
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Sustainability Guarantee Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Production-Ready Preview System
          </CardTitle>
          <CardDescription>
            Sustainable preview system that works reliably in production without trial dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-600">
                <DollarSign className="h-5 w-5" />
                $0.00
              </div>
              <div className="text-sm text-gray-600">Preview Cost</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
                <Infinity className="h-5 w-5" />
                Always
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-purple-600">
                <Zap className="h-5 w-5" />
                4+
              </div>
              <div className="text-sm text-gray-600">Data Sources</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-orange-600">
                <Eye className="h-5 w-5" />
                Real
              </div>
              <div className="text-sm text-gray-600">Validation</div>
            </div>
          </div>

          {sustainabilityCheck && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Production Guarantee:</strong> This preview system uses {sustainabilityCheck.strategies_available.length} sustainable 
                data sources and can handle {sustainabilityCheck.estimated_daily_capacity}+ previews daily at $0 cost. 
                No dependency on free trials or paid API credits for validation.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center mt-4">
            <Button 
              onClick={generateSustainablePreview}
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Sustainable Preview...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Production Preview
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Results */}
      {previewResults && (
        <>
          {/* Data Source Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Preview Strategy: {previewResults.search_strategy_used.replace('_', ' ').toUpperCase()}
              </CardTitle>
              <CardDescription>
                Using sustainable data discovery methods for reliable validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {previewResults.data_source_hierarchy.map((source, index) => (
                  <div key={index} className={`p-3 rounded-lg text-center ${
                    source === previewResults.search_strategy_used 
                      ? 'bg-green-100 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  } border`}>
                    <div className={`font-medium ${
                      source === previewResults.search_strategy_used 
                        ? 'text-green-800' 
                        : 'text-gray-600'
                    }`}>
                      {source === previewResults.search_strategy_used && <CheckCircle className="h-4 w-4 inline mr-1" />}
                      {source.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {source === previewResults.search_strategy_used ? 'Used for preview' : 'Fallback available'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">Data Discovery Results</div>
                <div className="text-sm text-blue-700">
                  Found {previewResults.total_urls_discoverable} discoverable LinkedIn profiles using {previewResults.search_strategy_used.replace('_', ' ')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Data Quality Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`text-2xl font-bold flex items-center justify-center gap-1 ${getQualityColor(previewResults.quality_analysis.overall_quality_score)}`}>
                    {getQualityIcon(previewResults.quality_analysis.overall_quality_score)}
                    {previewResults.quality_analysis.overall_quality_score}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Quality</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {previewResults.quality_analysis.title_match_rate}%
                  </div>
                  <div className="text-sm text-gray-600">Title Match</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {previewResults.quality_analysis.location_accuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Location Match</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {previewResults.quality_analysis.industry_relevance}%
                  </div>
                  <div className="text-sm text-gray-600">Industry Match</div>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {previewResults.quality_analysis.profile_completeness}%
                  </div>
                  <div className="text-sm text-gray-600">Completeness</div>
                </div>
              </div>

              {/* Validation Confidence */}
              <div className={`p-4 rounded-lg border ${
                previewResults.validation_confidence.recommendation === 'proceed' 
                  ? 'bg-green-50 border-green-200' 
                  : previewResults.validation_confidence.recommendation === 'adjust_criteria'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {previewResults.validation_confidence.recommendation === 'proceed' && 
                    <CheckCircle className="h-5 w-5 text-green-600" />}
                  {previewResults.validation_confidence.recommendation !== 'proceed' && 
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                  <span className="font-medium">
                    Recommendation: {previewResults.validation_confidence.recommendation.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div>Search Viability: {previewResults.validation_confidence.search_viability}%</div>
                  <div>Data Availability: {previewResults.validation_confidence.data_availability}%</div>
                  <div>Cost Accuracy: {previewResults.validation_confidence.cost_accuracy}%</div>
                </div>
                
                {previewResults.validation_confidence.suggestions && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Optimization Suggestions:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {previewResults.validation_confidence.suggestions.map((suggestion, index) => (
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
                Sample Profiles ({previewResults.preview_profiles.length} from sustainable sources)
              </CardTitle>
              <CardDescription>
                Real profile data discovered using production-ready methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {previewResults.preview_profiles.slice(0, showDetailedView ? 12 : 6).map((profile, index) => (
                  <ProfileCard key={index} profile={profile} />
                ))}
              </div>
              
              {previewResults.preview_profiles.length > 6 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailedView(!showDetailedView)}
                  >
                    {showDetailedView ? 'Show Less' : `Show All ${previewResults.preview_profiles.length} Profiles`}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full Results Estimate */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Full Scraping Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{previewResults.estimated_full_results.expected_profiles}</div>
                  <div className="text-sm text-gray-600">Expected Profiles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${previewResults.estimated_full_results.estimated_cost.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Estimated Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{previewResults.estimated_full_results.data_quality_prediction}%</div>
                  <div className="text-sm text-gray-600">Expected Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{previewResults.estimated_full_results.delivery_timeframe}</div>
                  <div className="text-sm text-gray-600">Delivery Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Decision */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle>Review and Decision</CardTitle>
              <CardDescription>
                This sustainable preview system works reliably in production. Ready to proceed?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your feedback on the preview (optional):
                </label>
                <Textarea
                  value={clientFeedback}
                  onChange={(e) => setClientFeedback(e.target.value)}
                  placeholder="e.g., 'Quality looks good, proceed with full scraping' or 'Need more senior executives'"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h4 className="font-medium">Production Benefits</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>✅ No trial dependency - works forever</li>
                    <li>✅ Multiple fallback data sources</li>
                    <li>✅ $0 preview cost in production</li>
                    <li>✅ Reliable data quality validation</li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleRejection}
                    className="flex items-center gap-2"
                  >
                    Adjust Criteria
                  </Button>
                  
                  <Button
                    onClick={handleApproval}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    disabled={previewResults.validation_confidence.recommendation === 'refine_search'}
                  >
                    Proceed with Full Scraping
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}