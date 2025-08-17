/**
 * Business Intelligence Agent - Comprehensive onboarding intelligence gathering
 * Implements the 9-phase strategic conversation framework for new customer onboarding
 */

import { BaseAgent, AgentConfig, TaskRequest, TaskResponse, ConversationContext } from '../types/AgentTypes';
import { LLMService } from '../../llm/LLMService';
import { MemoryService } from '../../memory/MemoryService';

export interface BusinessIntelligencePhase {
  id: string;
  name: string;
  description: string;
  questions: IntelligenceQuestion[];
  completion_criteria: string[];
  next_phase_triggers: string[];
}

export interface IntelligenceQuestion {
  primary_question: string;
  follow_ups: string[];
  conversation_starters: string[];
  information_targets: string[];
  transition_phrases: string[];
}

export interface CustomerIntelligenceProfile {
  // Phase 1: Business Context
  business_context: {
    industry: string;
    business_model: string;
    company_size: string;
    team_structure: any;
    current_challenges: string[];
  };
  
  // Phase 2: ICP Extraction
  ideal_customer_profile: {
    demographics: any;
    psychographics: any;
    decision_makers: any;
    customer_journey: any;
  };
  
  // Phase 3: Competitive Intelligence
  competitive_landscape: {
    direct_competitors: string[];
    differentiation_factors: string[];
    value_proposition: string;
    competitive_advantages: string[];
  };
  
  // Phase 4: Sales Process
  sales_methodology: {
    current_process: any;
    performance_metrics: any;
    pain_points: string[];
    success_criteria: any;
  };
  
  // Phase 5: Technical Requirements
  technical_stack: {
    current_tools: string[];
    integration_requirements: string[];
    compliance_needs: string[];
  };
  
  // Phase 6: Content & Messaging
  messaging_framework: {
    brand_voice: string;
    communication_style: string;
    existing_content: string[];
    messaging_effectiveness: any;
  };
  
  // Phase 7: Documents Collected
  knowledge_base: {
    uploaded_documents: string[];
    content_gaps: string[];
    priority_materials: string[];
  };
  
  // Phase 8: Campaign Strategy
  initial_strategy: {
    target_prioritization: any;
    channel_preferences: string[];
    success_metrics: any;
  };
  
  // Phase 9: Implementation Plan
  implementation: {
    timeline: any;
    resource_allocation: any;
    next_steps: string[];
  };
}

export class BusinessIntelligenceAgent extends BaseAgent {
  private llmService: LLMService;
  private memoryService: MemoryService;

