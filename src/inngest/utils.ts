import { Connection } from "@xyflow/react";
import toposort from "toposort";
import { Node } from "@xyflow/react";
import { BlockList } from "net";
import { inngest } from "./client";
import { createId } from "@paralleldrive/cuid2";

export const topologicalSort = (nodes: Node[], connections: Connection[],): Node[] => {
  if (connections.length === 0) {
    return nodes;
  }
  const edges: [string, string][] = connections.map((conn) => [
    conn.source,
    conn.target,
  ])

  const connectNodeIds = new Set<string>();
  for (const conn of connections) {
    connectNodeIds.add(conn.source);
    connectNodeIds.add(conn.target);
  }
  for (const node of nodes) {
    if (!connectNodeIds.has(node.id)) {
      edges.push([node.id, node.id])
    }

  }

  let sortedNodeIds: string[] = [];

  try {
    sortedNodeIds = toposort(edges)
  }
  catch (e) {
    if (e instanceof Error && e.message.includes("Cyclic")) {


      throw new Error("Cyclic dependency detected");
    }
    throw e;
  }


  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);

};

export const sendWorkflowExecution = async (data: {

  workflowId: string;
  [key: string]: any;

}) => {

  return inngest.send({

    name: "workflows/execute.workflow",
    data,
    id: createId(),
  });
};