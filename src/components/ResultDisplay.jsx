export default function ResultDisplay({ aiResponse }) {
  if (!aiResponse) return null;

  // Try to parse and format JSON responses
  let parsedData = null;
  let isJson = false;
  
  try {
    parsedData = JSON.parse(aiResponse);
    isJson = true;
  } catch {
    // Try to extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
        isJson = true;
      } catch {
        // Keep as plain text
      }
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">AI Recommendations</h3>
      </div>
      <div className="p-4">
        {isJson && parsedData ? (
          <div className="space-y-4">
            {/* Architecture Recommendations */}
            {parsedData.architecture_recommendations && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Architecture Recommendations</h4>
                <div className="space-y-3">
                  {parsedData.architecture_recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{rec.provider}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rec.architecture_pattern}</div>
                      <div className="text-sm mt-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Services:</span> 
                        <span className="text-gray-600 dark:text-gray-300"> {rec.services?.join(", ")}</span>
                      </div>
                      {rec.estimated_cost && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                          Estimated Cost: {rec.estimated_cost}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optimization Recommendations */}
            {parsedData.optimization_recommendations && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Optimization Recommendations</h4>
                <div className="space-y-3">
                  {parsedData.optimization_recommendations.map((opt, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{opt.component}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Current:</span> {opt.current_setup}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Recommended:</span> {opt.recommended_change}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                        Expected Savings: {opt.estimated_savings}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Migration Steps */}
            {parsedData.migration_steps && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Migration Plan</h4>
                <div className="space-y-3">
                  {parsedData.migration_steps.map((step, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{step.step}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{step.description}</div>
                      <div className="text-sm mt-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Target:</span> 
                        <span className="text-gray-600 dark:text-gray-300"> {step.target_provider}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Services:</span> 
                        <span className="text-gray-600 dark:text-gray-300"> {step.services?.join(", ")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overall Summary */}
            {(parsedData.overall_recommendation || parsedData.overall_summary || parsedData.summary) && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Summary</h4>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-gray-700 dark:text-gray-200">
                    {parsedData.overall_recommendation || parsedData.overall_summary || parsedData.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Raw JSON for debugging */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                View Raw Response
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-700 overflow-auto max-h-96 rounded border border-gray-200 dark:border-gray-600">
            <pre className="font-mono text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-200 p-3">{aiResponse}</pre>
          </div>
        )}
      </div>
    </div>
  );
}