  // 9-Phase Intelligence Gathering Framework
  private readonly intelligencePhases: BusinessIntelligencePhase[] = [
    {
      id: 'business_context',
      name: 'Business Context Discovery',
      description: 'Company fundamentals, industry, business model, team structure',
      questions: [
        {
          primary_question: "Let's start with the basics so I can understand your business. What industry are you in, and what does your company do?",
          follow_ups: [
            "Help me get more specific - what problems do you solve for your customers?",
            "That sounds interesting! Who's your typical customer in that space?",
            "I love specialized businesses! What makes you different in that market?"
          ],
          conversation_starters: [
            "That's a fascinating industry!",
            "I'm curious to learn more about that space.",
            "That sounds like an interesting business model."
          ],
          information_targets: [
            "industry_classification",
            "business_model_type",
            "target_market",
            "unique_value_proposition"
          ],
          transition_phrases: [
            "That gives me great context. Now let's dive into...",
            "Perfect! That helps me understand the landscape. Speaking of customers...",
            "Excellent foundation. I'm curious about..."
          ]
        }
      ],
      completion_criteria: [
        "Industry clearly identified",
        "Business model understood",
        "Target market defined",
        "Key differentiators captured"
      ],
      next_phase_triggers: [
        "customer_profile_request",
        "business_model_clarity",
        "value_proposition_established"
      ]
    },
    {
      id: 'icp_extraction',
      name: 'Ideal Customer Profile Extraction',
      description: 'Deep customer profiling, demographics, psychographics, journey mapping',
      questions: [
        {
          primary_question: "Let's talk about your perfect customer. Paint me a picture - what does your ideal client company look like?",
          follow_ups: [
            "What industry or industries do they operate in?",
            "What's the company size range - employees and revenue?",
            "Are they startups, established businesses, or enterprise?",
            "Any geographic preferences or limitations?"
          ],
          conversation_starters: [
            "Customer profiles are so important for targeting.",
            "I love understanding the ideal customer psychology.",
            "Let's get specific about who converts best."
          ],
          information_targets: [
            "demographic_profile",
            "company_characteristics",
            "decision_maker_roles",
            "buying_psychology"
          ],
          transition_phrases: [
            "That's a great customer profile. Now I'm curious about the competition...",
            "Perfect ICP clarity. Let's talk about your competitive landscape...",
            "Excellent targeting foundation. Speaking of positioning..."
          ]
        }
      ],
      completion_criteria: [
        "Complete demographic profile",
        "Decision maker roles identified",
        "Buying psychology understood",
        "Customer journey mapped"
      ],
      next_phase_triggers: [
        "competitive_analysis_needed",
        "positioning_discussion",
        "differentiation_questions"
      ]
    },
    {
      id: 'competitive_intelligence',
      name: 'Competitive Intelligence Gathering',
      description: 'Competitor analysis, differentiation, market positioning',
      questions: [
        {
          primary_question: "Who do you typically compete against for deals?",
          follow_ups: [
            "What do prospects compare you to most often?",
            "What do competitors do well that challenges you?",
            "Where do you clearly win against the competition?",
            "What do prospects say about your competitors?"
          ],
          conversation_starters: [
            "Competitive positioning is crucial for messaging.",
            "Understanding the competitive landscape helps with differentiation.",
            "Let's make sure we position you perfectly against alternatives."
          ],
          information_targets: [
            "direct_competitors",
            "competitive_advantages",
            "differentiation_factors",
            "market_positioning"
          ],
          transition_phrases: [
            "Great competitive insight. Now let's look at your current sales process...",
            "Perfect positioning clarity. I want to understand how you're selling now...",
            "Excellent differentiation. Let's dive into your sales methodology..."
          ]
        }
      ],
      completion_criteria: [
        "Competitor landscape mapped",
        "Differentiation factors clear",
        "Competitive advantages identified",
        "Positioning strategy understood"
      ],
      next_phase_triggers: [
        "sales_process_analysis",
        "methodology_discussion",
        "performance_metrics_needed"
      ]
    }
    // Additional phases would be implemented here following the same pattern
  ];

  constructor(config: AgentConfig) {
    super('analysis', config);
    this.llmService = LLMService.getInstance();
    this.memoryService = MemoryService.getInstance();
    this.initializeCapabilities();
  }

  private initializeCapabilities(): void {
    this.capabilities = [
      {
        name: 'business-intelligence-gathering',
        description: 'Comprehensive 9-phase business intelligence extraction',
        supportedComplexity: ['complex'],
        estimatedDuration: 45,
        requiredParameters: ['customer_context', 'intelligence_phase'],
        optionalParameters: ['previous_responses', 'priority_focus']
      },
      {
        name: 'adaptive-questioning',
        description: 'Dynamic question flow based on customer responses',
        supportedComplexity: ['moderate', 'complex'],
        estimatedDuration: 10,
        requiredParameters: ['customer_response', 'current_phase'],
        optionalParameters: ['conversation_history']
      },
      {
        name: 'intelligence-synthesis',
        description: 'Synthesize gathered intelligence into actionable insights',
        supportedComplexity: ['complex'],
        estimatedDuration: 15,
        requiredParameters: ['gathered_intelligence'],
        optionalParameters: ['business_goals', 'implementation_timeline']
      }
    ];
  }

