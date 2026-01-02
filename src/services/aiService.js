import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple rate limiting - increased due to 429 errors
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 10000; // 10 seconds between requests (increased to avoid 429)

const LAST_WORKING_MODEL_STORAGE_KEY = 'cloudoptimal:lastWorkingGeminiModel';
const MODEL_DISCOVERY_CACHE_KEY = 'cloudoptimal:geminiModelDiscovery';
const MODEL_DISCOVERY_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCachedLastWorkingModel() {
  try {
    return localStorage.getItem(LAST_WORKING_MODEL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setCachedLastWorkingModel(modelName) {
  try {
    localStorage.setItem(LAST_WORKING_MODEL_STORAGE_KEY, modelName);
  } catch {
    // ignore
  }
}

function parseRetryDelayMsFromError(error) {
  // The API sometimes returns retry delay text like: "Please retry in 8.209s" or "retryDelay":"8s"
  const message = String(error?.message || '');
  const secondsMatch = message.match(/Please retry in\s+(\d+(?:\.\d+)?)s/i);
  if (secondsMatch) return Math.ceil(parseFloat(secondsMatch[1]) * 1000);

  const retryDelayMatch = message.match(/"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/i);
  if (retryDelayMatch) return Math.ceil(parseFloat(retryDelayMatch[1]) * 1000);

  return null;
}

function isQuotaZeroForModel(error) {
  const message = String(error?.message || '');
  // Common text in the provided error: "limit: 0, model: gemini-2.0-flash"
  return /quota exceeded/i.test(message) && /limit:\s*0/i.test(message);
}

async function discoverBestFlashModel(apiKey) {
  // Allow override without code changes
  const override = import.meta.env.VITE_GEMINI_MODEL;
  if (override) return override;

  // Cache discovery to avoid extra calls
  try {
    const cachedRaw = localStorage.getItem(MODEL_DISCOVERY_CACHE_KEY);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (cached?.model && cached?.ts && Date.now() - cached.ts < MODEL_DISCOVERY_TTL_MS) {
        return cached.model;
      }
    }
  } catch {
    // ignore
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    const models = Array.isArray(data?.models) ? data.models : [];

    const flashModels = models
      .filter(m => typeof m?.name === 'string')
      .filter(m => m.name.includes('gemini-') && m.name.includes('flash'))
      // Prefer non-experimental models by default
      .filter(m => !m.name.includes('-exp'))
      // Only those that can generate content (field exists on the models list response)
      .filter(m => Array.isArray(m.supportedGenerationMethods) ? m.supportedGenerationMethods.includes('generateContent') : true)
      .map(m => m.name.replace(/^models\//, ''));

    const versionOf = (modelName) => {
      // Examples: gemini-2.5-flash, gemini-2.0-flash, gemini-3.0-flash
      const match = modelName.match(/^gemini-(\d+(?:\.\d+)?)/i);
      return match ? parseFloat(match[1]) : -1;
    };

    // Prefer newest stable Flash model by version.
    // If multiple have same major/minor, keep the first one.
    const newestByVersion = [...flashModels].sort((a, b) => versionOf(b) - versionOf(a))[0];

    // Keep a small explicit preference list as a tie-breaker / safety net.
    const preferred = [
      'gemini-3.0-flash',
      'gemini-3-flash',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    const chosen = preferred.find(p => flashModels.includes(p)) || newestByVersion || 'gemini-2.5-flash';

    try {
      localStorage.setItem(MODEL_DISCOVERY_CACHE_KEY, JSON.stringify({ model: chosen, ts: Date.now() }));
    } catch {
      // ignore
    }

    return chosen;
  } catch {
    // If discovery fails (network, CORS, quotas), fall back to a stable default.
    return 'gemini-2.5-flash';
  }
}

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
    
    // Model strategy:
    // 1) Use last-known-good model (cached) if present
    // 2) Else auto-discover best available stable Flash model (cached for 24h)
    // 3) Retry the chosen model on transient/network/429 (respecting retryDelay)
    // 4) Only fall back to other models if the chosen model is clearly unavailable

    const lastWorking = getCachedLastWorkingModel();
    const discovered = await discoverBestFlashModel(apiKey);
    const primaryModel = lastWorking || discovered;

    // Minimal fallback list (avoid experimental by default; avoid models that may have 0 free-tier quota)
    const modelsToTry = [
      primaryModel,
      primaryModel === 'gemini-2.5-flash' ? 'gemini-1.5-flash' : 'gemini-2.5-flash'
    ].filter(Boolean);

    console.log('🔍 Trying models in order of preference:', modelsToTry);

    let lastError;
    
    const modelsWithQuotaZero = new Set();

    for (const modelName of modelsToTry) {
      if (modelsWithQuotaZero.has(modelName)) continue;
      try {
        console.log(`🧪 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        // Attempt up to 2 times for transient issues, respecting retryDelay on 429
        let text = '';
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            text = response.text();
            break;
          } catch (attemptError) {
            const retryDelayMs = parseRetryDelayMsFromError(attemptError);

            if (isQuotaZeroForModel(attemptError)) {
              modelsWithQuotaZero.add(modelName);
              throw attemptError;
            }

            // If the API told us when to retry, honor it once.
            if (attempt === 1 && retryDelayMs) {
              console.log(`⏳ Model ${modelName} asked to retry in ${retryDelayMs}ms`);
              await sleep(retryDelayMs);
              continue;
            }

            // Network hiccup: brief retry once
            if (attempt === 1 && /network/i.test(String(attemptError?.message || ''))) {
              await sleep(800);
              continue;
            }

            throw attemptError;
          }
        }
        
        if (text) {
          console.log(`✅ Successfully used model: ${modelName}`);
          setCachedLastWorkingModel(modelName);
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
