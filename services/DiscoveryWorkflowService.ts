/**
 * Discovery Workflow Service
 * Integrates BusinessKnowledgeService with KnowledgeRAGService for comprehensive 60-minute discovery sessions
 * Handles document ingestion, business knowledge extraction, and RAG database population
 */

import { BusinessKnowledgeService, BusinessProfile, ConversationContext } from './BusinessKnowledgeService';
import { KnowledgeRAGService, DocumentMetadata, ContentTemplate } from './knowledge/KnowledgeRAGService';
import { ICPDiscoveryFramework, ICPCharacteristics } from './ICPDiscoveryFramework';
import { supabase } from '@/integrations/supabase/client';

export interface DiscoverySession {
  id: string;
  user_id: string;
  session_type: 'initial_discovery' | 'knowledge_building' | 'document_analysis' | 'competitor_research';
  status: 'in_progress' | 'completed' | 'paused';
  phase: 'introduction' | 'business_discovery' | 'icp_definition' | 'document_collection' | 'knowledge_synthesis' | 'completed';
  session_data: {
    discovered_insights: any[];
    documents_processed: string[];
    knowledge_gaps: string[];
    next_actions: string[];
    session_duration_minutes: number;
    completion_percentage: number;
  };
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DiscoveryPrompt {
  phase: string;
  questions: string[];
  context: string;
  expected_insights: string[];
  follow_up_triggers: string[];
}

export class DiscoveryWorkflowService {
  private static instance: DiscoveryWorkflowService;
  private businessKnowledge: BusinessKnowledgeService;
  private knowledgeRAG: KnowledgeRAGService;

  constructor() {
    this.businessKnowledge = BusinessKnowledgeService.getInstance();
    this.knowledgeRAG = KnowledgeRAGService.getInstance();
  }

  public static getInstance(): DiscoveryWorkflowService {
    if (!DiscoveryWorkflowService.instance) {
      DiscoveryWorkflowService.instance = new DiscoveryWorkflowService();
    }
    return DiscoveryWorkflowService.instance;
  }

  /**
   * Start a new discovery session
   */
  async startDiscoverySession(
    userId: string, 
    sessionType: DiscoverySession['session_type'] = 'initial_discovery'
  ): Promise<DiscoverySession> {
    const session: DiscoverySession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      session_type: sessionType,
      status: 'in_progress',
      phase: 'introduction',
      session_data: {
        discovered_insights: [],
        documents_processed: [],
        knowledge_gaps: [],
        next_actions: [],
        session_duration_minutes: 0,
        completion_percentage: 0
      },
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Store session in business profile's knowledge base
    await this.storeSessionData(userId, session);
    
    console.log(`🚀 Discovery session started: ${session.id}`);
    return session;
  }

  /**
   * Get structured ICP discovery questions based on current phase
   */
  getICPDiscoveryQuestions(phase: string): string[] {
    switch (phase) {
      case 'introduction':
      case 'business_discovery':
        return ICPDiscoveryFramework.getCompanyFoundationQuestions();
      
      case 'icp_definition':
        return [
          ...ICPDiscoveryFramework.getCurrentCustomerQuestions(),
          ...ICPDiscoveryFramework.getPainPointDiscoveryQuestions()
        ];
      
      case 'document_collection':
        return [
          ...ICPDiscoveryFramework.getTechnologyDiscoveryQuestions(),
          ...ICPDiscoveryFramework.getDecisionMakingQuestions()
        ];
      
      case 'knowledge_synthesis':
        return ICPDiscoveryFramework.getDisqualificationQuestions();
      
      default:
        return ICPDiscoveryFramework.getCompanyFoundationQuestions();
    }
  }

  /**
   * Generate follow-up questions based on user responses
   */
  generateFollowUpQuestions(context: string, userResponse: string): string[] {
    return ICPDiscoveryFramework.generateFollowUpQuestions(context, userResponse);
  }

  /**
   * Get ICP framework explanation for users
   */
  getICPFrameworkExplanation(): string {
    return ICPDiscoveryFramework.getICPExplanation();
  }

