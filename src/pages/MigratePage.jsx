import PromptPage from "./PromptPage";
import { migratePrompt } from "../prompts/migratePrompt";

export default function MigratePage() {
  return <PromptPage promptType="migrate" template={migratePrompt} />;
}
