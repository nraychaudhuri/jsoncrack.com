import React, { useState, useEffect } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { gaEvent } from "src/lib/utils/gaEvent";
import { searchQuery, cleanupHighlight, highlightMatchedNodes } from "src/lib/utils/graph/search";
import useGraph from "src/store/useGraph";
import useJson from "src/store/useJson";

export const useFocusNode = () => {
  const viewPort = useGraph(state => state.viewPort);
  const json = useJson(state => state.json);
  const [selectedNode, setSelectedNode] = useState(0);
  const [nodeCount, setNodeCount] = useState(0);
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebouncedValue(value, 600);
  const [delayExecution, setDelayExecution] = useState(false); // New state to manage delay execution flag

  const skip = () => setSelectedNode(current => (current + 1) % nodeCount);

  useEffect(() => {
    let timeoutId; // Variable to hold timeout ID for cleanup

    if (!value) {
      cleanupHighlight();
      setSelectedNode(0);
      setNodeCount(0);
      return;
    }

    if (!viewPort || !debouncedValue) return;

    if (!delayExecution) {
      setDelayExecution(true); // Set delay execution flag to true
      timeoutId = setTimeout(() => { // Delay the execution
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

        setDelayExecution(false); // Reset delay execution flag after execution
      }, 50); // 50ms delay
    }

    gaEvent("input", "search node in graph");

    return () => {
      clearTimeout(timeoutId); // Cleanup function to cancel the timeout if the component unmounts
    };
  }, [selectedNode, debouncedValue, value, viewPort, json, delayExecution]); // Include delayExecution in the dependency array

  return [value, setValue, skip, nodeCount, selectedNode] as const;
};
