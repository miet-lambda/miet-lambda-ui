interface Message {
  role: 'user' | 'assistant';
  content: string;
}

class AiService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async generateResponse(messages: Message[]): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set. Please configure your OpenAI API key.');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an AI coding assistant specializing in Lua programming. ' +
                'You help users understand, debug, and improve their Lua code. ' +
                'When explaining code, be clear and concise. ' +
                'When suggesting improvements, explain why they are beneficial. ' +
                'When showing code examples, use markdown code blocks with the lua language specifier.'
            },
            ...messages
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  async explainCode(code: string, context?: string): Promise<string> {
    const prompt = context 
      ? `Please explain this code:\n\`\`\`lua\n${code}\n\`\`\`\n${context}`
      : `Please explain this code:\n\`\`\`lua\n${code}\n\`\`\``;

    return this.generateResponse([
      {
        role: 'user',
        content: prompt
      }
    ]);
  }

  async suggestImprovements(code: string): Promise<string> {
    return this.generateResponse([
      {
        role: 'user',
        content: `Please analyze this code and suggest improvements:\n\`\`\`lua\n${code}\n\`\`\`\n` +
          'Focus on performance, readability, and best practices. ' +
          'If you suggest changes, please provide code examples.'
      }
    ]);
  }

  async findBugs(code: string): Promise<string> {
    return this.generateResponse([
      {
        role: 'user',
        content: `Please analyze this code for potential bugs and issues:\n\`\`\`lua\n${code}\n\`\`\`\n` +
          'Include both actual bugs and potential edge cases that might cause problems. ' +
          'For each issue, explain why it\'s problematic and how to fix it.'
      }
    ]);
  }

  async addComments(code: string): Promise<string> {
    return this.generateResponse([
      {
        role: 'user',
        content: `Please add comprehensive comments to this code:\n\`\`\`lua\n${code}\n\`\`\`\n` +
          'Include both high-level documentation and inline explanations where appropriate. ' +
          'Follow Lua commenting best practices.'
      }
    ]);
  }
}

export const aiService = new AiService();
export type { Message }; 