  /**
   * Generate contextual discovery questions based on current phase and business context
   */
  async generateDiscoveryQuestions(userId: string, currentPhase: string): Promise<DiscoveryPrompt> {
    const businessProfile = await this.businessKnowledge.getBusinessProfile(userId);
    
    const discoveryPrompts: Record<string, DiscoveryPrompt> = {
      introduction: {
        phase: 'introduction',
        context: 'Initial business understanding and trust building',
        questions: [
          "So tell me about your business - what do you do?",
          "What's your role there? What do you spend most of your time on?",
          "What industry are you in, and who are your main customers?",
          "How big is your team/company?",
          "What's the biggest challenge you're dealing with right now?"
        ],
        expected_insights: ['company_name', 'industry', 'company_size', 'target_audience', 'primary_challenges'],
        follow_up_triggers: [
          'company size mentioned → ask about team structure',
          'challenge mentioned → dive deeper into specific pain points',
          'customers mentioned → ask about ideal customer profile'
        ]
      },

      business_discovery: {
        phase: 'business_discovery',
        context: 'Deep dive into business model, customers, and value proposition',
        questions: [
          "Who's your ideal customer? What do they look like?",
          "What makes you different from your competitors?",
          "Walk me through your sales process - how does it work?",
          "How do you find new customers right now?",
          "What's your biggest struggle with sales?",
          "Got any good customer success stories you can share?",
          "What tools are you using for sales and marketing?"
        ],
        expected_insights: ['ideal_customer_profile', 'value_propositions', 'competitors', 'sales_process', 'sales_challenges'],
        follow_up_triggers: [
          'competitors mentioned → ask for specific names and differentiators',
          'tools mentioned → ask about integration needs',
          'success stories → ask for specific metrics and outcomes'
        ]
      },

      icp_definition: {
        phase: 'icp_definition',
        context: 'Precise ideal customer profile definition and targeting criteria',
        questions: [
          "What size companies work best with your solution?",
          "What job titles do you usually end up talking to?",
          "Are there specific industries where you see the most success?",
          "What do your best customers have in common?",
          "What are the red flags that tell you someone's not a good fit?",
          "How do you decide which leads to focus on first?",
          "What questions help you figure out if someone's worth pursuing?"
        ],
        expected_insights: ['ideal_customer_profile', 'target_audience', 'qualification_criteria'],
        follow_up_triggers: [
          'company size range mentioned → ask about revenue criteria',
          'job titles mentioned → ask about reporting structure',
          'disqualifiers mentioned → ask about edge cases'
        ]
      },

      current_state_analysis: {
        phase: 'current_state_analysis',
        context: 'Deep analysis of ideal customer current state, objectives, and pain points - understanding where customers are today',
        questions: [
          "Tell me about your best customers - what are they really trying to achieve? What's driving them?",
          "When your customers are at work every day, what takes up most of their time? What are they constantly focused on?",
          "If your customers could wave a magic wand and have their perfect business situation, what would that look like?",
          "What keeps your customers up at night? What are they struggling with that you help solve?",
          "Before they found you, how were your customers trying to handle these problems?",
          "Did those other approaches actually work for them? Or were they still frustrated?",
          "When customers are evaluating new solutions, what do they say they need it to do differently?",
          "How do your customers actually talk about their problems? What words do they use?"
        ],
        expected_insights: ['customer_objectives', 'customer_focus_areas', 'customer_long_term_desire', 'customer_pain_points', 'alternative_solutions', 'solution_effectiveness', 'improvement_expectations', 'customer_language'],
        follow_up_triggers: [
          'objectives mentioned → dive deeper into success metrics and priorities',
          'focus areas mentioned → understand daily workflows and time allocation',
          'long-term desire mentioned → explore vision and strategic goals',
          'pain points mentioned → explore impact, urgency, and frequency',
          'alternative solutions mentioned → analyze what they\'ve tried and why it failed',
          'customer language mentioned → capture exact terminology and emotional language'
        ]
      },

      problems_and_roadblocks: {
        phase: 'problems_and_roadblocks',
        context: 'Understanding customer objections, barriers, fears, and past negative experiences - anything that prevents ideal customers from getting a job done or done badly',
        questions: [
          "What stops your customers from making decisions? What do they get hung up on?",
          "When your customers are using their current tools or processes, what drives them crazy?",
          "What are your customers worried about when they're considering changing how they do things?",
          "What happens when your customers' current solutions break down or don't work?",
          "Tell me about a time when your customers tried something new and it didn't work out. What went wrong?",
          "What bad experiences have your customers had that make them hesitant to try new vendors?",
          "How do those past disappointments show up when they're evaluating new options?",
          "What would need to be different for them to feel confident about making a change?"
        ],
        expected_insights: ['customer_objections', 'customer_frustrations', 'customer_fears', 'solution_implications', 'past_disappointments', 'past_failures', 'trust_barriers', 'decision_impact'],
        follow_up_triggers: [
          'objections mentioned → explore root causes, frequency, and emotional drivers',
          'frustrations mentioned → quantify impact on productivity and workflow',
          'fears mentioned → understand emotional barriers and risk perceptions',
          'implications mentioned → explore business impact and consequences',
          'past failures mentioned → identify specific vendors, approaches, and lessons learned',
          'trust issues mentioned → explore proof requirements and credibility needs'
        ]
      },

      desired_state: {
        phase: 'desired_state',
        context: 'Understanding what your ideal customer is looking for in a solution, and how a solution could help them achieve their goals and objectives',
        questions: [
          "When your customers are dreaming about how things could be better, what does that look like?",
          "What questions do your customers need answered before they'll move forward with anything?",
          "At the end of the day, what results do your customers actually care about?",
          "If we checked back with your customers in 6 months, how would they know if something was working?",
          "What would your customers say is their ideal situation?",
          "What features absolutely have to be there versus things that would just be nice to have?",
          "How patient are your customers? Do they need to see results right away?",
          "What would make your customers say 'yeah, this is definitely worth paying for'?"
        ],
        expected_insights: ['desired_changes', 'critical_questions', 'expected_results', 'success_metrics', 'perfect_solution', 'essential_features', 'timeline_expectations', 'investment_criteria'],
        follow_up_triggers: [
          'changes mentioned → explore specific improvements and transformations',
          'critical questions mentioned → understand decision-making blockers',
          'results mentioned → quantify specific metrics and timeframes',
          'features mentioned → prioritize must-haves vs nice-to-haves',
          'timeline mentioned → understand urgency and implementation constraints',
          'investment mentioned → explore budget and ROI expectations'
        ]
      },

      value_proposition: {
        phase: 'value_proposition',
        context: 'Understanding your value chain, competitive advantage, customer value perception, and revenue model - the success of your business based on your revenue model',
        questions: [
          "What's the real value you're delivering to customers? Are you saving them time, money, or fixing something that's broken?",
          "How are you different from your competitors? What can you do that they can't?",
          "What do your customers actually say about the value you provide? How do they describe it?",
          "How big do you think your market really is? How many customers could you realistically serve?",
          "How do you make money? One-time payments, monthly subscriptions, or something else?",
          "What kind of margins are you looking for in your business?",
          "How did you decide on your pricing? What makes customers feel good about paying that amount?",
          "Do you offer guarantees or anything to reduce the risk for customers?",
          "Once someone becomes a customer, how do you make more money from them over time?",
          "What's changing in your industry that might create new opportunities?",
          "When your customers have to get approval to buy from you, what do they tell their boss?",
          "How quickly do customers typically see a return on what they spend with you?"
        ],
        expected_insights: ['value_type', 'competitive_advantage', 'customer_value_perception', 'market_potential', 'revenue_model', 'profit_margins', 'pricing_strategy', 'guarantee_policy', 'lifetime_value_strategy', 'industry_trends', 'investment_justification', 'roi_metrics'],
        follow_up_triggers: [
          'value type mentioned → explore specific benefits and quantify impact',
          'competitive advantage mentioned → understand differentiation and positioning',
          'customer perception mentioned → explore feedback and validation',
          'market potential mentioned → analyze addressable market size',
          'revenue model mentioned → understand pricing structure and scalability',
          'pricing mentioned → explore pricing strategy and customer acceptance',
          'lifetime value mentioned → understand retention and expansion strategies',
          'ROI mentioned → capture specific metrics and timeframes'
        ]
      },

      solution_benefits: {
        phase: 'solution_benefits',
        context: 'Understanding what your ideal customer is looking for in a solution, and how your solution could help them achieve their goals and objectives',
        questions: [
          "Thinking about those goals your customers have - how exactly does your solution help them get there?",
          "Which specific problems does your solution fix for customers?",
          "What pain points just go away when customers start using your solution?",
          "Can you tell me about a customer who got exactly what they wanted from working with you?",
          "What kind of improvements do customers actually see? Any numbers you can share?",
          "Remember those roadblocks we talked about - how does your solution help customers get past those?",
          "What stories or examples do you share with prospects to show this stuff actually works?",
          "How long does it take for customers to start seeing results?"
        ],
        expected_insights: ['solution_objectives_mapping', 'problem_solutions', 'pain_relief', 'success_examples', 'measurable_improvements', 'roadblock_solutions', 'proof_points', 'time_to_value'],
        follow_up_triggers: [
          'objectives achieved → connect to specific solution features and outcomes',
          'problems solved → quantify impact, frequency, and business value',
          'pain relief mentioned → explore emotional and practical benefits',
          'success examples mentioned → capture specific metrics and customer stories',
          'roadblocks addressed → understand how solution overcomes barriers',
          'proof points mentioned → collect testimonials, case studies, and data'
        ]
      },

      brand_story: {
        phase: 'brand_story',
        context: 'Understanding your personal and company story, brand personality, and thought leadership positioning - people buy from people who have an interesting story and content',
        questions: [
          "What's your story? Why did you start doing what you do?",
          "What happened in your life that led you to where you are now?",
          "Do people in your industry see you as someone who really knows their stuff? How'd that happen?",
          "If your business was a movie, what movie would it be?",
          "Who do you look up to in business? What do you admire about them?",
          "Besides your product, what else do you bring to the table for your customers?",
          "What's happening in your industry that your customers should know about?",
          "If your company was a car, what would it be? Luxury? Reliable? Fast?",
          "How would your friends describe your personality?",
          "How could you share your knowledge and experience to become known as the expert in your field?"
        ],
        expected_insights: ['company_story', 'personal_journey', 'expert_positioning', 'story_comparison', 'admired_personalities', 'community_value', 'industry_trends', 'brand_personality', 'personality_traits', 'content_strategy', 'thought_leadership'],
        follow_up_triggers: [
          'why story mentioned → explore deeper emotional drivers and mission',
          'journey mentioned → identify key turning points and lessons learned',
          'expertise mentioned → understand credibility markers and proof points',
          'story comparison mentioned → explore narrative frameworks and positioning',
          'admired personalities mentioned → understand aspirational qualities and modeling',
          'community value mentioned → explore unique contributions and differentiation',
          'trends mentioned → explore content opportunities and thought leadership topics',
          'personality mentioned → connect to messaging tone, style, and communication approach',
          'content strategy mentioned → discuss formats, channels, and thought leadership execution'
        ]
      },

      differentiation: {
        phase: 'differentiation',
        context: 'Understanding what your ideal customer is looking for in a solution, and how your solution could help them achieve their goals and objectives - competitive differentiation and expert positioning',
        questions: [
          "Why do customers pick you instead of someone else? What are the main reasons?",
          "How is what you do different from what they were doing before?",
          "What makes you different from your competitors?",
          "What's your secret sauce? What do you have that others don't?",
          "What extra value do customers get from working with you?",
          "What's the big outcome customers get from your relationship with them?",
          "Do your customers see you as THE go-to expert, or just another option?",
          "Do you write articles or share insights about your industry?",
          "What makes people trust that you really know what you're talking about?",
          "How do you stand out in a crowded market?"
        ],
        expected_insights: ['client_selection_reasons', 'solution_differentiation', 'competitive_differentiation', 'unfair_advantage', 'value_positioning', 'customer_outcomes', 'expert_positioning', 'content_authority', 'credibility_markers', 'competitive_strategy'],
        follow_up_triggers: [
          'selection reasons mentioned → explore specific decision factors and criteria',
          'differentiation mentioned → quantify advantages and unique benefits',
          'unfair advantage mentioned → understand sustainability and competitive moats',
          'value positioning mentioned → explore customer perception and pricing power',
          'outcomes mentioned → capture success stories, testimonials, and measurable results',
          'expert positioning mentioned → understand thought leadership and authority building',
          'content authority mentioned → explore publishing strategy and subject matter expertise',
          'credibility mentioned → identify proof points, credentials, and trust signals'
        ]
      },

      value_proposition_synthesis: {
        phase: 'value_proposition_synthesis',
        context: 'Creating a compelling value proposition that sets you apart from your competition - synthesizing all discovery insights into a clear positioning statement',
        questions: [
          "Let's pull this all together. Who exactly are you targeting?",
          "What's the main thing these customers are trying to achieve?",
          "What's stopping them from getting there right now?",
          "How would you describe what you're selling in simple terms?",
          "What's the main benefit customers get from working with you?",
          "Who else are your customers comparing you to?",
          "What makes you the obvious choice over those alternatives?",
          "What absolutely has to be there versus what's just nice to have?"
        ],
        expected_insights: ['target_customer_definition', 'customer_goals_aspirations', 'customer_challenges', 'product_category', 'key_benefits', 'competitive_alternatives', 'differentiation_advantages', 'feature_prioritization', 'value_proposition_statement'],
        follow_up_triggers: [
          'target customers mentioned → validate against previous ICP discussions',
          'goals mentioned → connect to objectives and desired outcomes',
          'challenges mentioned → link to pain points and roadblocks',
          'benefits mentioned → map to solution capabilities',
          'competition mentioned → refine differentiation strategy',
          'differentiation mentioned → strengthen competitive positioning',
          'features mentioned → prioritize development and messaging'
        ]
      },

      emotional_intelligence_discovery: {
        phase: 'emotional_intelligence_discovery',
        context: 'Understanding emotional triggers, pain language, and communication preferences for compelling copywriting',
        questions: [
          "When your prospects talk about their challenges, what exact words and phrases do they use?",
          "How do they express frustration about their current situation? What language shows real pain?",
          "What keeps them up at night? How do they describe the stress or urgency?",
          "When they're ready to buy, how does their language change? What phrases indicate urgency?",
          "What communication style works best with your audience - formal, casual, data-heavy, or story-driven?",
          "How do they prefer to receive information - detailed reports, quick summaries, or visual presentations?",
          "What tone gets their attention versus what immediately turns them off?",
          "Are they analytical types who need data, or relationship-focused people who want to connect first?"
        ],
        expected_insights: ['pain_language_patterns', 'emotional_triggers', 'urgency_indicators', 'buying_signal_language', 'communication_preferences', 'personality_type', 'information_preferences', 'tone_preferences'],
        follow_up_triggers: [
          'pain language mentioned → capture exact phrases and emotional context',
          'communication style mentioned → identify DISC or personality framework alignment',
          'urgency indicators mentioned → understand what creates immediate action',
          'buying signals mentioned → map language to sales cycle stages'
        ]
      },

      competitive_messaging_intelligence: {
        phase: 'competitive_messaging_intelligence',
        context: 'Understanding what messaging works, what fails, and competitive positioning insights',
        questions: [
          "What messages from competitors get responses versus get completely ignored?",
          "What approaches have failed with your audience? What made them tune out immediately?",
          "What subject lines, opening sentences, or calls-to-action have worked best for you?",
          "How do your prospects react to social proof, statistics, or case studies?",
          "What objections come up most often, and what language helps overcome them?",
          "What industry jargon or insider language shows you really 'get' their world?",
          "What buzzwords are overused in your industry and should be avoided?",
          "How do your prospects talk about ROI, success metrics, or business outcomes?"
        ],
        expected_insights: ['effective_messages', 'failed_approaches', 'winning_subject_lines', 'social_proof_preferences', 'common_objections', 'objection_responses', 'industry_language', 'success_metrics_language'],
        follow_up_triggers: [
          'effective messages mentioned → capture specific examples and contexts',
          'failed approaches mentioned → understand what went wrong and why',
          'objections mentioned → map to personality types and stakeholder roles',
          'industry language mentioned → build terminology and jargon database'
        ]
      },

      stakeholder_communication_mapping: {
        phase: 'stakeholder_communication_mapping',
        context: 'Understanding how different buying committee members prefer to be approached and influenced',
        questions: [
          "For each person involved in the buying process, how do they prefer to be approached?",
          "What does the CEO care about versus what the department head focuses on?",
          "Who are the real influencers versus the official decision makers?",
          "What kind of proof or content does each role need to move forward?",
          "How does internal politics affect their decision-making process?",
          "What's the typical approval chain, and who can say no at each stage?",
          "Which stakeholders need consensus versus who can make solo decisions?",
          "How do different personalities in the buying committee communicate and decide?"
        ],
        expected_insights: ['stakeholder_communication_preferences', 'role_based_priorities', 'influencer_mapping', 'proof_requirements_by_role', 'internal_politics', 'approval_process', 'decision_making_styles', 'personality_types_by_role'],
        follow_up_triggers: [
          'communication preferences mentioned → map to DISC or personality frameworks',
          'role priorities mentioned → create persona-specific value propositions',
          'internal politics mentioned → understand coalition building strategies',
          'proof requirements mentioned → develop role-specific content strategies'
        ]
      },

      modern_sales_framework_discovery: {
        phase: 'modern_sales_framework_discovery',
        context: 'Advanced sales methodology insights for AI-era B2B selling',
        questions: [
          "How do you currently qualify prospects? What framework or criteria do you use?",
          "What buying signals or intent data do you track to identify ready prospects?",
          "How do you handle committee-based buying where multiple people are involved?",
          "What's your approach to multi-threading and building relationships across the organization?",
          "How do you leverage social selling and digital touchpoints in your sales process?",
          "What role does customer success and expansion play in your overall revenue strategy?",
          "How do you measure and optimize your sales pipeline velocity?",
          "What technology and tools do you use for sales intelligence and automation?"
        ],
        expected_insights: ['qualification_frameworks', 'intent_signals', 'committee_strategies', 'multi_threading_approach', 'social_selling_methods', 'expansion_strategies', 'pipeline_optimization', 'sales_tech_stack'],
        follow_up_triggers: [
          'qualification mentioned → map to BANT, MEDDIC, SPIN, or custom frameworks',
          'intent signals mentioned → understand data sources and trigger events',
          'committee strategies mentioned → explore stakeholder engagement orchestration',
          'sales tech mentioned → assess integration and automation opportunities'
        ]
      },

      authority_building_discovery: {
        phase: 'authority_building_discovery',
        context: 'Understanding current authority and credibility positioning to support sales efforts',
        questions: [
          "How do prospects currently perceive your expertise when they first hear about you?",
          "What credentials or accomplishments help establish your credibility during sales conversations?",
          "Do prospects typically research you or your company before engaging in sales discussions?",
          "What unique insights or perspectives give you an edge over competitors in sales situations?",
          "How important is thought leadership and industry recognition for your sales process?",
          "What questions do prospects ask that demonstrate the need for more authority-building content?",
          "Are there industry topics where your expertise could differentiate you from competitors?",
          "How does building authority and thought leadership fit into your overall sales strategy?"
        ],
        expected_insights: ['current_authority_perception', 'credibility_factors', 'prospect_research_behavior', 'competitive_advantages', 'authority_importance', 'knowledge_gaps', 'expertise_differentiation', 'authority_sales_integration'],
        follow_up_triggers: [
          'authority perception mentioned → explore ways to strengthen credibility',
          'credibility factors mentioned → understand what establishes trust with prospects',
          'competitive advantages mentioned → identify unique positioning opportunities',
          'knowledge gaps mentioned → uncover content opportunities that support sales'
        ]
      },


      document_collection: {
        phase: 'document_collection',
        context: 'Gathering and analyzing company materials for knowledge base',
        questions: [
          "Do you have a website I can analyze to understand your positioning?",
          "Can you share any sales materials, pitch decks, or case studies?",
          "Do you have competitor analysis or market research documents?",
          "Are there product documentation or feature guides I should review?",
          "Do you have email templates or messaging that works well?",
          "Can you share any customer testimonials or success metrics?",
          "Are there industry reports or whitepapers relevant to your space?"
        ],
        expected_insights: ['website_analysis', 'sales_materials', 'competitive_intelligence', 'messaging_frameworks'],
        follow_up_triggers: [
          'website shared → analyze for value props and positioning',
          'documents shared → extract key insights and frameworks',
          'competitors mentioned → research competitive positioning'
        ]
      },

      knowledge_synthesis: {
        phase: 'knowledge_synthesis',
        context: 'Synthesizing all collected information into actionable insights',
        questions: [
          "Based on everything we've discussed, does this summary of your ICP sound accurate?",
          "Are there any important details about your business I might have missed?",
          "What would success look like for our sales automation efforts?",
          "Are there any specific use cases or scenarios you want to prioritize?",
          "What questions do your prospects typically ask during sales conversations?",
          "How do you handle objections or competitive situations?",
          "What metrics matter most for tracking our success together?"
        ],
        expected_insights: ['success_metrics', 'use_cases', 'objection_handling', 'competitive_strategies'],
        follow_up_triggers: [
          'metrics mentioned → set up tracking and goals',
          'objections mentioned → create response frameworks',
          'use cases mentioned → prioritize automation workflows'
        ]
      }
    };

    let prompt = discoveryPrompts[currentPhase] || discoveryPrompts.introduction;

    // Customize questions based on existing business context
    if (businessProfile) {
      prompt = this.customizeQuestionsForContext(prompt, businessProfile);
    }

    return prompt;
  }

