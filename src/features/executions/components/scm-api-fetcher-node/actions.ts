import { NodeActions } from "../lib/node-actions";

export const scmApiFetcherActions: NodeActions = {
  configure: {
    label: "Configure Fetcher",
    icon: "Globe",
    description: "Set up API endpoints and credentials"
  },
  test: {
    label: "Test Connection",
    icon: "Play",
    description: "Verify SCM Mapper API connectivity"
  },
  help: {
    label: "Documentation",
    icon: "HelpCircle",
    description: "View API documentation"
  }
};
