import { NodeActions } from "@/features/executions/components/lib/node-actions";

export const scmReportGeneratorActions: NodeActions = {
  configure: {
    label: "Configure Generator",
    icon: "FileText",
    description: "Set up report formats and options"
  },
  test: {
    label: "Test Generation",
    icon: "Play",
    description: "Test report generation with sample data"
  },
  help: {
    label: "Documentation",
    icon: "HelpCircle",
    description: "View report generation documentation"
  }
};
