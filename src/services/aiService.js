import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple rate limiting - increased due to 429 errors
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds between requests (increased to avoid 429)

// Debug function to list available models
export async function listAvailableModels() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("No API key configured");
    return [];
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models using the REST API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("Available models:", data.models.map(m => m.name));
      return data.models;
    } else {
      console.log("No models found or error:", data);
      return [];
    }
  } catch (error) {
    console.error("Error listing models:", error);
    return [];
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.debugListModels = listAvailableModels;
}

export async function getAIResponse(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured. Please add it to your .env file.");
  }

  // Rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏱️ Rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  lastRequestTime = Date.now();

  try {
    // Initialize with explicit configuration to avoid any endpoint issues
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('🔑 API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    console.log('🌐 SDK will use default endpoint: https://generativelanguage.googleapis.com');
    
    // Use the latest models as requested - 2.5 and 2.0
    // gemini-2.0-flash got 429 (rate limited) but it's available
    const modelsToTry = [
      'gemini-2.5-flash',          // Latest 2.5 model if available
      'gemini-2.0-flash-exp',      // Latest experimental 2.0  
      'gemini-2.0-flash'           // Main 2.0 model (was working, just rate limited)
    ];
    
    console.log('🔍 Trying models in order of preference:', modelsToTry);

    let lastError;
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🧪 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text) {
          console.log(`✅ Successfully used model: ${modelName}`);
          return text;
        }
      } catch (modelError) {
        console.warn(`❌ Model ${modelName} failed:`, {
          message: modelError.message,
          status: modelError.status,
          statusText: modelError.statusText,
          details: modelError
        });
        lastError = modelError;
        continue;
      }
    }
    
    throw lastError || new Error("All available models failed to generate content");
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid API key')) {
      throw new Error("Invalid API key. Please check your VITE_GEMINI_API_KEY.");
    } else if (error.message?.includes('quota') || error.message?.includes('QUOTA_EXCEEDED')) {
      throw new Error("API quota exceeded. Please check your Gemini API usage.");
    } else if (error.message?.includes('permission') || error.message?.includes('PERMISSION_DENIED')) {
      throw new Error("API key lacks permissions. Please check your Gemini API configuration.");
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      throw new Error("No compatible Gemini models found. Your API key may not have access to the required models.");
    } else {
      throw new Error(`Gemini API error: ${error.message || 'Unknown error occurred'}`);
    }
  }
}
