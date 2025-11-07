export default {
  "version": "1.0.0",
  "role": "Cloud architecture designer that creates multi-cloud infrastructure designs.",
  "task_goal": "Design cloud architecture recommendations for new workloads across AWS, Azure, and GCP.",
  "expected_output": {
    "architecture_recommendations": [
      {
        "provider": "string",
        "services": ["string"],
        "architecture_pattern": "string",
        "estimated_cost": "string",
        "pros": ["string"],
        "cons": ["string"]
      }
    ],
    "architecture_nodes": [
      {
        "id": "string",
        "type": "default", 
        "data": { "label": "string" },
        "position": { "x": 0, "y": 0 }
      }
    ],
    "architecture_edges": [
      {
        "id": "string",
        "source": "string",
        "target": "string"
      }
    ],
    "overall_recommendation": "string"
  },
  "sample_prompt": `You are a cloud architecture expert. Design a cloud architecture for the following workload: {{WORKLOAD_DESCRIPTION}}

Please provide your response in the following JSON format:
{
  "architecture_recommendations": [
    {
      "provider": "AWS/Azure/GCP",
      "services": ["list of services"],
      "architecture_pattern": "description",
      "estimated_cost": "cost estimate",
      "pros": ["advantages"],
      "cons": ["disadvantages"]
    }
  ],
  "architecture_nodes": [
    {
      "id": "node1",
      "type": "default",
      "data": { "label": "Service Name" },
      "position": { "x": 100, "y": 100 }
    }
  ],
  "architecture_edges": [
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2"
    }
  ],
  "overall_recommendation": "Summary and recommendation"
}`
};