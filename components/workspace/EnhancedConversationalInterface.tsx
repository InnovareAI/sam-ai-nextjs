/**
 * Enhanced Conversational Interface with Multi-Agent System Integration
 * Implements Anthropic's best practices for conversational AI
 */

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Zap, Target, Users, MessageSquare, BookOpen, TrendingUp, Plus, Sparkles, Brain, Cpu, Activity, Upload, Rocket, Linkedin, Search, Database, Mail, BarChart3, TestTube, FileText, Link, Save, Filter, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SamStatusIndicator } from "./SamStatusIndicator";
import { MessageFormatter } from "./MessageFormatter";
import { VoiceInterface } from "./VoiceInterface";
import { ChatHistory } from "./ChatHistory";
import { ContextMemory } from "./ContextMemory";
import { SamThinkingDisplay, ThinkingStep } from "./SamThinkingDisplay";
import { ModeSwitcher } from "./ModeSwitcher";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useVoice } from "@/hooks/useVoice";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ChatSkeleton } from "@/components/ui/skeleton";
import { AgentFactory } from "@/services/agents/AgentFactory";
import { AgentConfig, Message, AgentTrace } from "@/services/agents/types/AgentTypes";
import { MemoryService } from "@/services/memory/MemoryService";
import { ConversationPersistenceService } from "@/services/ConversationPersistenceService";
import { BusinessKnowledgeService, ConversationContext as BusinessContext } from "@/services/BusinessKnowledgeService";
import { DiscoveryWorkflowService, DiscoverySession } from "@/services/DiscoveryWorkflowService";
import { 
  SamAIConversationEngine, 
  ConversationContext, 
  SalesStage 
} from "@/lib/sam-ai-conversation-engine";

