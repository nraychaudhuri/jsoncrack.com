import React from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { gaEvent } from "src/lib/utils/gaEvent";
import { searchQuery, cleanupHighlight, highlightMatchedNodes } from "src/lib/utils/graph/search";
import useGraph from "src/store/useGraph";
import useJson from "src/store/useJson"; // Added import for useJson

export const useFocusNode = () => {
  const viewPort = useGraph(state => state.viewPort);
  const json = useJson(state => state.json); // Added to access JSON data from state
  const [selectedNode, setSelectedNode] = React.useState(0);
  const [nodeCount, setNodeCount] = React.useState(0);
  const [value, setValue] = React.useState("");
  const [debouncedValue] = useDebouncedValue(value, 600);

  const skip = () => setSelectedNode(current => (current + 1) % nodeCount);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (!value) {
      cleanupHighlight();
      setSelectedNode(0);
      setNodeCount(0);
      return;
    }

    if (!viewPort || !debouncedValue) return;

    timeoutId = setTimeout(() => {
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
    }, 50);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [selectedNode, debouncedValue, value, viewPort, json]); // Added json as a dependency

  return [value, setValue, skip, nodeCount, selectedNode] as const;
};
