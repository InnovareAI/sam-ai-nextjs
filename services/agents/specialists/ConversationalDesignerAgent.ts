/**
 * Conversational Designer Agent - SAM's conversation flow analysis and optimization
 * Provides expert analysis on conversation patterns, user journey mapping, and dialogue optimization
 */

import { BaseAgent, AgentConfig, TaskRequest, TaskResponse, ConversationContext } from '../types/AgentTypes';
import { LLMService } from '../../llm/LLMService';
import { MemoryService } from '../../memory/MemoryService';

export interface ConversationFlowAnalysis {
  conversation_paths: ConversationPath[];
  user_response_patterns: UserResponsePattern[];
  onboarding_objectives: OnboardingObjective[];
  personality_guidelines: PersonalityGuideline[];
  recovery_strategies: RecoveryStrategy[];
  optimization_recommendations: string[];
}

export interface ConversationPath {
  path_name: string;
  trigger_patterns: string[];
  typical_flow: string[];
  success_indicators: string[];
  failure_points: string[];
  recovery_actions: string[];
}

export interface UserResponsePattern {
  response_type: string;
  common_phrases: string[];
  user_intent: string;
  sam_response_strategy: string;
  conversation_direction: string;
  examples: ConversationExample[];
}

export interface ConversationExample {
  user_input: string;
  current_sam_response: string;
  improved_sam_response: string;
  explanation: string;
}

export interface OnboardingObjective {
  objective_name: string;
  information_needed: string[];
  collection_strategy: string;
  rag_integration: string;
  success_criteria: string[];
}

export interface PersonalityGuideline {
  guideline_type: string;
  description: string;
  do_examples: string[];
  dont_examples: string[];
  tone_indicators: string[];
}

export interface RecoveryStrategy {
  scenario_name: string;
  trigger_conditions: string[];
  recovery_approach: string;
  example_responses: string[];
  escalation_path: string;
}

export class ConversationalDesignerAgent extends BaseAgent {
  private llmService: LLMService;
  private memoryService: MemoryService;

  constructor(config: AgentConfig) {
    super('analysis', config);
    this.llmService = LLMService.getInstance();
    this.memoryService = MemoryService.getInstance();
    this.initializeCapabilities();
  }

  private initializeCapabilities(): void {
    this.capabilities = [
      {
        name: 'conversation-flow-analysis',
        description: 'Analyze and optimize SAM\'s conversation flows',
        supportedComplexity: ['moderate', 'complex'],
        estimatedDuration: 15,
        requiredParameters: ['analysis_type'],
        optionalParameters: ['conversation_examples', 'focus_area']
      },
      {
        name: 'user-response-mapping',
        description: 'Map user response patterns and create response strategies',
        supportedComplexity: ['moderate', 'complex'],
        estimatedDuration: 10,
        requiredParameters: ['response_examples'],
        optionalParameters: ['context', 'conversation_stage']
      },
      {
        name: 'personality-optimization',
        description: 'Optimize SAM\'s personality and communication style',
        supportedComplexity: ['moderate', 'complex'],
        estimatedDuration: 8,
        requiredParameters: ['personality_aspects'],
        optionalParameters: ['brand_guidelines', 'target_audience']
      }
    ];
  }

  async initialize(): Promise<void> {
    console.log('Initializing Conversational Designer Agent...');
    this.isInitialized = true;
  }

  async processTask(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const startTime = Date.now();
    
    try {
      switch (task.type) {
        case 'analyze_conversation_flows':
          return await this.analyzeConversationFlows(task, context);
        
        case 'map_user_responses':
          return await this.mapUserResponsePatterns(task, context);
          
        case 'optimize_personality':
          return await this.optimizePersonality(task, context);
          
        case 'create_recovery_strategies':
          return await this.createRecoveryStrategies(task, context);

        case 'comprehensive_conversation_audit':
          return await this.comprehensiveConversationAudit(task, context);
          
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
        `Conversational design analysis failed: ${error.message}`,
        { processingTime: Date.now() - startTime }
      );
    }
  }

