import { NodeActions } from "@/features/executions/components/lib/node-actions";

export const scmNotifierActions: NodeActions = {
  configure: {
    label: "Configure Notifier",
    icon: "Bell",
    description: "Set up notification channels and templates"
  },
  test: {
    label: "Test Notifications",
    icon: "Play",
    description: "Send test notification to configured channels"
  },
  help: {
    label: "Documentation",
    icon: "HelpCircle",
    description: "View notification documentation"
  }
};
