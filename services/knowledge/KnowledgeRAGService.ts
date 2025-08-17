/**
 * Knowledge Base RAG (Retrieval-Augmented Generation) Service
 * Implements Stage 3 of the 8-stage methodology: Knowledge Base Integration
 * 
 * This service handles:
 * - Document processing pipeline (PDFs, websites, competitive intel)
 * - Real-time knowledge application for message crafting
 * - Continuous learning and knowledge base maintenance
 */

import { MemoryService } from '@/services/memory/MemoryService';

export interface DocumentMetadata {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'website' | 'email' | 'presentation' | 'competitive_intel';
  source: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData?: {
    keyPoints: string[];
    entities: string[];
    categories: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
  };
  stage: 'knowledge_integration' | 'competitive_analysis' | 'sales_materials';
  workspaceId: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    pageNumber?: number;
    section?: string;
    relevanceScore?: number;
    keyTerms: string[];
  };
  stage: string;
}

export interface KnowledgeQuery {
  query: string;
  stage?: string;
  maxResults?: number;
  relevanceThreshold?: number;
  includeMetadata?: boolean;
}

export interface KnowledgeSearchResult {
  chunks: KnowledgeChunk[];
  totalResults: number;
  processingTime: number;
  suggestedActions?: string[];
  relatedTopics?: string[];
}

export interface CompetitorIntelligence {
  competitorName: string;
  url: string;
  keyInsights: string[];
  strengths: string[];
  weaknesses: string[];
  pricingInfo?: string;
  targetMarket?: string;
  lastUpdated: Date;
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: 'email' | 'linkedin' | 'call_script' | 'proposal';
  template: string;
  variables: string[];
  stage: string;
  successRate?: number;
  lastUsed?: Date;
}

export class KnowledgeRAGService {
  private static instance: KnowledgeRAGService;
  private memoryService: MemoryService;
  private documents: Map<string, DocumentMetadata> = new Map();
  private knowledgeChunks: Map<string, KnowledgeChunk[]> = new Map();
  private competitorData: Map<string, CompetitorIntelligence> = new Map();
  private templates: Map<string, ContentTemplate> = new Map();

  constructor() {
    this.memoryService = MemoryService.getInstance();
    this.initializeKnowledgeBase();
  }

  public static getInstance(): KnowledgeRAGService {
    if (!KnowledgeRAGService.instance) {
      KnowledgeRAGService.instance = new KnowledgeRAGService();
    }
    return KnowledgeRAGService.instance;
  }