  /**
   * Process user response and extract insights
   */
  async processDiscoveryResponse(
    userId: string,
    userMessage: string,
    currentPhase: string
  ): Promise<{
    extractedInsights: any;
    nextPhase?: string;
    nextQuestions: string[];
    documentsToRequest: string[];
    actionsGenerated: string[];
  }> {
    // Extract business insights from the response
    const currentProfile = await this.businessKnowledge.getBusinessProfile(userId);
    const extractedInsights = this.businessKnowledge.extractBusinessInsights(userMessage, currentProfile || undefined);

    // Save insights to business profile
    if (Object.keys(extractedInsights).length > 0) {
      await this.businessKnowledge.updateBusinessProfile(userId, extractedInsights);
      console.log('💡 Extracted discovery insights:', extractedInsights);
    }

    // Add insights to knowledge base for RAG retrieval
    await this.knowledgeRAG.updateWithConversationInsights(
      [{ role: 'user', content: userMessage }],
      [JSON.stringify(extractedInsights)],
      userId
    );

    // Determine next phase and questions
    const phaseProgression = this.determinePhaseProgression(currentPhase, extractedInsights, userMessage);
    const nextQuestions = await this.generateContextualFollowUps(userId, userMessage, extractedInsights);
    const documentsToRequest = this.identifyDocumentRequests(userMessage, extractedInsights);
    const actionsGenerated = this.generateActionItems(extractedInsights, currentPhase);

    return {
      extractedInsights,
      nextPhase: phaseProgression.nextPhase,
      nextQuestions,
      documentsToRequest,
      actionsGenerated
    };
  }