  async initialize(): Promise<void> {
    console.log('Initializing Business Intelligence Agent...');
    this.isInitialized = true;
  }

  async processTask(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const startTime = Date.now();
    
    try {
      switch (task.type) {
        case 'start_intelligence_gathering':
          return await this.startIntelligenceGathering(task, context);
        
        case 'process_intelligence_response':
          return await this.processIntelligenceResponse(task, context);
          
        case 'synthesize_intelligence':
          return await this.synthesizeIntelligence(task, context);
          
        case 'generate_next_question':
          return await this.generateNextQuestion(task, context);
          
        default:
          return this.createTaskResponse(
            task.id,
            { type: 'error', data: {} },
            false,
            `Unsupported task type: ${task.type}`,
            { processingTime: Date.now() - startTime }
          );
      }
    } catch (error) {
      return this.createTaskResponse(
        task.id,
        { type: 'error', data: {} },
        false,
        `Business intelligence gathering failed: ${error.message}`,
        { processingTime: Date.now() - startTime }
      );
    }
  }

  /**
   * Start comprehensive business intelligence gathering
   */
  private async startIntelligenceGathering(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const customerContext = task.parameters.customer_context;
    const currentPhase = this.intelligencePhases[0]; // Start with business context
    
    // Generate contextual opening based on customer type
    const openingMessage = await this.generateContextualOpening(customerContext, currentPhase);
    
    // Initialize intelligence profile
    const intelligenceProfile: Partial<CustomerIntelligenceProfile> = {
      business_context: {
        industry: '',
        business_model: '',
        company_size: '',
        team_structure: {},
        current_challenges: []
      }
    };

    // Store initial state in memory
    await this.memoryService.storeMemory({
      type: 'conversation',
      category: 'business',
      title: 'Business Intelligence Gathering - Started',
      content: 'Initiated comprehensive business intelligence gathering process',
      tags: ['intelligence_gathering', 'onboarding', 'business_context'],
      source: 'conversation',
      confidence: 1.0,
      metadata: {
        phase: currentPhase.id,
        intelligence_profile: intelligenceProfile,
        session_id: context.sessionId,
        started_at: new Date().toISOString()
      }
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'intelligence_start',
        data: {
          message: openingMessage,
          current_phase: currentPhase,
          intelligence_profile: intelligenceProfile,
          phase_progress: '1/9',
          is_intelligence_gathering: true
        }
      },
      true,
      'Business intelligence gathering initiated',
      { processingTime: 300 }
    );
  }

  /**
   * Generate contextual opening based on customer status
   */
  private async generateContextualOpening(customerContext: any, phase: BusinessIntelligencePhase): Promise<string> {
    const contextualOpening = await this.llmService.chat([
      {
        role: 'system',
        content: `You are SAM, starting comprehensive business intelligence gathering. Create a natural, contextual opening that:
1. Acknowledges their customer status appropriately
2. Explains the intelligence gathering purpose
3. Sets expectations for the conversation depth
4. Asks the first strategic question naturally`
      },
      {
        role: 'user',
        content: `Customer Context: ${JSON.stringify(customerContext)}
        
Phase: ${phase.name}
First Question: ${phase.questions[0].primary_question}

Create a natural opening that transitions into strategic business intelligence gathering.`
      }
    ], {
      model: 'quality',
      temperature: 0.7,
      maxTokens: 400
    });

    return contextualOpening.content;
  }

