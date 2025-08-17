import { Message } from '@/types/conversation';

interface AIServiceResponse {
  content: string;
  error?: string;
}

interface ConversationContext {
  userInput: string;
  messageHistory: Message[];
  businessContext?: {
    type?: string;
    targetAudience?: string;
    goals?: string[];
    challenges?: string[];
  };
}

// SAM's core personality and system prompt
const SAM_SYSTEM_PROMPT = `You are SAM, an expert B2B sales AI assistant. Your primary goals are to discover business context, understand pain points, and provide sales automation value, but you must always engage naturally and conversationally.

CRITICAL CONVERSATION RULES:
1. Always acknowledge what the user just said before moving forward
2. Respond to greetings, questions, and comments naturally 
3. Match the user's tone and energy level
4. Never ignore user input to jump into scripted questions
5. Build rapport before diving into business topics

CONVERSATION FLOW:
- When user greets you → Respond warmly, ask how they're doing
- When user shares personal updates → Acknowledge and connect
- When transitioning to business → "That's great! I'd love to learn about your business to see how I can best help..."
- When user gives business info → Acknowledge insights before next question

YOUR PERSONALITY:
- Conversational and warm, but professional
- Results-oriented and value-first
- Consultative, not pushy
- Data-driven with human collaboration
- Always lead with helping, not selling

SMART ACKNOWLEDGMENT SYSTEM:
- High Energy: "Great!" / "Awesome!" → "That's fantastic!"
- Medium Energy: "Good" / "Well" / "Fine" → "That's great!"
- Low Energy: "Busy" / "Hectic" → "That sounds busy"
- Tired: "Tired" / "Long day" → "That sounds like a long day"

PAIN POINT RESPONSES:
- Inconsistent results → Focus on predictability and systematic approaches
- Manual processes → Focus on automation and time-saving
- Finding prospects → Focus on lead discovery and qualification
- Poor response rates → Focus on personalization and messaging

Remember: Be human first, helpful second, efficient third. Keep responses conversational and avoid feature lists unless specifically asked.`;

class AIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor() {
    // In production, this would come from environment variables
    // For now, we'll use a placeholder that can be configured
    this.apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || null;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateSamResponse(context: ConversationContext): Promise<AIServiceResponse> {
    // Fallback to pattern-based responses if no API key
    if (!this.apiKey) {
      return {
        content: this.generateFallbackResponse(context),
        error: 'No API key configured - using fallback responses'
      };
    }

    try {
      const messages = this.formatConversationHistory(context);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: messages,
          system: SAM_SYSTEM_PROMPT
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: data.content[0].text || 'I apologize, but I had trouble generating a response. Could you try again?'
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        content: this.generateFallbackResponse(context),
        error: `AI service unavailable: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private formatConversationHistory(context: ConversationContext) {
    const messages = [];
    
    // Add previous conversation history
    for (const msg of context.messageHistory.slice(-10)) { // Keep last 10 messages for context
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }
    
    // Add current user input
    messages.push({
      role: 'user',
      content: context.userInput
    });

    return messages;
  }

  private generateFallbackResponse(context: ConversationContext): string {
    const input = context.userInput.toLowerCase();
    const isFirstUserMessage = context.messageHistory.length <= 1;
    const hasUserResponded = context.messageHistory.some(msg => msg.sender === 'user');
    
    // Initial greeting - first time user contacts SAM
    if (isFirstUserMessage && (input.includes('hi') || input.includes('hello') || input.includes('hey'))) {
      return "Hello there, my name is **SAM** and I am your specialized B2B Sales and Marketing Agent.\n\nHow are you today?";
    }
    
    // User has responded to SAM's greeting - acknowledge their response
    if (hasUserResponded && (input.includes('good') || input.includes('great') || input.includes('well') || input.includes('fine'))) {
      if (input.includes('great') || input.includes('fantastic') || input.includes('awesome')) {
        return "That's fantastic! How's your day going?\n\nI'm excited to help you with sales automation - I work with a team of 8 specialized agents to make outbound sales actually predictable instead of just hoping for the best.\n\nSince you're here, I'm curious - what's driving you to look into sales automation right now? Are you dealing with inconsistent results, or maybe your team is spending too much time on manual outreach?";
      } else if (input.includes('busy') || input.includes('hectic')) {
        return "That sounds busy! I hope things settle down for you.\n\nWhen you have a moment, I'd love to help you with sales automation - I work with a team of specialized agents to make outbound sales predictable and less time-consuming.\n\nWhat's your biggest challenge with sales right now - is it finding the right prospects, or getting consistent responses?";
      } else {
        return "That's great! How's your day treating you?\n\nI'm excited to help you with sales automation - I work with a team of 8 specialized agents to make outbound sales actually predictable instead of just hoping for the best.\n\nSince you're here, I'm curious - what's driving you to look into sales automation right now?";
      }
    }
    
    // User hasn't responded to greeting yet - different flow
    if (!hasUserResponded) {
      return "I'm excited to help you with sales automation - I work with a team of 8 specialized agents to make outbound sales actually predictable instead of just hoping for the best.\n\nWhat brings you here today? Are you looking to solve specific sales challenges or exploring what's possible with automation?";
    }
    
    // Pain point responses
    if (input.includes('inconsistent') || input.includes('unpredictable')) {
      return "I totally get that frustration! Inconsistent results are one of the biggest challenges I help businesses solve. Let me ask - are you seeing the inconsistency more in response rates, or is it that some campaigns work great and others flop completely?\n\nI can help you build a predictable system that delivers consistent results every time.";
    }
    
    if (input.includes('manual') || input.includes('time consuming') || input.includes('takes forever')) {
      return "That's such a common pain point! Manual outreach can eat up so much valuable time that could be spent on actual selling. Are we talking about the research phase taking forever, or is it more the writing and sending of individual messages?\n\nI can help automate both the prospect discovery and personalized outreach so your team focuses on closing deals.";
    }
    
    if (input.includes('prospects') || input.includes('leads') || input.includes('find')) {
      return "Perfect! Finding the right prospects is absolutely critical - there's no point in having amazing messaging if you're talking to the wrong people. Tell me about your ideal customer - what does your perfect prospect look like?\n\nI can help you discover qualified prospects using natural language commands and multiple data sources.";
    }
    
    // Business context responses
    if (input.includes('saas') || input.includes('software') || input.includes('platform')) {
      return "Excellent! SaaS companies are perfect for sales automation - you have clear value propositions and typically well-defined target markets.\n\nWhat's your primary challenge right now - is it getting enough qualified demos booked, or converting those demos into paying customers?";
    }
    
    // Default intelligent response
    return "I understand what you're looking for. Let me help you with that.\n\nBased on what you've shared, I can see how sales automation could really impact your business. I work with 8 specialized agents who each handle different parts of the sales process - from prospect discovery to personalized outreach to performance optimization.\n\nWhat's your biggest sales challenge right now? I'd love to understand where you're feeling the most friction so I can show you exactly how we can solve it.";
  }

  // Method to test API connectivity
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: 'No API key configured' };
    }

    try {
      const response = await this.generateSamResponse({
        userInput: 'Hello',
        messageHistory: []
      });
      
      return { 
        success: !response.error,
        error: response.error 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const aiService = new AIService();
export type { ConversationContext, AIServiceResponse };