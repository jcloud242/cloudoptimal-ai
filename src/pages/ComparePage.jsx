import PromptPage from "./PromptPage";
import { multiProviderPrompt } from "../prompts/multiProviderPrompt";

export default function ComparePage() {
  return <PromptPage promptType="multiProvider" template={multiProviderPrompt} />;
}
