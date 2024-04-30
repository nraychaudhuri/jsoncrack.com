export const searchQuery = (param: string, jsonData: any) => {
  // Assuming jsonData is an array of objects where each object represents a node
  return jsonData.filter(node => node.text.includes(param));
};

export const cleanupHighlight = () => {
  const nodes = document.querySelectorAll("foreignObject.searched, .highlight");

  nodes.forEach(node => {
    node.classList.remove("highlight", "searched");
  });
};

export const highlightMatchedNodes = (nodes: any[], selectedNode: number) => {
  nodes.forEach((node, index) => {
    const nodeElement = document.querySelector(`[data-key='${node.key}']`);
    if (nodeElement) {
      const foreignObject = nodeElement.parentElement?.closest("foreignObject");

      if (foreignObject) {
        foreignObject.classList.add("searched");
      }

      if (index === selectedNode) {
        nodeElement.classList.add("highlight");
      }
    }
  });
};