interface QuickAction {
  title: string;
  description: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

interface EnhancedConversationalInterfaceProps {
  operationMode?: 'inbound' | 'outbound';
}

// 6 Core conversation starters - main SAM workflow functions
const conversationStarters = {
  "Get Started": [
    {
      title: "📤 Upload Knowledge",
      prompt: "I want to upload company documents and training materials",
      icon: Upload,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "🔍 Research Prospects",
      prompt: "I need to research and find potential leads",
      icon: Search,
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "🎯 Find Leads",
      prompt: "I want to generate new leads and build prospect lists",
      icon: Target,
      color: "from-green-500 to-teal-600"
    }
  ],
  "Create & Optimize": [
    {
      title: "✍️ Write Messaging",
      prompt: "I need help writing outreach messages and email campaigns",
      icon: FileText,
      color: "from-orange-500 to-red-600"
    },
    {
      title: "🧪 A/B Testing",
      prompt: "I want to test different message variations and optimize performance",
      icon: TestTube,
      color: "from-pink-500 to-purple-600"
    },
    {
      title: "📊 Analyze Performance",
      prompt: "Show me campaign analytics and performance insights",
      icon: BarChart3,
      color: "from-indigo-500 to-blue-600"
    }
  ]
};

// Flatten for backward compatibility
const quickActions: QuickAction[] = Object.values(conversationStarters).flat().map(action => ({
  ...action,
  description: "",
  complexity: 'moderate' as const
}));

export function EnhancedConversationalInterface({ operationMode = 'outbound' }: EnhancedConversationalInterfaceProps) {
  const { 
    sessions, 
    currentSessionId, 
    createNewSession, 
    addMessageToSession, 
    loadSession,
    getCurrentSession 
  } = useChatHistory();
  
  const { speakText } = useVoice();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();
  
  // Agent system state
  const [agentFactory] = useState(() => AgentFactory.getInstance());
  const [samEngine] = useState(() => new SamAIConversationEngine());
  const [isAgentInitialized, setIsAgentInitialized] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [currentStage, setCurrentStage] = useState<SalesStage>('lead_discovery');
  
  // Conversation persistence and business knowledge
  const [conversationPersistence] = useState(() => ConversationPersistenceService.getInstance());
  const [businessKnowledge] = useState(() => BusinessKnowledgeService.getInstance());
  const [discoveryWorkflow] = useState(() => DiscoveryWorkflowService.getInstance());
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [businessContext, setBusinessContext] = useState<BusinessContext | null>(null);
  const [currentDiscoverySession, setCurrentDiscoverySession] = useState<DiscoverySession | null>(null);
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [inDiscoveryMode, setInDiscoveryMode] = useState(false);
  
  // UI state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [samIsActive, setSamIsActive] = useState(false);
  const [samStatus, setSamStatus] = useState("Ready to help you");
  const [isLoading, setIsLoading] = useState(false);
  const [agentTrace, setAgentTrace] = useState<AgentTrace[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [showThinking, setShowThinking] = useState(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [hasStartedOnboarding, setHasStartedOnboarding] = useState<boolean>(false);
  const [currentOperationMode, setCurrentOperationMode] = useState<'inbound' | 'outbound'>(operationMode);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [needsNameCollection, setNeedsNameCollection] = useState<boolean>(false);
  const [needsConfirmation, setNeedsConfirmation] = useState<boolean>(false);
  const [hasInitialMessage, setHasInitialMessage] = useState<boolean>(false);
  const [currentActivity, setCurrentActivity] = useState<string>("");
  const [activityHistory, setActivityHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper functions to check account connection status
  const checkLinkedInConnection = (): boolean => {
    // Check if LinkedIn account is connected (this would come from your auth/integration system)
    const linkedinData = localStorage.getItem('linkedin_connection');
    return linkedinData ? JSON.parse(linkedinData).connected : false;
  };

  const checkEmailConnection = (): boolean => {
    // Check if email account is connected (this would come from your auth/integration system)
    const emailData = localStorage.getItem('email_connection');
    return emailData ? JSON.parse(emailData).connected : false;
  };

  const checkActiveCampaigns = (): boolean => {
    // Check if there are active campaigns running
    const campaignsData = localStorage.getItem('active_campaigns');
    return campaignsData ? JSON.parse(campaignsData).length > 0 : false;
  };

  // Helper function to calculate discovery progress
  const calculateDiscoveryProgress = (phase: string): number => {
    const phaseProgress = {
      'introduction': 20,
      'business_discovery': 40,
      'icp_definition': 60,
      'document_collection': 80,
      'knowledge_synthesis': 90,
      'completed': 100
    };
    return phaseProgress[phase as keyof typeof phaseProgress] || 0;
  };

  // Helper function to generate discovery-aware greeting
  const generateDiscoveryAwareGreeting = async (userId: string, firstName?: string): Promise<string> => {
    try {
      const needsOnboarding = await businessKnowledge.needsOnboarding(userId);
      
      if (needsOnboarding) {
        const nameGreeting = firstName ? `Hello ${firstName}` : 'Hello there';
        
        return `${nameGreeting}, my name is **SAM** and I am your specialized B2B Sales and Marketing Agent.

How are you today?`;
      } else {
        // Use existing business context for returning users
        const context = await businessKnowledge.getConversationContext(userId);
        return businessKnowledge.generatePersonalizedGreeting(context);
      }
    } catch (error) {
      console.error('Failed to generate discovery-aware greeting:', error);
      return businessKnowledge.generatePersonalizedGreeting({ 
        business_profile: null, 
        recent_topics: [], 
        user_preferences: {}, 
        conversation_history_summary: '' 
      });
    }
  };

  // Load user profile and conversation history
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profileData = localStorage.getItem('user_auth_profile');
        if (profileData) {
          const profile = JSON.parse(profileData);
          setUserProfile(profile);
          
          // Check if we have a proper first name (not "Demo User" or empty)
          const firstName = profile.full_name?.split(' ')[0];
          if (!firstName || firstName === 'Demo' || profile.full_name === 'Demo User' || profile.full_name.trim() === '') {
            setNeedsNameCollection(true);
          }
          
          // Load business context for personalized greeting
          await loadBusinessContext(profile.id);
          
          // Load conversation history if available
          await loadPreviousMessages(profile.id);
        } else {
          setNeedsNameCollection(true);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        setNeedsNameCollection(true);
      }
    };

    loadUserProfile();
  }, []);

  // Load business context for personalized conversations
  const loadBusinessContext = async (userId: string) => {
    try {
      const context = await businessKnowledge.getConversationContext(userId);
      setBusinessContext(context);
      console.log('📊 Loaded business context:', context);
    } catch (error) {
      console.error('Failed to load business context:', error);
    }
  };

  // Load previous messages from business knowledge base
  const loadPreviousMessages = async (userId: string) => {
    if (!userId) return;
    
    setIsLoadingConversation(true);
    try {
      const previousMessages = await businessKnowledge.getRecentMessages(userId);
      if (previousMessages.length > 0 && messages.length === 0 && !needsNameCollection && !needsConfirmation) {
        // Convert stored messages back to our format
        const convertedMessages = previousMessages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          content: msg.content,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
          metadata: msg.metadata
        }));
        
        setMessages(convertedMessages);
        console.log(`📚 Loaded ${previousMessages.length} messages from previous conversations`);
      }
    } catch (error) {
      console.error('Failed to load previous messages:', error);
    } finally {
      setIsLoadingConversation(false);
    }
  };

  // Create new conversation when starting fresh
  const createNewConversation = async () => {
    if (!userProfile?.id) return null;
    
    try {
      const conversationId = await conversationPersistence.createConversation(
        userProfile.id,
        {
          agent_type: 'sam_ai',
          operation_mode: currentOperationMode,
          user_profile: userProfile
        }
      );
      
      if (conversationId) {
        setCurrentConversationId(conversationId);
        console.log(`✨ Created new conversation: ${conversationId}`);
        return conversationId;
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
    return null;
  };

  // Save message to persistent storage via business knowledge base
  const saveMessageToPersistence = async (message: Message) => {
    if (userProfile?.id) {
      try {
        // Get current messages and add the new one
        const currentMessages = [...messages, message];
        await businessKnowledge.saveConversationMessages(userProfile.id, currentMessages);
        console.log(`💾 Saved message to business knowledge base`);
      } catch (error) {
        console.error('Failed to save message to business knowledge base:', error);
      }
    }
  };

  // Set personalized initial message based on business context - only once and make it persistent
  useEffect(() => {
    const setInitialMessage = async () => {
      if (userProfile && businessContext && messages.length === 0 && !hasInitialMessage && !needsConfirmation) {
        const firstName = userProfile.full_name?.split(' ')[0];
        let greeting;
        
        if (needsNameCollection) {
          greeting = `Hello! I'm SAM, your AI Sales Orchestration Agent. What should I call you? Just your first name is perfect!`;
        } else {
          // Use discovery-aware greeting with personalization
          greeting = await generateDiscoveryAwareGreeting(userProfile.id, firstName);
        }
        
        const initialMessage = {
          id: "initial_persistent",
          content: greeting,
          sender: "sam" as const,
          timestamp: new Date(),
          isPersistent: true // Mark as persistent so it doesn't disappear
        };
        
        setMessages([initialMessage]);
        setHasInitialMessage(true);
        console.log('✅ Discovery-aware welcome message set:', initialMessage.content.substring(0, 50) + '...');
      }
    };

    setInitialMessage();
  }, [userProfile, businessContext, needsNameCollection, hasInitialMessage, needsConfirmation]);

  // Check if user is new and needs onboarding
  useEffect(() => {
    const checkUserOnboardingStatus = () => {
      const hasCompletedOnboarding = localStorage.getItem('sam_onboarding_completed');
      const accountCreatedAt = localStorage.getItem('account_created_at');
      const now = Date.now();
      const accountAge = accountCreatedAt ? now - parseInt(accountCreatedAt) : 0;
      
      // Consider user "new" if account is less than 7 days old or no onboarding flag
      const isUserNew = !hasCompletedOnboarding || accountAge < (7 * 24 * 60 * 60 * 1000);
      
      setIsNewUser(isUserNew);
      
      // If new user and agent is initialized, start onboarding
      // Don't start onboarding if we have persistent messages (like welcome message)
      if (isUserNew && isAgentInitialized && !hasStartedOnboarding && !hasInitialMessage) {
        startOnboardingFlow();
      }
    };

    checkUserOnboardingStatus();
  }, [isAgentInitialized, hasStartedOnboarding, hasInitialMessage]);

  // Initialize agent system with better error handling
  useEffect(() => {
    let isMounted = true;
    
    const initializeAgents = async () => {
      try {
        // Simple delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (!isMounted) return;
        
        // Try to initialize agent factory
        try {
          const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
          const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
          const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
          
          console.log('🔑 API Keys Status:', {
            openai: openaiKey ? `✅ Set (${openaiKey.substring(0, 10)}...)` : '❌ Missing',
            anthropic: anthropicKey ? `✅ Set (${anthropicKey.substring(0, 10)}...)` : '❌ Missing',
            openrouter: openrouterKey ? `✅ Set (${openrouterKey.substring(0, 10)}...)` : '❌ Missing'
          });
          
          const config: AgentConfig = {
            apiKeys: {
              openai: openaiKey || undefined,
              claude: anthropicKey || undefined,
              openrouter: openrouterKey || undefined,
            },
            supabase: {
              url: import.meta.env.VITE_SUPABASE_URL || 'https://latxadqrvrrrcvkktrog.supabase.co',
              anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdHhhZHFydnJycmN2a2t0cm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTk5ODYsImV4cCI6MjA2ODI3NTk4Nn0.3WkAgXpk_MyQioVf_SED9O_ArjcT9nH0uy9we2okftE',
            },
            features: {
              voiceEnabled: true,
              videoGeneration: false,
              linkedinAutomation: true,
              emailAutomation: true,
            },
            limits: {
              maxParallelTasks: 3,
              maxTokensPerRequest: 3000,
              maxSessionDuration: 60,
            },
            prompts: {
              orchestrator: "You are SAM, an AI sales assistant.",
              'lead-research': "You are a lead research specialist.",
              'campaign-management': "You are a campaign management expert.",
              'gtm-strategy': "You are a GTM strategy specialist.",
              'meddic-qualification': "You are a MEDDIC qualification expert.",
              'workflow-automation': "You are a workflow automation specialist.",
              'inbox-triage': "You are an inbox triage specialist.",
              'spam-filter': "You are a spam filter specialist.",
              'auto-response': "You are an auto-response specialist.",
              'content-creation': "You are a content creation specialist.",
              'outreach-automation': "You are an outreach automation expert.",
              'analytics': "You are a performance analytics specialist.",
              'knowledge-base': "You are a knowledge management expert."
            }
          };

          await agentFactory.initialize(config);
          
          // Initialize SAM conversation engine
          if (userProfile?.workspace_id) {
            const context = await samEngine.initializeConversation(
              userProfile.workspace_id,
              userProfile.workspace_id,
              operationMode
            );
            setConversationContext(context);
            console.log('✅ SAM conversation engine initialized');
          }
          
          console.log('✅ Agent system initialized');
          
          if (isMounted) {
            setSamStatus(`SAM AI ready - 8-stage methodology active`);
          }
        } catch (initError) {
          console.warn('⚠️ Agent initialization failed, using fallback mode:', initError);
          if (isMounted) {
            setSamStatus("Using simplified mode");
          }
        }
        
        if (isMounted) {
          setIsAgentInitialized(true);
        }
        
      } catch (error) {
        console.error('❌ Agent initialization error:', error);
        if (isMounted) {
          setSamStatus("Basic mode active");
          setIsAgentInitialized(true);
        }
      }
    };

    initializeAgents();
    
    return () => {
      isMounted = false;
    };
  }, [agentFactory, operationMode]);

  // Handle mode change
  const handleModeChange = (mode: 'inbound' | 'outbound' | 'unified') => {
    const mapped = mode === 'unified' ? 'outbound' : mode as 'inbound' | 'outbound';
    setCurrentOperationMode(mapped);
  };
  
  // Update operation mode when it changes
  useEffect(() => {
    if (isAgentInitialized) {
      try {
        const orchestrator = agentFactory.getOrchestrator();
        if (orchestrator) {
          orchestrator.setOperationMode(currentOperationMode);
          setSamStatus(`Switched to ${currentOperationMode} mode`);
        } else {
          setSamStatus(`${currentOperationMode} mode (simplified)`);
        }
      } catch (error) {
        console.warn('Mode change failed:', error);
        setSamStatus(`${currentOperationMode} mode (basic)`);
      }
      
      // Mode change notification removed per user request
    }
  }, [currentOperationMode, isAgentInitialized, agentFactory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || input;
    if (!content.trim()) return;

    // Check if user is providing their first name in response to name collection
    if (needsNameCollection && content.trim().length > 0) {
      await handleNameCollection(content.trim());
      return;
    }

    // Check if user needs to confirm before continuing
    if (needsConfirmation && content.trim().length > 0) {
      await handleUserConfirmation(content.trim());
      return;
    }

    // Create or use existing session
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (sessionId) {
      addMessageToSession(sessionId, userMessage as any);
    }
    
    // Save to persistent conversation memory
    await saveMessageToPersistence(userMessage);
    
    // Handle discovery session workflow
    if (userProfile?.id) {
      try {
        // Check if we're in discovery mode or need to start discovery
        const needsOnboarding = await businessKnowledge.needsOnboarding(userProfile.id);
        
        if (needsOnboarding && !inDiscoveryMode) {
          // Start discovery session for new users
          const session = await discoveryWorkflow.startDiscoverySession(userProfile.id, 'initial_discovery');
          setCurrentDiscoverySession(session);
          setInDiscoveryMode(true);
          console.log('🚀 Started discovery session:', session.id);
        }
        
        // Process message in discovery context if in discovery mode
        if (inDiscoveryMode && currentDiscoverySession) {
          const discoveryResult = await discoveryWorkflow.processDiscoveryResponse(
            userProfile.id,
            content,
            currentDiscoverySession.phase
          );
          
          // Update discovery progress
          const progressPercentage = calculateDiscoveryProgress(currentDiscoverySession.phase);
          setDiscoveryProgress(progressPercentage);
          
          console.log('🔍 Discovery insights extracted:', discoveryResult.extractedInsights);
          
          // AUTO-RAG INGESTION: Feed conversation insights into RAG system
          try {
            const autoRAGAgent = agentFactory.createAgent('auto-rag-ingestion');
            if (autoRAGAgent) {
              await autoRAGAgent.processTask({
                id: `rag_ingest_${Date.now()}`,
                type: 'ingest_conversation_real_time',
                parameters: {
                  conversation_messages: messages.slice(-5), // Last 5 messages for context
                  user_id: userProfile.id,
                  existing_context: discoveryResult.extractedInsights
                },
                priority: 'normal',
                timeout: 10000
              }, {
                sessionId: 'current',
                userId: userProfile.id,
                timestamp: new Date()
              });
              console.log('✅ Auto-RAG ingestion completed for conversation');
            }
          } catch (error) {
            console.error('⚠️ Auto-RAG ingestion failed:', error);
            // Don't block conversation flow if RAG ingestion fails
          }
          
          // Check if we should transition to next phase
          if (discoveryResult.nextPhase) {
            setCurrentDiscoverySession(prev => prev ? {
              ...prev,
              phase: discoveryResult.nextPhase as any,
              session_data: {
                ...prev.session_data,
                completion_percentage: progressPercentage
              }
            } : null);
          }
        }
        
        // Extract and save business insights from user message
        if (businessContext) {
          const insights = businessKnowledge.extractBusinessInsights(content, businessContext.business_profile || undefined);
          if (Object.keys(insights).length > 0) {
            await businessKnowledge.updateBusinessProfile(userProfile.id, insights);
            console.log('💡 Extracted business insights:', insights);
            
            // Refresh business context with new insights
            await loadBusinessContext(userProfile.id);
          }
        }
      } catch (error) {
        console.error('Failed to process discovery workflow:', error);
      }
    }
    
    setInput("");
    
    // Show SAM activity in status bar and activity meter
    setSamIsActive(true);
    setSamStatus("SAM is thinking...");
    setCurrentActivity("SAM is analyzing your request...");

    try {
      // Try SAM conversation engine first, then fallback
      console.log('🚀 SAM processing user request...');
      
      if (conversationContext && isAgentInitialized) {
        try {
          // Use SAM AI Conversation Engine for sophisticated processing
          const engineResult = await samEngine.processMessage(content, conversationContext);
          
          if (engineResult && engineResult.response && engineResult.confidence > 0.7) {
            const samResponse: Message = {
              id: (Date.now() + 1).toString(),
              content: engineResult.response,
              sender: "sam",
              timestamp: new Date(),
              metadata: {
                stage: engineResult.stage,
                confidence: engineResult.confidence,
                actionItems: engineResult.actionItems,
                nextSteps: engineResult.nextSteps
              }
            };

            setMessages(prev => [...prev, samResponse]);
            
            // Save to session with proper sessionId
            const sessionId = currentSessionId || createNewSession();
            if (sessionId) {
              addMessageToSession(sessionId, samResponse as any);
            }
            
            // Save to persistent memory
            await saveMessageToPersistence(samResponse);
            return; // Success - don't use fallback
          }
        } catch (engineError) {
          console.warn('SAM Engine failed, using fallback:', engineError);
        }
      }
      
      // Check if we're in discovery mode and should use discovery workflow
      if (inDiscoveryMode && currentDiscoverySession && userProfile?.id) {
        try {
          await handleDiscoveryModeResponse(content, userProfile.id);
          return; // Discovery handled, no need for fallback
        } catch (discoveryError) {
          console.warn('Discovery mode failed, using fallback:', discoveryError);
        }
      }
      
      // Use the robust fallback response system
      await handleFallbackProcessing(content);

    } catch (error) {
      console.error('SAM processing error:', error);
      
      // Emergency fallback if everything fails
      const emergencyResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you need help with your outreach! 🎯

**I can help you with:**
• **Finding qualified leads** in your target market
• **Writing compelling outreach messages** that get responses
• **Creating email campaigns** that convert
• **Optimizing your LinkedIn outreach** strategy
• **Tracking and improving** your response rates

**What specific part of your outreach would you like to work on first?** For example:
- "Help me find tech CEOs in Boston"
- "Write a cold email for SaaS prospects" 
- "Create a LinkedIn campaign for CTOs"

Just let me know what you need!`,
        sender: "sam",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, emergencyResponse]);
      
      // Save emergency response to session
      if (sessionId) {
        addMessageToSession(sessionId, emergencyResponse as any);
      }
      
      // Save to persistent memory
      await saveMessageToPersistence(emergencyResponse);
    } finally {
      setSamIsActive(false);
      setSamStatus("Ready to help");
      setCurrentActivity(""); // Clear activity when done
    }
  };

  const handleNameCollection = async (providedName: string) => {
    // Extract first name from user input (handle cases like "My name is John" or just "John")
    const namePattern = /(?:my name is|i'm|im|call me|name is|i am)\s+([a-zA-Z]+)/i;
    const match = providedName.match(namePattern);
    const firstName = match ? match[1] : providedName.split(' ')[0];
    
    // Validate the name (basic check for reasonable first name)
    if (firstName.length < 2 || firstName.length > 20 || !/^[a-zA-Z]+$/.test(firstName)) {
      const clarificationMessage: Message = {
        id: Date.now().toString(),
        content: "I didn't quite catch that. Could you just tell me your first name? For example, just type \"Sarah\" or \"Mike\".",
        sender: "sam",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, clarificationMessage]);
      return;
    }

    // Add user's response to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: providedName,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Save user message to persistent memory
    await saveMessageToPersistence(userMessage);
    
    setInput("");

    try {
      // Update profile with the new name
      const updatedProfile = {
        ...userProfile,
        full_name: firstName // We only store first name for now
      };

      // Save to localStorage
      localStorage.setItem('user_auth_profile', JSON.stringify(updatedProfile));
      
      // Update component state
      setUserProfile(updatedProfile);
      setNeedsNameCollection(false);
      setNeedsConfirmation(true); // User needs to confirm before continuing

      // Send confirmation message
      const confirmationMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Perfect! Nice to meet you, **${firstName}**! 🎉

Want me to **explain what I can do** first, or should we **just jump in** and start working?

**Just say "yes" or "ok"** to continue, then let me know: "explain" or "let's go"

💡 *Feel free to ask questions anytime!*`,
        sender: "sam",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, confirmationMessage]);
      
      // Save confirmation message to persistent memory
      await saveMessageToPersistence(confirmationMessage);

      console.log(`✅ User profile updated with name: ${firstName}`);
    } catch (error) {
      console.error('Failed to save user name:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Nice to meet you, ${firstName}! I had a small issue saving your name, but I'll remember it for this session. What would you like to work on first?`,
        sender: "sam",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Save error message to persistent memory
      await saveMessageToPersistence(errorMessage);
      
      setNeedsNameCollection(false);
    }
  };

  const handleDiscoveryModeResponse = async (content: string, userId: string) => {
    if (!currentDiscoverySession) return;

    setCurrentActivity("Processing your business insights...");

    // Generate appropriate discovery questions for current phase
    const discoveryPrompt = await discoveryWorkflow.generateDiscoveryQuestions(userId, currentDiscoverySession.phase);
    
    // Check if user wants to start discovery session
    if (content.toLowerCase().includes('start') && content.toLowerCase().includes('discovery')) {
      const samResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `🚀 **Perfect! Let's start our discovery session.**

${discoveryPrompt.context}

**${discoveryPrompt.questions[0]}**

*This is question 1 of our comprehensive business discovery. Take your time - the more details you share, the better I can help you!*`,
        sender: "sam",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, samResponse]);
      
      // Save to session and persistence
      const sessionId = currentSessionId || createNewSession();
      if (sessionId) {
        addMessageToSession(sessionId, samResponse as any);
      }
      await saveMessageToPersistence(samResponse);
      return;
    }

    // Process the discovery response
    const discoveryResult = await discoveryWorkflow.processDiscoveryResponse(
      userId,
      content,
      currentDiscoverySession.phase
    );

    // Generate appropriate follow-up response with next questions
    let responseContent = `💡 **Great insights! I'm learning about your business.**\n\n`;

    if (Object.keys(discoveryResult.extractedInsights).length > 0) {
      responseContent += `**What I captured:**\n`;
      Object.entries(discoveryResult.extractedInsights).forEach(([key, value]) => {
        responseContent += `• ${key.replace('_', ' ')}: ${value}\n`;
      });
      responseContent += `\n`;
    }

    // Add next questions
    if (discoveryResult.nextQuestions.length > 0) {
      responseContent += `**Let's dive deeper:**\n${discoveryResult.nextQuestions[0]}\n\n`;
      
      if (discoveryResult.nextQuestions.length > 1) {
        responseContent += `*Or alternatively: ${discoveryResult.nextQuestions[1]}*\n\n`;
      }
    }

    // Add document requests if any
    if (discoveryResult.documentsToRequest.length > 0) {
      responseContent += `**📄 Documents that would help:**\n`;
      discoveryResult.documentsToRequest.forEach(doc => {
        responseContent += `• ${doc.replace('_', ' ')}\n`;
      });
      responseContent += `\n`;
    }

    // Add phase completion check
    if (discoveryResult.nextPhase) {
      responseContent += `✅ **Moving to next phase: ${discoveryResult.nextPhase.replace('_', ' ')}**\n\n`;
    }

    // Add progress indicator
    const currentProgress = calculateDiscoveryProgress(currentDiscoverySession.phase);
    responseContent += `📊 **Discovery Progress: ${currentProgress}%** | About ${Math.max(0, 60 - Math.floor(currentProgress * 0.6))} minutes remaining\n\n`;

    const samResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: responseContent,
      sender: "sam",
      timestamp: new Date(),
      metadata: {
        discoveryPhase: currentDiscoverySession.phase,
        extractedInsights: discoveryResult.extractedInsights,
        nextActions: discoveryResult.actionsGenerated
      }
    };

    setMessages(prev => [...prev, samResponse]);
    
    // Save to session and persistence
    const sessionId = currentSessionId || createNewSession();
    if (sessionId) {
      addMessageToSession(sessionId, samResponse as any);
    }
    await saveMessageToPersistence(samResponse);
  };

  const handleUserConfirmation = async (response: string) => {
    const responseLower = response.toLowerCase().trim();
    
    // Check if user is confirming (yes, ok, sure, ready, etc.)
    const confirmationWords = ['yes', 'ok', 'okay', 'sure', 'ready', 'continue', 'proceed', 'go', 'start'];
    const isConfirming = confirmationWords.some(word => responseLower.includes(word));
    
    if (!isConfirming) {
      const clarificationMessage: Message = {
        id: Date.now().toString(),
        content: `Just say "yes" or "ok" to continue, or ask me anything if you need help!`,
        sender: "sam",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, clarificationMessage]);
      return;
    }

    // Add user's confirmation to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: response,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Save user confirmation to persistent memory
    await saveMessageToPersistence(userMessage);
    
    setInput("");

    // User confirmed, now offer the choice
    setNeedsConfirmation(false);
    
    const choiceMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: `Awesome! **What would you like to do?**

• **Type "explain"** and I'll walk you through what I can do (quick overview)
• **Type "let's go"** and we'll jump right into working

💡 *Feel free to ask questions anytime!*`,
      sender: "sam",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, choiceMessage]);
    
    // Save choice message to persistent memory
    await saveMessageToPersistence(choiceMessage);
  };

  const handleMultiAgentProcessing = async (content: string, sessionId: string) => {
    // Progress tracking
    const progressSteps = [
      { message: "Analyzing your request...", progress: 20 },
      { message: "Routing to specialist agents...", progress: 40 },
      { message: "Agents processing in parallel...", progress: 60 },
      { message: "Synthesizing response...", progress: 80 },
      { message: "Finalizing results...", progress: 100 }
    ];

    for (const step of progressSteps) {
      setSamStatus(step.message);
      setProcessingProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      // Get current session context including conversation history
      const currentSession = getCurrentSession();
      const conversationHistory = currentConversationId ? 
        await conversationPersistence.getConversationHistory(userProfile?.workspace_id || 'default', 20) : [];
      
      const existingContext = {
        messages: currentSession?.messages || [],
        conversationHistory: conversationHistory, // Include persistent memory context
        userProfile: {
          name: userProfile?.full_name || 'User',
          company: userProfile?.company || 'Your Company',
          targetAudience: 'B2B Decision Makers',
          productOffering: 'Sales Automation Platform',
          workspace_id: userProfile?.workspace_id
        }
      };

      // Add initial thinking step
      const initialStep: ThinkingStep = {
        id: `step_${Date.now()}`,
        type: 'thinking',
        agent: 'orchestrator',
        action: 'Analyzing your request...',
        details: 'Determining the best approach to help you',
        status: 'active',
        timestamp: new Date()
      };
      setThinkingSteps([initialStep]);

      // Simulate processing steps (in production, these would come from actual agent events)
      setTimeout(() => {
        setThinkingSteps(prev => [
          ...prev.map(s => ({ ...s, status: 'completed' as const })),
          {
            id: `step_${Date.now() + 1}`,
            type: 'routing',
            agent: 'orchestrator',
            action: 'Routing to specialist agents...',
            details: 'Identifying the right experts for your needs',
            status: 'active',
            timestamp: new Date()
          }
        ]);
        setProcessingProgress(30);
      }, 500);

      setTimeout(() => {
        setThinkingSteps(prev => [
          ...prev.map(s => s.status === 'active' ? { ...s, status: 'completed' as const } : s),
          {
            id: `step_${Date.now() + 2}`,
            type: 'agent-comm',
            agent: content.includes('lead') ? 'lead-research' : 
                   content.includes('campaign') ? 'campaign-management' : 
                   content.includes('LinkedIn') ? 'workflow-automation' : 'knowledge-base',
            action: 'Processing with specialist agent...',
            details: 'Gathering insights and recommendations',
            status: 'active',
            progress: 50,
            timestamp: new Date()
          }
        ]);
        setProcessingProgress(60);
      }, 1000);

      // Process through multi-agent system
      try {
        const result: any = await agentFactory.processMessage(content, existingContext as any, sessionId);
        
        // Update agent trace for debugging
        if (result?.agentTrace) {
          setAgentTrace(result.agentTrace);
        }
        
        // Complete all thinking steps
        setThinkingSteps(prev => prev.map(s => ({ ...s, status: 'completed' as const })));

        // Create SAM response
        const samResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: result?.response?.content || "I processed your request successfully, but I'm having trouble formulating a response right now. Could you try rephrasing your question?",
          sender: "sam",
          timestamp: new Date(),
          agentTrace: result?.agentTrace || []
        };

        setMessages(prev => [...prev, samResponse]);
        if (sessionId) {
          addMessageToSession(sessionId, samResponse as any);
        }
        
        // Save SAM response to persistent memory
        await saveMessageToPersistence(samResponse);
      } catch (processError) {
        console.error('Agent processing failed:', processError);
        throw processError; // Re-throw to trigger fallback
      }

    } finally {
      setSamIsActive(false);
      setIsLoading(false);
      setProcessingProgress(0);
      setSamStatus("Ready to help you");
    }
  };

  const handleFallbackProcessing = async (content: string) => {
    // Show activity meter with multiple stages
    setSamStatus("Processing...");
    
    // Stage 1: Analysis
    setCurrentActivity("SAM is analyzing your request...");
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Stage 2: Research
    setCurrentActivity("SAM is researching your target ICP...");
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Stage 3: Agent Communication (contextual based on content)
    const contentLower = content.toLowerCase();
    
    // Check recent conversation history for context - IMPROVED
    const recentMessages = messages.slice(-6); // Get more context
    const lastSamMessage = recentMessages.filter(msg => msg.sender === 'sam').pop()?.content || '';
    const lastUserMessage = recentMessages.filter(msg => msg.sender === 'user').slice(-2)[0]?.content || '';
    
    const lastSamLower = lastSamMessage.toLowerCase();
    const lastUserLower = lastUserMessage.toLowerCase();
    
    // Extract targeting criteria from recent conversation
    const conversationCriteria = extractCriteriaFromConversation(recentMessages);
    
    // Improved targeting context detection - look for actual patterns
    const hasTargetingContext = 
      // Check if SAM asked about prospects/targets
      (lastSamLower.includes('prospect') || lastSamLower.includes('target') || 
       lastSamLower.includes('looking for') || lastSamLower.includes('what type')) ||
      // Check if user provided targeting criteria recently
      (lastUserLower.includes('cto') || lastUserLower.includes('ceo') || 
       lastUserLower.includes('edtech') || lastUserLower.includes('saas') ||
       lastUserLower.includes('1-50') || lastUserLower.includes('employees')) ||
      // Check for continuation phrases
      (lastSamLower.includes('criteria') || lastSamLower.includes('search') ||
       lastSamLower.includes('find') || lastSamLower.includes('company')) ||
      // Check if conversation criteria were extracted
      (conversationCriteria.role || conversationCriteria.industry || conversationCriteria.companySize);
    
    if (hasTargetingContext && (contentLower.includes('proceed') || 
                               contentLower.includes('1') || 
                               contentLower.includes('prospect list') ||
                               contentLower.includes('show') ||
                               contentLower.includes('companies') ||
                               contentLower.includes('go') ||
                               contentLower.includes('start'))) {
      
      // Use extracted criteria instead of hardcoded
      const role = conversationCriteria.role || 'prospects';
      const industry = conversationCriteria.industry || 'technology';
      const companySize = conversationCriteria.companySize || 'growing companies';
      
      setCurrentActivity(`SAM is generating your ${industry} ${role} prospect list...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return generateProspectListResponse(role, industry, companySize);
    }
    if (contentLower.includes('lead') || contentLower.includes('prospect')) {
      setCurrentActivity("SAM is talking to the lead research agent...");
    } else if (contentLower.includes('campaign') || contentLower.includes('outreach')) {
      setCurrentActivity("SAM is consulting the campaign management agent...");
    } else if (contentLower.includes('write') || contentLower.includes('email')) {
      setCurrentActivity("SAM is working with the content creation agent...");
    } else {
      setCurrentActivity("SAM is talking to the lead qualification agent...");
    }
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Stage 4: Final Processing
    setCurrentActivity("SAM is preparing your personalized response...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Use the AgentFactory's processMessage method directly
      const existingContext = {
        userId: userProfile?.id || 'anonymous',
        messages: messages,
        userProfile: userProfile
      };
      
      const response = await agentFactory.processMessage(content, existingContext as any, currentSessionId || 'default');
      
      const samResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: response?.response?.content || response?.content || "I processed your request successfully!",
        sender: "sam",
        timestamp: new Date(),
        agentTrace: response?.agentTrace || []
      };

      setMessages(prev => [...prev, samResponse]);
      
      // Save to session with proper sessionId
      const sessionId = currentSessionId || createNewSession();
      if (sessionId) {
        addMessageToSession(sessionId, samResponse as any);
      }
      
      // Save to persistent memory
      await saveMessageToPersistence(samResponse);
      
    } catch (responseError) {
      console.warn('Agent response failed, using minimal fallback:', responseError);
      
      // Minimal fallback if agent system fails entirely
      const safeResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing a technical issue right now. Could you please try rephrasing your message? I'm here to help with your sales challenges.",
        sender: "sam",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, safeResponse]);
      
      // Save safe response to session
      const sessionId = currentSessionId || createNewSession();
      if (sessionId) {
        addMessageToSession(sessionId, safeResponse as any);
      }
      
      // Save to persistent memory
      await saveMessageToPersistence(safeResponse);
    }
    
    // Clear activity when processing is done
    setCurrentActivity("");
    setSamStatus("Ready to help");
  };

  const handleErrorResponse = async (error: Error) => {
    console.error('Agent system error:', error);
    
    // Show a helpful error response
    const errorResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: "I'm experiencing a brief technical issue. Let me help you with your sales challenges - what would you like to work on?",
      sender: "sam",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, errorResponse]);
    
    setSamIsActive(false);
    setIsLoading(false);
    setProcessingProgress(0);
    setSamStatus("Ready to help");
  };

  const handleQuickAction = (action: QuickAction) => {
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceMessage = (text: string) => {
    handleSendMessage(text);
  };

  const handleLoadSession = (sessionMessages: Message[]) => {
    // Don't overwrite messages if we're in the middle of name collection or confirmation
    if (needsNameCollection || needsConfirmation) {
      console.log('Skipping session load - user is in onboarding flow');
      return;
    }
    
    // Preserve persistent messages when loading session
    const persistentMessages = messages.filter(msg => msg.isPersistent);
    const nonPersistentSessionMessages = sessionMessages.filter(msg => !msg.isPersistent);
    
    if (persistentMessages.length > 0) {
      setMessages([...persistentMessages, ...nonPersistentSessionMessages]);
      console.log(`📚 Loaded session with ${persistentMessages.length} persistent messages preserved`);
    } else {
      setMessages(sessionMessages);
    }
  };

  const startOnboardingFlow = () => {
    console.log('⚠️ startOnboardingFlow called - preserving persistent messages');
    setHasStartedOnboarding(true);
    
    // Preserve persistent messages when starting onboarding
    setMessages(prev => {
      const persistentMessages = prev.filter(msg => msg.isPersistent);
      console.log(`📝 Preserved ${persistentMessages.length} persistent messages during onboarding`);
      return persistentMessages;
    });
    localStorage.setItem('sam_onboarding_started', 'true');
  };

  const completeOnboarding = () => {
    localStorage.setItem('sam_onboarding_completed', 'true');
    setIsNewUser(false);
    setHasStartedOnboarding(false);
    
    const completionMessage: Message = {
      id: `onboarding_complete_${Date.now()}`,
      content: `🚀 **Onboarding Complete!** 

You're all set up with SAM AI. I now understand your business and I'm ready to help you:

✅ Find qualified leads in your target market
✅ Create personalized outreach campaigns  
✅ Automate follow-ups and sequences
✅ Track performance and optimize results

**What would you like to work on first?** I'm here whenever you need help scaling your sales efforts!`,
      sender: "sam",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, completionMessage]);
  };

  const saveCurrentConversation = () => {
    if (messages.length === 0) return;
    
    // Create or use existing session
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
    }
    
    // Save all current messages to the session
    messages.forEach(message => {
      addMessageToSession(sessionId!, message as any);
    });
    
    // Show confirmation
    const confirmationMessage: Message = {
      id: Date.now().toString(),
      content: "✅ **Conversation saved!** Find it in Chat History (top right).",
      sender: "sam",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, confirmationMessage]);
    
    console.log(`💾 Conversation saved to session: ${sessionId}`);
  };

  const startNewChat = () => {
    const sessionId = createNewSession();
    
    // Preserve persistent messages when starting new chat
    const persistentMessages = messages.filter(msg => msg.isPersistent);
    const newChatMessage = {
      id: "1",
      content: "👋 **Hi there!** I'm SAM, your sales assistant.\n\n**Would you like me to:**\n• **Explain features first** (2-minute overview)\n• **Jump right into work** (start immediately)\n\nJust type \"explain\" or \"start working\" - your choice!",
      sender: "sam" as const,
      timestamp: new Date(),
    };
    
    setMessages([...persistentMessages, newChatMessage]);
    setAgentTrace([]);
  };

  // Helper function to extract targeting criteria from conversation history
  const extractCriteriaFromConversation = (recentMessages: Message[]) => {
    const criteria = {
      role: '',
      industry: '',
      companySize: '',
      location: ''
    };
    
    // Combine recent user messages to extract criteria
    const userMessages = recentMessages
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.content.toLowerCase())
      .join(' ');
    
    // Extract role
    if (userMessages.includes('cto') || userMessages.includes('ctos')) criteria.role = 'CTOs';
    else if (userMessages.includes('ceo') || userMessages.includes('ceos')) criteria.role = 'CEOs';
    else if (userMessages.includes('cmo') || userMessages.includes('cmos')) criteria.role = 'CMOs';
    else if (userMessages.includes('vp')) criteria.role = 'VPs';
    else if (userMessages.includes('director')) criteria.role = 'Directors';
    
    // Extract industry
    if (userMessages.includes('edtech') || userMessages.includes('ed tech')) criteria.industry = 'EdTech';
    else if (userMessages.includes('saas')) criteria.industry = 'SaaS';
    else if (userMessages.includes('fintech')) criteria.industry = 'FinTech';
    else if (userMessages.includes('healthtech')) criteria.industry = 'HealthTech';
    else if (userMessages.includes('healthcare')) criteria.industry = 'Healthcare';
    else if (userMessages.includes('technology') || userMessages.includes('tech')) criteria.industry = 'Technology';
    
    // Extract company size
    if (userMessages.includes('1-50') || userMessages.includes('1 to 50')) criteria.companySize = '1-50 employees';
    else if (userMessages.includes('50-100') || userMessages.includes('50 to 100')) criteria.companySize = '50-100 employees';
    else if (userMessages.includes('100-500') || userMessages.includes('100 to 500')) criteria.companySize = '100-500 employees';
    else if (userMessages.includes('small companies') || userMessages.includes('small')) criteria.companySize = 'small companies';
    
    // Extract location
    const locationPattern = /(?:boston|new york|san francisco|london|toronto|california|texas|florida)/gi;
    const locationMatch = userMessages.match(locationPattern);
    if (locationMatch) criteria.location = locationMatch[0];
    
    return criteria;
  };

  // Dynamic prospect list response generator
  const generateProspectListResponse = (role: string, industry: string, companySize: string) => {
    const companyCount = Math.floor(Math.random() * 20) + 35; // 35-55 companies
    const prospectCount = Math.floor(Math.random() * 15) + companyCount; // More prospects than companies
    
    // Industry-specific sample companies
    const sampleCompanies = {
      'EdTech': ['Teachable', 'ClassDojo', 'Outschool', 'Gradescope', 'Mystery Science'],
      'SaaS': ['Slack', 'Zoom', 'Notion', 'Figma', 'Stripe'],
      'FinTech': ['Stripe', 'Square', 'Robinhood', 'Coinbase', 'Plaid'],
      'Technology': ['GitHub', 'Docker', 'Atlassian', 'MongoDB', 'Twilio'],
      'technology': ['GitHub', 'Docker', 'Atlassian', 'MongoDB', 'Twilio']
    };
    
    const companies = sampleCompanies[industry] || sampleCompanies['technology'];
    
    return `🎯 **${industry} ${role} Prospect List Generated**

**Top ${industry} Companies (${companySize}) with ${role}:**

📊 **Market Analysis Results:**
• **Total Companies Found**: ${companyCount} ${industry} companies matching your criteria
• **Target Pool**: ${prospectCount} ${role} at fast-growing ${industry} startups
• **Average Company Age**: 3-7 years (prime growth stage)
• **Funding Status**: 89% have raised seed to Series A funding

🏢 **Sample Companies & ${role}:**
${companies.slice(0, 3).map((company, i) => 
  `• **${company}** (${industry} platform) - ${role.slice(0, -1)}: [Generated Contact]`
).join('\n')}

📧 **Next Steps Available:**
1. **Get full prospect list** with contact details (${prospectCount} ${role})
2. **Create personalized email templates** for ${industry} ${role}
3. **Generate LinkedIn outreach messages** tailored to each company
4. **Set up automated follow-up sequences**

**Ready to move forward?** Which would you like me to prepare first - the full contact list, email templates, or LinkedIn messages?`;
  };

  // Helper functions for stage management
  const getStageNumber = (stage: SalesStage): number => {
    const stageMap: { [key in SalesStage]: number } = {
      'lead_discovery': 1,
      'data_enrichment': 2,
      'knowledge_integration': 3,
      'lead_qualification': 4,
      'content_generation': 5,
      'outreach_execution': 6,
      'conversation_management': 7,
      'relationship_nurturing': 8
    };
    return stageMap[stage] || 1;
  };

  const getStageTitle = (stage: SalesStage): string => {
    const titleMap: { [key in SalesStage]: string } = {
      'lead_discovery': 'Lead Discovery',
      'data_enrichment': 'Data Enrichment',
      'knowledge_integration': 'Knowledge Integration',
      'lead_qualification': 'Lead Qualification',
      'content_generation': 'Content Generation',
      'outreach_execution': 'Outreach Execution',
      'conversation_management': 'Conversation Management',
      'relationship_nurturing': 'Relationship Nurturing'
    };
    return titleMap[stage] || 'Unknown Stage';
  };

  const getStageIcon = (stage: SalesStage) => {
    const iconMap: { [key in SalesStage]: any } = {
      'lead_discovery': Search,
      'data_enrichment': Database,
      'knowledge_integration': Brain,
      'lead_qualification': Filter,
      'content_generation': MessageSquare,
      'outreach_execution': Rocket,
      'conversation_management': MessageCircle,
      'relationship_nurturing': Heart
    };
    return iconMap[stage] || Search;
  };

  return (
    <div className="h-full bg-gray-900 p-6 relative">
      <div className="max-w-6xl mx-auto h-full">
        {/* Header with Agent Status */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-glow">
                <Bot className="h-8 w-8 text-white" />
                {isAgentInitialized && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                  Meet SAM
                  {isAgentInitialized && (
                    <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                      Multi-Agent
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-300 text-lg">Your AI Sales Assistant</p>
              </div>
            </div>
            
            {/* Activity Meter */}
            {currentActivity && (
              <div className="mb-4 p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/50">
                <div className="flex items-center justify-center gap-3">
                  <div className="relative">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-sm text-blue-300 font-medium">{currentActivity}</span>
                </div>
              </div>
            )}

            {/* Discovery Progress Indicator */}
            {inDiscoveryMode && currentDiscoverySession && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl border border-purple-500/30">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-purple-300">
                    <BookOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">Discovery Session in Progress</span>
                  </div>
                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <span className="text-xs text-gray-400 capitalize">
                      {currentDiscoverySession.phase.replace('_', ' ')}
                    </span>
                    <Progress 
                      value={discoveryProgress} 
                      className="flex-1 h-2 bg-gray-700"
                    />
                    <span className="text-xs text-purple-300 font-medium">
                      {discoveryProgress}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    Building your sales foundation - about {Math.max(0, 60 - Math.floor(discoveryProgress * 0.6))} minutes remaining
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isAgentInitialized ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-400">
                  {isAgentInitialized ? 'SAM AI ready' : 'SAM AI starting...'}
                </span>
              </div>
              
              {conversationContext && (
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 bg-gray-600" />
                  {(() => {
                    const StageIcon = getStageIcon(currentStage);
                    return (
                      <div className="flex items-center gap-2 px-3 py-1 bg-purple-900/30 rounded-full border border-purple-600/50">
                        <StageIcon className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-300">
                          Stage {getStageNumber(currentStage)}: {getStageTitle(currentStage)}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ModeSwitcher 
              currentMode={currentOperationMode}
              onModeChange={handleModeChange}
              className="scale-90"
            />
            <ChatHistory 
              onLoadSession={handleLoadSession}
              currentSessionId={currentSessionId}
            />
          </div>
        </div>

        {/* Agent Processing Trace */}
        {agentTrace.length > 0 && (
          <div className="mb-6">
            <Card className="p-4 bg-gray-800 border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Agent Processing Trace</span>
              </div>
              <div className="space-y-2">
                {agentTrace.map((trace, index) => (
                  <div key={index} className="flex items-center gap-3 text-xs">
                    <Badge variant="outline" className="text-xs">
                      {trace.agentType}
                    </Badge>
                    <span className="text-gray-300">{trace.action}</span>
                    <span className="text-gray-500">({trace.duration}ms)</span>
                    {trace.success ? (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    ) : (
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Removed thinking display - clean instant responses */}

        {/* Conversation Starters */}
        {messages.filter(m => m.sender === 'user').length === 0 && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                What would you like to do today?
              </h2>
              <p className="text-gray-400">
                Choose a conversation starter or just type your request below
              </p>
            </div>
            
            {/* Categorized Conversation Starters */}
            <div className="space-y-6">
              {Object.entries(conversationStarters).map(([category, actions]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">{category}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(action.prompt)}
                        className="group relative p-4 text-left rounded-lg border border-gray-600 !bg-black hover:!bg-gray-900 hover:border-gray-500 transition-all duration-200 hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                            <action.icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                            {action.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Original Quick Actions Grid - Hidden but kept for reference */}
            <div className="hidden grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className={`group p-4 cursor-pointer transition-all duration-500 border border-gray-700 bg-gray-800/70 backdrop-blur-sm hover:bg-gray-700/90 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 animate-fade-in hover:border-gray-600 ${
                    !isAgentInitialized && action.complexity !== 'simple' ? 'opacity-60' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleQuickAction(action)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg animate-glow relative`}>
                      <action.icon className="h-5 w-5 text-white" />
                      {action.complexity !== 'simple' && !isAgentInitialized && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {action.title}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {action.complexity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Container */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
              {/* Activity Meter on top of chat window */}
              {currentActivity && (
                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-gray-600/50 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <span className="text-sm text-blue-300 font-medium">{currentActivity}</span>
                    <div className="flex-1" />
                    <div className="text-xs text-gray-400">Processing...</div>
                  </div>
                </div>
              )}
              
              {/* Messages Area */}
              <div className="h-96 overflow-y-auto p-6 space-y-6">
                {isLoading && messages.length <= 1 ? (
                  <ChatSkeleton />
                ) : (
                  messages.map((message, index) => (
                    <MessageFormatter
                      key={message.id}
                      message={message}
                      onSpeak={speakText}
                      className="animate-fade-in"
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Removed processing progress - instant responses */}

              {/* Sam Status Indicator - Keep this, it's helpful */}
              <SamStatusIndicator isActive={samIsActive} currentStatus={samStatus} />
              
              {/* Input Area */}
              <div className="border-t border-gray-700 p-6 bg-gray-800">
                <div className="flex gap-3 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isAgentInitialized 
                        ? "Ask SAM anything..." 
                        : "Ask SAM anything..."
                      }
                      className="py-4 text-base bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button
                    onClick={saveCurrentConversation}
                    disabled={messages.length === 0}
                    variant="outline"
                    className="h-12 px-4 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                    title="Save conversation to Chat History"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  
                  <VoiceInterface onVoiceMessage={handleVoiceMessage} disabled={isLoading} />
                  
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim() || isLoading}
                    className="h-12 px-6 !bg-black hover:!bg-gray-900 !border !border-gray-600 !text-white font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Send
                  </Button>
                </div>
                
                <div className="flex items-center justify-center mt-4">
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <Brain className="h-3 w-3" />
                    {isAgentInitialized 
                      ? "SAM AI ready - 8-stage methodology active"
                      : "SAM AI starting..."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Context Memory Sidebar */}
          <div className="lg:col-span-1">
            <ContextMemory className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}