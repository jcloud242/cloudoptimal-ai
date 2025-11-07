import ReactFlow, { MiniMap, Controls } from "react-flow-renderer";

export default function DiagramView({ nodes = [], edges = [] }) {
  if (!nodes.length) {
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
      <div className="h-96 w-full">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}