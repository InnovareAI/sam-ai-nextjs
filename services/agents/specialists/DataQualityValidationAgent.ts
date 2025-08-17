/**
 * Data Quality Validation Agent - Minimizes Financial Risk for Apollo Actor Runs
 * Tests data quality with micro-batches before committing to full $5 extractions
 */

import { BaseAgent } from '../types/AgentTypes';
import { 
  AgentConfig, 
  AgentType, 
  TaskRequest, 
  TaskResponse, 
  AgentCapability,
  ConversationContext 
} from '../types/AgentTypes';

export interface QualityTestRequest {
  search_criteria: {
    linkedin_search_url?: string;
    title_keywords?: string[];
    company_criteria?: string[];
    location?: string[];
    industry?: string[];
  };
  test_size: number; // Default 20 for micro-test
  quality_thresholds: {
    min_email_deliverability: number; // Default 0.8 (80%)
    min_profile_relevance: number;    // Default 0.8 (80%) 
    min_data_completeness: number;    // Default 0.7 (70%)
    min_recent_activity: number;      // Default 0.5 (50%)
  };
}

export interface QualityTestResult {
  test_id: string;
  test_cost: number;
  records_tested: number;
  quality_metrics: {
    email_deliverability: number;
    profile_relevance: number;
    data_completeness: number;
    recent_activity: number;
    overall_quality_score: number;
  };
  sample_data: QualityRecord[];
  recommendation: 'PROCEED' | 'REFINE' | 'ABORT';
  estimated_full_batch_quality: number;
  financial_risk_assessment: {
    potential_waste_percentage: number;
    estimated_waste_cost: number;
    confidence_level: number;
  };
}

export interface QualityRecord {
  profile_id: string;
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  email_valid: boolean;
  profile_complete: boolean;
  recent_activity: boolean;
  relevance_score: number;
  data_quality_flags: string[];
}

export interface FullExtractionDecision {
  test_id: string;
  proceed_with_full_batch: boolean;
  adjusted_batch_size?: number; // If reducing risk
  refined_criteria?: any; // If refining before full run
}

export class DataQualityValidationAgent extends BaseAgent {
  private qualityTests: Map<string, QualityTestResult> = new Map();
  private readonly APOLLO_COST_PER_RECORD = 0.005; // $5 per 1000 records
  private readonly FULL_BATCH_SIZE = 1000;
  
  constructor(config: AgentConfig) {
    super('data-quality-validation' as AgentType, config);
  }

  async initialize(): Promise<void> {
    try {
      this.capabilities = [
        {
          name: 'run_quality_micro_test',
          description: 'Run micro-batch quality test before full Apollo extraction',
          supportedComplexity: ['simple', 'moderate'],
          estimatedDuration: 60,
          requiredParameters: ['search_criteria', 'test_size'],
          optionalParameters: ['quality_thresholds']
        },
        {
          name: 'assess_extraction_risk',
          description: 'Assess financial risk of full batch extraction based on test results',
          supportedComplexity: ['moderate', 'complex'],
          estimatedDuration: 30,
          requiredParameters: ['test_id'],
          optionalParameters: ['adjusted_batch_size']
        },
        {
          name: 'recommend_extraction_strategy',
          description: 'Recommend optimal extraction strategy to minimize waste',
          supportedComplexity: ['complex', 'expert'],
          estimatedDuration: 45,
          requiredParameters: ['test_results', 'budget_constraints'],
          optionalParameters: ['risk_tolerance']
        },
        {
          name: 'progressive_batch_validation',
          description: 'Validate data quality through progressive batch sizes',
          supportedComplexity: ['expert'],
          estimatedDuration: 180,
          requiredParameters: ['search_criteria'],
          optionalParameters: ['max_budget', 'quality_gates']
        }
      ];

      this.isInitialized = true;
      console.log('✅ Data Quality Validation Agent initialized - Financial risk mitigation active');
    } catch (error) {
      console.error('❌ Failed to initialize Data Quality Validation Agent:', error);
      throw error;
    }
  }

  async processTask(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    try {
      console.log(`🔍 Data Quality Validation Agent processing: ${task.type}`);
      
      const taskType = task.parameters.task_type as string;
      
      switch (taskType) {
        case 'micro_test':
          return await this.runQualityMicroTest(task, context);
        case 'assess_risk':
          return await this.assessExtractionRisk(task, context);
        case 'recommend_strategy':
          return await this.recommendExtractionStrategy(task, context);
        case 'progressive_validation':
          return await this.runProgressiveBatchValidation(task, context);
        default:
          throw new Error(`Unknown task type: ${taskType}`);
      }
    } catch (error) {
      console.error('Data Quality Validation Agent error:', error);
      return this.createTaskResponse(
        task.id,
        { type: 'error', data: { error: error.message } },
        false,
        error.message
      );
    }
  }

