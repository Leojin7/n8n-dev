import { NodeActions } from "../lib/node-actions";

export const scmJavaParserActions: NodeActions = {
  configure: {
    label: "Configure Parser",
    icon: "Settings",
    description: "Set up repository URL, branch, and access token"
  },
  test: {
    label: "Test Connection",
    icon: "Play",
    description: "Test the SCM Mapper API connection"
  },
  help: {
    label: "Documentation",
    icon: "HelpCircle",
    description: "View SCM Mapper documentation"
  }
};
