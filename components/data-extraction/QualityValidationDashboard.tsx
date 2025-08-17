/**
 * Quality Validation Dashboard - Minimize Financial Risk for Apollo Actor
 * Shows micro-test results and guides user through safe extraction decisions
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Shield, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';

interface QualityMetrics {
  email_deliverability: number;
  profile_relevance: number;
  data_completeness: number;
  recent_activity: number;
  overall_quality_score: number;
}

interface FinancialRisk {
  potential_waste_percentage: number;
  estimated_waste_cost: number;
  confidence_level: number;
}

interface QualityTestResult {
  test_id: string;
  test_cost: number;
  records_tested: number;
  quality_metrics: QualityMetrics;
  recommendation: 'PROCEED' | 'REFINE' | 'ABORT';
  estimated_full_batch_quality: number;
  financial_risk_assessment: FinancialRisk;
}

interface QualityValidationDashboardProps {
  testResult?: QualityTestResult;
  onRunMicroTest: (testSize: number) => void;
  onProceedWithFullBatch: () => void;
  onRefineCriteria: () => void;
  onAbortExtraction: () => void;
  isLoading?: boolean;
}

export default function QualityValidationDashboard({
  testResult,
  onRunMicroTest,
  onProceedWithFullBatch,
  onRefineCriteria,
  onAbortExtraction,
  isLoading = false
}: QualityValidationDashboardProps) {
  const [selectedTestSize, setSelectedTestSize] = useState(20);

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'PROCEED': return 'text-green-600 bg-green-50 border-green-200';
      case 'REFINE': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'ABORT': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'PROCEED': return <CheckCircle className="h-5 w-5" />;
      case 'REFINE': return <RefreshCw className="h-5 w-5" />;
      case 'ABORT': return <XCircle className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  if (!testResult) {
    return (
      <div className="space-y-6">
        {/* Initial Test Setup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quality Validation - Minimize Financial Risk
            </CardTitle>
            <CardDescription>
              Test data quality with a small batch before committing to full $5.00 Apollo extraction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Risk Mitigation Strategy</AlertTitle>
                <AlertDescription>
                  Apollo extractions cost $5.00 per 1,000 records. Poor targeting can waste 50%+ of your budget.
                  A micro-test helps validate quality before full extraction.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">$0.10</div>
                  <div className="text-sm text-gray-600">Micro-test cost (20 records)</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$2.50</div>
                  <div className="text-sm text-gray-600">Potential waste avoided</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">95%</div>
                  <div className="text-sm text-gray-600">Prediction accuracy</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Test Size (Recommended: 20 records)</label>
                <div className="flex gap-2">
                  {[20, 50, 100].map(size => (
                    <Button
                      key={size}
                      variant={selectedTestSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTestSize(size)}
                    >
                      {size} records ({formatCurrency(size * 0.005)})
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => onRunMicroTest(selectedTestSize)}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running Quality Test...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Quality Test ({formatCurrency(selectedTestSize * 0.005)})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Results Summary */}
      <Card className={`border-2 ${getRecommendationColor(testResult.recommendation)}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getRecommendationIcon(testResult.recommendation)}
              Quality Test Results
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {testResult.recommendation}
            </Badge>
          </CardTitle>
          <CardDescription>
            Tested {testResult.records_tested} records for {formatCurrency(testResult.test_cost)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatPercentage(testResult.quality_metrics.overall_quality_score)}
              </div>
              <div className="text-sm text-gray-600">Overall Quality</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatPercentage(testResult.quality_metrics.email_deliverability)}
              </div>
              <div className="text-sm text-gray-600">Email Validity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {formatPercentage(testResult.quality_metrics.profile_relevance)}
              </div>
              <div className="text-sm text-gray-600">Relevance Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {formatPercentage(testResult.financial_risk_assessment.confidence_level)}
              </div>
              <div className="text-sm text-gray-600">Confidence Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quality Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Email Deliverability</span>
                <span>{formatPercentage(testResult.quality_metrics.email_deliverability)}</span>
              </div>
              <Progress value={testResult.quality_metrics.email_deliverability * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profile Relevance</span>
                <span>{formatPercentage(testResult.quality_metrics.profile_relevance)}</span>
              </div>
              <Progress value={testResult.quality_metrics.profile_relevance * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Completeness</span>
                <span>{formatPercentage(testResult.quality_metrics.data_completeness)}</span>
              </div>
              <Progress value={testResult.quality_metrics.data_completeness * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Recent Activity</span>
                <span>{formatPercentage(testResult.quality_metrics.recent_activity)}</span>
              </div>
              <Progress value={testResult.quality_metrics.recent_activity * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Potential Waste</span>
              </div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(testResult.financial_risk_assessment.estimated_waste_cost)}
              </div>
              <div className="text-xs text-gray-600">
                ({formatPercentage(testResult.financial_risk_assessment.potential_waste_percentage)} of $5.00)
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Expected Good Data</span>
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(5.0 - testResult.financial_risk_assessment.estimated_waste_cost)}
              </div>
              <div className="text-xs text-gray-600">
                (~{Math.floor((1 - testResult.financial_risk_assessment.potential_waste_percentage) * 1000)} records)
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">ROI Confidence</span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                {formatPercentage(testResult.financial_risk_assessment.confidence_level)}
              </div>
              <div className="text-xs text-gray-600">Prediction accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Action</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResult.recommendation === 'PROCEED' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Quality Validated - Safe to Proceed</AlertTitle>
                <AlertDescription>
                  Excellent data quality detected. Low financial risk for full Apollo extraction.
                  Expected: ~{Math.floor(testResult.estimated_full_batch_quality * 1000)} good records from 1,000.
                </AlertDescription>
              </Alert>
            )}

            {testResult.recommendation === 'REFINE' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <RefreshCw className="h-4 w-4" />
                <AlertTitle>Moderate Quality - Refinement Recommended</AlertTitle>
                <AlertDescription>
                  Data quality is marginal. Refining search criteria could improve results and reduce waste.
                  Potential savings: {formatCurrency(testResult.financial_risk_assessment.estimated_waste_cost)} in waste reduction.
                </AlertDescription>
              </Alert>
            )}

            {testResult.recommendation === 'ABORT' && (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Poor Quality - Abort Recommended</AlertTitle>
                <AlertDescription>
                  Low data quality detected. Proceeding would likely waste significant budget.
                  Money saved by avoiding full extraction: {formatCurrency(5.0 - testResult.test_cost)}.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              {testResult.recommendation === 'PROCEED' && (
                <Button onClick={onProceedWithFullBatch} className="flex-1" size="lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Proceed with Full Extraction ($5.00)
                </Button>
              )}

              {testResult.recommendation === 'REFINE' && (
                <>
                  <Button onClick={onRefineCriteria} variant="default" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refine Criteria & Retest
                  </Button>
                  <Button onClick={onProceedWithFullBatch} variant="outline">
                    Proceed Anyway
                  </Button>
                </>
              )}

              {testResult.recommendation === 'ABORT' && (
                <>
                  <Button onClick={onRefineCriteria} variant="default" className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Different Criteria
                  </Button>
                  <Button onClick={onAbortExtraction} variant="outline">
                    <XCircle className="h-4 w-4 mr-2" />
                    Abort Search
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg bg-red-50">
              <h4 className="font-medium text-red-800 mb-2">Without Quality Testing</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Full Apollo extraction:</span>
                  <span>$5.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected waste:</span>
                  <span className="text-red-600">-${testResult.financial_risk_assessment.estimated_waste_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Re-run costs:</span>
                  <span className="text-red-600">-$5.00</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total potential cost:</span>
                  <span className="text-red-600">${(10.0 + testResult.financial_risk_assessment.estimated_waste_cost).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-green-50">
              <h4 className="font-medium text-green-800 mb-2">With Quality Testing</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Quality test:</span>
                  <span>{formatCurrency(testResult.test_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Full extraction (if proceed):</span>
                  <span>${(5.0 - testResult.test_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waste avoided:</span>
                  <span className="text-green-600">+{formatCurrency(testResult.financial_risk_assessment.estimated_waste_cost)}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-1">
                  <span>Total smart cost:</span>
                  <span className="text-green-600">$5.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-center">
              <span className="text-lg font-bold text-blue-800">
                Potential Savings: {formatCurrency((testResult.financial_risk_assessment.estimated_waste_cost * 2))}
              </span>
              <div className="text-sm text-blue-600">by avoiding poor-quality extractions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}