  /**
   * Run micro-batch quality test with Apollo actor (20 records = $0.10)
   */
  private async runQualityMicroTest(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const request = task.parameters as QualityTestRequest;
    const testId = this.generateTestId();
    
    console.log(`🧪 Running quality micro-test: ${request.test_size} records ($${(request.test_size * this.APOLLO_COST_PER_RECORD).toFixed(2)})`);
    
    // Execute micro-test with Apollo actor
    const testResult = await this.executeApolloMicroTest(request, testId);
    
    // Cache results for decision making
    this.qualityTests.set(testId, testResult);
    
    // Generate recommendation
    const recommendation = this.generateQualityRecommendation(testResult);
    
    return this.createTaskResponse(
      task.id,
      {
        type: 'quality_test_completed',
        data: {
          test_result: testResult,
          recommendation,
          next_steps: this.generateNextSteps(testResult)
        }
      },
      true,
      undefined,
      {
        processingTime: 60,
        confidence: 0.95,
        sources: ['apollo_actor_test']
      }
    );
  }

  /**
   * Execute micro-test with your Apollo actor
   */
  private async executeApolloMicroTest(request: QualityTestRequest, testId: string): Promise<QualityTestResult> {
    // Simulate Apollo actor run with test batch
    const testCost = request.test_size * this.APOLLO_COST_PER_RECORD;
    
    // Mock Apollo extraction results (replace with actual Apollo API call)
    const mockTestData: QualityRecord[] = Array.from({ length: request.test_size }, (_, i) => {
      const mockRelevance = 0.6 + (Math.random() * 0.4); // 60-100% relevance
      const emailValid = Math.random() > 0.2; // 80% email validity
      const profileComplete = Math.random() > 0.3; // 70% profile completeness
      const recentActivity = Math.random() > 0.5; // 50% recent activity
      
      return {
        profile_id: `test_${testId}_${i}`,
        name: `Test Professional ${i + 1}`,
        title: ['Software Engineer', 'Product Manager', 'Sales Director', 'Marketing Lead'][i % 4],
        company: ['TechCorp', 'InnovateLabs', 'SalesForce', 'MarketingPro'][i % 4],
        email: emailValid ? `test${i}@example.com` : undefined,
        email_valid: emailValid,
        profile_complete: profileComplete,
        recent_activity: recentActivity,
        relevance_score: mockRelevance,
        data_quality_flags: this.generateDataQualityFlags(emailValid, profileComplete, recentActivity, mockRelevance)
      };
    });

    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(mockTestData);
    
    // Assess financial risk
    const riskAssessment = this.assessFinancialRisk(qualityMetrics);
    
    return {
      test_id: testId,
      test_cost: testCost,
      records_tested: request.test_size,
      quality_metrics: qualityMetrics,
      sample_data: mockTestData,
      recommendation: this.determineRecommendation(qualityMetrics, request.quality_thresholds),
      estimated_full_batch_quality: qualityMetrics.overall_quality_score,
      financial_risk_assessment: riskAssessment
    };
  }

  /**
   * Calculate quality metrics from test data
   */
  private calculateQualityMetrics(testData: QualityRecord[]): any {
    const totalRecords = testData.length;
    
    const emailDeliverability = testData.filter(r => r.email_valid).length / totalRecords;
    const profileRelevance = testData.reduce((sum, r) => sum + r.relevance_score, 0) / totalRecords;
    const dataCompleteness = testData.filter(r => r.profile_complete).length / totalRecords;
    const recentActivity = testData.filter(r => r.recent_activity).length / totalRecords;
    
    // Overall quality score (weighted average)
    const overallQualityScore = (
      emailDeliverability * 0.35 +      // Email validity is most important
      profileRelevance * 0.30 +         // Relevance is critical
      dataCompleteness * 0.25 +         // Complete profiles matter
      recentActivity * 0.10              // Recent activity is bonus
    );
    
    return {
      email_deliverability: emailDeliverability,
      profile_relevance: profileRelevance,
      data_completeness: dataCompleteness,
      recent_activity: recentActivity,
      overall_quality_score: overallQualityScore
    };
  }

  /**
   * Assess financial risk of full batch extraction
   */
  private assessFinancialRisk(qualityMetrics: any): any {
    const overallQuality = qualityMetrics.overall_quality_score;
    
    // Estimate waste percentage based on quality
    const potentialWastePercentage = Math.max(0, 1 - overallQuality);
    const estimatedWasteCost = potentialWastePercentage * (this.FULL_BATCH_SIZE * this.APOLLO_COST_PER_RECORD);
    
    // Confidence level based on test size and quality consistency
    const confidenceLevel = Math.min(0.95, 0.6 + (overallQuality * 0.35));
    
    return {
      potential_waste_percentage: potentialWastePercentage,
      estimated_waste_cost: estimatedWasteCost,
      confidence_level: confidenceLevel
    };
  }