  /**
   * Initialize knowledge base with default templates and data
   */
  private async initializeKnowledgeBase(): Promise<void> {
    try {
      // Initialize with default sales templates
      this.addDefaultTemplates();
      console.log('✅ Knowledge base initialized');
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }

  /**
   * Process uploaded document and extract knowledge
   */
  async processDocument(
    file: File, 
    workspaceId: string, 
    documentType?: string
  ): Promise<DocumentMetadata> {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const metadata: DocumentMetadata = {
      id: documentId,
      title: file.name,
      type: this.detectDocumentType(file),
      source: file.name,
      uploadedAt: new Date(),
      status: 'processing',
      stage: 'knowledge_integration',
      workspaceId
    };

    this.documents.set(documentId, metadata);

    try {
      // Simulate document processing
      await this.simulateDocumentProcessing(file, metadata);
      
      // Extract knowledge chunks
      const chunks = await this.extractKnowledgeChunks(file, documentId);
      this.knowledgeChunks.set(documentId, chunks);

      // Update status
      metadata.status = 'completed';
      metadata.processedAt = new Date();
      
      console.log(`📄 Document processed: ${file.name}`);
      return metadata;
    } catch (error) {
      console.error('Document processing failed:', error);
      metadata.status = 'failed';
      throw error;
    }
  }

  /**
   * Search knowledge base for relevant information
   */
  async searchKnowledge(query: KnowledgeQuery): Promise<KnowledgeSearchResult> {
    const startTime = Date.now();
    const queryLower = query.query.toLowerCase();
    const results: KnowledgeChunk[] = [];

    // Simple text-based search (in production, would use vector embeddings)
    for (const [documentId, chunks] of this.knowledgeChunks) {
      for (const chunk of chunks) {
        const relevanceScore = this.calculateRelevanceScore(queryLower, chunk);
        
        if (relevanceScore >= (query.relevanceThreshold || 0.3)) {
          chunk.metadata.relevanceScore = relevanceScore;
          results.push(chunk);
        }
      }
    }

    // Sort by relevance
    results.sort((a, b) => (b.metadata.relevanceScore || 0) - (a.metadata.relevanceScore || 0));

    // Limit results
    const limitedResults = results.slice(0, query.maxResults || 10);

    const processingTime = Date.now() - startTime;

    return {
      chunks: limitedResults,
      totalResults: results.length,
      processingTime,
      suggestedActions: this.generateSuggestedActions(queryLower, limitedResults),
      relatedTopics: this.extractRelatedTopics(limitedResults)
    };
  }

  /**
   * Generate personalized content using knowledge base
   */
  async generatePersonalizedContent(
    template: ContentTemplate,
    prospectData: any,
    contextQuery: string
  ): Promise<{
    content: string;
    personalizations: string[];
    knowledgeUsed: string[];
    confidence: number;
  }> {
    // Search for relevant knowledge
    const knowledgeResults = await this.searchKnowledge({
      query: contextQuery,
      maxResults: 5,
      relevanceThreshold: 0.4
    });

    // Apply personalization
    let content = template.template;
    const personalizations: string[] = [];
    const knowledgeUsed: string[] = [];

    // Replace template variables with prospect data
    for (const variable of template.variables) {
      if (prospectData[variable]) {
        content = content.replace(`{${variable}}`, prospectData[variable]);
        personalizations.push(`${variable}: ${prospectData[variable]}`);
      }
    }

    // Integrate relevant knowledge
    if (knowledgeResults.chunks.length > 0) {
      const relevantInsights = knowledgeResults.chunks
        .slice(0, 3)
        .map(chunk => chunk.content.slice(0, 200))
        .join(' ');
      
      knowledgeUsed.push(...knowledgeResults.chunks.map(c => c.documentId));
      
      // Add insights to content (simplified approach)
      content += `\n\nBased on our research and understanding of your industry: ${relevantInsights}...`;
    }

    const confidence = this.calculateContentConfidence(personalizations, knowledgeUsed);

    return {
      content,
      personalizations,
      knowledgeUsed,
      confidence
    };
  }

  /**
   * Process competitor website for intelligence
   */
  async processCompetitorWebsite(url: string, competitorName: string): Promise<CompetitorIntelligence> {
    try {
      // Simulate web scraping (in production, would use actual web scraping)
      const intelligence: CompetitorIntelligence = {
        competitorName,
        url,
        keyInsights: [
          'Focus on enterprise customers',
          'Strong presence in North American market',
          'Emphasis on security and compliance'
        ],
        strengths: [
          'Established brand recognition',
          'Comprehensive feature set',
          'Strong customer support'
        ],
        weaknesses: [
          'Higher pricing than competitors',
          'Complex onboarding process',
          'Limited API integrations'
        ],
        pricingInfo: 'Starting at $99/month for basic plan',
        targetMarket: 'Mid-market and enterprise companies',
        lastUpdated: new Date()
      };

      this.competitorData.set(competitorName, intelligence);
      console.log(`🔍 Competitor intelligence processed: ${competitorName}`);
      
      return intelligence;
    } catch (error) {
      console.error('Failed to process competitor website:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a workspace
   */
  getDocuments(workspaceId: string): DocumentMetadata[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.workspaceId === workspaceId);
  }

  /**
   * Get competitor intelligence
   */
  getCompetitorIntelligence(): CompetitorIntelligence[] {
    return Array.from(this.competitorData.values());
  }

  /**
   * Get available content templates
   */
  getContentTemplates(type?: string): ContentTemplate[] {
    const templates = Array.from(this.templates.values());
    return type ? templates.filter(t => t.type === type) : templates;
  }

  /**
   * Add custom content template
   */
  addContentTemplate(template: Omit<ContentTemplate, 'id'>): ContentTemplate {
    const id = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTemplate: ContentTemplate = { ...template, id };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  /**
   * Update knowledge base with conversation insights
   */
  async updateWithConversationInsights(
    conversation: any[],
    insights: string[],
    workspaceId: string
  ): Promise<void> {
    // Create a knowledge chunk from conversation insights
    const chunkId = `insight_${Date.now()}`;
    const chunk: KnowledgeChunk = {
      id: chunkId,
      documentId: 'conversation_insights',
      content: insights.join(' '),
      metadata: {
        keyTerms: this.extractKeyTerms(insights.join(' ')),
        relevanceScore: 1.0
      },
      stage: 'conversation_management'
    };

    // Add to knowledge base
    const existingChunks = this.knowledgeChunks.get('conversation_insights') || [];
    existingChunks.push(chunk);
    this.knowledgeChunks.set('conversation_insights', existingChunks);

    console.log('💡 Conversation insights added to knowledge base');
  }

  // Private helper methods

  private detectDocumentType(file: File): DocumentMetadata['type'] {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'docx';
      case 'ppt':
      case 'pptx':
        return 'presentation';
      default:
        return 'pdf'; // Default fallback
    }
  }

  private async simulateDocumentProcessing(
    file: File, 
    metadata: DocumentMetadata
  ): Promise<void> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract mock data based on file type
    metadata.extractedData = {
      keyPoints: [
        'Value proposition and unique selling points',
        'Target customer characteristics',
        'Competitive advantages',
        'Success metrics and case studies'
      ],
      entities: ['Company Name', 'Product Features', 'Customer Benefits'],
      categories: ['Sales Materials', 'Product Information', 'Market Analysis'],
      sentiment: 'positive'
    };
  }

  private async extractKnowledgeChunks(
    file: File, 
    documentId: string
  ): Promise<KnowledgeChunk[]> {
    // Simulate chunk extraction (in production, would use actual text extraction)
    const chunks: KnowledgeChunk[] = [];
    
    const sampleChunks = [
      'Our company provides innovative solutions for sales automation and lead generation.',
      'Key benefits include 50% increase in qualified leads and 30% reduction in sales cycle time.',
      'Target customers are mid-market B2B companies with 50-500 employees in technology sector.',
      'Competitive advantages include AI-powered personalization and multi-channel automation.'
    ];

    sampleChunks.forEach((content, index) => {
      chunks.push({
        id: `${documentId}_chunk_${index}`,
        documentId,
        content,
        metadata: {
          pageNumber: index + 1,
          section: `Section ${index + 1}`,
          keyTerms: this.extractKeyTerms(content)
        },
        stage: 'knowledge_integration'
      });
    });

    return chunks;
  }

  private calculateRelevanceScore(query: string, chunk: KnowledgeChunk): number {
    const queryTerms = query.toLowerCase().split(' ');
    const chunkContent = chunk.content.toLowerCase();
    
    let matches = 0;
    for (const term of queryTerms) {
      if (chunkContent.includes(term)) {
        matches++;
      }
    }
    
    return matches / queryTerms.length;
  }

  private generateSuggestedActions(query: string, results: KnowledgeChunk[]): string[] {
    const actions: string[] = [];
    
    if (query.includes('email') || query.includes('message')) {
      actions.push('Generate personalized email template');
      actions.push('Create follow-up sequence');
    }
    
    if (query.includes('competitor') || query.includes('competition')) {
      actions.push('Update competitive analysis');
      actions.push('Create comparison sheet');
    }
    
    if (query.includes('proposal') || query.includes('pitch')) {
      actions.push('Generate custom proposal');
      actions.push('Create presentation outline');
    }
    
    return actions;
  }

  private extractRelatedTopics(results: KnowledgeChunk[]): string[] {
    const topics = new Set<string>();
    
    results.forEach(chunk => {
      chunk.metadata.keyTerms.forEach(term => topics.add(term));
    });
    
    return Array.from(topics).slice(0, 5);
  }

  private extractKeyTerms(content: string): string[] {
    // Simple keyword extraction (in production, would use NLP)
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 3);
    
    // Remove common words and return unique terms
    const stopWords = ['that', 'with', 'have', 'this', 'will', 'your', 'they', 'been', 'their'];
    return [...new Set(words.filter(word => !stopWords.includes(word)))].slice(0, 10);
  }

  private calculateContentConfidence(
    personalizations: string[], 
    knowledgeUsed: string[]
  ): number {
    const personalizationScore = Math.min(personalizations.length * 0.2, 0.6);
    const knowledgeScore = Math.min(knowledgeUsed.length * 0.1, 0.4);
    return Math.min(personalizationScore + knowledgeScore, 1.0);
  }

  private addDefaultTemplates(): void {
    const defaultTemplates: Omit<ContentTemplate, 'id'>[] = [
      {
        name: 'Cold Email - Value Proposition',
        type: 'email',
        template: `Hi {firstName},

I noticed {company} is {companyContext}. Many companies in your industry struggle with {painPoint}.

At {ourCompany}, we help {targetMarket} achieve {benefit} through {solution}.

Would you be open to a brief 15-minute call to discuss how we might help {company} {specificOutcome}?

Best regards,
{senderName}`,
        variables: ['firstName', 'company', 'companyContext', 'painPoint', 'ourCompany', 'targetMarket', 'benefit', 'solution', 'specificOutcome', 'senderName'],
        stage: 'content_generation',
        successRate: 0.12
      },
      {
        name: 'LinkedIn Connection Request',
        type: 'linkedin',
        template: `Hi {firstName}, I noticed we're both working in {industry}. I'd love to connect and share insights about {sharedInterest}. Looking forward to connecting!`,
        variables: ['firstName', 'industry', 'sharedInterest'],
        stage: 'outreach_execution',
        successRate: 0.35
      },
      {
        name: 'Follow-up After No Response',
        type: 'email',
        template: `Hi {firstName},

I wanted to follow up on my previous message about {previousTopic}.

I understand you're busy, so I'll keep this brief. I recently came across {recentNews} and thought it might be relevant to {company}'s {relevantChallenge}.

If this resonates, I'd be happy to share how {ourSolution} has helped similar companies achieve {specificResult}.

Worth a quick conversation?

Best,
{senderName}`,
        variables: ['firstName', 'previousTopic', 'recentNews', 'company', 'relevantChallenge', 'ourSolution', 'specificResult', 'senderName'],
        stage: 'relationship_nurturing',
        successRate: 0.08
      }
    ];

    defaultTemplates.forEach(template => {
      const id = `default_${template.name.toLowerCase().replace(/\s+/g, '_')}`;
      this.templates.set(id, { ...template, id });
    });
  }
}

export default KnowledgeRAGService;