const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Orchestrator Service (Google Gemini Edition)
 * Handles multi-model fallback and professional content generation.
 */
class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
    
    // Strategy: Try the fastest/newest model first, fallback to stable options
    this.models = [
      "gemini-2.5-flash",          // Primary (Ultra-fast & cost-effective)
      "gemini-2.0-flash",          // Fallback 1
      "gemini-1.5-pro",            // Fallback 2 (Higher reasoning)
    ];
  }

  /**
   * Generates content with automatic model fallback
   */
  async generateContent(prompt, transcript) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
      throw new Error('GEMINI_API_KEY is missing in .env');
    }

    const systemInstruction = "You are a world-class viral content strategist for top-tier creators. You specialize in platform-specific repurposing and high-conversion hooks.";
    const userMessage = `${prompt}\n\nCONTENT TRANSCRIPT:\n${transcript}`;
    let lastError = null;

    // Orchestration Loop: Try models in order until one succeeds
    for (const modelName of this.models) {
      try {
        console.log(`🤖 Attempting generation with: ${modelName}`);
        
        const model = this.genAI.getGenerativeModel({ 
          model: modelName,
          systemInstruction: systemInstruction,
        });

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
          generationConfig: {
            temperature: 0.7,
          }
        });

        const content = result.response.text();
        if (content) {
          console.log(`✅ Success with ${modelName}`);
          return content;
        }
      } catch (error) {
        console.warn(`⚠️ Model ${modelName} failed:`, error.message);
        lastError = error;
        continue; // Try next model
      }
    }

    throw new Error(`AI Orchestrator failed: ${lastError?.message || 'All models exhausted'}`);
  }
}

module.exports = new AIService();