  /**
   * Process customer response and continue intelligence gathering
   */
  private async processIntelligenceResponse(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const userResponse = task.parameters.user_response as string;
    const currentPhase = task.parameters.current_phase as string;
    const intelligenceProfile = task.parameters.intelligence_profile;
    
    // Extract intelligence from response
    const extractedIntelligence = await this.extractIntelligenceFromResponse(
      userResponse, 
      currentPhase, 
      intelligenceProfile
    );
    
    // Update intelligence profile
    const updatedProfile = this.updateIntelligenceProfile(intelligenceProfile, extractedIntelligence, currentPhase);
    
    // Determine next question or phase transition
    const nextAction = await this.determineNextAction(updatedProfile, currentPhase, userResponse);
    
    // Store intelligence in memory
    await this.storeIntelligenceData(extractedIntelligence, currentPhase, context.sessionId);

    return this.createTaskResponse(
      task.id,
      {
        type: 'intelligence_response',
        data: {
          message: nextAction.message,
          current_phase: nextAction.phase,
          intelligence_profile: updatedProfile,
          extracted_data: extractedIntelligence,
          phase_progress: nextAction.progress,
          is_intelligence_gathering: !nextAction.completed
        }
      },
      true,
      'Intelligence response processed',
      { processingTime: 600 }
    );
  }

  /**
   * Extract structured intelligence from conversational response
   */
  private async extractIntelligenceFromResponse(
    response: string, 
    phase: string, 
    currentProfile: any
  ): Promise<Record<string, unknown>> {
    const extractionPrompt = this.getExtractionPromptForPhase(phase);
    
    try {
      const extraction = await this.llmService.chat([
        {
          role: 'system',
          content: `You are a business intelligence extraction expert. Extract structured information from conversational responses. Return valid JSON only.`
        },
        {
          role: 'user',
          content: `${extractionPrompt}\n\nUser Response: "${response}"\n\nCurrent Profile Context: ${JSON.stringify(currentProfile)}`
        }
      ], {
        model: 'quality',
        temperature: 0.2,
        maxTokens: 500
      });

      return JSON.parse(extraction.content);
    } catch (error) {
      console.error('Intelligence extraction failed:', error);
      return { raw_response: response, extraction_error: error.message, phase: phase };
    }
  }

  /**
   * Get extraction prompt for specific intelligence phase
   */
  private getExtractionPromptForPhase(phase: string): string {
    const prompts = {
      'business_context': `Extract business context intelligence:
        - industry: string
        - business_model: "B2B" | "B2C" | "B2B2C" | "marketplace" | "SaaS" | "other"
        - company_size: "startup" | "small" | "medium" | "enterprise"
        - team_structure: object with roles and counts
        - unique_value_proposition: string
        - current_challenges: string[]
        Return as JSON.`,
      
      'icp_extraction': `Extract ideal customer profile:
        - target_industries: string[]
        - company_size_preferences: string[]
        - decision_maker_roles: string[]
        - geographic_focus: string[]
        - buying_psychology: object with motivations and pain points
        - customer_journey_insights: string[]
        Return as JSON.`,
      
      'competitive_intelligence': `Extract competitive intelligence:
        - direct_competitors: string[]
        - competitive_advantages: string[]
        - differentiation_factors: string[]
        - market_position: string
        - competitive_weaknesses: string[]
        - win_loss_patterns: string[]
        Return as JSON.`
    };

    return prompts[phase] || `Extract relevant business intelligence from the response as structured JSON.`;
  }

  /**
   * Update intelligence profile with new data
   */
  private updateIntelligenceProfile(
    currentProfile: any, 
    newIntelligence: any, 
    phase: string
  ): CustomerIntelligenceProfile {
    const updated = { ...currentProfile };
    
    switch (phase) {
      case 'business_context':
        updated.business_context = { ...updated.business_context, ...newIntelligence };
        break;
      case 'icp_extraction':
        updated.ideal_customer_profile = { ...updated.ideal_customer_profile, ...newIntelligence };
        break;
      case 'competitive_intelligence':
        updated.competitive_landscape = { ...updated.competitive_landscape, ...newIntelligence };
        break;
      // Add other phases as needed
    }
    
    return updated as CustomerIntelligenceProfile;
  }

