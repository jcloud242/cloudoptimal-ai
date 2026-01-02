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
  
  // Split on numbered sections and key markers
  const sections = text
    .split(/(?=\d+\.\s+\*\*)|(?=\*\*Next Steps)|(?=\*\*Key [Bb]enefits)/)
    .map(section => section.trim())
    .filter(section => section.length > 0);
  
  return sections.map((section, index) => {
    // Handle numbered benefits/points (1. **Something:** text)
    const numberedMatch = section.match(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*([\s\S]*)/);
    if (numberedMatch) {
      const [, number, title, content] = numberedMatch;
      return (
        <div key={index} className="flex gap-3 mb-3">
          <span className="flex-shrink-0 w-7 h-7 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full text-sm font-semibold flex items-center justify-center mt-0.5">
            {number}
          </span>
          <div className="flex-1">
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              <span className="font-semibold text-blue-700 dark:text-blue-300">{title}:</span>
              {' '}{parseMarkdownText(content.trim())}
            </p>
          </div>
        </div>
      );
    }
    
    // Handle "Key Benefits" section
    if (section.match(/\*\*Key [Bb]enefits/)) {
      const benefitsContent = section.replace(/\*\*Key [Bb]enefits[^:]*:\*\*\s*/, '');
      const benefits = benefitsContent
        .split(/[,;]|(?=\s+[A-Z][a-z]+\s+[a-z]+)/)
        .map(b => b.trim())
        .filter(b => b.length > 10);
      
      return (
        <div key={index} className="my-4">
          <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Key Benefits
          </h5>
          <ul className="space-y-2 ml-7">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 flex gap-2">
                <span className="text-blue-500 dark:text-blue-400 flex-shrink-0">•</span>
                <span>{parseMarkdownText(benefit)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    // Handle "Next Steps" section with numbered sub-steps
    if (section.includes('Next Steps')) {
      const nextStepsContent = section.replace(/\*\*Next Steps[^:]*:\*\*\s*/, '');
      const steps = nextStepsContent
        .split(/(?=\d+\.\s+\*\*)/)
        .filter(step => step.trim())
        .map(step => {
          const stepMatch = step.match(/^(\d+)\.\s+\*\*([^:]+):\*\*\s*([\s\S]*)/);
          if (stepMatch) {
            return {
              number: stepMatch[1],
              title: stepMatch[2].trim(),
              content: stepMatch[3].trim()
            };
          }
          return null;
        })
        .filter(Boolean);
      
      if (steps.length > 0) {
        return (
          <div key={index} className="my-4">
            <h5 className="font-semibold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Next Steps for Implementation
            </h5>
            <div className="space-y-3">
              {steps.map((step, stepIndex) => (
                <div key={stepIndex} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 rounded-full text-xs font-semibold flex items-center justify-center mt-0.5">
                    {step.number}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-green-700 dark:text-green-300 block mb-1">{step.title}:</span>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{step.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    
    // Handle regular paragraphs - split long ones for readability
    if (section.length > 200) {
      const sentences = section.match(/[^.!?]+[.!?]+/g) || [section];
      return (
        <div key={index} className="space-y-2 mb-3">
          {sentences.map((sentence, sentIndex) => (
            <p key={sentIndex} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {parseMarkdownText(sentence.trim())}
            </p>
          ))}
        </div>
      );
    }
    
    // Default paragraph with markdown parsing
    return (
      <p key={index} className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-3">
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

  const detectProviderKey = (data) => {
    const providerRaw =
      data?.recommended_solution?.recommended_provider ||
      data?.recommended_solution?.primary_provider ||
      data?.recommended_solution?.provider ||
      '';
    const provider = String(providerRaw).toLowerCase();
    if (provider.includes('aws') || provider.includes('amazon')) return 'aws';
    if (provider.includes('azure') || provider.includes('microsoft')) return 'azure';
    if (provider.includes('gcp') || provider.includes('google')) return 'gcp';
    return null;
  };

  const getResourceTableTotalText = (data) => {
    if (!data?.resource_table || data.resource_table.length === 0) return null;

    const costComparison = data.cost_comparison;
    if (costComparison) {
      if (costComparison.multi_cloud_total) return costComparison.multi_cloud_total;

      const providerKey = detectProviderKey(data);
      if (providerKey === 'aws' && costComparison.aws_total) return costComparison.aws_total;
      if (providerKey === 'azure' && costComparison.azure_total) return costComparison.azure_total;
      if (providerKey === 'gcp' && costComparison.gcp_total) return costComparison.gcp_total;
    }

    const costs = data.resource_table.map(resource => {
      const cost = resource.cost_monthly_est;
      if (typeof cost === 'string') {
        const match = cost.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)/);
        return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      }
      return typeof cost === 'number' ? cost : 0;
    });
    const total = costs.reduce((sum, cost) => sum + cost, 0);
    return total > 0 ? `$${total.toLocaleString()}` : 'Contact for pricing';
  };

  const getCostTotalCellClass = (isRecommended) =>
    `px-4 py-2 text-sm font-bold ${
      isRecommended
        ? 'text-green-600 dark:text-green-400'
        : 'text-gray-600 dark:text-gray-300'
    }`;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900/30 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Detailed Results
        </h3>
      </div>
      <div className="p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">{isJson && parsedData ? (
          <div className="space-y-6">
            {/* Resource Table - FIRST */}
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
                          {getResourceTableTotalText(parsedData)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Overall Summary - SECOND, right after resource table */}
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

            {/* CSP Comparison Table - THIRD and LAST */}
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
                              <td className={getCostTotalCellClass(false)}>{parsedData.cost_comparison.single_cloud_aws || 'N/A'}</td>
                              <td className={getCostTotalCellClass(false)}>{parsedData.cost_comparison.single_cloud_azure || 'N/A'}</td>
                              <td className={getCostTotalCellClass(true)}>
                                Multi-Cloud: {parsedData.cost_comparison.multi_cloud_total}
                                {parsedData.cost_comparison.single_cloud_gcp ? ` (GCP: ${parsedData.cost_comparison.single_cloud_gcp})` : ''}
                              </td>
                            </>
                          ) : (
                            <>
                              {(() => {
                                const recommendedKey = detectProviderKey(parsedData);
                                return (
                                  <>
                                    <td className={getCostTotalCellClass(recommendedKey === 'aws')}>{parsedData.cost_comparison.aws_total}</td>
                                    <td className={getCostTotalCellClass(recommendedKey === 'azure')}>{parsedData.cost_comparison.azure_total}</td>
                                    <td className={getCostTotalCellClass(recommendedKey === 'gcp')}>{parsedData.cost_comparison.gcp_total}</td>
                                  </>
                                );
                              })()}
                            </>
                          )}
                        </tr>
                      )}
                    </tbody>
                  </table>
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