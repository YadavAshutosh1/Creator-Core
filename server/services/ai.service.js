const OpenAI = require("openai");

/**
 * AI Orchestrator Service (OpenRouter Edition)
 * Handles multi-model fallback and professional content generation.
 */
class AIService {
  constructor() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    this.client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey || 'dummy_key', // Prevent crash if key is momentarily missing
      defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Creator AI Dashboard",
      },
    });

    // Strategy: Try the fastest/newest model first, fallback to stable options
    this.models = [
      "google/gemini-2.0-flash-001",    // Primary (Ultra-fast)
      "google/gemini-pro-1.5",          // Fallback 1
      "openai/gpt-4o-mini",             // Fallback 2 (Extremely stable)
      "anthropic/claude-3-haiku",       // Fallback 3
    ];
  }

  /**
   * Generates content with automatic model fallback
   */
  async generateContent(prompt, transcript) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is missing in .env');
    }

    const userMessage = `${prompt}\n\nCONTENT TRANSCRIPT:\n${transcript}`;
    let lastError = null;

    // Orchestration Loop: Try models in order until one succeeds
    for (const model of this.models) {
      try {
        console.log(`🤖 Attempting generation with: ${model}`);
        
        const response = await this.client.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a world-class viral content strategist for top-tier creators. You specialize in platform-specific repurposing and high-conversion hooks.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          console.log(`✅ Success with ${model}`);
          return content;
        }
      } catch (error) {
        console.warn(`⚠️ Model ${model} failed:`, error.message);
        lastError = error;
        continue; // Try next model
      }
    }

    throw new Error(`AI Orchestrator failed: ${lastError?.message || 'All models exhausted'}`);
  }
}

module.exports = new AIService();
