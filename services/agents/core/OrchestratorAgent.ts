/**
 * Orchestrator Agent - Main coordinator for SAM AI Multi-Agent System
 * Implements Anthropic's orchestrator-worker pattern
 */

import { 
  BaseAgent, 
  AgentType, 
  AgentInstance, 
  Message, 
  TaskRequest, 
  TaskResponse, 
  ConversationContext, 
  IntentClassification,
  AgentRoutingDecision,
  MessageIntent,
  TaskComplexity,
  AgentConfig,
  AgentCapability
} from '../types/AgentTypes';
import { LLMService, LLMMessage } from '../../llm/LLMService';
import { MemoryService } from '../../memory/MemoryService';
import { AgentFrameworkExplainer } from '../AgentFrameworkExplainer';
import { BusinessKnowledgeService } from '../../BusinessKnowledgeService';

export type OperationMode = 'outbound' | 'inbound' | 'unified';

export class OrchestratorAgent extends BaseAgent {
  private specialists: Map<AgentType, AgentInstance> = new Map();
  private activeContext: Map<string, ConversationContext> = new Map();
  private operationMode: OperationMode = 'outbound';
  private llmService: LLMService;
  private memoryService: MemoryService;
  private frameworkExplainer: AgentFrameworkExplainer;
  private businessKnowledgeService: BusinessKnowledgeService;
  public readonly name = 'SAM';
  public readonly description = 'Your AI Sales & Communications Expert';

  constructor(config: AgentConfig) {
    super('orchestrator', config);
    this.initializeCapabilities();
    this.llmService = LLMService.getInstance();
    this.memoryService = MemoryService.getInstance();
    this.frameworkExplainer = AgentFrameworkExplainer.getInstance();
    this.businessKnowledgeService = BusinessKnowledgeService.getInstance();
  }

  public setOperationMode(mode: OperationMode): void {
    this.operationMode = mode;
    console.log(`SAM switched to ${mode} mode`);
    // Update active specialists based on mode
    this.updateSpecialistsForMode(mode);
  }

  private updateSpecialistsForMode(mode: OperationMode): void {
    // Update specialist priorities based on mode
    switch (mode) {
      case 'inbound':
        console.log('Activating inbound specialist team: Inbox Triage, Spam Filter, Auto-Response');
        break;
      case 'outbound':
        console.log('Activating outbound specialist team: Lead Research, Campaign Management, Content Creation');
        break;
      case 'unified':
        console.log('Activating unified mode: All specialists available for both inbound and outbound tasks');
        break;
    }
  }

  private initializeCapabilities(): void {
    this.capabilities = [
      {
        name: 'intent-classification',
        description: 'Analyze user messages to determine intent and route to appropriate specialists',
        supportedComplexity: ['simple', 'moderate', 'complex', 'expert'],
        estimatedDuration: 2,
        requiredParameters: ['message', 'context'],
        optionalParameters: ['sessionHistory']
      },
      {
        name: 'task-orchestration',
        description: 'Coordinate multiple specialist agents for complex requests',
        supportedComplexity: ['moderate', 'complex', 'expert'],
        estimatedDuration: 10,
        requiredParameters: ['tasks', 'context'],
        optionalParameters: ['parallel']
      },
      {
        name: 'response-synthesis',
        description: 'Combine outputs from multiple agents into coherent response',
        supportedComplexity: ['simple', 'moderate', 'complex'],
        estimatedDuration: 3,
        requiredParameters: ['agentOutputs'],
        optionalParameters: ['userPreferences']
      },
      {
        name: 'framework-explanation',
        description: 'Explain how SAM\'s 8-agent agentic framework works',
        supportedComplexity: ['simple', 'moderate'],
        estimatedDuration: 5,
        requiredParameters: ['explanation_type'],
        optionalParameters: ['user_context', 'specific_scenario']
      }
    ];
  }

  async initialize(): Promise<void> {
    // Initialize orchestrator-specific resources
    console.log('Initializing SAM Orchestrator Agent...');
    this.isInitialized = true;
  }

  public registerSpecialists(specialists: Map<AgentType, AgentInstance>): void {
    this.specialists = new Map(specialists);
    console.log(`Registered ${specialists.size} specialist agents`);
  }

