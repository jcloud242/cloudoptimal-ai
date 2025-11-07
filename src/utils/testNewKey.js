// Ultra-simple Gemini test - call this from browser console after getting new API key
async function testNewGeminiKey(newApiKey) {
  console.log('🔍 Testing new Gemini API key...');
  console.log('🔑 Key starts with:', newApiKey.substring(0, 15) + '...');
  
  try {
    // Test the new AI Studio endpoint with the correct model name
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${newApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say "Hello, I am working!" if you can respond.'
          }]
        }]
      })
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('🎉 SUCCESS! Gemini responded:', data);
      console.log('✅ Your new API key works perfectly!');
      return data;
    } else {
      const errorText = await response.text();
      console.error('❌ Still failed:', errorText);
      return { error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { error: error.message };
  }
}

// Make it available globally
window.testNewGeminiKey = testNewGeminiKey;

export { testNewGeminiKey };