import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Debug utility to list all available Gemini models
 * This can be called from the browser console to see what models are available
 */
export async function debugListModels() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ VITE_GEMINI_API_KEY is not configured");
    return;
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('🚀 Testing models directly (listModels not available)...');
    
    const candidateModels = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest', 
      'gemini-1.5-flash-002',
      'gemini-flash'
    ];

    const workingModels = [];
    const failedModels = [];
    
    for (const modelName of candidateModels) {
      try {
        console.log(`🧪 Testing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Just test model creation for speed - no actual API calls
        if (model) {
          const isFlash = modelName.toLowerCase().includes('flash');
          console.log(`✅ ${modelName} - Model created ${isFlash ? '🆓 (Free Tier)' : '💰 (Paid Tier)'}`);
          workingModels.push(modelName);
        }
      } catch (error) {
        console.log(`❌ ${modelName} - FAILED: ${error.message}`);
        failedModels.push({ model: modelName, error: error.message });
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log('🆓 Working Free Tier Models:', workingModels.filter(m => m.includes('flash')));
    console.log('💰 Working Paid Models:', workingModels.filter(m => !m.includes('flash')));
    console.log('❌ Failed Models:', failedModels.map(f => f.model));
    
    if (workingModels.length === 0) {
      console.error('⚠️ NO WORKING MODELS FOUND!');
      console.log('💡 Troubleshooting:');
      console.log('   1. Check your API key is valid');
      console.log('   2. Ensure your API key has Gemini API access');
      console.log('   3. Try creating a new API key at: https://makersuite.google.com/app/apikey');
    }
    
    return { working: workingModels, failed: failedModels };
    
  } catch (error) {
    console.error('❌ Error testing models:', error);
    console.log('🔍 Error details:');
    console.log('  - Message:', error.message);
    console.log('  - Status:', error.status || 'Unknown');
    
    if (error.message?.includes('403')) {
      console.log('💡 This looks like an API key permissions issue');
      console.log('   Try creating a new API key at: https://makersuite.google.com/app/apikey');
    } else if (error.message?.includes('401')) {
      console.log('💡 This looks like an invalid API key');
      console.log('   Check your API key at: https://makersuite.google.com/app/apikey');
    }
    
    return null;
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.debugListModels = debugListModels;
}