  /**
   * Determine recommendation based on quality thresholds
   */
  private determineRecommendation(qualityMetrics: any, thresholds: any): 'PROCEED' | 'REFINE' | 'ABORT' {
    const metrics = qualityMetrics;
    const thresh = thresholds || {
      min_email_deliverability: 0.8,
      min_profile_relevance: 0.8,
      min_data_completeness: 0.7,
      min_recent_activity: 0.5
    };
    
    // Check if all thresholds are met
    const emailOk = metrics.email_deliverability >= thresh.min_email_deliverability;
    const relevanceOk = metrics.profile_relevance >= thresh.min_profile_relevance;
    const completenessOk = metrics.data_completeness >= thresh.min_data_completeness;
    const activityOk = metrics.recent_activity >= thresh.min_recent_activity;
    
    if (emailOk && relevanceOk && completenessOk && activityOk) {
      return 'PROCEED';
    } else if (metrics.overall_quality_score >= 0.6) {
      return 'REFINE'; // Marginal quality, worth refining criteria
    } else {
      return 'ABORT'; // Poor quality, not worth pursuing
    }
  }

  /**
   * Generate next steps based on test results
   */
  private generateNextSteps(testResult: QualityTestResult): any {
    switch (testResult.recommendation) {
      case 'PROCEED':
        return {
          action: 'full_extraction',
          message: `Excellent quality detected (${(testResult.quality_metrics.overall_quality_score * 100).toFixed(1)}%). Safe to proceed with full $5 Apollo extraction.`,
          estimated_good_records: Math.floor(this.FULL_BATCH_SIZE * testResult.quality_metrics.overall_quality_score),
          estimated_waste: `$${testResult.financial_risk_assessment.estimated_waste_cost.toFixed(2)}`,
          confidence: `${(testResult.financial_risk_assessment.confidence_level * 100).toFixed(0)}%`
        };
        
      case 'REFINE':
        return {
          action: 'refine_criteria',
          message: `Moderate quality (${(testResult.quality_metrics.overall_quality_score * 100).toFixed(1)}%). Refine search criteria and test again.`,
          suggestions: this.generateRefinementSuggestions(testResult),
          max_loss: `$${testResult.test_cost.toFixed(2)} (test cost only)`,
          potential_savings: `$${(testResult.financial_risk_assessment.estimated_waste_cost - testResult.test_cost).toFixed(2)}`
        };
        
      case 'ABORT':
        return {
          action: 'abort_search',
          message: `Poor quality detected (${(testResult.quality_metrics.overall_quality_score * 100).toFixed(1)}%). Avoid $5 Apollo run.`,
          money_saved: `$${(5.0 - testResult.test_cost).toFixed(2)}`,
          alternative_suggestions: [
            'Try different LinkedIn search criteria',
            'Target different industries or titles',
            'Use different data source',
            'Refine geographic targeting'
          ]
        };
        
      default:
        return { action: 'unknown', message: 'Unable to determine next steps' };
    }
  }

  /**
   * Generate refinement suggestions based on quality issues
   */
  private generateRefinementSuggestions(testResult: QualityTestResult): string[] {
    const suggestions: string[] = [];
    const metrics = testResult.quality_metrics;
    
    if (metrics.email_deliverability < 0.8) {
      suggestions.push('Focus on more recent profiles (better email validity)');
      suggestions.push('Target active LinkedIn users only');
    }
    
    if (metrics.profile_relevance < 0.8) {
      suggestions.push('Use more specific title keywords');
      suggestions.push('Add company size or industry filters');
    }
    
    if (metrics.data_completeness < 0.7) {
      suggestions.push('Target profiles with complete LinkedIn information');
      suggestions.push('Focus on premium LinkedIn accounts');
    }
    
    if (metrics.recent_activity < 0.5) {
      suggestions.push('Target profiles with recent posts or updates');
      suggestions.push('Focus on currently employed professionals');
    }
    
    return suggestions;
  }

