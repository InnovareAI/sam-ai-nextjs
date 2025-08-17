/**
 * Apify Bulk Processing Service
 * Handles intelligent bulk approval and automated data extraction
 */

export interface ApprovalRule {
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

export interface BulkProcessingResult {
  total_records: number;
  auto_approved: number;
  manual_review_required: number;
  auto_rejected: number;
  cost_savings: number;
  processing_time: number;
  approval_decisions: ApprovalDecision[];
}

export interface ApprovalDecision {
  record_id: string;
  decision: 'auto_approved' | 'manual_review' | 'auto_rejected';
  rule_applied?: string;
  confidence_score: number;
  cost_per_record: number;
  reasoning: string;
}

export class ApifyBulkProcessor {
  private approvalRules: ApprovalRule[] = [];
  private costPerRecord: number = 0;

  constructor(approvalRules: ApprovalRule[], totalCost: number, totalRecords: number) {
    this.approvalRules = approvalRules;
    this.costPerRecord = totalCost / totalRecords;
  }

  /**
   * Process a dataset with intelligent bulk approval
   */
  async processBulkApproval(previewData: any[]): Promise<BulkProcessingResult> {
    const startTime = Date.now();
    const decisions: ApprovalDecision[] = [];
    let autoApproved = 0;
    let manualReview = 0;
    let autoRejected = 0;
    let totalCostSavings = 0;

    for (const record of previewData) {
      const decision = this.evaluateRecord(record);
      decisions.push(decision);

      switch (decision.decision) {
        case 'auto_approved':
          autoApproved++;
          break;
        case 'manual_review':
          manualReview++;
          break;
        case 'auto_rejected':
          autoRejected++;
          totalCostSavings += decision.cost_per_record;
          break;
      }
    }

    return {
      total_records: previewData.length,
      auto_approved: autoApproved,
      manual_review_required: manualReview,
      auto_rejected: autoRejected,
      cost_savings: totalCostSavings,
      processing_time: Date.now() - startTime,
      approval_decisions: decisions
    };
  }

  /**
   * Evaluate a single record against approval rules
   */
  private evaluateRecord(record: any): ApprovalDecision {
    const relevanceScore = record.relevance_score || 0;
    const profileCompleteness = record.profile_completeness || 0;
    const recordCost = this.costPerRecord;

    // Check each rule in priority order
    for (const rule of this.approvalRules.filter(r => r.enabled)) {
      const evaluation = this.applyRule(rule, record, relevanceScore, profileCompleteness);
      if (evaluation.matches) {
        return {
          record_id: record.id,
          decision: evaluation.decision,
          rule_applied: rule.id,
          confidence_score: evaluation.confidence,
          cost_per_record: recordCost,
          reasoning: evaluation.reasoning
        };
      }
    }

    // Default fallback logic
    if (relevanceScore >= 0.8 && profileCompleteness >= 0.7) {
      return {
        record_id: record.id,
        decision: 'auto_approved',
        confidence_score: relevanceScore,
        cost_per_record: recordCost,
        reasoning: 'High relevance and profile completeness (fallback rule)'
      };
    } else if (relevanceScore >= 0.5) {
      return {
        record_id: record.id,
        decision: 'manual_review',
        confidence_score: relevanceScore,
        cost_per_record: recordCost,
        reasoning: 'Medium relevance - manual review recommended'
      };
    } else {
      return {
        record_id: record.id,
        decision: 'auto_rejected',
        confidence_score: relevanceScore,
        cost_per_record: recordCost,
        reasoning: 'Low relevance score - auto-rejected to save costs'
      };
    }
  }

  /**
   * Apply a specific rule to a record
   */
  private applyRule(rule: ApprovalRule, record: any, relevanceScore: number, profileCompleteness: number): {
    matches: boolean;
    decision: 'auto_approved' | 'manual_review' | 'auto_rejected';
    confidence: number;
    reasoning: string;
  } {
    const criteria = rule.criteria;
    let matches = true;
    let reasoning = `Applied rule: ${rule.name}`;

    // Check minimum relevance score
    if (criteria.min_relevance_score && relevanceScore < criteria.min_relevance_score) {
      matches = false;
    }

    // Check maximum cost per record
    if (criteria.max_cost_per_record && this.costPerRecord > criteria.max_cost_per_record) {
      return {
        matches: true,
        decision: 'auto_rejected',
        confidence: 0.9,
        reasoning: `Cost ${this.costPerRecord.toFixed(2)} exceeds threshold ${criteria.max_cost_per_record}`
      };
    }

    // Check required fields
    if (criteria.required_fields) {
      for (const field of criteria.required_fields) {
        if (!record[field] || record[field] === '' || record[field] === 'N/A') {
          matches = false;
          reasoning += ` - Missing required field: ${field}`;
          break;
        }
      }
    }

    // Check role seniority
    if (criteria.role_seniority && record.title) {
      const title = record.title.toLowerCase();
      const hasSeniorRole = criteria.role_seniority.some(role => {
        const rolePattern = role.toLowerCase();
        return title.includes(rolePattern) || 
               title.includes('ceo') || title.includes('cto') || title.includes('cfo') ||
               title.includes('president') || title.includes('vp') || title.includes('vice president') ||
               title.includes('director') || title.includes('manager');
      });
      
      if (!hasSeniorRole) {
        matches = false;
        reasoning += ' - Role not in target seniority levels';
      }
    }

    if (!matches) {
      return {
        matches: false,
        decision: 'manual_review',
        confidence: relevanceScore,
        reasoning: 'Rule criteria not met'
      };
    }

    // Rule matches - determine decision
    let decision: 'auto_approved' | 'manual_review' | 'auto_rejected' = 'auto_approved';
    
    if (rule.id === 'high_quality' && relevanceScore >= 0.9) {
      decision = 'auto_approved';
      reasoning += ' - High quality profile auto-approved';
    } else if (rule.id === 'target_roles' && relevanceScore >= 0.7) {
      decision = 'auto_approved';
      reasoning += ' - Target decision maker auto-approved';
    } else if (rule.id === 'cost_efficient' && relevanceScore >= 0.7) {
      decision = 'auto_approved';
      reasoning += ' - Cost-efficient high-relevance record';
    }

    return {
      matches: true,
      decision,
      confidence: Math.min(relevanceScore + 0.1, 1.0), // Boost confidence for rule matches
      reasoning
    };
  }