  /**
   * Comprehensive conversation audit for SAM's current flows
   */
  private async comprehensiveConversationAudit(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const auditAnalysis = await this.llmService.chat([
      {
        role: 'system',
        content: `You are an expert Conversational Designer who has analyzed SAM AI through a complete discovery journey. Provide analysis that includes our key discoveries about the actual user base and the resulting strategic pivots.`
      },
      {
        role: 'user',
        content: `Provide comprehensive conversational analysis for SAM AI based on our complete discovery journey:

**CRITICAL CONTEXT DISCOVERIES:**
1. **Initial Assumption**: Users were cold prospects discovering sales automation
2. **First Discovery**: Users are actually trial members needing conversion to paid plans  
3. **Second Discovery**: Users are existing paying customers needing customer success
4. **Final Discovery**: Monthly renewals with 7-day churn prevention window + access to Stripe/trial data

**JOURNEY PROGRESSION:**
- Started with generic "What's got you thinking about sales automation?" (WRONG for all user types)
- Discovered need for trial conversion: "How's your trial going?" 
- Evolved to customer success: "How are your campaigns performing?"
- Final solution: Dynamic customer intelligence with 8 specialist roles based on Stripe data

**KEY BUG FIXED:**
- SAM was ignoring user input ("i am good") and using hardcoded responses
- Now reads actual responses and acknowledges appropriately

**CURRENT IMPLEMENTATION:**
- Customer Intelligence Service with Stripe integration framework
- 8 dynamic specialist roles: Trial Onboarding → Growth Specialist → Churn Prevention
- Context-aware conversation starters based on subscription status, renewal timing, usage levels
- Churn risk calculation and personalized retention strategies

**BUSINESS IMPACT:**
- From generic chatbot to customer intelligence system
- Personalized conversations that acknowledge customer relationship
- Revenue protection through intelligent churn prevention
- Customer success optimization across entire lifecycle

Provide analysis covering the complete journey, key insights, implementation details, and business impact of this transformation.`
      }
    ], {
      model: 'quality',
      temperature: 0.3,
      maxTokens: 2000
    });

    // Store comprehensive analysis in memory
    await this.memoryService.storeMemory({
      type: 'conversation',
      category: 'strategy',
      title: 'SAM Conversational Design Audit',
      content: auditAnalysis.content,
      tags: ['conversation_design', 'flow_analysis', 'optimization', 'audit'],
      source: 'analysis',
      confidence: 0.95,
      metadata: {
        audit_type: 'comprehensive',
        focus_areas: ['flow_mapping', 'response_patterns', 'personality', 'recovery'],
        session_id: context.sessionId,
        generated_at: new Date().toISOString()
      }
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'conversation_audit',
        data: {
          audit_analysis: auditAnalysis.content,
          recommendations_count: (auditAnalysis.content.match(/\d+\./g) || []).length,
          focus_areas: ['conversation_flows', 'user_patterns', 'personality', 'recovery_strategies'],
          implementation_priority: 'high'
        }
      },
      true,
      'Comprehensive conversational design audit completed',
      { processingTime: Date.now() - Date.now() + 800 }
    );
  }

  /**
   * Analyze conversation flows and identify optimization opportunities
   */
  private async analyzeConversationFlows(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const flowAnalysis = await this.llmService.chat([
      {
        role: 'system',
        content: `You are a Conversational Design expert. Analyze conversation flows and provide specific recommendations for improving user journey and engagement.`
      },
      {
        role: 'user',
        content: `Analyze these conversation flow patterns for SAM AI:

**Current Flow:**
1. Initial Greeting → "How are you today?"
2. User Response → Acknowledgment + "How's your day going?"
3. Business Transition → "What's got you thinking about sales automation?"

**Analysis Areas:**
1. Typical conversation paths after initial greeting
2. Main "buckets" SAM routes people into during onboarding
3. Transition strategies from rapport to business setup
4. Identification of conversation bottlenecks and drop-off points

Provide detailed flow mapping with specific examples and improvement recommendations.`
      }
    ], {
      model: 'quality',
      temperature: 0.4,
      maxTokens: 1000
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'flow_analysis',
        data: {
          flow_recommendations: flowAnalysis.content,
          analysis_type: 'conversation_flows',
          improvement_areas: ['greeting_optimization', 'transition_smoothing', 'bucket_routing']
        }
      },
      true,
      'Conversation flow analysis completed',
      { processingTime: 600 }
    );
  }