  /**
   * Process uploaded documents during discovery
   */
  async processDiscoveryDocument(
    userId: string,
    file: File,
    documentContext: string
  ): Promise<{
    documentMetadata: DocumentMetadata;
    extractedInsights: any;
    integratedKnowledge: string[];
  }> {
    // Process document through RAG system
    const documentMetadata = await this.knowledgeRAG.processDocument(file, userId, documentContext);

    // Extract business insights from document content
    const documentInsights = await this.extractBusinessInsightsFromDocument(documentMetadata);

    // Update business profile with document insights
    if (Object.keys(documentInsights).length > 0) {
      await this.businessKnowledge.updateBusinessProfile(userId, documentInsights);
    }

    // Add document to knowledge base category
    await this.businessKnowledge.addToKnowledgeBase(userId, 'documents_analyzed', {
      document_id: documentMetadata.id,
      document_type: documentMetadata.type,
      source: documentMetadata.source,
      insights: documentInsights,
      context: documentContext
    });

    const integratedKnowledge = await this.generateDocumentKnowledgeIntegration(documentMetadata, documentInsights);

    console.log(`📄 Discovery document processed: ${file.name}`);
    return {
      documentMetadata,
      extractedInsights: documentInsights,
      integratedKnowledge
    };
  }

  /**
   * Generate comprehensive discovery session summary and recommendations
   */
  async generateDiscoverySessionSummary(userId: string): Promise<{
    businessProfile: BusinessProfile;
    knowledgeBase: any;
    discoveryCompleteness: number;
    recommendations: string[];
    nextSteps: string[];
    readinessAssessment: {
      prospectingReady: boolean;
      messagingReady: boolean;
      campaignReady: boolean;
      missingElements: string[];
    };
  }> {
    const businessProfile = await this.businessKnowledge.getBusinessProfile(userId);
    if (!businessProfile) {
      throw new Error('No business profile found');
    }

    // Assess discovery completeness
    const completeness = this.assessDiscoveryCompleteness(businessProfile);
    
    // Generate recommendations based on collected knowledge
    const recommendations = this.generateDiscoveryRecommendations(businessProfile, completeness);
    
    // Generate next steps for the user
    const nextSteps = this.generateNextSteps(businessProfile, completeness);
    
    // Assess readiness for different activities
    const readinessAssessment = this.assessActivityReadiness(businessProfile);

    return {
      businessProfile,
      knowledgeBase: businessProfile.knowledge_base,
      discoveryCompleteness: completeness.overallScore,
      recommendations,
      nextSteps,
      readinessAssessment
    };
  }

