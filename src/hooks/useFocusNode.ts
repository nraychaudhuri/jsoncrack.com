import React from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { gaEvent } from "src/lib/utils/gaEvent";
import { searchQuery, cleanupHighlight, highlightMatchedNodes } from "src/lib/utils/graph/search";
import useGraph from "src/store/useGraph";

export const useFocusNode = (jsonData) => {
  const viewPort = useGraph(state => state.viewPort);
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
    const matchedNodes = searchQuery(debouncedValue, jsonData);
    const matchedNode = matchedNodes[selectedNode] || null;

    cleanupHighlight();

    if (matchedNode) {
      highlightMatchedNodes(matchedNodes, selectedNode);
      setNodeCount(matchedNodes.length);

      const element = document.querySelector(`[data-key='${matchedNode.key}']`);
      if (element && element instanceof HTMLElement) {
        viewPort?.camera.centerFitElementIntoView(element, {
          elementExtraMarginForZoom: 400,
        });
      }
    } else {
      setSelectedNode(0);
      setNodeCount(0);
    }

    gaEvent("input", "search node in graph");
  }, [selectedNode, debouncedValue, value, viewPort, jsonData]);

  return [value, setValue, skip, nodeCount, selectedNode] as const;
};
