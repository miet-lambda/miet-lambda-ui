export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

class AiService {
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly API_KEY = 'sk-1234abcd1234abcd1234abcd1234abcd1234abcd';

  private async makeRequest(messages: Message[]): Promise<string> {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to get response from AI service');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling AI service:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get AI response. Please try again later.');
    }
  }

  async generateResponse(messages: Message[]): Promise<string> {
    return this.makeRequest(messages);
  }

  async explainCode(code: string, message?: string): Promise<string> {
    const prompt = message || 'Could you explain what this code does?';
    return this.makeRequest([
      {
        role: 'user',
        content: `${prompt}\n\nHere's the code:\n\`\`\`\n${code}\n\`\`\``
      }
    ]);
  }

  async findBugs(code: string): Promise<string> {
    return this.makeRequest([
      {
        role: 'user',
        content: `Could you analyze this code for potential bugs, issues, or improvements?\n\nHere's the code:\n\`\`\`\n${code}\n\`\`\``
      }
    ]);
  }

  async suggestImprovements(code: string): Promise<string> {
    return this.makeRequest([
      {
        role: 'user',
        content: `Could you suggest ways to improve or optimize this code?\n\nHere's the code:\n\`\`\`\n${code}\n\`\`\``
      }
    ]);
  }

  async addComments(code: string): Promise<string> {
    return this.makeRequest([
      {
        role: 'user',
        content: `Could you add helpful comments to explain this code?\n\nHere's the code:\n\`\`\`\n${code}\n\`\`\``
      }
    ]);
  }
}

export const aiService = new AiService(); 