  // Private helper methods

  private customizeQuestionsForContext(prompt: DiscoveryPrompt, profile: BusinessProfile): DiscoveryPrompt {
    const customizedQuestions = prompt.questions.map(question => {
      // Customize questions based on existing profile data
      if (profile.company_name && question.includes('your business')) {
        return question.replace('your business', `${profile.company_name}`);
      }
      if (profile.industry && question.includes('industry')) {
        return `Given you're in ${profile.industry}, ${question.toLowerCase()}`;
      }
      return question;
    });

    return {
      ...prompt,
      questions: customizedQuestions
    };
  }

  private determinePhaseProgression(
    currentPhase: string,
    extractedInsights: any,
    userMessage: string
  ): { nextPhase?: string; reason: string } {
    const phaseOrder = ['introduction', 'business_discovery', 'icp_definition', 'current_state_analysis', 'problems_and_roadblocks', 'desired_state', 'value_proposition', 'solution_benefits', 'brand_story', 'differentiation', 'value_proposition_synthesis', 'emotional_intelligence_discovery', 'competitive_messaging_intelligence', 'stakeholder_communication_mapping', 'modern_sales_framework_discovery', 'authority_building_discovery', 'document_collection', 'knowledge_synthesis', 'completed'];
    const currentIndex = phaseOrder.indexOf(currentPhase);

    // Check if enough information is gathered for current phase
    const completionCriteria = {
      introduction: () => extractedInsights.company_name || extractedInsights.industry,
      business_discovery: () => extractedInsights.target_audience || extractedInsights.value_propositions,
      icp_definition: () => extractedInsights.ideal_customer_profile || userMessage.toLowerCase().includes('customer profile') || userMessage.toLowerCase().includes('target customer'),
      current_state_analysis: () => extractedInsights.customer_objectives || extractedInsights.customer_pain_points || userMessage.toLowerCase().includes('objective') || userMessage.toLowerCase().includes('pain point'),
      problems_and_roadblocks: () => extractedInsights.customer_objections || extractedInsights.customer_fears || userMessage.toLowerCase().includes('objection') || userMessage.toLowerCase().includes('frustration') || userMessage.toLowerCase().includes('fear'),
      desired_state: () => extractedInsights.desired_changes || extractedInsights.expected_results || userMessage.toLowerCase().includes('expect') || userMessage.toLowerCase().includes('result') || userMessage.toLowerCase().includes('success'),
      value_proposition: () => extractedInsights.value_type || extractedInsights.competitive_advantage || userMessage.toLowerCase().includes('value') || userMessage.toLowerCase().includes('save') || userMessage.toLowerCase().includes('roi'),
      solution_benefits: () => extractedInsights.solution_objectives_mapping || extractedInsights.problem_solutions || userMessage.toLowerCase().includes('benefit') || userMessage.toLowerCase().includes('improve') || userMessage.toLowerCase().includes('achieve'),
      brand_story: () => extractedInsights.company_story || extractedInsights.brand_personality || userMessage.toLowerCase().includes('story') || userMessage.toLowerCase().includes('personality') || userMessage.toLowerCase().includes('thought leader'),
      differentiation: () => extractedInsights.competitive_advantages || extractedInsights.unfair_advantage || userMessage.toLowerCase().includes('different') || userMessage.toLowerCase().includes('advantage') || userMessage.toLowerCase().includes('expert'),
      value_proposition_synthesis: () => extractedInsights.value_proposition_statement || userMessage.toLowerCase().includes('value proposition') || userMessage.toLowerCase().includes('positioning') || userMessage.toLowerCase().includes('target customer'),
      emotional_intelligence_discovery: () => extractedInsights.pain_language_patterns || extractedInsights.communication_preferences || userMessage.toLowerCase().includes('language') || userMessage.toLowerCase().includes('tone') || userMessage.toLowerCase().includes('communication'),
      competitive_messaging_intelligence: () => extractedInsights.effective_messages || extractedInsights.failed_approaches || userMessage.toLowerCase().includes('messaging') || userMessage.toLowerCase().includes('subject line') || userMessage.toLowerCase().includes('objection'),
      stakeholder_communication_mapping: () => extractedInsights.stakeholder_communication_preferences || extractedInsights.role_based_priorities || userMessage.toLowerCase().includes('stakeholder') || userMessage.toLowerCase().includes('decision maker') || userMessage.toLowerCase().includes('buying committee'),
      modern_sales_framework_discovery: () => extractedInsights.qualification_frameworks || extractedInsights.sales_tech_stack || userMessage.toLowerCase().includes('qualify') || userMessage.toLowerCase().includes('framework') || userMessage.toLowerCase().includes('sales process'),
      authority_building_discovery: () => extractedInsights.current_authority_perception || extractedInsights.credibility_factors || userMessage.toLowerCase().includes('authority') || userMessage.toLowerCase().includes('credibility') || userMessage.toLowerCase().includes('expert') || userMessage.toLowerCase().includes('reputation'),
      document_collection: () => userMessage.toLowerCase().includes('website') || userMessage.toLowerCase().includes('document'),
      knowledge_synthesis: () => userMessage.toLowerCase().includes('summary') || userMessage.toLowerCase().includes('accurate')
    };

    const isPhaseComplete = completionCriteria[currentPhase as keyof typeof completionCriteria]?.() || false;

    if (isPhaseComplete && currentIndex < phaseOrder.length - 1) {
      return {
        nextPhase: phaseOrder[currentIndex + 1],
        reason: `Phase ${currentPhase} completed with sufficient insights`
      };
    }

    return { reason: `Continuing ${currentPhase} phase` };
  }

