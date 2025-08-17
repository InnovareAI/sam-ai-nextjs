/**
 * Memory Service for SAM AI - Full RAG Pipeline
 * Manages persistent context storage and retrieval with vector embeddings
 */

import { supabase } from '@/integrations/supabase/client';
import { LLMService } from '../llm/LLMService';

export interface MemoryItem {
  id: string;
  workspace_id: string;
  type: 'product' | 'audience' | 'company' | 'campaign' | 'conversation' | 'preference';
  category: 'business' | 'technical' | 'strategy' | 'performance';
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
  tags: string[];
  source: 'user_input' | 'document_upload' | 'conversation' | 'analysis';
  confidence: number; // 0-1 score of how confident SAM is about this info
  embedding?: number[]; // Vector embedding for semantic search
  chunk_index?: number; // For document chunks
  parent_document_id?: string; // Reference to original document
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  lastAccessed: Date;
  expiresAt?: Date; // Optional expiration for temporary context
}

export interface DocumentChunk {
  id: string;
  workspace_id: string;
  document_id: string;
  content: string;
  contextual_content: string; // Enhanced content with context for better retrieval
  chunk_index: number;
  tokens: number;
  embedding: number[];
  contextual_embedding: number[]; // Embedding of contextual content
  metadata: Record<string, unknown>;
  chunk_context: string; // The contextual description for this chunk
  created_at: string;
}

export interface SemanticSearchResult {
  chunk: DocumentChunk;
  similarity: number;
  context: string;
}

export class MemoryService {
  private static instance: MemoryService;
  private llmService: LLMService;
  private currentWorkspaceId: string;

