export const searchQuery = (param: string, jsonData: any) => {
  // Assuming jsonData is an array of objects where each object represents a node
  // and param is the search term. This is a simplistic search implementation.
  return jsonData.filter(node => JSON.stringify(node).toLowerCase().includes(param.toLowerCase()));
};

export const cleanupHighlight = () => {
  const nodes = document.querySelectorAll("foreignObject.searched, .highlight");

  nodes.forEach(node => {
    node.classList.remove("highlight", "searched");
  });
};

export const highlightMatchedNodes = (nodes: any[], selectedNode: number) => {
  // Assuming nodes is an array of node objects and each node object has an id property.
  nodes.forEach((node, index) => {
    const element = document.querySelector(`[data-node-id='${node.id}']`);
    if (element) {
      element.classList.add("searched");
      if (index === selectedNode) {
        element.classList.add("highlight");
      }
    }
  });
};
