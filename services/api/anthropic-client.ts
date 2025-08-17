/**
 * Anthropic Claude API Client
 * Fixed authentication and error handling
 */

interface AnthropicConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: null | string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicClient {
  private baseUrl = 'https://api.anthropic.com/v1';
  private config: Required<AnthropicConfig>;

  constructor(config: AnthropicConfig) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'claude-3-5-sonnet-20241022',
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7
    };

    if (!this.config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
  }

  async createMessage(
    messages: AnthropicMessage[],
    options?: Partial<AnthropicConfig>
  ): Promise<AnthropicResponse> {
    const requestConfig = { ...this.config, ...options };

    // Format messages for Anthropic API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Extract system message if present (Anthropic requires separate system parameter)
    let systemMessage = '';
    const userMessages = formattedMessages.filter(msg => {
      if (msg.role === 'user' && msg.content.startsWith('System:')) {
        systemMessage = msg.content.replace('System:', '').trim();
        return false;
      }
      return true;
    });

    const requestBody = {
      model: requestConfig.model,
      max_tokens: requestConfig.maxTokens,
      temperature: requestConfig.temperature,
      messages: userMessages,
      ...(systemMessage && { system: systemMessage })
    };

    try {
      console.log('Anthropic API Request:', {
        url: `${this.baseUrl}/messages`,
        model: requestConfig.model,
        messageCount: userMessages.length,
        hasSystem: !!systemMessage
      });

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': requestConfig.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'messages-2023-12-15'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Invalid Anthropic API key. Please check your API key configuration.');
        }
        
        if (response.status === 400) {
          throw new Error(`Bad request to Anthropic API: ${errorText}`);
        }

        if (response.status === 429) {
          throw new Error('Anthropic API rate limit exceeded. Please try again later.');
        }

        if (response.status === 500) {
          throw new Error('Anthropic API server error. Please try again later.');
        }

        throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
      }

      const data: AnthropicResponse = await response.json();
      
      console.log('Anthropic API Success:', {
        model: data.model,
        inputTokens: data.usage.input_tokens,
        outputTokens: data.usage.output_tokens,
        stopReason: data.stop_reason
      });

      return data;

    } catch (error) {
      console.error('Anthropic Client Error:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error(`Unexpected error calling Anthropic API: ${error}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.createMessage([
        { role: 'user', content: 'Hello, please respond with just "OK" to test the connection.' }
      ], { maxTokens: 10 });

      return testResponse.content?.[0]?.text?.includes('OK') || false;
    } catch (error) {
      console.error('Anthropic connection test failed:', error);
      return false;
    }
  }

  // Helper method to extract text from response
  getResponseText(response: AnthropicResponse): string {
    return response.content
      ?.find(item => item.type === 'text')
      ?.text || '';
  }

  // Helper method to get token usage
  getUsage(response: AnthropicResponse) {
    return {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens
    };
  }

  // Method to validate API key format
  static validateApiKey(apiKey: string): boolean {
    // Anthropic API keys start with 'sk-ant-'
    return typeof apiKey === 'string' && 
           apiKey.startsWith('sk-ant-') && 
           apiKey.length > 20;
  }
}

// Factory function for easy instantiation
export function createAnthropicClient(apiKey: string, options?: Partial<AnthropicConfig>): AnthropicClient {
  return new AnthropicClient({
    apiKey,
    ...options
  });
}

// Export types for use in other modules
export type { AnthropicConfig, AnthropicMessage, AnthropicResponse };