  public async processMessage(
    message: string, 
    existingContext: Record<string, unknown>, 
    sessionId: string
  ): Promise<{
    response: Message;
    context: ConversationContext;
    agentTrace: Array<Record<string, unknown>>;
  }> {
    const startTime = Date.now();
    const agentTrace: Array<Record<string, unknown>> = [];

    try {
      // Get or create conversation context
      const context = await this.getOrCreateContext(sessionId, existingContext);
      
      // Step 1: Classify intent
      const intent = await this.classifyIntent(message, context);
      agentTrace.push({
        agentType: 'orchestrator',
        action: 'intent-classification',
        input: { message },
        output: intent,
        duration: Date.now() - startTime,
        success: true
      });

      // Step 2: Route to appropriate agent(s)
      const routingDecision = this.routeToAgents(intent);
      agentTrace.push({
        agentType: 'orchestrator',
        action: 'routing-decision',
        input: intent,
        output: routingDecision,
        duration: Date.now() - startTime,
        success: true
      });

      // Step 3: Execute tasks
      const taskResponses = await this.executeTasks(routingDecision, intent, context);
      agentTrace.push(...taskResponses.traces);

      // Step 4: Synthesize response
      const response = await this.synthesizeResponse(
        message, 
        intent, 
        taskResponses.results, 
        context
      );

      // Step 5: Update context
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        content: message,
        sender: 'user',
        timestamp: new Date(),
        intent: intent.intent,
        confidence: intent.confidence
      };

      const samResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        content: response,
        sender: 'sam',
        timestamp: new Date(),
        agentTrace
      };

      context.messageHistory.push(userMessage, samResponse);
      this.activeContext.set(sessionId, context);

      // Save conversation to persistent storage for returning users
      if (context.userId !== 'anonymous') {
        try {
          await this.businessKnowledgeService.saveConversationMessages(
            context.userId, 
            context.messageHistory
          );
        } catch (error) {
          console.error('Failed to save conversation:', error);
        }
      }

