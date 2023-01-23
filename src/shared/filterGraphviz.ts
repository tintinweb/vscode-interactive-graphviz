import { toDot, fromDot } from "ts-graphviz";
import {
  ClusterStatementASTNode,
  DotASTNode,
  EdgeTargetASTNode,
  fromModel,
  GraphASTNode,
  NodeASTNode,
  toModel,
  // eslint-disable-next-line import/no-unresolved
} from "ts-graphviz/ast";

function filterAstNode(
  node: GraphASTNode | ClusterStatementASTNode | DotASTNode,
  nodes: string[],
  edges: string[],
)
  : GraphASTNode | ClusterStatementASTNode | DotASTNode | undefined {
  if (node.type === "Node") {
    if (nodes.includes(node.id.value)) {
      return node;
    }
  } else if (node.type === "Edge") {
    const targetsToKeep: EdgeTargetASTNode[] = node.targets.filter((target) => target.type === "NodeRef"
      && (
        nodes.includes(target.id.value)
        || edges.some((edge) => edge.endsWith(`->${target.id.value}`) || edge.startsWith(`${target.id.value}->`))
      ));

    // Reduce single element of edge to node
    if (targetsToKeep.length === 1 && targetsToKeep[0].type === "NodeRef") {
      const n = targetsToKeep[0];
      const r : NodeASTNode = {
        children: n.children,
        id: n.id,
        type: "Node",
        location: n.location,
      };
      return r;
    }
    if (targetsToKeep.length > 1) {
      // eslint-disable-next-line no-param-reassign
      node.targets = targetsToKeep as any;
      return node;
    }
  }

  // eslint-disable-next-line no-param-reassign
  node.children = node.children
    .map((child) => filterAstNode(child, nodes, edges))
    .filter((i) => !!i) as ClusterStatementASTNode[];

  if (node.children.length > 0) return node;

  return undefined;
}

export default function filterGraphviz(
  dot: string,
  nodes: string[],
  edges: string[],
): string | undefined {
  const d = fromModel(fromDot(dot));

  const f = filterAstNode(d, nodes, edges);

  if (!f) {
    return undefined;
  }

  return toDot(toModel(f as any));
}
