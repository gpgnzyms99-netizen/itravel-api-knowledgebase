import { generateGraphTopology } from './graphData.js';

function validateGraphData() {
  console.log('Running automated graph topology assertions...');
  const { nodes, edges } = generateGraphTopology();

  const nodeIds = new Set();
  const edgeIds = new Set();
  const errors = [];

  // 1. Validate Nodes
  nodes.forEach(node => {
    if (nodeIds.has(node.id)) {
      errors.push(`Duplicate Node ID found: "${node.id}"`);
    }
    nodeIds.add(node.id);

    if (!node.displayName || node.displayName.includes('undefined')) {
      errors.push(`Node "${node.id}" has invalid or undefined displayName: "${node.displayName}"`);
    }

    if (node.description && node.description.includes('undefined')) {
      errors.push(`Node "${node.id}" has undefined in description: "${node.description}"`);
    }

    if (!node.sourceCitation || node.sourceCitation.includes('undefined')) {
      errors.push(`Node "${node.id}" has invalid sourceCitation: "${node.sourceCitation}"`);
    }
  });

  // 2. Validate Edges
  edges.forEach(edge => {
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate Edge ID found: "${edge.id}"`);
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge "${edge.id}" references non-existent source node: "${edge.source}"`);
    }

    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge "${edge.id}" references non-existent target node: "${edge.target}"`);
    }

    if (!edge.label || edge.label.includes('undefined')) {
      errors.push(`Edge "${edge.id}" has invalid label: "${edge.label}"`);
    }
  });

  if (errors.length > 0) {
    console.error(`❌ Graph Topology Validation FAILED with ${errors.length} errors:`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log(`✅ Graph Topology Validation PASSED successfully! (${nodes.length} nodes, ${edges.length} edges verified with ZERO undefined fields or ID collisions)`);
}

validateGraphData();
