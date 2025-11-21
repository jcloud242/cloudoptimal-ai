import PromptPage from "./PromptPage";
import { designPrompt } from "../prompts/designPrompt";

export default function DesignPage() {
  return <PromptPage promptType="design" template={designPrompt} />;
}
