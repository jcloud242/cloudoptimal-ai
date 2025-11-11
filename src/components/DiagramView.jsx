import { useEffect, useRef } from "react";
import ReactFlow, { MiniMap, Controls } from "react-flow-renderer";
import mermaid from "mermaid";

export default function DiagramView({ nodes = [], edges = [], mermaidCode = "" }) {
  const mermaidRef = useRef(null);

  useEffect(() => {
    // Initialize Mermaid
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    if (mermaidCode && mermaidRef.current) {
      console.log('🎨 DiagramView: Attempting to render Mermaid code:', mermaidCode);
      
      // Clear previous content
      mermaidRef.current.innerHTML = '';
      
      const renderDiagram = async () => {
        try {
          // Clean the mermaid code
          let cleanCode = mermaidCode.trim();
          
          // Check if it's already a valid diagram type
          if (!cleanCode.startsWith('flowchart') && 
              !cleanCode.startsWith('graph') && 
              !cleanCode.startsWith('architecture-beta')) {
            console.log('🔧 Adding flowchart TD prefix to code');
            cleanCode = `flowchart TD\n${cleanCode}`;
          }
          
          console.log('✨ Final Mermaid code to render:', cleanCode);
          
          // Generate unique ID for this diagram
          const diagramId = `mermaid-diagram-${Date.now()}`;
          
          // Use mermaid.render instead of init for better control
          const { svg } = await mermaid.render(diagramId, cleanCode);
          
          // Insert the SVG directly
          mermaidRef.current.innerHTML = svg;
          console.log('✅ Mermaid diagram rendered successfully');
          
        } catch (error) {
          console.error('❌ Mermaid rendering error:', error);
          
          // Show detailed error info
          mermaidRef.current.innerHTML = `
            <div class="mermaid-error p-4">
              <p class="text-red-600 dark:text-red-400 mb-2 font-semibold">Error rendering diagram</p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Error: ${error.message}</p>
              <div class="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded border border-yellow-200 dark:border-yellow-800 mb-3">
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Mermaid Code Received:</p>
                <pre class="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto text-gray-600 dark:text-gray-300">${mermaidCode}</pre>
              </div>
              <div class="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-800">
                <p class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Expected Format Example:</p>
                <pre class="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto text-gray-600 dark:text-gray-300">flowchart TD
    A[Load Balancer] --> B[Web Server]
    B --> C[(Database)]</pre>
              </div>
            </div>
          `;
        }
      };
      
      renderDiagram();
    }
  }, [mermaidCode]);

  if (!nodes.length && !mermaidCode) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Architecture Diagram</h3>
        </div>
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <p>No architecture diagram available yet.</p>
          <p className="text-sm mt-1">Submit a design prompt to generate a visual diagram.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Architecture Diagram</h3>
      </div>
      
      {/* Debug info and test button */}
      {!mermaidCode && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            🔍 Debug: mermaidCode = "{mermaidCode}" (length: {mermaidCode.length})
          </p>
          <button 
            onClick={async () => {
              // Test with a simple diagram
              const testCode = `flowchart TD
    A[Load Balancer] --> B[Web Server]
    B --> C[(Database)]
    C --> D[Cache]`;
              console.log('🧪 Testing with sample Mermaid code:', testCode);
              
              if (mermaidRef.current) {
                try {
                  mermaidRef.current.innerHTML = '';
                  const diagramId = `test-diagram-${Date.now()}`;
                  const { svg } = await mermaid.render(diagramId, testCode);
                  mermaidRef.current.innerHTML = svg;
                  console.log('✅ Test diagram rendered successfully');
                } catch (error) {
                  console.error('❌ Test diagram failed:', error);
                  mermaidRef.current.innerHTML = `<div class="text-red-500 p-4">Test failed: ${error.message}</div>`;
                }
              }
            }}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            Test Mermaid Rendering
          </button>
        </div>
      )}

      {/* Mermaid Diagram Display */}
      {mermaidCode && (
        <div className="p-4">
          <div className="mb-2 text-sm text-green-600 dark:text-green-400">
            ✅ Mermaid code received (length: {mermaidCode.length})
          </div>
          <div ref={mermaidRef} className="mermaid-container flex justify-center min-h-[200px]">
            {/* Mermaid diagram will be rendered here */}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              View Mermaid Code
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {mermaidCode}
            </pre>
          </details>
        </div>
      )}
      
      {/* React Flow Diagram (legacy support) */}
      {nodes.length > 0 && (
        <div className="h-96 w-full">
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <MiniMap />
            <Controls />
          </ReactFlow>
        </div>
      )}
    </div>
  );
}