  /**
   * Progressive batch validation for large extractions
   */
  private async runProgressiveBatchValidation(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const { search_criteria, max_budget = 10.0 } = task.parameters;
    
    console.log('📊 Running progressive batch validation to minimize risk');
    
    const validationSteps = [
      { size: 20, purpose: 'Initial quality test' },
      { size: 100, purpose: 'Confidence building' },
      { size: 400, purpose: 'Scale validation' },
      { size: 500, purpose: 'Final batch' }
    ];
    
    let totalCost = 0;
    let overallQuality = 0;
    const results = [];
    
    for (const step of validationSteps) {
      const stepCost = step.size * this.APOLLO_COST_PER_RECORD;
      
      if (totalCost + stepCost > max_budget) {
        break; // Budget limit reached
      }
      
      // Simulate batch extraction
      const batchResult = await this.simulateBatchExtraction(step.size);
      results.push({
        ...step,
        cost: stepCost,
        quality: batchResult.quality,
        decision: batchResult.quality > 0.75 ? 'continue' : 'stop'
      });
      
      totalCost += stepCost;
      overallQuality += batchResult.quality;
      
      // Stop if quality drops below threshold
      if (batchResult.quality < 0.75) {
        console.log(`🛑 Stopping progressive validation at ${step.size} records due to quality drop`);
        break;
      }
    }
    
    return this.createTaskResponse(
      task.id,
      {
        type: 'progressive_validation_completed',
        data: {
          validation_steps: results,
          total_cost: totalCost,
          average_quality: overallQuality / results.length,
          recommendation: this.generateProgressiveRecommendation(results),
          money_saved: this.calculateMoneySaved(results)
        }
      },
      true
    );
  }

  // Helper methods
  private generateTestId(): string {
    return `quality_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDataQualityFlags(emailValid: boolean, profileComplete: boolean, recentActivity: boolean, relevance: number): string[] {
    const flags: string[] = [];
    
    if (!emailValid) flags.push('invalid_email');
    if (!profileComplete) flags.push('incomplete_profile');
    if (!recentActivity) flags.push('inactive_profile');
    if (relevance < 0.7) flags.push('low_relevance');
    
    return flags;
  }

  private generateQualityRecommendation(testResult: QualityTestResult): any {
    return {
      recommendation: testResult.recommendation,
      confidence: testResult.financial_risk_assessment.confidence_level,
      risk_level: testResult.financial_risk_assessment.potential_waste_percentage > 0.3 ? 'high' : 'low',
      next_action: testResult.recommendation === 'PROCEED' ? 'run_full_batch' : 'refine_criteria'
    };
  }

  private async simulateBatchExtraction(size: number): Promise<{ quality: number }> {
    // Simulate declining quality for demo purposes
    const baseQuality = 0.85;
    const qualityDecline = size > 200 ? (size - 200) / 1000 : 0;
    return { quality: Math.max(0.5, baseQuality - qualityDecline) };
  }

  private generateProgressiveRecommendation(results: any[]): string {
    const avgQuality = results.reduce((sum, r) => sum + r.quality, 0) / results.length;
    
    if (avgQuality > 0.8) {
      return 'High quality maintained throughout validation. Safe for large batch extraction.';
    } else if (avgQuality > 0.6) {
      return 'Moderate quality. Consider smaller batches or criteria refinement.';
    } else {
      return 'Quality concerns detected. Recommend criteria revision before large extraction.';
    }
  }

  private calculateMoneySaved(results: any[]): number {
    const totalSpent = results.reduce((sum, r) => sum + r.cost, 0);
    const wouldHaveSpent = 5.0; // Full Apollo batch cost
    return Math.max(0, wouldHaveSpent - totalSpent);
  }

  private async assessExtractionRisk(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const { test_id } = task.parameters;
    const testResult = this.qualityTests.get(test_id);
    
    if (!testResult) {
      throw new Error(`Test ${test_id} not found`);
    }
    
    const riskAssessment = {
      financial_risk: testResult.financial_risk_assessment,
      quality_score: testResult.quality_metrics.overall_quality_score,
      recommendation: testResult.recommendation,
      potential_savings: testResult.recommendation !== 'PROCEED' ? 5.0 - testResult.test_cost : 0
    };
    
    return this.createTaskResponse(
      task.id,
      { type: 'risk_assessment', data: riskAssessment },
      true
    );
  }

  private async recommendExtractionStrategy(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const { test_results, budget_constraints, risk_tolerance = 'medium' } = task.parameters;
    
    const strategy = this.generateOptimalStrategy(test_results, budget_constraints, risk_tolerance);
    
    return this.createTaskResponse(
      task.id,
      { type: 'extraction_strategy', data: strategy },
      true
    );
  }

  private generateOptimalStrategy(testResults: any, budget: number, riskTolerance: string): any {
    // Generate optimal extraction strategy based on test results and constraints
    return {
      recommended_approach: 'progressive_batching',
      batch_sizes: [50, 200, 750],
      total_budget: budget,
      expected_quality: 0.82,
      risk_mitigation: ['Quality gates between batches', 'Stop-loss at 70% quality', 'Refinement loops']
    };
  }

  async getCapabilities(): Promise<AgentCapability[]> {
    return this.capabilities;
  }

  async healthCheck(): Promise<boolean> {
    return this.isInitialized;
  }

  async shutdown(): Promise<void> {
    this.qualityTests.clear();
    console.log('🛑 Data Quality Validation Agent shutdown complete');
  }
}