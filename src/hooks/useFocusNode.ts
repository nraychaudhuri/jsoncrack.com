import React from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { gaEvent } from "../lib/utils/gaEvent";
import { searchQuery, cleanupHighlight, highlightMatchedNodes } from "../lib/utils/graph/search";
import useGraph from "../store/useGraph";
import useJson from "../store/useJson";

// Added import for useJson

export const useFocusNode = () => {
  const viewPort = useGraph(state => state.viewPort);
  const json = useJson(state => state.json); // Added to include JSON data as a dependency
  const [selectedNode, setSelectedNode] = React.useState(0);
  const [nodeCount, setNodeCount] = React.useState(0);
  const [value, setValue] = React.useState("");
  const [debouncedValue] = useDebouncedValue(value, 600);

  const skip = () => setSelectedNode(current => (current + 1) % nodeCount);

  React.useEffect(() => {
    if (!value) {
      cleanupHighlight();
      setSelectedNode(0);
      setNodeCount(0);
      return;
    }

    if (!viewPort || !debouncedValue) return;
    const matchedNodes: NodeListOf<Element> = searchQuery(`span[data-key*='${debouncedValue}' i]`);
    const matchedNode: Element | null = matchedNodes[selectedNode] || null;

    cleanupHighlight();

    if (matchedNode && matchedNode.parentElement) {
      highlightMatchedNodes(matchedNodes, selectedNode);
      setNodeCount(matchedNodes.length);

      viewPort?.camera.centerFitElementIntoView(matchedNode.parentElement, {
        elementExtraMarginForZoom: 400,
      });
    } else {
      setSelectedNode(0);
      setNodeCount(0);
    }

    gaEvent("input", "search node in graph");
  }, [selectedNode, debouncedValue, value, viewPort, json]); // Corrected the useEffect dependency array

  return [value, setValue, skip, nodeCount, selectedNode] as const;
};