      return {
        response: samResponse,
        context,
        agentTrace
      };

    } catch (error) {
      console.error('Orchestrator processing error:', error);
      
      const errorResponse: Message = {
        id: `msg_${Date.now()}`,
        content: "I apologize, but I encountered an issue processing your request. Let me try to help you in a different way. Could you please rephrase your question?",
        sender: 'sam',
        timestamp: new Date(),
        agentTrace: [{
          agentType: 'orchestrator',
          action: 'error-handling',
          input: { message, error: error.message },
          output: null,
          duration: Date.now() - startTime,
          success: false,
          error: error.message
        }]
      };

      return {
        response: errorResponse,
        context: this.activeContext.get(sessionId) || await this.getOrCreateContext(sessionId, existingContext),
        agentTrace: [errorResponse.agentTrace[0]]
      };
    }
  }

  private async classifyIntent(message: string, context: ConversationContext): Promise<IntentClassification> {
    // Enhanced intent classification using patterns and keywords
    const intentPatterns: Record<MessageIntent, { keywords: string[], complexity: TaskComplexity }> = {
      'lead-generation': {
        keywords: ['find', 'leads', 'scrape', 'prospects', 'cmo', 'cto', 'ctos', 'ceo', 'vp', 'director', 'founder', 'startups', 'companies', 'new york', 'boston', 'san francisco', 'marketing', 'tech', 'sales navigator', 'linkedin', 'contacts', 'search', 'edtech', 'saas', 'fintech', 'healthtech', 'employees', '1-50', '50-100', '100-500', 'small companies', 'medium companies'],
        complexity: 'moderate'
      },
      'campaign-optimization': {
        keywords: ['optimize', 'improve', 'performance', 'conversion', 'open rate', 'response rate'],
        complexity: 'complex'
      },
      'content-creation': {
        keywords: ['write', 'create', 'email', 'subject line', 'template', 'copy', 'message'],
        complexity: 'moderate'
      },
      'performance-analysis': {
        keywords: ['analyze', 'metrics', 'results', 'data', 'report', 'roi', 'analytics'],
        complexity: 'complex'
      },
      'automation-setup': {
        keywords: ['automate', 'sequence', 'workflow', 'campaign', 'setup', 'configure'],
        complexity: 'expert'
      },
      'prompt-optimization': {
        keywords: ['optimize prompt', 'improve behavior', 'better responses', 'prompt engineering', 'LLM behavior', 'system prompt', 'AI tuning'],
        complexity: 'expert'
      },
      'framework-explanation': {
        keywords: ['how does sam work', 'explain framework', 'agent system', '8 agents', 'agentic', 'how do you work', 'multi-agent', 'specialists', 'orchestrator', 'agent team', 'how sam works', 'your agents', 'your system'],
        complexity: 'simple'
      },
      'knowledge-query': {
        keywords: ['what is', 'how to', 'explain', 'help', 'question', 'information'],
        complexity: 'simple'
      },
      'general-question': {
        keywords: ['hello', 'hi', 'thanks', 'yes', 'no'],
        complexity: 'simple'
      }
    };

    const messageLower = message.toLowerCase();
    let bestMatch: { intent: MessageIntent; confidence: number } = {
      intent: 'general-question',
      confidence: 0.3
    };

    // Check conversation context - if previous message asked about prospects and this contains specific criteria
    const recentMessages = context.messageHistory.slice(-3);
    const previousSamMessage = recentMessages.find(msg => msg.sender === 'sam')?.content?.toLowerCase() || '';
    const isAnsweringProspectQuestion = previousSamMessage.includes('what type of prospects') && 
      (messageLower.includes('cto') || messageLower.includes('ceo') || messageLower.includes('cmo') || 
       messageLower.includes('director') || messageLower.includes('vp') || messageLower.includes('edtech') ||
       messageLower.includes('saas') || messageLower.includes('fintech') || messageLower.includes('1-50') ||
       messageLower.includes('employees') || messageLower.includes('companies'));

    if (isAnsweringProspectQuestion) {
      bestMatch = {
        intent: 'lead-generation',
        confidence: 0.9
      };
    } else {
      // Calculate confidence scores for each intent
      for (const [intent, pattern] of Object.entries(intentPatterns)) {
        const matches = pattern.keywords.filter(keyword => 
          messageLower.includes(keyword.toLowerCase())
        ).length;
        
        const confidence = matches / pattern.keywords.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            intent: intent as MessageIntent,
            confidence: Math.min(confidence, 0.95)
          };
        }
      }
    }

    // Extract parameters based on intent
    const parameters = this.extractParameters(message, bestMatch.intent);
    
    // Determine suggested agents
    const suggestedAgents = this.getSuggestedAgents(bestMatch.intent);
    
    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      parameters,
      suggestedAgents,
      complexity: intentPatterns[bestMatch.intent].complexity,
      estimatedTokens: Math.ceil(message.length / 4) // Rough token estimate
    };
  }

  private extractParameters(message: string, intent: MessageIntent): Record<string, unknown> {
    const parameters: Record<string, unknown> = {};
    
    // Basic parameter extraction patterns
    const patterns = {
      company: /(?:company|companies?|business|firm)(?:\s+(?:called|named))?\s+([A-Za-z\s&.,-]+)/i,
      location: /(?:in|from|at|near)\s+([A-Za-z\s,]+)/i,
      industry: /(?:industry|sector|field)(?:\s+of)?\s+([A-Za-z\s&.,-]+)/i,
      role: /(?:role|title|position|job)\s+(?:of|as)?\s+([A-Za-z\s&.,-]+)/i,
      metric: /(\d+(?:\.\d+)?%?)\s+(?:open rate|response rate|conversion|roi)/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = message.match(pattern);
      if (match) {
        parameters[key] = match[1].trim();
      }
    }

    return parameters;
  }

  private getSuggestedAgents(intent: MessageIntent): AgentType[] {
    const intentAgentMapping: Record<MessageIntent, AgentType[]> = {
      'lead-generation': ['lead-discovery', 'lead-enrichment'],
      'campaign-optimization': ['campaign-management', 'message-generation'],
      'content-creation': ['message-generation', 'content-authority'],
      'performance-analysis': ['analytics'],
      'automation-setup': ['campaign-management', 'n8n-integration'],
      'prompt-optimization': ['prompt-engineer'],
      'framework-explanation': ['orchestrator'],
      'knowledge-query': ['knowledge-base'],
      'general-question': ['knowledge-base']
    };

    return intentAgentMapping[intent] || ['knowledge-base'];
  }

  private routeToAgents(intent: IntentClassification): AgentRoutingDecision {
    const primaryAgent = intent.suggestedAgents[0];
    const supportingAgents = intent.suggestedAgents.slice(1);
    
    // Determine if tasks can be run in parallel
    const isParallel = intent.complexity !== 'simple' && supportingAgents.length > 0;
    
    // Estimate duration based on complexity
    const baseTime = {
      'simple': 3,
      'moderate': 8,
      'complex': 15,
      'expert': 25
    };

    return {
      primaryAgent,
      supportingAgents,
      isParallel,
      estimatedDuration: baseTime[intent.complexity],
      requiredCapabilities: [intent.intent]
    };
  }

  private async executeTasks(
    routing: AgentRoutingDecision, 
    intent: IntentClassification,
    context: ConversationContext
  ): Promise<{ results: TaskResponse[], traces: Array<Record<string, unknown>> }> {
    const results: TaskResponse[] = [];
    const traces: Array<Record<string, unknown>> = [];

    // Create task request
    const taskRequest: TaskRequest = {
      id: `task_${Date.now()}`,
      type: intent.intent,
      description: `Handle ${intent.intent} request with ${intent.complexity} complexity`,
      parameters: intent.parameters,
      complexity: intent.complexity,
      priority: 1,
      context: {
        sessionId: context.sessionId,
        userProfile: context.userProfile,
        messageHistory: context.messageHistory.slice(-5) // Last 5 messages for context
      }
    };

    try {
      // Execute primary agent task
      const primaryAgent = this.specialists.get(routing.primaryAgent);
      if (primaryAgent) {
        const startTime = Date.now();
        const result = await primaryAgent.processTask(taskRequest, context);
        
        traces.push({
          agentType: routing.primaryAgent,
          action: 'process-task',
          input: taskRequest,
          output: result,
          duration: Date.now() - startTime,
          success: result.success,
          error: result.error
        });
        
        results.push(result);

        // Execute supporting agents if needed
        if (routing.supportingAgents.length > 0 && routing.isParallel) {
          const supportingPromises = routing.supportingAgents.map(async agentType => {
            const agent = this.specialists.get(agentType);
            if (agent) {
              const startTime = Date.now();
              try {
                const result = await agent.processTask(taskRequest, context);
                traces.push({
                  agentType,
                  action: 'support-task',
                  input: taskRequest,
                  output: result,
                  duration: Date.now() - startTime,
                  success: result.success,
                  error: result.error
                });
                return result;
              } catch (error) {
                traces.push({
                  agentType,
                  action: 'support-task',
                  input: taskRequest,
                  output: null,
                  duration: Date.now() - startTime,
                  success: false,
                  error: error.message
                });
                return null;
              }
            }
            return null;
          });

          const supportingResults = await Promise.all(supportingPromises);
          results.push(...supportingResults.filter(r => r !== null) as TaskResponse[]);
        }
      }
    } catch (error) {
      console.error('Task execution error:', error);
      traces.push({
        agentType: 'orchestrator',
        action: 'task-execution-error',
        input: taskRequest,
        output: null,
        duration: 0,
        success: false,
        error: error.message
      });
    }

    return { results, traces };
  }

  private async synthesizeResponse(
    originalMessage: string,
    intent: IntentClassification,
    taskResults: TaskResponse[],
    context: ConversationContext
  ): Promise<string> {
    console.log(`🔍 Synthesizing response for intent: ${intent.intent}, results: ${taskResults.length}`);
    
    // Check if this is a greeting or first interaction for personalized response
    const isGreeting = this.isGreetingMessage(originalMessage) || context.messageHistory.length <= 1;
    
    if (isGreeting && context.userId !== 'anonymous') {
      return this.generatePersonalizedGreeting(originalMessage, context);
    }
    
    // Special handling for lead generation requests
    if (intent.intent === 'lead-generation' && taskResults.length === 0) {
      return this.handleLeadGenerationRequest(originalMessage, intent);
    }
    
    // Get relevant memories for context
    const memories = this.memoryService.getRelevantMemories({
      tags: [intent.intent]
    });
    
    // Build LLM messages with context
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: this.llmService.createSystemPrompt('orchestrator', {
          mode: this.operationMode,
          intent: intent.intent,
          memories: memories.slice(0, 3) // Include top 3 relevant memories
        })
      }
    ];

    // Add conversation history (both current session and persistent)
    const recentMessages = context.messageHistory.slice(-5);
    const persistentHistory = (context as any).conversationHistory || [];
    
    // Include recent persistent conversation history for context
    const allHistory = [...persistentHistory.slice(-10), ...recentMessages];
    const uniqueHistory = allHistory.filter((msg, index, self) => 
      self.findIndex(m => m.id === msg.id) === index
    ).slice(-8); // Last 8 unique messages for context
    
    uniqueHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: originalMessage
    });

    // If we have task results, add them as context
    if (taskResults.length > 0) {
      const resultsContext = taskResults
        .filter(r => r.success && r.result)
        .map(r => r.result)
        .join('\n\n');
      
      if (resultsContext) {
        messages.push({
          role: 'system',
          content: `Task results from specialist agents:\n${resultsContext}`
        });
      }
    }

    try {
      // Get LLM response
      const llmResponse = await this.llmService.chat(messages, {
        model: this.getModelForIntent(intent.intent),
        temperature: 0.7,
        maxTokens: 1500
      });

      // Extract and store any new context from the conversation
      await this.memoryService.extractFromConversation(originalMessage, llmResponse.content);

      // Add follow-up suggestions if appropriate
      const suggestions = this.generateFollowUpSuggestions(intent.intent, taskResults);
      if (suggestions.length > 0) {
        return `${llmResponse.content}\n\n**Suggested next steps:**\n${suggestions.map(s => `• ${s}`).join('\n')}`;
      }

      return llmResponse.content;
    } catch (error) {
      console.error('LLM synthesis failed, using fallback:', error);
      return this.generateFallbackResponse(intent.intent, originalMessage);
    }
  }

  private getModelForIntent(intent: MessageIntent): string {
    // Use different models based on intent complexity
    const modelMap: Record<MessageIntent, string> = {
      'lead-generation': 'quality',
      'campaign-optimization': 'quality',
      'content-creation': 'creative',
      'performance-analysis': 'analysis',
      'automation-setup': 'quality',
      'knowledge-query': 'balanced',
      'general-question': 'fast'
    };

    return modelMap[intent] || 'balanced';
  }

  private generateFallbackResponse(intent: MessageIntent, originalMessage: string): string {
    const fallbackResponses = {
      'lead-generation': "I solve this with automated LinkedIn and email outreach that converts prospects into meetings. But first, I need to understand your business so the outreach actually works. What industry are you in and what problem do you solve?",
      'campaign-optimization': "I can boost your LinkedIn and email campaign performance. What's not working - low response rates, poor open rates, or prospects going cold?",
      'content-creation': "I create LinkedIn and email outreach that gets responses by speaking to specific pain points. What do you need - connection requests, follow-up sequences, or meeting booking messages?",
      'performance-analysis': "Let's analyze your LinkedIn and email outreach performance. Which campaigns or metrics should we look at first?",
      'automation-setup': "I automate LinkedIn and email outreach that builds relationships and books meetings. What's your biggest time sink - prospecting, messaging, or follow-ups?",
      'knowledge-query': "I can help with that. Give me more context about what you need to know.",
      'general-question': "Hey! I'm SAM - a self-service LinkedIn and email outreach tool that actually converts. I work automatically once set up, but I need information about your business and positioning to deliver results. Most people come to me frustrated with generic messages that get ignored or inconsistent follow-up that loses deals. What specific challenge brought you here, and what's your website so I can understand how you position yourself?"
    };

    return fallbackResponses[intent] || fallbackResponses['general-question'];
  }

  private synthesizeLeadGenerationResponse(primary: TaskResponse, all: TaskResponse[]): string {
    return "Great! I've analyzed your lead generation request. Based on your criteria, I can help you find qualified prospects using LinkedIn Sales Navigator, Google Search, and other sources. Here's what I found:\n\n" + 
           (primary.result || "I'm ready to start searching for leads that match your target profile.");
  }

  private synthesizeCampaignOptimizationResponse(primary: TaskResponse, all: TaskResponse[]): string {
    return "I've analyzed your campaign optimization needs. Here are my recommendations for improving your performance:\n\n" + 
           (primary.result || "Let me help you identify the key areas where we can boost your campaign effectiveness.");
  }

  private synthesizeContentCreationResponse(primary: TaskResponse, all: TaskResponse[]): string {
    return "I've created some content ideas for you. Here's what I came up with:\n\n" + 
           (primary.result || "I'm ready to help you create compelling, personalized content that resonates with your audience.");
  }

  private synthesizeAnalyticsResponse(primary: TaskResponse, all: TaskResponse[]): string {
    return "Here's my analysis of your performance data:\n\n" + 
           (primary.result || "I can help you dive deep into your metrics and identify opportunities for improvement.");
  }

  private synthesizeAutomationResponse(primary: TaskResponse, all: TaskResponse[]): string {
    return "I've outlined an automation strategy for you:\n\n" + 
           (primary.result || "Let me help you set up automated workflows that will save you time and improve consistency.");
  }

  private synthesizeKnowledgeResponse(primary: TaskResponse, all: TaskResponse[], originalMessage: string): string {
    return primary.result || `I understand you're asking about: "${originalMessage}". Let me provide you with the most relevant information I have on this topic.`;
  }

  private generateFollowUpSuggestions(intent: MessageIntent, results: TaskResponse[]): string[] {
    const suggestionMap = {
      'lead-generation': ['Enrich the leads with contact information', 'Create personalized outreach sequences', 'Set up automated follow-ups'],
      'campaign-optimization': ['A/B test different subject lines', 'Analyze competitor strategies', 'Create new audience segments'],
      'content-creation': ['Generate video scripts', 'Create follow-up sequences', 'Develop A/B test variants'],
      'performance-analysis': ['Set up automated reporting', 'Create optimization experiments', 'Forecast future performance'],
      'automation-setup': ['Test the workflow', 'Create backup sequences', 'Set up performance monitoring'],
      'knowledge-query': ['Learn about related topics', 'See practical examples', 'Get implementation guidance'],
      'general-question': ['Train SAM on your offering', 'Define your target audience', 'Set up your first campaign']
    };

    return suggestionMap[intent] || suggestionMap['general-question'];
  }

  private async getOrCreateContext(sessionId: string, existingContext: Record<string, unknown>): Promise<ConversationContext> {
    let context = this.activeContext.get(sessionId);
    
    if (!context) {
      const userId = existingContext?.userId as string || 'anonymous';
      
      // Load business knowledge and conversation history for returning users
      let businessProfile = null;
      let conversationHistory: any[] = [];
      
      if (userId !== 'anonymous') {
        try {
          // Get business profile and conversation context
          const businessContext = await this.businessKnowledgeService.getConversationContext(userId);
          businessProfile = businessContext.business_profile;
          
          // Load recent conversation messages for context
          conversationHistory = await this.businessKnowledgeService.getRecentMessages(userId);
          
          console.log(`🔄 Loaded context for returning user: ${businessProfile?.company_name || 'User'}`);
        } catch (error) {
          console.error('Failed to load user context:', error);
        }
      }
      
      context = {
        sessionId,
        userId,
        workspace: existingContext?.workspace,
        messageHistory: existingContext?.messages || [],
        userProfile: existingContext?.userProfile,
        currentTasks: [],
        completedTasks: [],
        knowledgeBase: {},
        // Add business context for memory
        businessProfile,
        conversationHistory
      };
      
      this.activeContext.set(sessionId, context);
    }

    return context;
  }

  async processTask(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    // Orchestrator doesn't process tasks directly - it delegates
    throw new Error('Orchestrator delegates tasks to specialists');
  }

  getCapabilities(): AgentCapability[] {
    return this.capabilities;
  }

  async healthCheck(): Promise<boolean> {
    // Check if specialists are healthy
    for (const [type, agent] of this.specialists) {
      try {
        const healthy = await agent.healthCheck();
        if (!healthy) {
          console.warn(`Specialist ${type} failed health check`);
          return false;
        }
      } catch (error) {
        console.error(`Health check error for ${type}:`, error);
        return false;
      }
    }
    return this.isInitialized;
  }

  async shutdown(): Promise<void> {
    this.activeContext.clear();
    this.specialists.clear();
    this.isInitialized = false;
    console.log('Orchestrator agent shut down');
  }

  /**
   * Handle lead generation requests - focus on discovery first
   */
  private handleLeadGenerationRequest(message: string, intent: IntentClassification): string {
    console.log(`🎯 Handling lead generation request with discovery focus: ${message}`);
    
    // Parse any specific criteria mentioned in the message
    const messageLower = message.toLowerCase();
    
    let response = `Perfect! I solve this with automated LinkedIn and email outreach that actually converts prospects into meetings.\n\n`;
    
    // If they mentioned specific criteria, acknowledge it
    if (messageLower.includes('cto') || messageLower.includes('ceo') || messageLower.includes('cmo')) {
      response += `Targeting ${messageLower.includes('cto') ? 'CTOs' : messageLower.includes('ceo') ? 'CEOs' : 'CMOs'} is smart - they're decision makers who can actually buy.\n\n`;
    }
    
    if (messageLower.includes('saas') || messageLower.includes('edtech') || messageLower.includes('fintech')) {
      const industry = messageLower.includes('saas') ? 'SaaS' : messageLower.includes('edtech') ? 'EdTech' : 'FinTech';
      response += `${industry} is a great space - lots of potential if you target the right pain points.\n\n`;
    }
    
    response += `**My Solution: LinkedIn + Email Outreach That Converts**\n`;
    response += `• Find prospects who actually need what you're selling\n`;
    response += `• Create personalized messages that speak to their specific pain points\n`;
    response += `• Multi-channel sequences that build relationships, not spam inboxes\n`;
    response += `• Automated follow-up that never lets prospects go cold\n\n`;
    
    response += `**Why This Works:** +35% higher engagement, 50% faster pipeline, 10x ROI\n\n`;
    
    response += `But here's the key - I need to understand your business AND see how you currently position yourself. Otherwise, it's just generic outreach that gets ignored.\n\n`;
    
    response += `**What I Need:**\n`;
    response += `• **Discovery conversation** about your business, customers, and competitive landscape\n`;
    response += `• **Your materials:** Website link, LinkedIn posts, sales decks, any messaging you're proud of\n`;
    response += `• **Competitive intel:** Your top competitors' websites and what you envy about their messaging\n\n`;
    
    response += `**Why This Information is Critical:**\n`;
    response += `SAM is a self-service tool that runs automatically, but I need the right inputs to deliver the promised results. Without understanding how YOU communicate and your competitive landscape, I'll create generic automation that fails.\n\n`;
    
    response += `**The Deal:** 60 minutes of information sharing = months of automated outreach that converts.\n\n`;
    
    response += `Let's start - what industry are you in and what specific problem does your company solve?\n\n`;
    
    response += `Also helpful to share:\n`;
    response += `• Your website link\n`;
    response += `• Links to 2-3 main competitors\n`;
    response += `• Examples of sales outreach you think actually works`;
    
    return response;
  }

  /**
   * Check if message is a greeting
   */
  private isGreetingMessage(message: string): boolean {
    const greetingPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
      /^(what's up|howdy|greetings|yo)/i,
      /^(how are you|how's it going)/i,
      /^(sam|hey sam|hello sam|hi sam)/i
    ];
    
    return greetingPatterns.some(pattern => pattern.test(message.trim()));
  }

  /**
   * Generate personalized greeting with name and personal question
   */
  private async generatePersonalizedGreeting(originalMessage: string, context: ConversationContext): Promise<string> {
    const businessProfile = (context as any).businessProfile;
    const conversationHistory = (context as any).conversationHistory || [];
    
    // Extract user name from profile or message
    let userName = '';
    let companyName = '';
    let personalContext = '';
    
    if (businessProfile) {
      companyName = businessProfile.company_name || '';
      // Try to extract user name from various sources
      userName = this.extractUserName(businessProfile, conversationHistory);
    }
    
    // Generate personalized greeting based on user context
    if (businessProfile && businessProfile.onboarding_completed) {
      // Returning user with completed setup
      return this.generateReturningUserGreeting(userName, companyName, businessProfile, conversationHistory);
    } else if (businessProfile && !businessProfile.onboarding_completed) {
      // Returning user still in onboarding
      return this.generateOnboardingGreeting(userName, companyName, businessProfile);
    } else {
      // New user
      return this.generateNewUserGreeting(originalMessage);
    }
  }

  /**
   * Extract user name from various sources
   */
  private extractUserName(businessProfile: any, conversationHistory: any[]): string {
    // Try to get name from submitter info
    if (businessProfile.submitter_name) {
      const firstName = businessProfile.submitter_name.split(' ')[0];
      return firstName;
    }
    
    // Try to extract from conversation history
    const namePatterns = [
      /(?:i'm|my name is|call me|i am)\s+([a-zA-Z]+)/i,
      /(?:this is|it's)\s+([a-zA-Z]+)(?:\s+speaking)?/i
    ];
    
    for (const msg of conversationHistory) {
      if (msg.sender === 'user') {
        for (const pattern of namePatterns) {
          const match = msg.content.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
      }
    }
    
    return '';
  }

  /**
   * Generate greeting for returning user with completed setup
   */
  private generateReturningUserGreeting(userName: string, companyName: string, businessProfile: any, conversationHistory: any[]): string {
    const nameGreeting = userName ? `Hey ${userName}!` : 'Hey there!';
    const companyContext = companyName ? ` for ${companyName}` : '';
    
    // Generate personal question based on business context
    const personalQuestions = this.generatePersonalQuestions(businessProfile);
    const randomQuestion = personalQuestions[Math.floor(Math.random() * personalQuestions.length)];
    
    return `${nameGreeting} Good to see you back! 👋

${randomQuestion}

I've got all the context about your business${companyContext} and my agents are ready to work.

What's the priority today:
• Find qualified prospects matching your ICP?
• Create personalized outreach campaigns?
• Optimize existing campaigns for better results?
• Set up automated follow-up sequences?

Or something else you need to tackle?`;
  }

  /**
   * Generate greeting for user still in onboarding
   */
  private generateOnboardingGreeting(userName: string, companyName: string, businessProfile: any): string {
    const nameGreeting = userName ? `Hey ${userName}!` : 'Hey there!';
    const stage = businessProfile.onboarding_stage;
    
    // Generate personal question
    const personalQuestions = this.generatePersonalQuestions(businessProfile);
    const randomQuestion = personalQuestions[Math.floor(Math.random() * personalQuestions.length)];
    
    switch (stage) {
      case 'introduction':
        return `${nameGreeting} Welcome back! 👋

${randomQuestion}

We started talking about ${companyName || 'your business'} last time. Ready to dive deeper so my agents can start solving your sales challenges?`;

      case 'discovery':
        return `${nameGreeting} Good to see you again! 👋

${randomQuestion}

We were building the foundation for ${companyName} - got your industry (${businessProfile.industry}) and some initial context. 

Let's keep going with your ideal customer profile so my agents know exactly who to target.`;

      default:
        return `${nameGreeting} Good to see you again! 👋

${randomQuestion}

What's the priority for ${companyName || 'your business'} today - more setup or ready to start generating results?`;
    }
  }

  /**
   * Get customer context for personalized responses (v3.0)
   */
  private getCustomerContext(session: any): any {
    // TODO: Integrate with Stripe API and usage analytics
    // For now, return mock context or extract from session metadata
    
    // This will be replaced with real Stripe/usage data integration
    const mockCustomerContext = {
      subscriptionStatus: 'active', // 'trialing', 'active', 'past_due', 'unpaid'
      daysUntilRenewal: 15, // Days until next billing cycle
      customerAge: 45, // Days since first subscription
      usageLevel: 'medium', // 'low', 'medium', 'high' based on platform usage
      trialStatus: null // Only relevant for trial users
    };

    // In production, this would be:
    // const stripeData = await this.stripeService.getCustomerSubscription(session.customerId);
    // const usageData = await this.analyticsService.getCustomerUsage(session.customerId);
    // return this.calculateCustomerContext(stripeData, usageData);

    return mockCustomerContext;
  }

  /**
   * Generate greeting for new user
   */
  private generateNewUserGreeting(originalMessage: string): string {
    // Check if this is a response to "How are you today?" 
    // Get the current session context to check message history
    const sessionKeys = Array.from(this.activeContext.keys());
    const currentSession = sessionKeys.length > 0 ? this.activeContext.get(sessionKeys[0]) : null;
    const messageHistory = currentSession?.messageHistory || [];
    
    // Check if the last SAM message asked "How are you today?"
    const lastSamMessage = messageHistory.slice().reverse().find(msg => msg.sender === 'sam');
    const isResponseToGreeting = lastSamMessage && lastSamMessage.content.includes('How are you today?');
    
    if (isResponseToGreeting) {
      // This is the user's response to "How are you today?" - use their actual response with customer context
      const customerContext = this.getCustomerContext(currentSession);
      return this.businessKnowledgeService.generateGreetingFollowUp(originalMessage, customerContext);
    }
    
    // Default response for new users if not in the specific greeting flow
    return `Thanks for your message! I'm here to help you with B2B sales automation.

What would you like to know about my 8-agent sales system?`;
  }

  /**
   * Generate personal questions based on business context
   */
  private generatePersonalQuestions(businessProfile: any): string[] {
    const questions = [
      "How are you today?",
      "What's on your mind?",
      "How's your week going?",
      "Hope you're doing well!",
      "How are things going with you?",
      "What's keeping you busy these days?"
    ];
    
    // Add day-specific questions
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();
    
    // Weekend questions
    if (dayOfWeek === 5) { // Friday
      questions.push("Any fun plans for the weekend?");
      questions.push("Anything exciting you have planned for the weekend?");
    } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      questions.push("Hope you're having a good weekend!");
      questions.push("How's your weekend going?");
    } else if (dayOfWeek === 1) { // Monday
      questions.push("How was your weekend?");
      questions.push("Hope you had a good weekend!");
    }
    
    // Time-based questions
    if (hour < 11) {
      questions.push("How's your morning going?");
    } else if (hour > 16) {
      questions.push("How's your afternoon been?");
    }
    
    // Business-related but casual questions
    if (businessProfile?.industry) {
      const industry = businessProfile.industry.toLowerCase();
      if (industry.includes('saas') || industry.includes('software')) {
        questions.push("How's everything going in the tech world?");
      } else if (industry.includes('consulting')) {
        questions.push("How's the consulting world treating you?");
      } else if (industry.includes('marketing')) {
        questions.push("How are things in the marketing space?");
      }
    }
    
    return questions;
  }
}