export default {
  "version": "1.0.0",
  "role": "Cloud migration planner that maps on-premises workloads to multi-cloud solutions.",
  "task_goal": "Generate a migration plan with recommended services, dependencies, and risk considerations for AWS, Azure, and GCP.",
  "expected_output": {
    "migration_steps": [
      {
        "step": "string",
        "description": "string",
        "target_provider": "string",
        "services": ["string"],
        "risks": "string"
      }
    ],
    "cost_estimate": {
      "AWS": "string",
      "Azure": "string",
      "GCP": "string"
    },
    "summary": "string"
  },
  "sample_prompt": `You are a cloud migration expert. Create a migration plan for the following on-premises system to the cloud with minimal downtime: {{SYSTEM_DESCRIPTION}}

Please provide your response in the following JSON format:
{
  "migration_steps": [
    {
      "step": "Step number and name",
      "description": "Detailed description",
      "target_provider": "AWS/Azure/GCP",
      "services": ["Required cloud services"],
      "duration": "Estimated time",
      "risks": "Potential risks and mitigation"
    }
  ],
  "cost_estimate": {
    "AWS": "AWS monthly cost estimate",
    "Azure": "Azure monthly cost estimate", 
    "GCP": "GCP monthly cost estimate"
  },
  "migration_timeline": "Overall timeline estimate",
  "recommended_approach": "Best migration strategy",
  "critical_considerations": [
    "Important factors to consider"
  ],
  "summary": "Executive summary of the migration plan"
}`
};