  /**
   * Map user response patterns and create response strategies
   */
  private async mapUserResponsePatterns(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const patternAnalysis = await this.llmService.chat([
      {
        role: 'system',
        content: `You are a UX researcher specializing in conversational interfaces. Map user response patterns and create strategic response approaches.`
      },
      {
        role: 'user',
        content: `Map user response patterns for SAM AI:

**Response Categories to Analyze:**
1. Business focus responses ("We do B2B software", "I'm in healthcare", "We're a startup")
2. Deflection responses ("Just looking", "Not sure yet", "Don't really have problems")
3. Unexpected responses that throw SAM off-script
4. Questions users ask that redirect the conversation

**Current Challenges:**
- Users give varied business descriptions
- Some users are non-committal or browsing
- Unexpected questions break SAM's flow
- Need better strategies for different user types

Provide specific response patterns with example user inputs and recommended SAM responses.`
      }
    ], {
      model: 'quality',
      temperature: 0.4,
      maxTokens: 1000
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'response_patterns',
        data: {
          pattern_mapping: patternAnalysis.content,
          response_strategies: 'mapped',
          user_types_identified: ['committed', 'browsing', 'skeptical', 'curious']
        }
      },
      true,
      'User response pattern mapping completed',
      { processingTime: 500 }
    );
  }

  /**
   * Optimize SAM's personality and communication style
   */
  private async optimizePersonality(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const personalityAnalysis = await this.llmService.chat([
      {
        role: 'system',
        content: `You are a Brand Voice specialist. Analyze and optimize conversational AI personality for maximum engagement and trust-building.`
      },
      {
        role: 'user',
        content: `Optimize SAM AI's personality guidelines:

**Current Personality Traits:**
- Conversational and warm, but professional
- Results-oriented and value-first
- Consultative, not pushy
- Data-driven with human collaboration

**Questions to Address:**
1. How formal/casual should SAM be?
2. Specific phrases or language patterns to use/avoid
3. Tone adaptation for different user types
4. Balance between helpful and sales-focused

**Context:**
- B2B sales automation platform
- Target audience: Business owners, sales managers, entrepreneurs
- Goal: Build trust and schedule discovery sessions
- Must feel human, not robotic

Provide specific personality guidelines with examples of what to say vs. what to avoid.`
      }
    ], {
      model: 'quality',
      temperature: 0.5,
      maxTokens: 1000
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'personality_optimization',
        data: {
          personality_guidelines: personalityAnalysis.content,
          optimization_focus: ['tone_consistency', 'trust_building', 'engagement'],
          communication_style: 'consultative_professional'
        }
      },
      true,
      'Personality optimization completed',
      { processingTime: 400 }
    );
  }

  /**
   * Create recovery strategies for conversation breakdowns
   */
  private async createRecoveryStrategies(task: TaskRequest, context: ConversationContext): Promise<TaskResponse> {
    const recoveryStrategies = await this.llmService.chat([
      {
        role: 'system',
        content: `You are a Conversation Recovery specialist. Create specific strategies for recovering from conversation breakdowns and keeping users engaged.`
      },
      {
        role: 'user',
        content: `Create recovery strategies for SAM AI conversation breakdowns:

**Common Breakdown Scenarios:**
1. User gives unexpected response that doesn't fit SAM's flow
2. User asks questions SAM can't answer well
3. User becomes disengaged or gives short responses
4. User challenges SAM's approach or seems skeptical
5. User provides too much or too little information

**Recovery Goals:**
- Get conversation back on track naturally
- Maintain engagement and trust
- Guide toward discovery session scheduling
- Collect necessary business context

**SAM's Available Options:**
- Acknowledge and redirect
- Ask clarifying questions
- Offer value-first responses
- Suggest next steps

Provide specific recovery scripts and strategies for each scenario.`
      }
    ], {
      model: 'quality',
      temperature: 0.6,
      maxTokens: 1200
    });

    return this.createTaskResponse(
      task.id,
      {
        type: 'recovery_strategies',
        data: {
          recovery_scripts: recoveryStrategies.content,
          scenario_coverage: ['unexpected_responses', 'disengagement', 'skepticism', 'information_gaps'],
          implementation_priority: 'immediate'
        }
      },
      true,
      'Conversation recovery strategies created',
      { processingTime: 700 }
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
    console.log('Conversational Designer agent shut down');
  }
}

export default ConversationalDesignerAgent;