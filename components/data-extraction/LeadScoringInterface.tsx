/**
 * Lead Scoring Interface
 * Shows false positive detection and lead qualification based on LinkedIn vs Website analysis
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Eye,
  Filter,
  Download,
  Zap,
  Globe,
  Building2,
  Users,
  Search,
  MessageCircle
} from 'lucide-react';

import { EnrichedProfile } from '@/services/ProfileEnrichmentService';
import LeadScoringService, { ICPCriteria, LeadScore } from '@/services/LeadScoringService';

interface LeadScoringInterfaceProps {
  enrichedProfiles: EnrichedProfile[];
  icp: ICPCriteria;
  onScoringComplete?: (scoredLeads: LeadScore[]) => void;
}

export default function LeadScoringInterface({ 
  enrichedProfiles, 
  icp, 
  onScoringComplete 
}: LeadScoringInterfaceProps) {
  const [scoredLeads, setScoredLeads] = useState<LeadScore[]>([]);
  const [isScoring, setIsScoring] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadScore | null>(null);
  const [filterBy, setFilterBy] = useState<'all' | 'high_priority' | 'false_positive'>('all');
  const [showAnalysis, setShowAnalysis] = useState(false);

  const scoringService = new LeadScoringService();

  const handleStartScoring = async () => {
    if (!enrichedProfiles.length) {
      alert('No profiles to score');
      return;
    }

    setIsScoring(true);
    
    try {
      console.log(`🎯 Starting lead scoring for ${enrichedProfiles.length} profiles`);
      const scores: LeadScore[] = [];
      
      for (const profile of enrichedProfiles) {
        const score = await scoringService.scoreProfile(profile, icp);
        scores.push(score);
      }
      
      setScoredLeads(scores);
      setShowAnalysis(true);
      
      if (onScoringComplete) {
        onScoringComplete(scores);
      }
      
      console.log(`✅ Scoring completed for ${scores.length} leads`);
      
    } catch (error) {
      console.error('❌ Lead scoring failed:', error);
      alert(`Scoring failed: ${error.message}`);
    } finally {
      setIsScoring(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case 'high_priority':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium_priority':
        return <Target className="h-5 w-5 text-blue-600" />;
      case 'low_priority':
        return <TrendingUp className="h-5 w-5 text-yellow-600" />;
      case 'false_positive':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    const colors = {
      'high_priority': 'bg-green-100 text-green-800',
      'medium_priority': 'bg-blue-100 text-blue-800',
      'low_priority': 'bg-yellow-100 text-yellow-800',
      'false_positive': 'bg-red-100 text-red-800'
    };
    return colors[classification] || 'bg-gray-100 text-gray-800';
  };

  const filteredLeads = scoredLeads.filter(lead => {
    if (filterBy === 'all') return true;
    return lead.classification === filterBy;
  });

  const getAnalysisSummary = () => {
    const total = scoredLeads.length;
    const highPriority = scoredLeads.filter(l => l.classification === 'high_priority').length;
    const falsePositives = scoredLeads.filter(l => l.classification === 'false_positive').length;
    const avgScore = scoredLeads.reduce((sum, l) => sum + l.overall_score, 0) / total;
    
    return { total, highPriority, falsePositives, avgScore };
  };

  const summary = scoredLeads.length > 0 ? getAnalysisSummary() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-orange-600" />
            Lead Scoring & False Positive Detection
          </CardTitle>
          <CardDescription>
            Analyze LinkedIn vs Website data to identify real targets and filter false positives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{enrichedProfiles.length}</div>
              <div className="text-sm text-gray-600">Profiles to Score</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {summary?.highPriority || 0}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {summary?.falsePositives || 0}
              </div>
              <div className="text-sm text-gray-600">False Positives</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {summary?.avgScore?.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Intelligent Lead Qualification</h4>
              <p className="text-sm text-gray-600">
                Detect LinkedIn misrepresentations using website content and SEO analysis
              </p>
            </div>
            <Button 
              onClick={handleStartScoring}
              disabled={!enrichedProfiles.length || isScoring}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isScoring ? (
                <>
                  <Target className="h-4 w-4 mr-2 animate-pulse" />
                  Scoring...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Score {enrichedProfiles.length} Leads
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Results */}
      {showAnalysis && (
        <>
          {/* Summary Analytics */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Scoring Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{summary.highPriority}</div>
                  <div className="text-sm text-gray-600">High Priority Targets</div>
                  <div className="text-xs text-green-700">
                    {((summary.highPriority / summary.total) * 100).toFixed(0)}% of total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{summary.falsePositives}</div>
                  <div className="text-sm text-gray-600">False Positives Detected</div>
                  <div className="text-xs text-red-700">
                    {((summary.falsePositives / summary.total) * 100).toFixed(0)}% filtered out
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{summary.avgScore.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Average Score</div>
                  <div className="text-xs text-blue-700">Lead quality index</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {((summary.total - summary.falsePositives) / summary.total * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy Rate</div>
                  <div className="text-xs text-purple-700">Real targets identified</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setFilterBy('all')}>
                  <Users className="h-4 w-4 mr-2" />
                  All Leads ({scoredLeads.length})
                </Button>
                <Button variant="outline" onClick={() => setFilterBy('high_priority')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  High Priority ({summary.highPriority})
                </Button>
                <Button variant="outline" onClick={() => setFilterBy('false_positive')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  False Positives ({summary.falsePositives})
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scored Leads List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Scored Leads ({filteredLeads.length})</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLeads.map((lead, index) => {
                  const profile = enrichedProfiles.find(p => p.linkedin_url === lead.profile_id);
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {getClassificationIcon(lead.classification)}
                          <div>
                            <h4 className="font-medium">{profile?.name}</h4>
                            <p className="text-sm text-blue-600">{profile?.title}</p>
                            <p className="text-sm text-gray-600">{profile?.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getScoreColor(lead.overall_score)} font-bold`}>
                            {lead.overall_score}/100
                          </Badge>
                          <div className="mt-1">
                            <Badge className={getClassificationColor(lead.classification)}>
                              {lead.classification.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Key Insights */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-gray-500">LinkedIn Match:</span>
                          <div className="text-sm font-medium">
                            {lead.scoring_factors.job_title_match.score}/100
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Website Alignment:</span>
                          <div className="text-sm font-medium">
                            {lead.scoring_factors.seo_keyword_alignment.score}/100
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">False Positive Risk:</span>
                          <div className={`text-sm font-medium ${
                            lead.scoring_factors.false_positive_signals.score > 30 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {lead.scoring_factors.false_positive_signals.score}/100
                          </div>
                        </div>
                      </div>

                      {/* Warning Signals */}
                      {lead.scoring_factors.false_positive_signals.score > 20 && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Potential Issues Detected</span>
                          </div>
                          <p className="text-sm text-red-700">
                            {lead.scoring_factors.false_positive_signals.reasoning}
                          </p>
                        </div>
                      )}

                      {/* Opportunity Insights */}
                      {lead.qualification_insights.strengths.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Key Strengths</span>
                          </div>
                          <p className="text-sm text-green-700">
                            {lead.qualification_insights.strengths.join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Action Recommendations */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-500">Recommended Action: </span>
                          <span className="font-medium">{lead.recommended_actions.priority}</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Detailed Lead Analysis Modal */}
      {selectedLead && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Lead Analysis: {enrichedProfiles.find(p => p.linkedin_url === selectedLead.profile_id)?.name}</CardTitle>
              <CardDescription>
                Comprehensive scoring breakdown and recommendations
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              Close
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="scoring" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="scoring">Scoring Breakdown</TabsTrigger>
                <TabsTrigger value="analysis">False Positive Analysis</TabsTrigger>
                <TabsTrigger value="insights">Qualification Insights</TabsTrigger>
                <TabsTrigger value="actions">Recommended Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="scoring" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profile Factors */}
                  <div>
                    <h4 className="font-medium mb-3">LinkedIn Profile Factors (35% weight)</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedLead.scoring_factors).slice(0, 6).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm">{key.replace('_', ' ')}</span>
                          <div className="text-right">
                            <Badge variant="outline" className={getScoreColor(value.score)}>
                              {value.score}/100
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Company Factors */}
                  <div>
                    <h4 className="font-medium mb-3">Company Intelligence (30% weight)</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedLead.scoring_factors).slice(6, 11).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm">{key.replace('_', ' ')}</span>
                          <div className="text-right">
                            <Badge variant="outline" className={getScoreColor(value.score)}>
                              {value.score}/100
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">False Positive Analysis</h4>
                  <p className="text-sm text-yellow-700 mb-3">
                    Score: {selectedLead.scoring_factors.false_positive_signals.score}/100
                  </p>
                  <p className="text-sm text-yellow-700">
                    {selectedLead.scoring_factors.false_positive_signals.reasoning}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Detection Factors</h4>
                  <div className="text-sm text-gray-600">
                    Our system analyzes LinkedIn claims against website reality to detect:
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Industry misrepresentation (LinkedIn vs website SEO)</li>
                    <li>• Technology claims vs actual website technology</li>
                    <li>• Company size claims vs content targeting</li>
                    <li>• Service offerings vs LinkedIn job titles</li>
                    <li>• Content consistency between platforms</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-3 text-green-800">Strengths</h4>
                    <ul className="space-y-1">
                      {selectedLead.qualification_insights.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-green-700 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-red-800">Concerns</h4>
                    <ul className="space-y-1">
                      {selectedLead.qualification_insights.concerns.map((concern, idx) => (
                        <li key={idx} className="text-sm text-red-700 flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Personalization Hooks</h4>
                  <div className="space-y-1">
                    {selectedLead.qualification_insights.personalization_hooks.map((hook, idx) => (
                      <Badge key={idx} variant="outline" className="mr-2 mb-1">
                        {hook}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Recommended Approach</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Priority: <strong>{selectedLead.recommended_actions.priority}</strong>
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedLead.recommended_actions.outreach_strategy}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Key Messaging</h4>
                  <ul className="space-y-1">
                    {selectedLead.recommended_actions.key_messaging.map((message, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                        <MessageCircle className="h-3 w-3" />
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Scoring Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>False Positive Detection Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h4 className="font-medium text-red-800">Detect Misrepresentation</h4>
              <p className="text-sm text-red-700">
                Identify LinkedIn profiles claiming tech roles but working at non-tech companies
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Globe className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800">Website Truth Verification</h4>
              <p className="text-sm text-green-700">
                Use SEO keywords and content to verify actual business vs LinkedIn claims
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800">Precise Targeting</h4>
              <p className="text-sm text-blue-700">
                Focus outreach on genuinely qualified prospects, improving conversion rates
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}