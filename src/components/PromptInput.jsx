import { useState } from "react";

    const promptOptions = [
      { value: 'design', label: 'Design Architecture', description: 'Get architecture recommendations with CAF & Well-Architected framework integration' },
      { value: 'optimize', label: 'Optimize Existing', description: 'Optimize current cloud architecture for cost, performance, and compliance' },
      { value: 'migrate', label: 'Migration Planning', description: 'Plan migration strategy with risk assessment and timeline' },
      { value: 'multiProvider', label: 'Multi-Cloud Strategy', description: 'Design resilient multi-cloud architectures leveraging multiple providers' }
    ];const placeholderText = {
  design: "Describe your workload with business context (e.g., 'E-commerce platform, 50k users/day, need 99.9% uptime, PCI compliance, global audience')",
  optimize: "Describe current infrastructure and pain points (e.g., 'AWS setup: EC2 t3.large, RDS MySQL, high costs, slow response times')",
  migrate: "Describe on-premises system and constraints (e.g., 'Legacy .NET app, SQL Server, 1000 users, compliance requirements, budget constraints')",
  multiProvider: "Describe requirements that benefit from multi-cloud (e.g., 'Global app, disaster recovery, avoid vendor lock-in, regulatory compliance across regions')"
};

export default function PromptInput({ onSubmit, templates, disabled, onClearSession }) {
  const [selectedPrompt, setSelectedPrompt] = useState("design");
  const [userInput, setUserInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || disabled) return;
    onSubmit(selectedPrompt, userInput);
    setUserInput("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Get AI Recommendations</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Select a prompt type and describe your requirements</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Prompt Type
          </label>
          <select
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            disabled={disabled}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 appearance-none cursor-pointer"
          >
            {Object.keys(templates).map((key) => (
              <option key={key} value={key} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                {key.charAt(0).toUpperCase() + key.slice(1)} Architecture
              </option>
            ))}
          </select>
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Selected: {selectedPrompt.charAt(0).toUpperCase() + selectedPrompt.slice(1)} Architecture
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {promptOptions.find(option => option.value === selectedPrompt)?.description || ''}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Requirements Description
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={placeholderText[selectedPrompt]}
            disabled={disabled}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 h-32 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
          />
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            disabled={!userInput.trim() || disabled}
            className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {disabled ? "Getting Recommendations..." : "Get AI Recommendations"}
          </button>
          
          {onClearSession && (
            <button 
              type="button"
              onClick={onClearSession}
              disabled={disabled}
              className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
              title="Clear current session for fresh AI context"
            >
              Clear Session
            </button>
          )}
        </div>
      </form>
    </div>
  );
}