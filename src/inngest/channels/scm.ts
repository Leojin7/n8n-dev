import { inngest } from "../client";

export const scmChannel = () => ({
  status: (data: { nodeId: string; status: string; message: string;[key: string]: any }) => ({
    channel: "scm/status",
    topic: "status",
    data,
    // Use unique step ID with nodeId to prevent conflicts
    id: `scm-status-${data.nodeId}`
  }),
});
