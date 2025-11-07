// List available models - call this from browser console
async function listAvailableModels() {
  const apiKey = 'AIzaSyCfaYr1YsX_N1d359VQOIvUhjY4fUx6Fuk';
  
  console.log('🔍 Checking available models...');
  
  const endpoints = [
    'https://generativelanguage.googleapis.com/v1/models',
    'https://generativelanguage.googleapis.com/v1beta/models'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing endpoint: ${endpoint}`);
      const response = await fetch(`${endpoint}?key=${apiKey}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Available models:`, data.models?.map(m => m.name) || data);
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed (${response.status}):`, errorText);
      }
    } catch (error) {
      console.log(`❌ Network error:`, error.message);
    }
  }
}

// Make it available globally
window.listAvailableModels = listAvailableModels;

export { listAvailableModels };