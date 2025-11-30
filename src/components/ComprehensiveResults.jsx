import { useState } from 'react';
import { Cloud, Zap, Shield, DollarSign, Gauge, Cog } from 'lucide-react';
import DiagramView from './DiagramView';

// Function to parse markdown-style formatting
function parseMarkdownText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
    if (boldMatch) {
      return (
        <span key={index} className="font-semibold text-blue-700 dark:text-blue-300">
          {boldMatch[1]}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function ComprehensiveResults({ aiResponse, diagramData, recommendedProvider }) {
  const [howItWorksExpanded, setHowItWorksExpanded] = useState(false);

  if (!aiResponse) return null;

  let parsedData = null;
  try {
    parsedData = JSON.parse(aiResponse);
  } catch {
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[0]);
      } catch {
        // Keep as plain text
      }
    }
  }

  // Extract data from parsed response
  const howItWorks = parsedData?.how_it_works || parsedData?.workflow_steps || [];
  const keyBenefits = parsedData?.key_benefits || parsedData?.benefits || [];
  const wafHighlights = parsedData?.waf_highlights || parsedData?.well_architected || {};
  const nextSteps = parsedData?.next_steps || parsedData?.implementation_steps || [];
  const providerRationale = parsedData?.provider_rationale || parsedData?.recommended_solution?.justification || "";

  // WAF pillars mapping with icons and colors - ALWAYS these 5, no more, no less
  const wafPillars = {
    security: { icon: Shield, color: 'yellow', label: 'Security' },
    cost_optimization: { icon: DollarSign, color: 'green', label: 'Cost Optimization' },
    operational_excellence: { icon: Cog, color: 'purple', label: 'Operational Excellence' },
    performance_efficiency: { icon: Gauge, color: 'pink', label: 'Performance Efficiency' },
    reliability: { icon: Zap, color: 'blue', label: 'Reliability' }
  };

  // Filter to ONLY show the 5 defined pillars, ignore any others AI might add
  const validWafHighlights = {};
  Object.keys(wafPillars).forEach(key => {
    if (wafHighlights[key]) {
      validWafHighlights[key] = wafHighlights[key];
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-white">
      {/* Recommended Solution Header */}
      {recommendedProvider && (
        <header className="border-b border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="w-8 h-8 text-blue-500 dark:text-blue-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Recommended Architecture
              </h1>
            </div>
            <div className="mb-3">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">
                {recommendedProvider.provider} - {recommendedProvider.architecture}
              </h2>
            </div>
            <p className="text-gray-700 dark:text-slate-300 text-lg max-w-full leading-relaxed">
              {recommendedProvider.reasoning}
            </p>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* How It Works & Key Benefits - Combined Single Card */}
        {(howItWorks.length > 0 || keyBenefits.length > 0) && (
          <div className="bg-white/80 dark:bg-slate-800/50 rounded-xl p-8 border-0 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* How It Works - Left Side */}
              {howItWorks.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">How It Works</h3>
                  <ul className="space-y-3 text-gray-700 dark:text-slate-300">
                    {howItWorks.slice(0, howItWorksExpanded ? undefined : 5).map((step, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <span className="flex-shrink-0 w-7 h-7 bg-blue-500 dark:bg-blue-600 text-white rounded-full text-sm font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="flex-1">{typeof step === 'string' ? step : step.description || step.step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Benefits - Right Side */}
              {keyBenefits.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700 dark:text-slate-300">
                    {keyBenefits.slice(0, 5).map((benefit, index) => (
                      <li key={index} className="flex gap-3 items-start">
                        <span className="text-cyan-500 dark:text-cyan-400 flex-shrink-0 text-lg">✓</span>
                        <span className="flex-1">{typeof benefit === 'string' ? parseMarkdownText(benefit) : benefit.description || benefit.benefit}</span>
                      </li>
                    ))}
                  </ul>
                  {howItWorks.length > 5 && (
                    <div className="mt-4 text-right">
                      <span
                        onClick={() => setHowItWorksExpanded(!howItWorksExpanded)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm cursor-pointer"
                      >
                        {howItWorksExpanded ? '...See Less' : '...See More'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Architecture Diagram */}
        {diagramData && (
          <div>
            <DiagramView diagramData={diagramData} />
          </div>
        )}

        {/* Resource Table */}
        {parsedData?.resource_table && parsedData.resource_table.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900/30 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resource Architecture</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">Resource</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">SKU/Tier</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">WAF Patterns</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">Cost (Monthly Est.)</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.resource_table.map((resource, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-slate-600">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">{resource.resource}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.sku_tier}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.description}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{resource.waf_patterns}</td>
                      <td className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400">{resource.cost_monthly_est}</td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50 dark:bg-blue-900/30 font-medium border-t-2 border-blue-200 dark:border-blue-800">
                    <td className="px-4 py-2 text-sm font-bold text-blue-700 dark:text-blue-300" colSpan="4">
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

        {/* Enhanced Summary */}
        {(parsedData?.overall_recommendation || parsedData?.overall_summary || parsedData?.summary) && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900/30 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Solution Summary</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="text-gray-700 dark:text-gray-200 leading-relaxed">
                {parseMarkdownText(parsedData.overall_recommendation || parsedData.overall_summary || parsedData.summary)}
              </div>
              
              {/* Provider Rationale */}
              {providerRationale && recommendedProvider && (
                <div className="mt-6 p-5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg mb-2">
                    Why {recommendedProvider.provider}?
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                    {providerRationale}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WAF Highlights - ALWAYS show exactly 5 pillars */}
        {Object.keys(validWafHighlights).length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Well-Architected Framework Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(validWafHighlights).map(([key, value]) => {
                const pillarConfig = wafPillars[key];
                const Icon = pillarConfig.icon;
                return (
                  <div
                    key={key}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 hover:border-blue-400 dark:hover:border-slate-600 transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-5 h-5 text-${pillarConfig.color}-500 dark:text-${pillarConfig.color}-400`} />
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100">{pillarConfig.label}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed">
                      {typeof value === 'string' ? value : value.summary || value.description || ''}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CSP Comparison Table */}
        {parsedData?.csp_comparison_table && parsedData.csp_comparison_table.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-blue-900/30 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cloud Provider Comparison</h3>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">Component</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">AWS</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">Azure</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-600">GCP</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.csp_comparison_table.map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-slate-600">
                      <td className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200">{row.component}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.aws}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.azure}</td>
                      <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{row.gcp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {nextSteps.length > 0 && (
          <div className="bg-white/80 dark:bg-slate-800/50 rounded-xl p-6 border-0 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Next Steps for Implementation</h3>
            <ul className="space-y-4 text-gray-700 dark:text-slate-300">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 bg-green-500 dark:bg-green-600 text-white rounded-full text-sm font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    {typeof step === 'string' ? (
                      <span>{step}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-gray-900 dark:text-slate-100 block mb-1">
                          {step.title || step.step}:
                        </span>
                        <span className="text-sm">{step.description || step.details}</span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
