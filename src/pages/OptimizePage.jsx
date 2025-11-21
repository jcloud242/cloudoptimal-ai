import PromptPage from "./PromptPage";
import { optimizePrompt } from "../prompts/optimizePrompt";

export default function OptimizePage() {
  return <PromptPage promptType="optimize" template={optimizePrompt} />;
}
