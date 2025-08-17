/**
 * Agent Factory - Creates and manages SAM AI specialist agents
 * Following Anthropic's orchestrator-worker pattern
 */

import { AgentConfig, AgentType, AgentInstance } from './types/AgentTypes';
import { OrchestratorAgent } from './core/OrchestratorAgent';
import { LeadResearchAgent } from './specialists/LeadResearchAgent';
import { CampaignManagementAgent } from './specialists/CampaignManagementAgent';
import { GTMStrategyAgent } from './specialists/GTMStrategyAgent';
import { MEDDICQualificationAgent } from './specialists/MEDDICQualificationAgent';
import { OnboardingAgent } from './specialists/OnboardingAgent';
import { KnowledgeBaseAgent } from './specialists/KnowledgeBaseAgent';
import { WorkflowAutomationAgent } from './specialists/WorkflowAutomationAgent';
import { InboxTriageAgent } from './specialists/InboxTriageAgent';
import { SpamFilterAgent } from './specialists/SpamFilterAgent';
import { AutoResponseAgent } from './specialists/AutoResponseAgent';
import { PromptEngineerAgent } from './specialists/PromptEngineerAgent';
import { ApifyScrapingAgent } from './specialists/ApifyScrapingAgent';
import { DataEnrichmentAgent } from './specialists/DataEnrichmentAgent';
import { N8nWorkflowValidationAgent } from './specialists/N8nWorkflowValidationAgent';
import { DataQualityValidationAgent } from './specialists/DataQualityValidationAgent';
import { ConversationalDesignerAgent } from './specialists/ConversationalDesignerAgent';
import { AutoRAGIngestionAgent } from './specialists/AutoRAGIngestionAgent';

export class AgentFactory {
  private static instance: AgentFactory;
  private agentRegistry: Map<AgentType, AgentInstance> = new Map();
  private orchestrator: OrchestratorAgent | null = null;

  private constructor() {}

  public static getInstance(): AgentFactory {
    if (!AgentFactory.instance) {
      AgentFactory.instance = new AgentFactory();
    }
    return AgentFactory.instance;
  }

  /**
   * Initialize the agent system with orchestrator and specialists
   */
  public async initialize(config: AgentConfig): Promise<void> {
    try {
      // Initialize orchestrator first
      this.orchestrator = new OrchestratorAgent(config);
      await this.orchestrator.initialize();

      // Initialize all specialist agents (both inbound and outbound)
      const specialists = [
        // Outbound specialists
        { type: 'lead-research' as AgentType, class: LeadResearchAgent },
        { type: 'campaign-management' as AgentType, class: CampaignManagementAgent },
        { type: 'gtm-strategy' as AgentType, class: GTMStrategyAgent },
        { type: 'meddic-qualification' as AgentType, class: MEDDICQualificationAgent },
        { type: 'workflow-automation' as AgentType, class: WorkflowAutomationAgent },
        // Inbound specialists
        { type: 'inbox-triage' as AgentType, class: InboxTriageAgent },
        { type: 'spam-filter' as AgentType, class: SpamFilterAgent },
        { type: 'auto-response' as AgentType, class: AutoResponseAgent },
        // System specialists
        { type: 'prompt-engineer' as AgentType, class: PromptEngineerAgent },
        // Shared specialists
        { type: 'onboarding' as AgentType, class: OnboardingAgent },
        { type: 'knowledge-base' as AgentType, class: KnowledgeBaseAgent },
        // Apify Integration specialists
        { type: 'apify-scraping' as AgentType, class: ApifyScrapingAgent },
        { type: 'data-enrichment' as AgentType, class: DataEnrichmentAgent },
        // Workflow Integration specialists
        { type: 'n8n-workflow-validation' as AgentType, class: N8nWorkflowValidationAgent },
        // Risk Management specialists
        { type: 'data-quality-validation' as AgentType, class: DataQualityValidationAgent },
        // Conversation Design specialists
        { type: 'analysis' as AgentType, class: ConversationalDesignerAgent },
        // Auto-RAG Ingestion specialist - CRITICAL: Auto-feeds conversation insights into RAG
        { type: 'auto-rag-ingestion' as AgentType, class: AutoRAGIngestionAgent }
      ];

      for (const { type, class: AgentClass } of specialists) {
        const agent = new AgentClass(config);
        await agent.initialize();
        this.agentRegistry.set(type, agent);
      }

      // Register specialists with orchestrator
      this.orchestrator.registerSpecialists(this.agentRegistry);

      console.log('🚀 SAM AI Multi-Agent System initialized with GPT-5 (cost-optimized)');
    } catch (error) {
      console.error('Failed to initialize agent system:', error);
      throw error;
    }
  }

  /**
   * Get the main orchestrator agent
   */
  public getOrchestrator(): OrchestratorAgent {
    if (!this.orchestrator) {
      throw new Error('Agent system not initialized. Call initialize() first.');
    }
    return this.orchestrator;
  }

  /**
   * Get a specific specialist agent
   */
  public getSpecialist(type: AgentType): AgentInstance {
    const agent = this.agentRegistry.get(type);
    if (!agent) {
      throw new Error(`Specialist agent ${type} not found`);
    }
    return agent;
  }

  /**
   * Process user message through the multi-agent system
   */
  public async processMessage(
    message: string,
    context: Record<string, unknown>,
    sessionId: string
  ): Promise<unknown> {
    if (!this.orchestrator) {
      throw new Error('Agent system not initialized');
    }

    return await this.orchestrator.processMessage(message, context, sessionId);
  }

  /**
   * Health check for all agents
   */
  public async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    // Check orchestrator
    health.orchestrator = this.orchestrator ? 
      await this.orchestrator.healthCheck() : false;

    // Check specialists
    for (const [type, agent] of this.agentRegistry) {
      try {
        health[type] = await agent.healthCheck();
      } catch (error) {
        health[type] = false;
      }
    }

    return health;
  }

  /**
   * Shutdown all agents gracefully
   */
  public async shutdown(): Promise<void> {
    if (this.orchestrator) {
      await this.orchestrator.shutdown();
    }

    for (const agent of this.agentRegistry.values()) {
      await agent.shutdown();
    }

    this.agentRegistry.clear();
    this.orchestrator = null;
  }
}