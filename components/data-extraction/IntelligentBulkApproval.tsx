/**
 * Intelligent Bulk Approval Component
 * Solves the "approval fatigue" problem with smart automation and rules-based approval
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Filter, 
  Target, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Settings,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  criteria: {
    min_relevance_score?: number;
    max_cost_per_record?: number;
    required_fields?: string[];
    company_size_filter?: string[];
    industry_filter?: string[];
    role_seniority?: string[];
  };
}

interface IntelligentBulkApprovalProps {
  totalRecords: number;
  estimatedCost: number;
  previewData: any[];
  onApprove: (approvalRules: ApprovalRule[]) => void;
  onReject: () => void;
}

export default function IntelligentBulkApproval({
  totalRecords,
  estimatedCost,
  previewData,
  onApprove,
  onReject
}: IntelligentBulkApprovalProps) {
  const [approvalMode, setApprovalMode] = useState<'smart' | 'rules' | 'manual'>('smart');
  const [qualityThreshold, setQualityThreshold] = useState([75]);
  const [costThreshold, setCostThreshold] = useState([5.0]);
  const [autoApprovalRules, setAutoApprovalRules] = useState<ApprovalRule[]>([
    {
      id: 'high_quality',
      name: 'High Quality Profiles',
      description: 'Automatically approve profiles with >90% relevance score',
      enabled: true,
      criteria: {
        min_relevance_score: 0.9,
        required_fields: ['name', 'title', 'company', 'location']
      }
    },
    {
      id: 'target_roles',
      name: 'Target Decision Makers',
      description: 'Auto-approve C-level, VPs, and Directors',
      enabled: true,
      criteria: {
        role_seniority: ['C-Level', 'VP', 'Director', 'Manager'],
        min_relevance_score: 0.7
      }
    },
    {
      id: 'cost_efficient',
      name: 'Cost Efficient Records',
      description: 'Approve records under $3.00 each with 70%+ relevance',
      enabled: false,
      criteria: {
        max_cost_per_record: 3.0,
        min_relevance_score: 0.7
      }
    }
  ]);

  const calculateApprovalEstimate = () => {
    let autoApprovedCount = 0;
    let manualReviewCount = 0;
    let rejectedCount = 0;

    // Simulate approval based on preview data and rules
    previewData.forEach(record => {
      const relevanceScore = record.relevance_score || 0;
      const profileCompleteness = record.profile_completeness || 0;
      
      if (relevanceScore >= qualityThreshold[0] / 100) {
        autoApprovedCount++;
      } else if (relevanceScore >= 0.5) {
        manualReviewCount++;
      } else {
        rejectedCount++;
      }
    });

    // Extrapolate to total dataset
    const ratio = totalRecords / previewData.length;
    return {
      autoApproved: Math.floor(autoApprovedCount * ratio),
      manualReview: Math.floor(manualReviewCount * ratio),
      rejected: Math.floor(rejectedCount * ratio)
    };
  };

  const estimate = calculateApprovalEstimate();
  const costSavings = (estimate.rejected / totalRecords) * estimatedCost;

  const handleSmartApproval = () => {
    const smartRules: ApprovalRule[] = [
      {
        id: 'smart_auto',
        name: 'Smart Auto-Approval',
        description: `Auto-approve ${estimate.autoApproved} high-quality records`,
        enabled: true,
        criteria: {
          min_relevance_score: qualityThreshold[0] / 100,
          max_cost_per_record: costThreshold[0]
        }
      }
    ];
    onApprove(smartRules);
  };

  const handleRulesBasedApproval = () => {
    onApprove(autoApprovalRules.filter(rule => rule.enabled));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Intelligent Bulk Approval - Avoid Approval Fatigue
          </CardTitle>
          <CardDescription>
            Let AI handle repetitive approval decisions based on your criteria. 
            Review only the records that matter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalRecords.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estimate.autoApproved.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Auto-Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {estimate.manualReview.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Manual Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                ${costSavings.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Cost Savings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Approval Mode Selection */}
      <Tabs value={approvalMode} onValueChange={(value) => setApprovalMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smart">Smart AI Approval</TabsTrigger>
          <TabsTrigger value="rules">Rules-Based</TabsTrigger>
          <TabsTrigger value="manual">Manual Review</TabsTrigger>
        </TabsList>

        {/* Smart AI Approval */}
        <TabsContent value="smart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                AI-Powered Smart Approval
              </CardTitle>
              <CardDescription>
                Set your quality standards and let AI automatically approve qualifying records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Quality Threshold: {qualityThreshold[0]}%</label>
                  <Slider
                    value={qualityThreshold}
                    onValueChange={setQualityThreshold}
                    max={100}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Records with {qualityThreshold[0]}%+ relevance score will be auto-approved
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Max Cost per Record: ${costThreshold[0].toFixed(2)}</label>
                  <Slider
                    value={costThreshold}
                    onValueChange={setCostThreshold}
                    max={10}
                    min={1}
                    step={0.5}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Reject records costing more than ${costThreshold[0].toFixed(2)} each
                  </p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Smart Approval Preview</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700">Auto-Approved:</span>
                    <span className="font-bold ml-2">{estimate.autoApproved.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-orange-700">Manual Review:</span>
                    <span className="font-bold ml-2">{estimate.manualReview.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-red-700">Auto-Rejected:</span>
                    <span className="font-bold ml-2">{estimate.rejected.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Cost Savings:</span>
                    <span className="font-bold ml-2">${costSavings.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSmartApproval} className="flex-1">
                  Start Smart Approval
                </Button>
                <Button variant="outline" onClick={onReject}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules-Based Approval */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Approval Rules
              </CardTitle>
              <CardDescription>
                Define specific criteria for automatic approval
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {autoApprovalRules.map((rule) => (
                <div key={rule.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {rule.criteria.min_relevance_score && 
                        `Min relevance: ${(rule.criteria.min_relevance_score * 100).toFixed(0)}% • `
                      }
                      {rule.criteria.max_cost_per_record &&
                        `Max cost: $${rule.criteria.max_cost_per_record} • `
                      }
                      {rule.criteria.required_fields && 
                        `Required fields: ${rule.criteria.required_fields.length}`
                      }
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(enabled) => {
                      setAutoApprovalRules(rules => 
                        rules.map(r => r.id === rule.id ? { ...r, enabled } : r)
                      );
                    }}
                  />
                </div>
              ))}

              <div className="flex gap-2">
                <Button onClick={handleRulesBasedApproval} className="flex-1">
                  Apply Rules & Start Extraction
                </Button>
                <Button variant="outline" onClick={onReject}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Review */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Manual Review Mode
              </CardTitle>
              <CardDescription>
                Review each batch manually (not recommended for large datasets)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-yellow-50 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Approval Fatigue Warning</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Manual review of {totalRecords.toLocaleString()} records will require 
                      approximately {Math.ceil(totalRecords / 100)} approval sessions. 
                      Consider using Smart Approval instead.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">Manual review will proceed in batches of 100 records</p>
                <div className="text-sm">
                  Estimated time: {Math.ceil(totalRecords / 100 * 2)} minutes<br/>
                  Approval sessions: {Math.ceil(totalRecords / 100)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Start Manual Review (Not Recommended)
                </Button>
                <Button variant="outline" onClick={onReject}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Benefits Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800">Intelligent Approval Benefits</h4>
              <ul className="text-sm text-green-700 mt-1 space-y-1">
                <li>• Eliminate approval fatigue - review only 10-20% manually</li>
                <li>• Consistent quality standards applied automatically</li>
                <li>• Significant cost savings by rejecting low-quality records</li>
                <li>• Complete audit trail of approval decisions</li>
                <li>• Learn from your approval patterns over time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}