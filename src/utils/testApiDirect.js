// Simple API key test - call this from browser console
async function testApiKeyDirect() {
  const apiKey = 'AIzaSyCfaYr1YsX_N1d359VQOIvUhjY4fUx6Fuk';
  
  console.log('🔍 Testing API key directly with fetch...');
  
  try {
    // Try v1beta API with the correct model name
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Say hello'
          }]
        }]
      })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', data);
      return data;
    } else {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return { error: errorText, status: response.status };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { error: error.message };
  }
}

// Make it available globally
window.testApiKeyDirect = testApiKeyDirect;

export { testApiKeyDirect };