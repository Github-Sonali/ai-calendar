// app/lib/ollama.ts
// This file handles all communication with Ollama

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream: boolean;
  format?: 'json';
}

// Define a type for parsed JSON responses
type ParsedJSON = Record<string, unknown>;

class OllamaClient {
  private baseUrl: string;

  constructor() {
    // Ollama runs locally on port 11434
    this.baseUrl = 'http://localhost:11434';
  }

  /**
   * Generate a response from Ollama
   * @param prompt - The prompt to send to the model
   * @param model - The model to use (default: llama3)
   */
  async generate(prompt: string, model: string = 'llama2'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false, // Get complete response at once
        } as OllamaGenerateRequest),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  /**
   * Generate JSON response - useful for structured data
   * @param prompt - The prompt to send to the model
   * @param model - The model to use (default: llama3)
   */
  async generateJSON(prompt: string, model: string = 'llama2'): Promise<ParsedJSON> {
    // Add stronger instruction for JSON output
    const jsonPrompt = `${prompt}

IMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON. Do not include markdown code blocks. Just the raw JSON object.`;
    
    const response = await this.generate(jsonPrompt, model);
    
    // Clean the response to extract JSON
    let cleanedResponse = response.trim();
    
    // Remove markdown code blocks if present
    cleanedResponse = cleanedResponse.replace(/```json\s*/gi, '');
    cleanedResponse = cleanedResponse.replace(/```\s*/gi, '');
    
    // Try to find JSON object in the response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    try {
      // Try to parse the cleaned JSON response
      const parsed = JSON.parse(cleanedResponse) as ParsedJSON;
      console.log('Successfully parsed JSON:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse JSON response:', cleanedResponse);
      console.error('Parse error:', parseError);
      
      // Fallback: try to extract specific fields manually
      try {
        const fallbackData: ParsedJSON = {
          title: this.extractField(response, 'title') || 'Untitled Event',
          date: this.extractField(response, 'date') || new Date().toISOString().split('T')[0],
          time: this.extractField(response, 'time') || '09:00',
          duration: parseInt(this.extractField(response, 'duration') || '60'),
          category: this.extractField(response, 'category') || 'meeting',
          confidence: 0.5
        };
        
        console.log('Using fallback extraction:', fallbackData);
        return fallbackData;
      } catch {
        throw new Error('Could not parse JSON from response');
      }
    }
  }

  /**
   * Extract a field value from text using regex
   */
  private extractField(text: string, fieldName: string): string | null {
    // Try different patterns to extract field values
    const patterns = [
      new RegExp(`"${fieldName}"\\s*:\\s*"([^"]+)"`, 'i'),
      new RegExp(`${fieldName}\\s*:\\s*"([^"]+)"`, 'i'),
      new RegExp(`"${fieldName}"\\s*:\\s*([^,}]+)`, 'i'),
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  /**
   * Check if Ollama is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
export const ollama = new OllamaClient();