  private async generateContextualFollowUps(
    userId: string,
    userMessage: string,
    extractedInsights: any
  ): Promise<string[]> {
    const followUps: string[] = [];

    // Generate follow-ups based on extracted insights
    if (extractedInsights.company_name) {
      followUps.push(`Tell me more about how ${extractedInsights.company_name} differentiates itself in the market.`);
    }

    if (extractedInsights.industry) {
      followUps.push(`What are the biggest challenges companies in ${extractedInsights.industry} typically face?`);
    }

    if (extractedInsights.target_audience) {
      followUps.push(`When you're targeting ${extractedInsights.target_audience}, what's their biggest pain point?`);
    }

    // Add knowledge-based follow-ups using RAG
    const knowledgeResults = await this.knowledgeRAG.searchKnowledge({
      query: userMessage,
      maxResults: 3,
      relevanceThreshold: 0.4
    });

    if (knowledgeResults.suggestedActions) {
      followUps.push(...knowledgeResults.suggestedActions.map(action => 
        `Based on our knowledge base: ${action}`
      ));
    }

    return followUps.slice(0, 3); // Limit to 3 follow-ups
  }

  private identifyDocumentRequests(userMessage: string, extractedInsights: any): string[] {
    const requests: string[] = [];
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('website') || extractedInsights.website_url) {
      requests.push('website_analysis');
    }

