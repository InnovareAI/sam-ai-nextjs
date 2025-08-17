/**
 * Data Preview Agent - Handles preview-first data extraction with user approval
 * Implements ethical data handling: preview without sensitive info, full extraction only after approval
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

export interface PreviewRequest {
  extraction_type: 'linkedin_profiles' | 'company_data' | 'website_content';
  target_url: string;
  search_criteria?: {
    title?: string[];
    location?: string[];
    company_size?: string;
    industry?: string[];
  };
  preview_limit: number; // Default 10 for preview
  full_limit?: number; // For approved full extraction
}

export interface PreviewResult {
  preview_id: string;
  extraction_type: string;
  total_available: number;
  preview_count: number;
  preview_data: PreviewRecord[];
  cost_estimate: {
    preview_cost: number;
    full_extraction_cost: number;
    currency: string;
  };
  extraction_metadata: {
    estimated_duration: number;
    data_quality_score: number;
    source_reliability: number;
  };
}

export interface PreviewRecord {
  // Abstract data without sensitive information
  id: string;
  name?: string;
  title?: string;
  company?: string;
  location?: string;
  industry?: string;
  experience_level?: 'entry' | 'mid' | 'senior' | 'executive';
  profile_completeness: number;
  relevance_score: number;
  // NO email, LinkedIn URL, phone in preview
}

export interface ApprovalRequest {
  preview_id: string;
  approved_extraction_type: 'selected' | 'all' | 'custom';
  selected_ids?: string[]; // For selected approval
  custom_criteria?: any; // For custom filtering
  max_records?: number; // User-defined limit
}

export interface FullExtractionResult {
  extraction_id: string;
  preview_id: string;
  total_extracted: number;
  successful_extractions: number;
  failed_extractions: number;
  full_data: FullRecord[];
  processing_summary: {
    start_time: string;
    end_time: string;
    duration_seconds: number;
    cost_actual: number;
  };
}

export interface FullRecord extends PreviewRecord {
  // Full data with sensitive information (post-approval)
  email?: string;
  linkedin_url?: string;
  phone?: string;
  social_profiles?: string[];
  contact_verified: boolean;
  last_updated: string;
}

export interface BulkApprovalWorkflow {
  workflow_id: string;
  total_batches: number;
  batch_size: number;
  current_batch: number;
  status: 'pending' | 'processing' | 'paused' | 'completed' | 'cancelled';
  approved_batches: number[];
  rejected_batches: number[];
  estimated_completion: string;
}

export class DataPreviewAgent extends BaseAgent {
  private previewCache: Map<string, PreviewResult> = new Map();
  private approvalWorkflows: Map<string, BulkApprovalWorkflow> = new Map();
  
  constructor(config: AgentConfig) {
    super('data-preview' as AgentType, config);
  }

  async initialize(): Promise<void> {
    try {
      this.capabilities = [
        {
          name: 'generate_data_preview',
          description: 'Generate privacy-safe preview of available data for user approval',
          supportedComplexity: ['simple', 'moderate', 'complex'],
          estimatedDuration: 30,
          requiredParameters: ['extraction_type', 'target_url'],
          optionalParameters: ['search_criteria', 'preview_limit']
        },
        {
          name: 'process_approval_decision',
          description: 'Process user approval and execute full data extraction',
          supportedComplexity: ['moderate', 'complex'],
          estimatedDuration: 120,
          requiredParameters: ['preview_id', 'approved_extraction_type'],
          optionalParameters: ['selected_ids', 'custom_criteria', 'max_records']
        },
        {
          name: 'manage_bulk_approval_workflow',
          description: 'Handle bulk data extraction with batch approval for 1000+ records',
          supportedComplexity: ['complex', 'expert'],
          estimatedDuration: 300,
          requiredParameters: ['preview_id', 'batch_size'],
          optionalParameters: ['auto_approval_criteria', 'quality_threshold']
        },
        {
          name: 'estimate_extraction_costs',
          description: 'Provide accurate cost estimates for data extraction operations',
          supportedComplexity: ['simple', 'moderate'],
          estimatedDuration: 15,
          requiredParameters: ['extraction_type', 'target_count'],
          optionalParameters: ['data_depth', 'processing_requirements']
        }
      ];

      this.isInitialized = true;
      console.log('✅ Data Preview Agent initialized with ethical data handling');
    } catch (error) {
      console.error('❌ Failed to initialize Data Preview Agent:', error);
      throw error;
    }
  }

  async processTask(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    try {
      console.log(`🔍 Data Preview Agent processing: ${task.type}`);
      
      const taskType = task.parameters.task_type as string;
      
      switch (taskType) {
        case 'generate_preview':
          return await this.generateDataPreview(task, context);
        case 'process_approval':
          return await this.processApprovalDecision(task, context);
        case 'manage_bulk_workflow':
          return await this.manageBulkApprovalWorkflow(task, context);
        case 'estimate_costs':
          return await this.estimateExtractionCosts(task, context);
        default:
          throw new Error(`Unknown task type: ${taskType}`);
      }
    } catch (error) {
      console.error('Data Preview Agent error:', error);
      return this.createTaskResponse(
        task.id,
        { type: 'error', data: { error: error.message } },
        false,
        error.message
      );
    }
  }

  /**
   * Generate privacy-safe preview of available data
   */
  private async generateDataPreview(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const request = task.parameters as PreviewRequest;
    const previewId = this.generatePreviewId();
    
    console.log(`🔍 Generating preview for ${request.extraction_type}: ${request.target_url}`);
    
    // Simulate Apify preview run with limited data
    const previewResult = await this.executePreviewExtraction(request, previewId);
    
    // Cache for approval process
    this.previewCache.set(previewId, previewResult);
    
    // Generate user-friendly preview summary
    const previewSummary = this.generatePreviewSummary(previewResult);
    
    return this.createTaskResponse(
      task.id,
      {
        type: 'data_preview_generated',
        data: {
          preview_result: previewResult,
          summary: previewSummary,
          approval_options: this.generateApprovalOptions(previewResult)
        }
      },
      true,
      undefined,
      {
        processingTime: 30,
        confidence: 0.95,
        sources: ['apify_preview']
      }
    );
  }

  /**
   * Execute preview extraction via Apify - shows ALL available records but without sensitive data
   */
  private async executePreviewExtraction(request: PreviewRequest, previewId: string): Promise<PreviewResult> {
    // Execute full list discovery but extract only public data (no emails/contacts)
    const totalAvailable = this.estimateTotalAvailable(request);
    const previewLimit = totalAvailable; // Show ALL records in preview (but limited data per record)
    
    // Mock preview data - ALL available records with public info only
    // In production: Apify extracts all records but only name/title/company (no emails/phones)
    const mockPreviewData: PreviewRecord[] = Array.from({ length: previewLimit }, (_, i) => ({
      id: `preview_${previewId}_${i}`,
      name: `Professional ${i + 1}`,
      title: ['Software Engineer', 'Product Manager', 'Sales Director', 'Marketing Lead'][i % 4],
      company: ['TechCorp', 'InnovateLabs', 'SalesForce', 'MarketingPro'][i % 4],
      location: ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA'][i % 4],
      industry: 'Technology',
      experience_level: ['mid', 'senior', 'executive', 'senior'][i % 4] as any,
      profile_completeness: 0.7 + (Math.random() * 0.3),
      relevance_score: 0.6 + (Math.random() * 0.4)
    }));

    return {
      preview_id: previewId,
      extraction_type: request.extraction_type,
      total_available: this.estimateTotalAvailable(request),
      preview_count: previewLimit, // This is now the FULL count, not a sample
      preview_data: mockPreviewData,
      cost_estimate: {
        preview_cost: 0, // Preview is free/very low cost
        full_extraction_cost: this.calculateFullExtractionCost(request),
        currency: 'USD'
      },
      extraction_metadata: {
        estimated_duration: this.estimateExtractionDuration(request),
        data_quality_score: 0.85,
        source_reliability: 0.92
      }
    };
  }

  /**
   * Process user approval and execute full extraction
   */
  private async processApprovalDecision(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const approval = task.parameters as ApprovalRequest;
    const previewResult = this.previewCache.get(approval.preview_id);
    
    if (!previewResult) {
      throw new Error(`Preview ${approval.preview_id} not found or expired`);
    }

    console.log(`✅ Processing approval for preview ${approval.preview_id}: ${approval.approved_extraction_type}`);

    // Handle different approval types
    let extractionResult: FullExtractionResult;
    
    switch (approval.approved_extraction_type) {
      case 'selected':
        extractionResult = await this.executeSelectedExtraction(previewResult, approval.selected_ids || []);
        break;
      case 'all':
        extractionResult = await this.executeFullExtraction(previewResult, approval.max_records);
        break;
      case 'custom':
        extractionResult = await this.executeCustomExtraction(previewResult, approval.custom_criteria);
        break;
      default:
        throw new Error(`Unknown approval type: ${approval.approved_extraction_type}`);
    }

    // Store in Supabase for user access
    await this.storeExtractionResults(extractionResult, context);

    return this.createTaskResponse(
      task.id,
      {
        type: 'extraction_completed',
        data: {
          extraction_result: extractionResult,
          storage_location: `supabase://extractions/${extractionResult.extraction_id}`,
          export_options: ['csv', 'json', 'excel']
        }
      },
      true,
      undefined,
      {
        processingTime: extractionResult.processing_summary.duration_seconds,
        confidence: 0.98,
        sources: ['apify_full_extraction', 'supabase_storage']
      }
    );
  }

  /**
   * Manage bulk approval workflow for 1000+ records
   */
  private async manageBulkApprovalWorkflow(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const { preview_id, batch_size = 100 } = task.parameters;
    const previewResult = this.previewCache.get(preview_id);
    
    if (!previewResult) {
      throw new Error(`Preview ${preview_id} not found`);
    }

    const totalRecords = previewResult.total_available;
    const totalBatches = Math.ceil(totalRecords / batch_size);
    
    const workflowId = this.generateWorkflowId();
    const bulkWorkflow: BulkApprovalWorkflow = {
      workflow_id: workflowId,
      total_batches: totalBatches,
      batch_size,
      current_batch: 1,
      status: 'pending',
      approved_batches: [],
      rejected_batches: [],
      estimated_completion: this.calculateEstimatedCompletion(totalBatches, batch_size)
    };

    this.approvalWorkflows.set(workflowId, bulkWorkflow);

    console.log(`📋 Created bulk approval workflow: ${totalRecords} records in ${totalBatches} batches`);

    return this.createTaskResponse(
      task.id,
      {
        type: 'bulk_workflow_created',
        data: {
          workflow: bulkWorkflow,
          batch_preview: await this.generateBatchPreview(previewResult, 1, batch_size),
          approval_interface: {
            approve_batch_url: `/api/approve-batch/${workflowId}`,
            reject_batch_url: `/api/reject-batch/${workflowId}`,
            pause_workflow_url: `/api/pause-workflow/${workflowId}`
          }
        }
      },
      true,
      undefined,
      {
        processingTime: 15,
        confidence: 0.95,
        sources: ['workflow_manager']
      }
    );
  }

  /**
   * Generate batch preview for bulk approval
   */
  private async generateBatchPreview(previewResult: PreviewResult, batchNumber: number, batchSize: number): Promise<any> {
    const startIndex = (batchNumber - 1) * batchSize;
    const endIndex = Math.min(startIndex + batchSize, previewResult.total_available);
    
    return {
      batch_number: batchNumber,
      batch_size: endIndex - startIndex,
      estimated_records: endIndex - startIndex,
      cost_estimate: this.calculateBatchCost(endIndex - startIndex),
      sample_data: previewResult.preview_data.slice(0, Math.min(5, endIndex - startIndex)), // Show 5 samples
      quality_metrics: {
        estimated_completeness: 0.8 + (Math.random() * 0.2),
        estimated_accuracy: 0.85 + (Math.random() * 0.15),
        relevance_score: 0.75 + (Math.random() * 0.25)
      }
    };
  }

  // Helper methods
  private generatePreviewId(): string {
    return `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private estimateTotalAvailable(request: PreviewRequest): number {
    // Mock estimation based on request type and URL
    const baseEstimate = {
      'linkedin_profiles': 500,
      'company_data': 200,
      'website_content': 100
    };
    return baseEstimate[request.extraction_type] || 100;
  }

  private calculateFullExtractionCost(request: PreviewRequest): number {
    const costPerRecord = {
      'linkedin_profiles': 0.02,
      'company_data': 0.015,
      'website_content': 0.01
    };
    const totalRecords = this.estimateTotalAvailable(request);
    return totalRecords * (costPerRecord[request.extraction_type] || 0.01);
  }

  private estimateExtractionDuration(request: PreviewRequest): number {
    const totalRecords = this.estimateTotalAvailable(request);
    return Math.ceil(totalRecords / 50) * 60; // ~50 records per minute
  }

  private generatePreviewSummary(result: PreviewResult): string {
    return `Found ${result.total_available} potential records. Preview shows ${result.preview_count} samples with ${(result.extraction_metadata.data_quality_score * 100).toFixed(1)}% estimated quality. Full extraction cost: $${result.cost_estimate.full_extraction_cost.toFixed(2)}`;
  }

  private generateApprovalOptions(result: PreviewResult): any {
    return {
      extract_all: {
        description: `Extract all ${result.total_available} records`,
        cost: result.cost_estimate.full_extraction_cost,
        estimated_duration: result.extraction_metadata.estimated_duration
      },
      extract_selected: {
        description: 'Extract only selected high-quality records',
        cost_per_record: result.cost_estimate.full_extraction_cost / result.total_available,
        selection_interface: true
      },
      bulk_workflow: {
        description: 'Set up batch approval for large datasets (1000+ records)',
        recommended_batch_size: 100,
        total_batches: Math.ceil(result.total_available / 100)
      }
    };
  }

  private calculateBatchCost(batchSize: number): number {
    return batchSize * 0.015; // $0.015 per record
  }

  private calculateEstimatedCompletion(totalBatches: number, batchSize: number): string {
    const estimatedHours = (totalBatches * 0.5); // 30 min per batch approval
    const completionDate = new Date(Date.now() + (estimatedHours * 60 * 60 * 1000));
    return completionDate.toISOString();
  }

  // Mock execution methods (replace with actual Apify calls)
  private async executeSelectedExtraction(previewResult: PreviewResult, selectedIds: string[]): Promise<FullExtractionResult> {
    // Implementation for selected record extraction
    return this.mockFullExtractionResult(previewResult.preview_id, selectedIds.length);
  }

  private async executeFullExtraction(previewResult: PreviewResult, maxRecords?: number): Promise<FullExtractionResult> {
    // Implementation for full extraction
    const recordCount = Math.min(maxRecords || previewResult.total_available, previewResult.total_available);
    return this.mockFullExtractionResult(previewResult.preview_id, recordCount);
  }

  private async executeCustomExtraction(previewResult: PreviewResult, criteria: any): Promise<FullExtractionResult> {
    // Implementation for custom criteria extraction
    return this.mockFullExtractionResult(previewResult.preview_id, Math.floor(previewResult.total_available * 0.7));
  }

  private mockFullExtractionResult(previewId: string, recordCount: number): FullExtractionResult {
    const extractionId = `extraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (recordCount * 1000)); // 1 sec per record
    
    return {
      extraction_id: extractionId,
      preview_id: previewId,
      total_extracted: recordCount,
      successful_extractions: Math.floor(recordCount * 0.95),
      failed_extractions: Math.ceil(recordCount * 0.05),
      full_data: [], // Would contain actual FullRecord[] data
      processing_summary: {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: Math.floor((endTime.getTime() - startTime.getTime()) / 1000),
        cost_actual: recordCount * 0.015
      }
    };
  }

  private async storeExtractionResults(result: FullExtractionResult, context: ConversationContext): Promise<void> {
    // Store in Supabase for user access
    console.log(`💾 Storing extraction results: ${result.extraction_id}`);
    // Implementation would store in Supabase here
  }

  private async estimateExtractionCosts(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const { extraction_type, target_count } = task.parameters;
    
    const costPerRecord = {
      'linkedin_profiles': 0.02,
      'company_data': 0.015,
      'website_content': 0.01
    };
    
    const totalCost = (target_count as number) * (costPerRecord[extraction_type as string] || 0.01);
    
    return this.createTaskResponse(
      task.id,
      {
        type: 'cost_estimate',
        data: {
          extraction_type,
          target_count,
          cost_per_record: costPerRecord[extraction_type as string] || 0.01,
          total_cost: totalCost,
          currency: 'USD',
          breakdown: {
            apify_costs: totalCost * 0.7,
            processing_costs: totalCost * 0.2,
            storage_costs: totalCost * 0.1
          }
        }
      },
      true
    );
  }

  async getCapabilities(): Promise<AgentCapability[]> {
    return this.capabilities;
  }

  async healthCheck(): Promise<boolean> {
    return this.isInitialized;
  }

  async shutdown(): Promise<void> {
    this.previewCache.clear();
    this.approvalWorkflows.clear();
    console.log('🛑 Data Preview Agent shutdown complete');
  }
}