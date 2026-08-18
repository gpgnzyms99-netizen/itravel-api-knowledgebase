import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateGraphTopology } from './graphData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateGraphData() {
  console.log('Running automated graph topology assertions & mechanical line citation checks...');
  const { nodes, edges } = generateGraphTopology();

  const nodeIds = new Set();
  const edgeIds = new Set();
  const errors = [];

  // Cache source files for fast line inspection
  const fileCache = new Map();
  function getFileLine(filename, lineNumber) {
    if (!fileCache.has(filename)) {
      const filePath = path.join(__dirname, filename);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
      fileCache.set(filename, lines);
    }
    const lines = fileCache.get(filename);
    const index = lineNumber - 1; // 1-indexed to 0-indexed
    if (index < 0 || index >= lines.length) {
      return null;
    }
    return lines[index];
  }

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

    // Mechanical Citation Verification (Extract file.js:NN references and verify exact line content)
    if (node.sourceCitation) {
      // Matches "businessData.js:8", "businessData.js:281", "apiData.js:10", etc.
      const citationRegex = /([a-zA-Z0-9_]+\.js):(\d+)/g;
      let match;
      while ((match = citationRegex.exec(node.sourceCitation)) !== null) {
        const [, filename, lineStr] = match;
        const lineNum = parseInt(lineStr, 10);
        const lineContent = getFileLine(filename, lineNum);

        if (lineContent === null) {
          errors.push(`Node "${node.id}" cites ${filename}:${lineNum} which is out of bounds or file missing.`);
        } else {
          // Check that line content is not a lone closing brace or blank line
          const trimmed = lineContent.trim();
          if (trimmed === '}' || trimmed === '},' || trimmed === ']' || trimmed === '];' || trimmed === '') {
            errors.push(`Node "${node.id}" cites ${filename}:${lineNum} which points to an empty line or lone brace: "${trimmed}"`);
          }
        }
      }
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

  // 3. Isolated Node Check (Ensure zero orphaned nodes exist in the network topology)
  const connectedNodeIds = new Set();
  edges.forEach(e => {
    connectedNodeIds.add(e.source);
    connectedNodeIds.add(e.target);
  });

  const isolatedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
  if (isolatedNodes.length > 0) {
    errors.push(`Found ${isolatedNodes.length} isolated nodes in graph topology: ${isolatedNodes.map(n => n.id).join(', ')}`);
  }

  if (errors.length > 0) {
    console.error(`❌ Graph Topology & Citation Verification FAILED with ${errors.length} errors:`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log(`✅ Graph Topology & Mechanical Line Citation Verification PASSED successfully!`);
  console.log(`  - Total Nodes: ${nodes.length}`);
  console.log(`  - Total Edges: ${edges.length}`);
  console.log(`  - Isolated Nodes: 0 (100% of nodes connected in network graph)`);
  console.log(`  - Mechanical Line Citations Verified: 100% resolve to valid non-brace source code lines`);
}

validateGraphData();
