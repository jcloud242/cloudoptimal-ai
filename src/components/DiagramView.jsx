import ArchitectureDiagram from "./ArchitectureDiagram_ReactFlow";
import { AlertCircle } from "lucide-react";

/**
 * DiagramView Component
 * 
 * Renders architecture diagrams using the new JSON-based custom SVG diagram system.
 * This replaces the previous Mermaid-based rendering for better control and reliability.
 */
export default function DiagramView({ diagramData }) {
  if (!diagramData) {
    return null; // Don't show anything if no diagram data
  }

  // Handle legacy mermaidCode string (convert to warning)
  if (typeof diagramData === 'string') {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900/30 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Architecture Diagram
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                Legacy Diagram Format
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                This session uses the old Mermaid diagram format. Please generate a new architecture to see the improved interactive diagrams.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render new JSON-based diagram
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900/30 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Architecture Diagram
        </h3>
      </div>
      <div className="p-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 h-[600px]">
        <ArchitectureDiagram data={diagramData} />
      </div>
      
      <div className="p-6">
        <details className="mt-0">
          <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
            View JSON Source
          </summary>
          <pre className="mt-2 text-xs bg-gray-800 dark:bg-gray-950 text-gray-300 dark:text-gray-400 p-4 rounded-lg overflow-auto max-h-60 border border-gray-700 dark:border-gray-800">
            {JSON.stringify(diagramData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
