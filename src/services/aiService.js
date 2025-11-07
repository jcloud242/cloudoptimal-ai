import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getAIResponse(prompt) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured. Please add it to your .env file.");
  }

  try {
    // Initialize with explicit configuration to avoid any endpoint issues
    const genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('🔑 API Key (first 10 chars):', apiKey.substring(0, 10) + '...');
    console.log('🌐 SDK will use default endpoint: https://generativelanguage.googleapis.com');
    
    // Try models that are confirmed to work with the current API
    const modelsToTry = [
      'gemini-2.0-flash',        // Latest free tier model (Nov 2024+)
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-pro'  // Adding back as fallback since error said it's not found, not access denied
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