    if (lowerMessage.includes('case study') || lowerMessage.includes('success')) {
      requests.push('case_studies');
    }

    if (lowerMessage.includes('competitor') || lowerMessage.includes('competition')) {
      requests.push('competitive_analysis');
    }

    if (lowerMessage.includes('pitch') || lowerMessage.includes('deck') || lowerMessage.includes('presentation')) {
      requests.push('sales_materials');
    }

    return requests;
  }

  private generateActionItems(extractedInsights: any, currentPhase: string): string[] {
    const actions: string[] = [];

    if (extractedInsights.company_name) {
      actions.push(`Research ${extractedInsights.company_name} for additional context`);
    }

    if (extractedInsights.competitors) {
      actions.push('Analyze competitive landscape and positioning');
    }

    if (extractedInsights.target_audience) {
      actions.push('Create persona profiles for target audience');
    }

    if (currentPhase === 'document_collection') {
      actions.push('Process uploaded documents for insights');
      actions.push('Create messaging frameworks from materials');
    }

    return actions;
  }

  private async extractBusinessInsightsFromDocument(documentMetadata: DocumentMetadata): Promise<any> {
    // Extract insights from document metadata and content
    const insights: any = {};

    if (documentMetadata.extractedData?.entities) {
      insights.entities_mentioned = documentMetadata.extractedData.entities;
    }

    if (documentMetadata.extractedData?.keyPoints) {
      insights.key_value_propositions = documentMetadata.extractedData.keyPoints;
    }

    if (documentMetadata.extractedData?.categories) {
      insights.content_categories = documentMetadata.extractedData.categories;
    }

    return insights;
  }

