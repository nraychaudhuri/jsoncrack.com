import React from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { gaEvent } from "src/lib/utils/gaEvent";
import { searchQuery, cleanupHighlight, highlightMatchedNodes } from "src/lib/utils/graph/search";
import useGraph from "src/store/useGraph";
import useJson from "src/store/useJson"; // Added useJson import

export const useFocusNode = () => {
  const viewPort = useGraph(state => state.viewPort);
  const json = useJson(state => state.getJson); // Added to track JSON changes
  const [selectedNode, setSelectedNode] = React.useState(0);
  const [nodeCount, setNodeCount] = React.useState(0);
  const [value, setValue] = React.useState("");
  const [debouncedValue] = useDebouncedValue(value, 600);
  const [timeoutId, setTimeoutId] = React.useState<number | null>(null); // Changed to manage timeout as number or null
  
  const skip = () => setSelectedNode(current => (current + 1) % nodeCount);
  
  React.useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId); // Clear existing timeout
    
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
    
    const newTimeoutId = setTimeout(() => { // Added timeout
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
    }, 50); // 50ms timeout
    
    setTimeoutId(newTimeoutId as unknown as number); // Update timeoutId state with type cast
    
    gaEvent("input", "search node in graph");
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId); // Cleanup function to clear timeout
    };
  }, [selectedNode, debouncedValue, value, viewPort, json]); // Added json as a dependency
  
  return [value, setValue, skip, nodeCount, selectedNode] as const;
};
