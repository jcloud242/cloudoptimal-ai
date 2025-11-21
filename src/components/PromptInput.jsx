import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function PromptInput({ onSubmit, disabled, placeholder, loading, templateName }) {
  const [userInput, setUserInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || disabled) return;
    onSubmit(userInput);
    setUserInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
      {/* Prompt Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide">
          Prompt Type
        </label>
        <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white font-medium text-sm border border-gray-200 dark:border-gray-700">
          {templateName || "Design"}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          CAF & Well-Architected framework integration
        </p>
      </div>

      {/* Requirements Description */}
      <div className="flex-1 flex flex-col">
        <label
          htmlFor="requirements"
          className="block text-xs font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wide"
        >
          Requirements Description
        </label>
        <textarea
          id="requirements"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={placeholder || "Describe your requirements in detail..."}
          disabled={disabled}
          className="flex-1 min-h-[200px] px-4 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:opacity-50 transition-all text-sm resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!userInput.trim() || loading}
        className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg disabled:shadow-none"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Generating..." : "Get Recommendations"}
      </button>
    </form>
  );
}