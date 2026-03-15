import { NodeActions } from "@/features/executions/components/lib/node-actions";

export const scmStorageActions: NodeActions = {
  configure: {
    label: "Configure Storage",
    icon: "Database",
    description: "Set up database storage options"
  },
  test: {
    label: "Test Storage",
    icon: "Play",
    description: "Test database connection and storage"
  },
  help: {
    label: "Documentation",
    icon: "HelpCircle",
    description: "View storage documentation"
  }
};
