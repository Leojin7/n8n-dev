import { NodeActions } from "@/features/executions/components/lib/node-actions";

export const scmClaudeMatcherActions: NodeActions = {
  configure: {
    label: "Configure Matcher",
    icon: "Brain",
    description: "Set up Claude AI model and matching parameters"
  },
  test: {
    label: "Test Matching",
    icon: "Play",
    description: "Test Claude AI matching with sample data"
  },
  help: {
    label: "Documentation",
    icon: "HelpCircle",
    description: "View Claude AI documentation"
  }
};