  private constructor() {
    this.llmService = LLMService.getInstance();
    // Get workspace ID from localStorage (demo mode)
    this.currentWorkspaceId = localStorage.getItem('demo_workspace_id') || 'df5d730f-1915-4269-bd5a-9534478b17af';
  }

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  /**
   * Generate embeddings for text content
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use OpenAI embeddings API
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          input: text,
          model: 'text-embedding-3-small' // Cost-effective embedding model
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding API failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      // Fallback: return zero vector
      return new Array(1536).fill(0);
    }
  }

  /**
   * Chunk large content into smaller pieces for better retrieval
   */
  private chunkContent(content: string, maxChunkSize: number = 1000): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence.trim();
      } else {
        currentChunk += (currentChunk.length > 0 ? '. ' : '') + sentence.trim();
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks.length > 0 ? chunks : [content];
  }

  /**
   * Generate contextual description for a chunk using Anthropic's approach
   */
  private async generateChunkContext(
    chunk: string, 
    documentTitle: string, 
    documentMetadata: Record<string, unknown>,
    chunkIndex: number
  ): Promise<string> {
    try {
      const contextPrompt = `Generate a brief contextual description (50-100 tokens) for this content chunk that will help with retrieval.

Document: "${documentTitle}"
Document Type: ${documentMetadata.type || 'unknown'}
Document Context: ${JSON.stringify(documentMetadata)}
Chunk ${chunkIndex + 1}:

"${chunk}"

Generate context that explains:
1. What this chunk is about
2. How it relates to the overall document
3. What business/sales context it provides
4. Key topics and entities mentioned

Context:`;

      const contextResponse = await this.llmService.generateResponse(
        'Generate contextual description for better retrieval',
        [{ role: 'user', content: contextPrompt }],
        { maxTokens: 150, temperature: 0.3 }
      );

      return contextResponse.trim();
    } catch (error) {
      console.error('Failed to generate chunk context:', error);
      // Fallback: create basic context from metadata
      return `This is content from ${documentTitle} (${documentMetadata.type}) containing information about ${Object.keys(documentMetadata).join(', ')}.`;
    }
  }

  /**
   * Create contextual content by combining chunk with its context
   */
  private createContextualContent(chunk: string, context: string): string {
    return `Context: ${context}\n\nContent: ${chunk}`;
  }

  /**
   * Store a document with chunking and embeddings
   */
  public async storeDocument(
    title: string,
    content: string,
    metadata: Record<string, unknown> = {},
    source: 'user_input' | 'document_upload' | 'conversation' | 'analysis' = 'document_upload'
  ): Promise<string> {
    try {
      // Create document record
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error: docError } = await supabase
        .from('knowledge_documents')
        .insert({
          id: documentId,
          workspace_id: this.currentWorkspaceId,
          title,
          content,
          metadata,
          source,
          status: 'processing',
          created_at: new Date().toISOString()
        });

      if (docError) {
        console.error('Error storing document:', docError);
        throw new Error(`Failed to store document: ${docError.message}`);
      }

      // Chunk the content
      const chunks = this.chunkContent(content);
      console.log(`Generated ${chunks.length} chunks for document: ${title}`);

      // Process chunks with contextual embeddings
      const chunkPromises = chunks.map(async (chunkContent, index) => {
        // Generate contextual description for this chunk
        const chunkContext = await this.generateChunkContext(
          chunkContent, 
          title, 
          metadata, 
          index
        );

        // Create contextual content combining chunk with context
        const contextualContent = this.createContextualContent(chunkContent, chunkContext);

        // Generate embeddings for both original and contextual content
        const [originalEmbedding, contextualEmbedding] = await Promise.all([
          this.generateEmbedding(chunkContent),
          this.generateEmbedding(contextualContent)
        ]);
        
        return {
          id: `${documentId}_chunk_${index}`,
          workspace_id: this.currentWorkspaceId,
          document_id: documentId,
          content: chunkContent,
          contextual_content: contextualContent,
          chunk_context: chunkContext,
          chunk_index: index,
          tokens: chunkContent.split(' ').length,
          embedding: originalEmbedding,
          contextual_embedding: contextualEmbedding,
          metadata: { 
            ...metadata, 
            chunk_type: 'text',
            has_context: true,
            context_length: chunkContext.length
          },
          created_at: new Date().toISOString()
        };
      });

      const processedChunks = await Promise.all(chunkPromises);

      // Store chunks in database
      const { error: chunksError } = await supabase
        .from('knowledge_chunks')
        .insert(processedChunks);

      if (chunksError) {
        console.error('Error storing chunks:', chunksError);
        throw new Error(`Failed to store chunks: ${chunksError.message}`);
      }

      // Update document status
      await supabase
        .from('knowledge_documents')
        .update({ 
          status: 'completed',
          chunk_count: chunks.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      console.log(`✅ Successfully stored document with ${chunks.length} chunks and embeddings`);
      return documentId;

    } catch (error) {
      console.error('Document storage failed:', error);
      throw error;
    }
  }

  /**
   * Store a new memory item (legacy interface for compatibility)
   */
  public async storeMemory(item: Omit<MemoryItem, 'id' | 'createdAt' | 'updatedAt' | 'accessCount' | 'lastAccessed' | 'workspace_id'>): Promise<MemoryItem> {
    // For simple memory items, store as a single document
    const documentId = await this.storeDocument(
      item.title,
      item.content,
      { 
        type: item.type,
        category: item.category,
        tags: item.tags,
        confidence: item.confidence,
        ...item.metadata 
      },
      item.source
    );

    const memory: MemoryItem = {
      ...item,
      id: documentId,
      workspace_id: this.currentWorkspaceId,
      createdAt: new Date(),
      updatedAt: new Date(),
      accessCount: 0,
      lastAccessed: new Date()
    };

    return memory;
  }

  /**
   * Semantic search across knowledge base using contextual retrieval
   */
  public async semanticSearch(
    query: string, 
    limit: number = 5,
    minSimilarity: number = 0.7,
    useContextual: boolean = true
  ): Promise<SemanticSearchResult[]> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Choose embedding field based on useContextual flag
      const embeddingField = useContextual ? 'contextual_embedding' : 'embedding';
      
      // Use Supabase's vector similarity search with contextual embeddings
      const { data: chunks, error } = await supabase.rpc('match_knowledge_chunks_contextual', {
        query_embedding: queryEmbedding,
        match_threshold: minSimilarity,
        match_count: limit,
        filter_workspace_id: this.currentWorkspaceId,
        use_contextual: useContextual
      });

      if (error) {
        console.error('Contextual semantic search error:', error);
        // Fallback to basic search if contextual search fails
        return this.basicSemanticSearch(query, limit, minSimilarity);
      }

      return chunks.map((chunk: any) => ({
        chunk: {
          id: chunk.id,
          workspace_id: chunk.workspace_id,
          document_id: chunk.document_id,
          content: chunk.content,
          contextual_content: chunk.contextual_content,
          chunk_context: chunk.chunk_context,
          chunk_index: chunk.chunk_index,
          tokens: chunk.tokens,
          embedding: chunk.embedding,
          contextual_embedding: chunk.contextual_embedding,
          metadata: chunk.metadata,
          created_at: chunk.created_at
        },
        similarity: chunk.similarity,
        context: this.buildEnhancedContext(chunk.content, chunk.chunk_context, query)
      }));

    } catch (error) {
      console.error('Contextual semantic search failed:', error);
      return this.basicSemanticSearch(query, limit, minSimilarity);
    }
  }

  /**
   * Fallback basic semantic search
   */
  private async basicSemanticSearch(
    query: string, 
    limit: number,
    minSimilarity: number
  ): Promise<SemanticSearchResult[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const { data: chunks, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: minSimilarity,
        match_count: limit,
        filter_workspace_id: this.currentWorkspaceId
      });

      if (error) {
        console.error('Basic semantic search error:', error);
        return [];
      }

      return chunks.map((chunk: any) => ({
        chunk: {
          id: chunk.id,
          workspace_id: chunk.workspace_id,
          document_id: chunk.document_id,
          content: chunk.content,
          contextual_content: chunk.contextual_content || chunk.content,
          chunk_context: chunk.chunk_context || '',
          chunk_index: chunk.chunk_index,
          tokens: chunk.tokens,
          embedding: chunk.embedding,
          contextual_embedding: chunk.contextual_embedding || chunk.embedding,
          metadata: chunk.metadata,
          created_at: chunk.created_at
        },
        similarity: chunk.similarity,
        context: this.buildContext(chunk.content, query)
      }));
    } catch (error) {
      console.error('Basic semantic search failed:', error);
      return [];
    }
  }

  /**
   * Build enhanced contextual information using chunk context
   */
  private buildEnhancedContext(chunkContent: string, chunkContext: string, query: string): string {
    // Build rich context using both content and chunk context
    const queryWords = query.toLowerCase().split(' ');
    let enhancedContent = chunkContent;
    
    // Highlight query terms in content
    queryWords.forEach(word => {
      if (word.length > 3) {
        const regex = new RegExp(`(${word})`, 'gi');
        enhancedContent = enhancedContent.replace(regex, '**$1**');
      }
    });

    // Include chunk context for better understanding
    return `Context: ${chunkContext}\n\nContent: ${enhancedContent}`;
  }

  /**
   * Build contextual information around a chunk (legacy method)
   */
  private buildContext(chunkContent: string, query: string): string {
    // Simple context building - highlight relevant parts
    const queryWords = query.toLowerCase().split(' ');
    let context = chunkContent;
    
    queryWords.forEach(word => {
      if (word.length > 3) {
        const regex = new RegExp(`(${word})`, 'gi');
        context = context.replace(regex, '**$1**');
      }
    });

    return context;
  }

  /**
   * Get relevant context for a user query
   */
  public async getRelevantContext(
    query: string,
    maxTokens: number = 2000
  ): Promise<{ context: string; sources: string[] }> {
    const results = await this.semanticSearch(query, 10, 0.6);
    
    if (results.length === 0) {
      return { context: 'No relevant context found.', sources: [] };
    }

    let context = '';
    let currentTokens = 0;
    const sources: string[] = [];

    for (const result of results) {
      const chunkTokens = result.chunk.tokens;
      
      if (currentTokens + chunkTokens > maxTokens) {
        break;
      }

      context += `\n\n--- Source: ${result.chunk.document_id} (Similarity: ${(result.similarity * 100).toFixed(1)}%) ---\n`;
      context += result.context;
      
      currentTokens += chunkTokens;
      sources.push(result.chunk.document_id);
    }

    return { context: context.trim(), sources: [...new Set(sources)] };
  }

  /**
   * Get memory items by type and category (for compatibility)
   */
  public async getMemoriesByType(
    type: MemoryItem['type'],
    category?: MemoryItem['category']
  ): Promise<MemoryItem[]> {
    try {
      let query = supabase
        .from('knowledge_documents')
        .select('*')
        .eq('workspace_id', this.currentWorkspaceId)
        .contains('metadata', { type });

      if (category) {
        query = query.contains('metadata', { category });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching memories:', error);
        return [];
      }

      return data.map(doc => ({
        id: doc.id,
        workspace_id: doc.workspace_id,
        type: doc.metadata.type,
        category: doc.metadata.category,
        title: doc.title,
        content: doc.content,
        metadata: doc.metadata,
        tags: doc.metadata.tags || [],
        source: doc.source,
        confidence: doc.metadata.confidence || 0.8,
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at || doc.created_at),
        accessCount: 0,
        lastAccessed: new Date()
      }));

    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }

  /**
   * Get all documents for the workspace
   */
  public async getAllDocuments(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('*')
        .eq('workspace_id', this.currentWorkspaceId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error retrieving documents:', error);
      return [];
    }
  }

  /**
   * Delete a document and its chunks
   */
  public async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Delete chunks first
      const { error: chunksError } = await supabase
        .from('knowledge_chunks')
        .delete()
        .eq('document_id', documentId);

      if (chunksError) {
        console.error('Error deleting chunks:', chunksError);
        return false;
      }

      // Delete document
      const { error: docError } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('id', documentId);

      if (docError) {
        console.error('Error deleting document:', docError);
        return false;
      }

      console.log(`✅ Successfully deleted document: ${documentId}`);
      return true;

    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Store business profile with contextual metadata for better retrieval
   */
  public async storeBusinessProfile(
    userId: string,
    companyName: string,
    businessData: Record<string, unknown>
  ): Promise<string> {
    const contextMetadata = {
      type: 'business_profile',
      category: 'company',
      user_id: userId,
      company_name: companyName,
      discovery_stage: businessData.onboarding_stage || 'introduction',
      industry: businessData.industry,
      company_size: businessData.company_size,
      target_audience: businessData.target_audience,
      created_for: 'sales_automation',
      purpose: 'drives all prospect research and messaging strategies'
    };

    const content = `Business Profile for ${companyName}:
Industry: ${businessData.industry}
Company Size: ${businessData.company_size}
Target Audience: ${businessData.target_audience}
Value Propositions: ${JSON.stringify(businessData.value_propositions)}
Competitors: ${JSON.stringify(businessData.competitors)}
Sales Challenges: ${JSON.stringify(businessData.sales_challenges)}
Current Sales Process: ${businessData.current_sales_process}`;

    return this.storeDocument(
      `Business Profile - ${companyName}`,
      content,
      contextMetadata,
      'conversation'
    );
  }

  /**
   * Store prospect intelligence with context
   */
  public async storeProspectIntelligence(
    prospectName: string,
    companyName: string,
    prospectData: Record<string, unknown>,
    campaignId?: string
  ): Promise<string> {
    const contextMetadata = {
      type: 'prospect_intelligence',
      category: 'prospect',
      prospect_name: prospectName,
      company_name: companyName,
      campaign_id: campaignId,
      priority_level: prospectData.priority || 'medium',
      buying_intent: prospectData.buying_intent || 'unknown',
      qualification_score: prospectData.qualification_score,
      created_for: 'outbound_campaign',
      purpose: `lead qualification and personalized outreach for ${prospectName} at ${companyName}`
    };

    const content = `Prospect Intelligence for ${prospectName} at ${companyName}:
Title: ${prospectData.title}
Company Funding: ${prospectData.funding_info}
Recent Activity: ${prospectData.recent_activity}
Pain Points: ${JSON.stringify(prospectData.pain_points)}
Buying Signals: ${JSON.stringify(prospectData.buying_signals)}
Contact Information: ${JSON.stringify(prospectData.contact_info)}
Personalization Opportunities: ${JSON.stringify(prospectData.personalization_data)}`;

    return this.storeDocument(
      `Prospect Intel - ${prospectName} (${companyName})`,
      content,
      contextMetadata,
      'analysis'
    );
  }

  /**
   * Store conversation history with context
   */
  public async storeConversationHistory(
    userId: string,
    conversationType: 'discovery' | 'campaign_planning' | 'optimization',
    conversationData: Record<string, unknown>
  ): Promise<string> {
    const contextMetadata = {
      type: 'conversation_history',
      category: 'conversation',
      user_id: userId,
      conversation_type: conversationType,
      business_context: conversationData.business_context,
      workflow_stage: conversationData.workflow_stage,
      agent_insights: conversationData.agent_insights,
      created_for: 'context_retention',
      purpose: `conversation context for ${conversationType} session to inform future interactions`
    };

    const content = `Conversation History - ${conversationType}:
User Goals: ${JSON.stringify(conversationData.user_goals)}
Key Insights: ${JSON.stringify(conversationData.key_insights)}
Decisions Made: ${JSON.stringify(conversationData.decisions)}
Next Steps: ${JSON.stringify(conversationData.next_steps)}
Agent Recommendations: ${JSON.stringify(conversationData.recommendations)}`;

    return this.storeDocument(
      `Conversation - ${conversationType} (${new Date().toISOString().split('T')[0]})`,
      content,
      contextMetadata,
      'conversation'
    );
  }

  /**
   * Store campaign performance with context
   */
  public async storeCampaignPerformance(
    campaignName: string,
    performanceData: Record<string, unknown>,
    campaignMetadata: Record<string, unknown>
  ): Promise<string> {
    const contextMetadata = {
      type: 'campaign_performance',
      category: 'performance',
      campaign_name: campaignName,
      target_audience: campaignMetadata.target_audience,
      messaging_strategy: campaignMetadata.messaging_strategy,
      channels_used: campaignMetadata.channels,
      campaign_goal: campaignMetadata.goal,
      created_for: 'optimization',
      purpose: `performance data for campaign optimization and future strategy improvements`
    };

    const content = `Campaign Performance - ${campaignName}:
Target Audience: ${campaignMetadata.target_audience}
Messaging Strategy: ${campaignMetadata.messaging_strategy}
Performance Metrics: ${JSON.stringify(performanceData.metrics)}
Best Performing Messages: ${JSON.stringify(performanceData.top_messages)}
Channel Results: ${JSON.stringify(performanceData.channel_breakdown)}
Key Learnings: ${JSON.stringify(performanceData.insights)}
Optimization Recommendations: ${JSON.stringify(performanceData.recommendations)}`;

    return this.storeDocument(
      `Campaign Performance - ${campaignName}`,
      content,
      contextMetadata,
      'analysis'
    );
  }

  // Legacy methods for compatibility
  public clearAllMemories(): void {
    console.log('clearAllMemories called - implement if needed for development');
  }

  public getMemoryByType(type: string): MemoryItem[] {
    console.log(`getMemoryByType called with ${type} - use getMemoriesByType instead`);
    return [];
  }
}

export default MemoryService;