  private async generateDocumentKnowledgeIntegration(
    documentMetadata: DocumentMetadata,
    documentInsights: any
  ): Promise<string[]> {
    const integrations: string[] = [];

    // Generate knowledge integration points
    if (documentInsights.key_value_propositions) {
      integrations.push('Value propositions extracted and integrated into messaging framework');
    }

    if (documentInsights.entities_mentioned) {
      integrations.push('Key entities identified and added to prospect targeting criteria');
    }

    if (documentMetadata.type === 'website') {
      integrations.push('Website analysis completed - positioning and messaging captured');
    }

    return integrations;
  }

  private assessDiscoveryCompleteness(profile: BusinessProfile): {
    overallScore: number;
    categoryScores: Record<string, number>;
    missingElements: string[];
  } {
    const categories = {
      basic_info: {
        weight: 0.2,
        elements: ['company_name', 'industry', 'company_size'],
        score: 0
      },
      target_market: {
        weight: 0.3,
        elements: ['target_audience', 'ideal_customer_profile'],
        score: 0
      },
      value_proposition: {
        weight: 0.2,
        elements: ['value_propositions', 'competitors'],
        score: 0
      },
      sales_process: {
        weight: 0.2,
        elements: ['current_sales_process', 'sales_challenges'],
        score: 0
      },
      knowledge_base: {
        weight: 0.1,
        elements: ['knowledge_base'],
        score: 0
      }
    };

    const missingElements: string[] = [];
    let totalWeightedScore = 0;

    for (const [categoryName, category] of Object.entries(categories)) {
      let categoryScore = 0;
      for (const element of category.elements) {
        const hasElement = profile[element as keyof BusinessProfile] && 
          (Array.isArray(profile[element as keyof BusinessProfile]) ? 
            (profile[element as keyof BusinessProfile] as any[]).length > 0 : 
            profile[element as keyof BusinessProfile] !== '');
        
        if (hasElement) {
          categoryScore += 1;
        } else {
          missingElements.push(element);
        }
      }
      
      category.score = categoryScore / category.elements.length;
      totalWeightedScore += category.score * category.weight;
    }

    return {
      overallScore: Math.round(totalWeightedScore * 100),
      categoryScores: Object.fromEntries(
        Object.entries(categories).map(([name, cat]) => [name, Math.round(cat.score * 100)])
      ),
      missingElements
    };
  }

  private generateDiscoveryRecommendations(
    profile: BusinessProfile,
    completeness: ReturnType<typeof this.assessDiscoveryCompleteness>
  ): string[] {
    const recommendations: string[] = [];

    if (completeness.categoryScores.basic_info < 80) {
      recommendations.push('Complete basic company information (size, industry details)');
    }

    if (completeness.categoryScores.target_market < 70) {
      recommendations.push('Define ideal customer profile more precisely');
    }

    if (completeness.categoryScores.value_proposition < 60) {
      recommendations.push('Gather sales materials and competitive positioning documents');
    }

    if (completeness.categoryScores.sales_process < 50) {
      recommendations.push('Document current sales process and identify automation opportunities');
    }

    if (completeness.overallScore >= 70) {
      recommendations.push('Ready to begin prospect research and campaign setup');
    }

    return recommendations;
  }

  private generateNextSteps(
    profile: BusinessProfile,
    completeness: ReturnType<typeof this.assessDiscoveryCompleteness>
  ): string[] {
    const nextSteps: string[] = [];

    if (completeness.overallScore < 60) {
      nextSteps.push('Continue discovery conversation to fill knowledge gaps');
      nextSteps.push('Request additional documents and materials');
    } else if (completeness.overallScore < 80) {
      nextSteps.push('Refine ideal customer profile and targeting criteria');
      nextSteps.push('Begin competitive analysis and positioning');
    } else {
      nextSteps.push('Start prospect research and list building');
      nextSteps.push('Create personalized outreach campaigns');
      nextSteps.push('Set up automated follow-up sequences');
    }

    return nextSteps;
  }

  private assessActivityReadiness(profile: BusinessProfile): {
    prospectingReady: boolean;
    messagingReady: boolean;
    campaignReady: boolean;
    missingElements: string[];
  } {
    const hasTargetAudience = profile.target_audience && profile.target_audience !== '';
    const hasValueProp = profile.value_propositions && profile.value_propositions.length > 0;
    const hasICP = profile.ideal_customer_profile && Object.keys(profile.ideal_customer_profile).length > 0;
    const hasIndustry = profile.industry && profile.industry !== '';

    const missingElements: string[] = [];

    if (!hasTargetAudience) missingElements.push('target_audience');
    if (!hasValueProp) missingElements.push('value_propositions');
    if (!hasICP) missingElements.push('ideal_customer_profile');
    if (!hasIndustry) missingElements.push('industry');

    return {
      prospectingReady: hasTargetAudience && hasIndustry,
      messagingReady: hasValueProp && hasTargetAudience,
      campaignReady: hasTargetAudience && hasValueProp && hasICP,
      missingElements
    };
  }

  private async storeSessionData(userId: string, session: DiscoverySession): Promise<void> {
    await this.businessKnowledge.addToKnowledgeBase(userId, 'discovery_sessions', session);
  }
}

export default DiscoveryWorkflowService;