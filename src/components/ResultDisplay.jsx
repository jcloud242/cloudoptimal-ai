// Function to parse markdown-style formatting and convert to JSX
function parseMarkdownText(text) {
  if (!text) return null;
  
  // Split text while preserving markdown formatting
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    // Check if this part is bold markdown
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return (
        <span key={index} className="font-semibold text-blue-700 dark:text-blue-300">
          {boldMatch[1]}
        </span>
      );
    }
    // Regular text
    return <span key={index}>{part}</span>;
  });
}

// Function to format long summary text with proper breaks and structure
function formatSummaryText(text) {
  if (!text) return null;
  
  // Split on numbered sections (1. 2. 3. etc.) and other natural breaks
  const sections = text
    .split(/(?=\d+\.\s+\*\*)|(?=\*\*Next Steps)|(?=Key benefits include:)|(?=\*\*Key Benefits:|Key Benefits:)/)
    .map(section => section.trim())
    .filter(section => section.length > 0);
  
  return sections.map((section, index) => {
    // Handle numbered benefits/points (1. **Something:** text)
    const numberedMatch = section.match(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*(.*)/);
    if (numberedMatch) {
      const [, number, title, content] = numberedMatch;
      return (
        <div key={index} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full text-sm font-semibold flex items-center justify-center">
            {number}
          </span>
          <div>
            <span className="font-semibold text-blue-700 dark:text-blue-300">{title}:</span>
            <span className="ml-1">{parseMarkdownText(content)}</span>
          </div>
        </div>
      );
    }
    
    // Handle "Next Steps" section
    if (section.includes('Next Steps')) {
      const nextStepsContent = section.replace(/\*\*Next Steps[^:]*:\*\*\s*/, '');
      const steps = nextStepsContent
        .split(/\d+\.\s+\*\*/)
        .filter(step => step.trim())
        .map(step => step.replace(/\*\*([^*]+)\*\*/, '$1').trim());
      
      return (
        <div key={index}>
          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Next Steps for Implementation:</h5>
          <div className="space-y-2 ml-4">
            {steps.map((step, stepIndex) => {
              const stepParts = step.split(':');
              const stepTitle = stepParts[0];
              const stepContent = stepParts.slice(1).join(':').trim();
              
              return (
                <div key={stepIndex} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded text-sm font-semibold flex items-center justify-center">
                    {stepIndex + 1}
                  </span>
                  <div className="text-sm">
                    <span className="font-semibold text-green-700 dark:text-green-300">{stepTitle}:</span>
                    <span className="ml-1">{stepContent}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Handle regular paragraphs with markdown
    if (section.length > 150) {
      // Split long paragraphs on sentence boundaries
      const sentences = section.split(/(?<=\.)\s+/).filter(s => s.trim());
      if (sentences.length > 2) {
        return (
          <div key={index} className="space-y-2">
            {sentences.map((sentence, sentIndex) => (
              <p key={sentIndex} className="text-sm leading-relaxed">
                {parseMarkdownText(sentence)}
              </p>
            ))}
          </div>
        );
      }
    }
    
    // Default paragraph with markdown parsing
    return (
      <p key={index} className="text-sm leading-relaxed">
        {parseMarkdownText(section)}
      </p>
    );
  });
}

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
          <div className="space-y-6">
            {/* Recommended Solution */}
            {parsedData.recommended_solution && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Recommended Solution</h4>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                  {/* Single Provider Solution */}
                  {parsedData.recommended_solution.recommended_provider && (
                    <>
                      <div className="font-medium text-blue-700 dark:text-blue-300 text-lg mb-2">
                        Recommended Provider: {parsedData.recommended_solution.recommended_provider}
                      </div>
                      <div className="text-gray-700 dark:text-gray-200 mb-2">
                        <strong>Architecture:</strong> {parsedData.recommended_solution.recommended_architecture}
                      </div>
                    </>
                  )}
                  {/* Multi-Provider Solution */}
                  {parsedData.recommended_solution.primary_provider && (
                    <>
                      <div className="font-medium text-blue-700 dark:text-blue-300 text-lg mb-2">
                        Multi-Cloud Strategy: {parsedData.recommended_solution.multi_cloud_strategy}
                      </div>
                      <div className="text-gray-700 dark:text-gray-200 mb-2">
                        <strong>Primary Provider:</strong> {parsedData.recommended_solution.primary_provider}
                      </div>
                      <div className="text-gray-700 dark:text-gray-200 mb-2">
                        <strong>Secondary Provider:</strong> {parsedData.recommended_solution.secondary_provider}
                      </div>
                    </>
                  )}
                  {parsedData.recommended_solution.justification && (
                    <div className="text-gray-600 dark:text-gray-300 text-sm">
                      <strong>Justification:</strong> {parsedData.recommended_solution.justification}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resource Table */}
            {parsedData.resource_table && parsedData.resource_table.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Resource Architecture</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Resource</th>
                        {/* Multi-Provider Headers */}
                        {parsedData.resource_table[0]?.deployment_strategy ? (
                          <>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Deployment Strategy</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Description</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">WAF Patterns</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Cost (Monthly Est.)</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">SKU/Tier</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Description</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">WAF Patterns</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Cost (Monthly Est.)</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.resource_table.map((resource, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                          <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">{resource.resource}</td>
                          {/* Multi-Provider Data */}
                          {resource.deployment_strategy ? (
                            <>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.deployment_strategy}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.description}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.waf_patterns}</td>
                              <td className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">{resource.cost_monthly_est}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.sku_tier}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.description}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.waf_patterns}</td>
                              <td className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">{resource.cost_monthly_est}</td>
                            </>
                          )}
                        </tr>
                      ))}
                      {/* Total Cost Row for Resource Table */}
                      <tr className="bg-blue-50 dark:bg-blue-900/30 font-medium border-t-2 border-blue-200 dark:border-blue-800">
                        <td className="px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-300" colSpan={parsedData.resource_table[0]?.deployment_strategy ? "3" : "3"}>
                          Total Recommended Solution Cost
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400">
                          {(() => {
                            const costs = parsedData.resource_table.map(resource => {
                              const cost = resource.cost_monthly_est;
                              if (typeof cost === 'string') {
                                const match = cost.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/);
                                return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
                              }
                              return typeof cost === 'number' ? cost : 0;
                            });
                            const total = costs.reduce((sum, cost) => sum + cost, 0);
                            return total > 0 ? `$${total.toLocaleString()}` : 'Contact for pricing';
                          })()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CSP Comparison Table */}
            {parsedData.csp_comparison_table && parsedData.csp_comparison_table.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Cloud Provider Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Component</th>
                        {/* Multi-Provider Headers */}
                        {parsedData.csp_comparison_table[0]?.primary_cloud ? (
                          <>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Primary Cloud</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Secondary Cloud</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Integration</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">AWS</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">Azure</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">GCP</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.csp_comparison_table.map((row, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-600">
                          <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">{row.component}</td>
                          {/* Multi-Provider Data */}
                          {row.primary_cloud ? (
                            <>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.primary_cloud}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.secondary_cloud}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.integration_method}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.aws}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.azure}</td>
                              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.gcp}</td>
                            </>
                          )}
                        </tr>
                      ))}
                      {parsedData.cost_comparison && (
                        <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                          <td className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200">Total Monthly Cost</td>
                          {/* Multi-Provider Cost Display */}
                          {parsedData.cost_comparison.multi_cloud_total ? (
                            <>
                              <td className="px-4 py-2 text-sm font-bold text-green-600 dark:text-green-400">{parsedData.cost_comparison.single_cloud_aws || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm font-bold text-green-600 dark:text-green-400">{parsedData.cost_comparison.single_cloud_azure || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400">Multi-Cloud: {parsedData.cost_comparison.multi_cloud_total}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-2 text-sm font-bold text-green-600 dark:text-green-400">{parsedData.cost_comparison.aws_total}</td>
                              <td className="px-4 py-2 text-sm font-bold text-green-600 dark:text-green-400">{parsedData.cost_comparison.azure_total}</td>
                              <td className="px-4 py-2 text-sm font-bold text-green-600 dark:text-green-400">{parsedData.cost_comparison.gcp_total}</td>
                            </>
                          )}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Migration Strategy (Multi-Provider specific) */}
            {parsedData.migration_strategy && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Implementation Strategy</h4>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded border border-purple-200 dark:border-purple-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {parsedData.migration_strategy.phase_1 && (
                      <div>
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Phase 1</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{parsedData.migration_strategy.phase_1}</p>
                      </div>
                    )}
                    {parsedData.migration_strategy.phase_2 && (
                      <div>
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Phase 2</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{parsedData.migration_strategy.phase_2}</p>
                      </div>
                    )}
                    {parsedData.migration_strategy.phase_3 && (
                      <div>
                        <h5 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Phase 3</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-200">{parsedData.migration_strategy.phase_3}</p>
                      </div>
                    )}
                  </div>
                  {parsedData.migration_strategy.timeline && (
                    <div className="mb-2">
                      <span className="font-medium text-gray-700 dark:text-gray-200">Timeline:</span> 
                      <span className="text-gray-600 dark:text-gray-300"> {parsedData.migration_strategy.timeline}</span>
                    </div>
                  )}
                  {parsedData.migration_strategy.risk_mitigation && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-200">Risk Mitigation:</span> 
                      <span className="text-gray-600 dark:text-gray-300"> {parsedData.migration_strategy.risk_mitigation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legacy Architecture Recommendations for backward compatibility */}
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

            {/* Tradeoffs Analysis */}
            {parsedData.tradeoffs_analysis && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Objective Analysis</h4>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                  {parsedData.tradeoffs_analysis.advantages && (
                    <div className="mb-3">
                      <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Advantages:</h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-200 list-disc list-inside space-y-1">
                        {parsedData.tradeoffs_analysis.advantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parsedData.tradeoffs_analysis.disadvantages && (
                    <div className="mb-3">
                      <h5 className="font-medium text-red-700 dark:text-red-300 mb-1">Disadvantages:</h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-200 list-disc list-inside space-y-1">
                        {parsedData.tradeoffs_analysis.disadvantages.map((disadvantage, index) => (
                          <li key={index}>{disadvantage}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {parsedData.tradeoffs_analysis.considerations && (
                    <div>
                      <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Key Considerations:</h5>
                      <ul className="text-sm text-gray-700 dark:text-gray-200 list-disc list-inside space-y-1">
                        {parsedData.tradeoffs_analysis.considerations.map((consideration, index) => (
                          <li key={index}>{consideration}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optimization Recommendations */}
            {parsedData.optimization_recommendations && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Optimization Recommendations</h4>
                <div className="space-y-3">
                  {parsedData.optimization_recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{rec.provider}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rec.optimization_type}</div>
                      <div className="text-sm mt-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Recommendation:</span> 
                        <span className="text-gray-600 dark:text-gray-300"> {rec.recommendation}</span>
                      </div>
                      {rec.cost_savings && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                          Potential Savings: {rec.cost_savings}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Migration Recommendations */}
            {parsedData.migration_recommendations && (
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Migration Recommendations</h4>
                <div className="space-y-3">
                  {parsedData.migration_recommendations.map((rec, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{rec.provider}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{rec.migration_strategy}</div>
                      <div className="text-sm mt-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Approach:</span> 
                        <span className="text-gray-600 dark:text-gray-300"> {rec.approach}</span>
                      </div>
                      {rec.timeline && (
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                          Timeline: {rec.timeline}
                        </div>
                      )}
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
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded border border-blue-200 dark:border-blue-800">
                  <div className="text-gray-700 dark:text-gray-200 space-y-3">
                    {formatSummaryText(parsedData.overall_recommendation || parsedData.overall_summary || parsedData.summary)}
                  </div>
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