  /**
   * Determine next action: continue phase, transition, or complete
   */
  private async determineNextAction(profile: any, currentPhase: string, userResponse: string): Promise<any> {
    // This would implement sophisticated logic to determine:
    // 1. Whether current phase is complete
    // 2. What the next question should be
    // 3. When to transition to next phase
    // 4. How to maintain natural conversation flow
    
    // For now, return a basic next question structure
    return {
      message: "That's valuable insight! Let me dive deeper into this area...",
      phase: currentPhase,
      progress: "2/9",
      completed: false
    };
  }

  /**
   * Store intelligence data in memory system
   */
  private async storeIntelligenceData(intelligence: any, phase: string, sessionId: string): Promise<void> {
    await this.memoryService.storeMemory({
      type: 'business',
      category: 'intelligence',
      title: `Business Intelligence - ${phase}`,
      content: JSON.stringify(intelligence),
      tags: ['intelligence', phase, 'business_data'],
      source: 'conversation',
      confidence: 0.9,
      metadata: {
        phase: phase,
        intelligence_data: intelligence,
        session_id: sessionId,
        extracted_at: new Date().toISOString()
      }
    });
  }

  /**
   * Synthesize all gathered intelligence into actionable insights
   */
  private async synthesizeIntelligence(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const completeProfile = task.parameters.intelligence_profile as CustomerIntelligenceProfile;
    
    const synthesis = await this.llmService.chat([
      {
        role: 'system',
        content: `You are a business strategy expert. Synthesize comprehensive business intelligence into actionable sales automation strategy.`
      },
      {
        role: 'user',
        content: `Complete Customer Intelligence Profile:
        
${JSON.stringify(completeProfile, null, 2)}

Generate comprehensive synthesis covering:
1. Strategic recommendations for sales automation
2. Personalized campaign strategies
3. Content and messaging framework
4. Implementation priorities
5. Success metrics and KPIs

Provide actionable insights that will power the 8-agent sales automation system.`
      }
    ], {
      model: 'quality',
      temperature: 0.4,
      maxTokens: 1200
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'intelligence_synthesis',
        data: {
          synthesis: synthesis.content,
          intelligence_profile: completeProfile,
          recommendations: 'generated',
          implementation_ready: true
        }
      },
      true,
      'Business intelligence synthesis completed',
      { processingTime: 800 }
    );
  }

  /**
   * Generate next strategic question based on conversation flow
   */
  private async generateNextQuestion(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const currentPhase = task.parameters.current_phase;
    const conversationHistory = task.parameters.conversation_history || [];
    const intelligenceGaps = task.parameters.intelligence_gaps || [];

    const nextQuestion = await this.llmService.chat([
      {
        role: 'system',
        content: `You are SAM, conducting strategic business intelligence gathering. Generate the next perfect question that:
1. Flows naturally from the conversation
2. Gathers critical missing intelligence
3. Maintains engagement and depth
4. Moves toward business understanding`
      },
      {
        role: 'user',
        content: `Current Phase: ${currentPhase}
Conversation History: ${JSON.stringify(conversationHistory)}
Intelligence Gaps: ${JSON.stringify(intelligenceGaps)}

Generate the next strategic question with natural transition.`
      }
    ], {
      model: 'quality',
      temperature: 0.6,
      maxTokens: 300
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'next_question',
        data: {
          question: nextQuestion.content,
          phase: currentPhase,
          intelligence_targets: ['identified', 'from', 'gaps']
        }
      },
      true,
      'Next strategic question generated',
      { processingTime: 400 }
    );
  }

  getCapabilities() {
    return this.capabilities;
  }

  async healthCheck(): Promise<boolean> {
    return this.isInitialized && this.llmService !== null;
  }

  async shutdown(): Promise<void> {
    this.isInitialized = false;
    console.log('Business Intelligence agent shut down');
  }
}

export default BusinessIntelligenceAgent;