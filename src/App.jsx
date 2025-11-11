import { useState } from "react";
import PromptInput from "./components/PromptInput";
import ResultDisplay from "./components/ResultDisplay";
import DiagramView from "./components/DiagramView";
import SessionHistory from "./components/SessionHistory";
import ThemeToggle from "./components/ThemeToggle";

import { designPrompt } from './prompts/designPrompt';
import { optimizePrompt } from './prompts/optimizePrompt';
import { migratePrompt } from './prompts/migratePrompt';
import { multiProviderPrompt } from './prompts/multiProviderPrompt';

import { getAIResponse } from "./services/aiService";
import { saveSession } from "./utils/sessionStorage";

export default function App() {
  const templates = {
    design: designPrompt,
    optimize: optimizePrompt,
    migrate: migratePrompt,
    multiProvider: multiProviderPrompt
  };
  const [aiResponse, setAIResponse] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [mermaidCode, setMermaidCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSession, setCurrentSession] = useState(null);

  const handleSubmit = async (promptType, userInput) => {
    setLoading(true);
    setError("");
    setAIResponse("");
    setNodes([]);
    setEdges([]);
    setMermaidCode("");
    
    try {
      const template = templates[promptType];
      const promptText = `FRESH SESSION - IGNORE ANY PREVIOUS CONTEXT\n\n${template.sample_prompt}`
        .replace("{{WORKLOAD_DESCRIPTION}}", userInput)
        .replace("{{INFRA_DESCRIPTION}}", userInput)
        .replace("{{SYSTEM_DESCRIPTION}}", userInput);

      const response = await getAIResponse(promptText);
      setAIResponse(response);

      // Parse response for structured data
      let parsedData = null;
      try {
        parsedData = JSON.parse(response);
        
        // Handle architecture diagrams (from design prompts)
        if (parsedData.architecture_nodes && parsedData.architecture_edges) {
          setNodes(parsedData.architecture_nodes);
          setEdges(parsedData.architecture_edges);
        }
        
        // Handle Mermaid diagrams
        if (parsedData.architecture_diagram) {
          console.log("📊 Found architecture diagram:", parsedData.architecture_diagram);
          setMermaidCode(parsedData.architecture_diagram);
        } else {
          console.log("❌ No architecture_diagram found in response");
        }
        
        console.log("Parsed AI response:", parsedData);
        
      } catch (parseError) {
        console.log("❌ JSON parse error:", parseError.message);
        console.log("Raw response:", response);
        
        // If not JSON, try to extract JSON from response text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            // Fix common JSON syntax errors before parsing
            let jsonText = jsonMatch[0];
            
            // Remove trailing commas before closing braces/brackets
            jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1');
            
            const extracted = JSON.parse(jsonText);
            
            // Handle architecture diagrams
            if (extracted.architecture_nodes && extracted.architecture_edges) {
              setNodes(extracted.architecture_nodes);
              setEdges(extracted.architecture_edges);
            }
            
            // Handle Mermaid diagrams
            if (extracted.architecture_diagram) {
              console.log("📊 Found architecture diagram in extracted JSON:", extracted.architecture_diagram);
              setMermaidCode(extracted.architecture_diagram);
            }
            
            console.log("Extracted and fixed JSON from response:", extracted);
            
            // Update the AI response with the fixed JSON for display
            setAIResponse(JSON.stringify(extracted, null, 2));
            
          } catch (extractError) {
            console.log("❌ Could not extract valid JSON from response:", extractError.message);
          }
        } else {
          console.log("No structured data in AI response");
        }
      }

      // Save session
      const sessionData = {
        promptType,
        userInput,
        aiResponse: response,
        nodes: nodes,
        edges: edges
      };
      
      const sessionId = saveSession(sessionData);
      setCurrentSession({ id: sessionId, ...sessionData });
      
    } catch (err) {
      setError(`Failed to get AI response: ${err.message}`);
      console.error("AI call failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSession = (session) => {
    setAIResponse(session.aiResponse);
    setNodes(session.nodes || []);
    setEdges(session.edges || []);
    setCurrentSession(session);
    setError("");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto p-4 flex flex-col gap-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">CloudOptimal AI</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Multi-cloud architecture planning and optimization</p>
          </div>
          <ThemeToggle />
        </div>
        
        <SessionHistory onLoadSession={handleLoadSession} />
        
        <PromptInput onSubmit={handleSubmit} templates={templates} disabled={loading} onClearSession={() => {
          setAIResponse("");
          setNodes([]);
          setEdges([]);
          setMermaidCode("");
          setCurrentSession(null);
          setError("");
        }} />
        
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">Getting AI recommendations...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
            <div className="font-medium mb-2">Error:</div>
            <div className="mb-3">{error}</div>
            {error.includes('No compatible') && (
              <div className="text-sm bg-red-100 dark:bg-red-800/50 p-3 rounded border-l-4 border-red-400">
                <div className="font-medium mb-1">💡 Troubleshooting Tips:</div>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>This app is configured for <strong>free tier Gemini Flash models</strong></li>
                  <li>Verify your API key is valid and active</li>
                  <li>Ensure your API key has access to Gemini Flash models (free tier)</li>
                  <li>Open browser console and run <code className="bg-red-200 dark:bg-red-700 px-1 rounded">debugListModels()</code> to see available models</li>
                  <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Google AI Studio</a> to verify your API key</li>
                </ul>
              </div>
            )}
          </div>
        )}
        
        <ResultDisplay aiResponse={aiResponse} />
        <DiagramView nodes={nodes} edges={edges} mermaidCode={mermaidCode} />
      </div>
    </div>
  );
}
