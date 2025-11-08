import fetch from 'node-fetch';

export class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY;
    this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    
    if (!this.apiKey) {
      console.warn('⚠️  DEEPSEEK_API_KEY not found in environment variables');
    }
  }

  /**
   * Simple chat method
   */
  async chat(message) {
    return this.chatWithOptions({
      message,
      model: 'deepseek-chat',
      temperature: 1.0,
    });
  }

  /**
   * Chat with custom options
   */
  async chatWithOptions({ 
    message, 
    model = 'deepseek-chat', 
    temperature = 1.0, 
    maxTokens = 2048,
    systemPrompt = 'You are a helpful assistant.'
  }) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  /**
   * Check API status
   */
  async checkStatus() {
    if (!this.apiKey) {
      return {
        status: 'not_configured',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      // Try a minimal request to check if the API is accessible
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10,
        }),
      });

      return {
        status: response.ok ? 'healthy' : 'error',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
