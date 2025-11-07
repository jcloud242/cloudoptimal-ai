import { useState } from "react";

const promptDescriptions = {
  design: "Get AI-powered architecture recommendations for new workloads across AWS, Azure, and GCP",
  optimize: "Analyze existing infrastructure for cost savings and performance improvements", 
  migrate: "Create migration plans from on-premises or legacy systems to the cloud"
};

const placeholderText = {
  design: "Describe your application or workload requirements (e.g., 'A web application with 10,000 daily users, requiring high availability and auto-scaling')",
  optimize: "Describe your current cloud infrastructure setup (e.g., 'Running on AWS EC2 t3.large instances with RDS MySQL, experiencing high costs')",
  migrate: "Describe your on-premises system (e.g., 'Legacy Java application on physical servers with Oracle database, 500 concurrent users')"
};

export default function PromptInput({ onSubmit, templates, disabled }) {
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
              {promptDescriptions[selectedPrompt]}
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

        <button 
          type="submit" 
          disabled={!userInput.trim() || disabled}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {disabled ? "Getting Recommendations..." : "Get AI Recommendations"}
        </button>
      </form>
    </div>
  );
}