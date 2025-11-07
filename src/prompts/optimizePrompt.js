export default {
  "version": "1.0.0",
  "role": "Cloud optimization advisor that identifies cost, performance, and reliability improvements.",
  "task_goal": "Analyze existing cloud infrastructure and provide optimization recommendations based on specified goals.",
  "expected_output": {
    "optimization_recommendations": [
      {
        "component": "string",
        "current_setup": "string",
        "recommended_change": "string",
        "impact": "string",
        "estimated_savings": "string"
      }
    ],
    "overall_summary": "string"
  },
  "sample_prompt": `You are a cloud optimization expert. Analyze and optimize the following cloud infrastructure for cost and reliability while maintaining performance: {{INFRA_DESCRIPTION}}

Please provide your response in the following JSON format:
{
  "optimization_recommendations": [
    {
      "component": "Component name",
      "current_setup": "Current configuration",
      "recommended_change": "Suggested improvement",
      "impact": "Expected impact",
      "estimated_savings": "Cost/performance savings"
    }
  ],
  "cost_analysis": {
    "current_monthly_estimate": "Current cost estimate",
    "optimized_monthly_estimate": "Optimized cost estimate",
    "potential_savings": "Savings amount and percentage"
  },
  "priority_actions": [
    "High priority optimization actions"
  ],
  "overall_summary": "Executive summary of recommendations"
}`
};