  /**
   * Generate approval summary for user review
   */
  generateApprovalSummary(result: BulkProcessingResult): string {
    const approvalRate = (result.auto_approved / result.total_records * 100).toFixed(1);
    const rejectionRate = (result.auto_rejected / result.total_records * 100).toFixed(1);
    const manualRate = (result.manual_review_required / result.total_records * 100).toFixed(1);

    return `
🤖 Intelligent Bulk Approval Complete

📊 Results Summary:
• Total Records: ${result.total_records.toLocaleString()}
• Auto-Approved: ${result.auto_approved.toLocaleString()} (${approvalRate}%)
• Manual Review: ${result.manual_review_required.toLocaleString()} (${manualRate}%)
• Auto-Rejected: ${result.auto_rejected.toLocaleString()} (${rejectionRate}%)

💰 Cost Impact:
• Cost Savings: $${result.cost_savings.toFixed(2)}
• Processing Time: ${result.processing_time}ms

🎯 Next Steps:
${result.auto_approved > 0 ? '• Start extraction for auto-approved records' : ''}
${result.manual_review_required > 0 ? `• Review ${result.manual_review_required} records manually` : ''}
${result.auto_rejected > 0 ? '• Review rejection rules if needed' : ''}
    `.trim();
  }

  /**
   * Export approval decisions for audit/review
   */
  exportApprovalDecisions(result: BulkProcessingResult): string {
    const csvHeaders = 'Record ID,Decision,Rule Applied,Confidence Score,Cost,Reasoning\n';
    const csvRows = result.approval_decisions.map(decision => 
      `${decision.record_id},${decision.decision},${decision.rule_applied || 'default'},${decision.confidence_score.toFixed(3)},${decision.cost_per_record.toFixed(2)},"${decision.reasoning}"`
    ).join('\n');
    
    return csvHeaders + csvRows;
  }
}

/**
 * Default approval rules for common use cases
 */
export const DEFAULT_APPROVAL_RULES: ApprovalRule[] = [
  {
    id: 'premium_quality',
    name: 'Premium Quality Profiles',
    description: 'Auto-approve profiles with 95%+ relevance and complete information',
    enabled: true,
    criteria: {
      min_relevance_score: 0.95,
      required_fields: ['name', 'title', 'company', 'location', 'experience_level']
    }
  },
  {
    id: 'executive_targets', 
    name: 'Executive Decision Makers',
    description: 'Auto-approve C-level executives and VPs with 80%+ relevance',
    enabled: true,
    criteria: {
      min_relevance_score: 0.8,
      role_seniority: ['C-Level', 'VP', 'Vice President', 'Executive'],
      required_fields: ['name', 'title', 'company']
    }
  },
  {
    id: 'cost_optimization',
    name: 'Cost-Optimized Selection',
    description: 'Reject expensive records with low relevance to optimize budget',
    enabled: true,
    criteria: {
      max_cost_per_record: 4.0,
      min_relevance_score: 0.6
    }
  },
  {
    id: 'quality_baseline',
    name: 'Quality Baseline Filter',
    description: 'Auto-reject profiles below 50% relevance to maintain data quality',
    enabled: true,
    criteria: {
      min_relevance_score: 0.5
    }
  }
];

/**
 * Smart approval presets for different use cases
 */
export const APPROVAL_PRESETS = {
  aggressive: {
    name: 'Aggressive Approval',
    description: 'Approve most records, optimize for volume',
    rules: DEFAULT_APPROVAL_RULES.map(rule => ({ 
      ...rule, 
      criteria: { 
        ...rule.criteria, 
        min_relevance_score: (rule.criteria.min_relevance_score || 0.5) * 0.8 
      }
    }))
  },
  conservative: {
    name: 'Conservative Approval', 
    description: 'High-quality only, optimize for precision',
    rules: DEFAULT_APPROVAL_RULES.map(rule => ({ 
      ...rule, 
      criteria: { 
        ...rule.criteria, 
        min_relevance_score: Math.min((rule.criteria.min_relevance_score || 0.5) * 1.2, 0.95)
      }
    }))
  },
  cost_optimized: {
    name: 'Cost-Optimized',
    description: 'Balance quality and cost, reject expensive low-quality records', 
    rules: DEFAULT_APPROVAL_RULES.filter(rule => 
      rule.id !== 'premium_quality' // Remove premium rule to save costs
    )
  }
};