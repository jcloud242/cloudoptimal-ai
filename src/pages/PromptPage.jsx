import { useState } from "react";
import { Sparkles, Code2 } from "lucide-react";
import Header from "../components/Header";
import PromptInput from "../components/PromptInput";
import ResultDisplay from "../components/ResultDisplay";
import DiagramView from "../components/DiagramView";
import SessionHistory from "../components/SessionHistory";
import ResizableDivider from "../components/ResizableDivider";
import RecommendationCard from "../components/RecommendationCard";
import { getAIResponse } from "../services/aiService";
import { saveSession } from "../utils/sessionStorage";

export default function PromptPage({ promptType, template }) {
  const [aiResponse, setAIResponse] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [diagramData, setDiagramData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSession, setCurrentSession] = useState(null);
  const [leftWidth, setLeftWidth] = useState(40);
  const [recommendedProvider, setRecommendedProvider] = useState(null);

  const handleSubmit = async (userInput) => {
    setLoading(true);
    setError("");
    setAIResponse("");
    setNodes([]);
    setEdges([]);
    setDiagramData(null);

    try {
      const promptText =
        `FRESH SESSION - IGNORE ANY PREVIOUS CONTEXT\n\n${template.sample_prompt}`
          .replace("{{WORKLOAD_DESCRIPTION}}", userInput)
          .replace("{{INFRA_DESCRIPTION}}", userInput)
          .replace("{{SYSTEM_DESCRIPTION}}", userInput);

      const response = await getAIResponse(promptText);
      setAIResponse(response);

      // Parse response for structured data
      let parsedData = null;
      try {
        parsedData = JSON.parse(response);

        // Extract recommended solution/provider if available
        if (parsedData.recommended_solution) {
          setRecommendedProvider({
            provider:
              parsedData.recommended_solution.recommended_provider ||
              parsedData.recommended_solution.primary_provider ||
              "Cloud Provider",
            architecture:
              parsedData.recommended_solution.recommended_architecture ||
              parsedData.recommended_solution.multi_cloud_strategy ||
              "Recommended Solution",
            reasoning:
              parsedData.recommended_solution.justification ||
              "AI-recommended solution",
          });
        }

        // Handle architecture diagrams (from design prompts)
        if (parsedData.architecture_nodes && parsedData.architecture_edges) {
          setNodes(parsedData.architecture_nodes);
          setEdges(parsedData.architecture_edges);
        }

        // Handle Mermaid diagrams
        if (parsedData.architecture_diagram) {
          console.log(
            "📊 Found architecture diagram:",
            parsedData.architecture_diagram
          );
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
            jsonText = jsonText.replace(/,(\s*[}\]])/g, "$1");

            const extracted = JSON.parse(jsonText);

            // Handle architecture diagrams
            if (extracted.architecture_nodes && extracted.architecture_edges) {
              setNodes(extracted.architecture_nodes);
              setEdges(extracted.architecture_edges);
            }

            // Extract recommended solution/provider if available
            if (extracted.recommended_solution) {
              setRecommendedProvider({
                provider:
                  extracted.recommended_solution.recommended_provider ||
                  extracted.recommended_solution.primary_provider ||
                  "Cloud Provider",
                architecture:
                  extracted.recommended_solution.recommended_architecture ||
                  extracted.recommended_solution.multi_cloud_strategy ||
                  "Recommended Solution",
                reasoning:
                  extracted.recommended_solution.justification ||
                  "AI-recommended solution",
              });
            }

            // Handle architecture diagrams (JSON format)
            if (extracted.architecture_diagram) {
              console.log(
                "📊 Found architecture diagram in extracted JSON:",
                extracted.architecture_diagram
              );
              setDiagramData(extracted.architecture_diagram);
            }

            console.log("Extracted and fixed JSON from response:", extracted);

            // Update the AI response with the fixed JSON for display
            setAIResponse(JSON.stringify(extracted, null, 2));
          } catch (extractError) {
            console.log(
              "❌ Could not extract valid JSON from response:",
              extractError.message
            );
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
        edges: edges,
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

    // Parse the response to extract recommendation and mermaid code
    try {
      const parsedData = JSON.parse(session.aiResponse);

      // Extract recommended solution
      if (parsedData.recommended_solution) {
        setRecommendedProvider({
          provider:
            parsedData.recommended_solution.recommended_provider ||
            parsedData.recommended_solution.primary_provider ||
            "Cloud Provider",
          architecture:
            parsedData.recommended_solution.recommended_architecture ||
            parsedData.recommended_solution.multi_cloud_strategy ||
            "Recommended Solution",
          reasoning:
            parsedData.recommended_solution.justification ||
            "AI-recommended solution",
        });
      }

      // Extract architecture diagram (JSON format)
      if (parsedData.architecture_diagram) {
        setDiagramData(parsedData.architecture_diagram);
      }
    } catch (parseError) {
      console.log("Could not parse session data:", parseError);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-blue-950 transition-colors duration-200 flex flex-col overflow-hidden">
      <Header />

      {/* Main Content Area with Split Panels */}
      <div className="flex-1 flex overflow-hidden">
        <ResizableDivider
          leftWidth={leftWidth}
          setLeftWidth={setLeftWidth}
          leftPanel={
            <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
              <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
                {!aiResponse ? (
                  <>
                    {/* Page Title */}
                    <div className="mb-8">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        {template.name}
                      </h1>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-light">
                        {template.description}
                      </p>
                    </div>

                    {/* Prompt Form */}
                    <div className="flex-1 flex flex-col">
                      <PromptInput
                        onSubmit={handleSubmit}
                        disabled={loading}
                        placeholder={template.placeholder || "Describe your requirements..."}
                        loading={loading}
                        templateName={template.name}
                      />

                      {error && (
                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                          <div className="font-medium mb-2">Error:</div>
                          <div className="mb-3">{error}</div>
                          {error.includes("No compatible") && (
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
                    </div>

                    {/* Session History at Bottom */}
                    <div className="mt-6">
                      <SessionHistory onLoadSession={handleLoadSession} />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Results View */}
                    <div className="mb-6">
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        Recommendation
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-light">
                        AI-powered architecture analysis
                      </p>
                    </div>

                    {/* Display User's Original Prompt */}
                    {currentSession?.userInput && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-2 mb-2">
                          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Requirements</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pl-6">
                          {currentSession.userInput}
                        </p>
                      </div>
                    )}

                    <div className="flex-1 min-h-0">
                      {recommendedProvider && (
                        <RecommendationCard
                          provider={recommendedProvider.provider}
                          architecture={recommendedProvider.architecture}
                          reasoning={recommendedProvider.reasoning}
                        />
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        setAIResponse("");
                        setNodes([]);
                        setEdges([]);
                        setDiagramData(null);
                        setRecommendedProvider(null);
                        setCurrentSession(null);
                        setError("");
                      }}
                      className="w-full mt-6 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      New Analysis
                    </button>
                  </>
                )}
              </div>
            </div>
          }
          rightPanel={
            <div className="h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 overflow-y-auto">
              {/* Right Panel: Diagrams and Detailed Results */}
              {aiResponse || nodes.length > 0 || diagramData ? (
                <div className="p-6 space-y-6">
                  <DiagramView diagramData={diagramData} />
                  <ResultDisplay aiResponse={aiResponse} />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-20 w-20 mb-6 text-gray-300 dark:text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-2xl font-semibold text-gray-400 dark:text-gray-600 mb-2">
                      No results yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-600">
                      Submit a prompt to see diagrams and recommendations
                    </p>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
