import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateGraphTopology } from './graphData.js';
import { API_KNOWLEDGE_BASE } from './apiData.js';

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

    // Mechanical Citation Verification with Bare Continuation Support & Path Token Relevance
    if (node.sourceCitation) {
      const parts = node.sourceCitation.split(',');
      let lastFilename = null;

      parts.forEach(part => {
        const trimmed = part.trim();
        // Match "file.js:NN" or ":NN"
        const fullMatch = /([a-zA-Z0-9_]+\.js):(\d+)/.exec(trimmed);
        const bareMatch = /^:(\d+)/.exec(trimmed);

        let filename = null;
        let lineNum = null;

        if (fullMatch) {
          filename = fullMatch[1];
          lineNum = parseInt(fullMatch[2], 10);
          lastFilename = filename;
        } else if (bareMatch && lastFilename) {
          filename = lastFilename;
          lineNum = parseInt(bareMatch[1], 10);
        }

        if (filename && lineNum) {
          const lineContent = getFileLine(filename, lineNum);
          if (lineContent === null) {
            errors.push(`Node "${node.id}" cites ${filename}:${lineNum} which is out of bounds or file missing.`);
          } else {
            const lineTrimmed = lineContent.trim();
            if (lineTrimmed === '}' || lineTrimmed === '},' || lineTrimmed === ']' || lineTrimmed === '];' || lineTrimmed === '') {
              errors.push(`Node "${node.id}" cites ${filename}:${lineNum} which points to an empty line or lone brace: "${lineTrimmed}"`);
            }

            // Strengthen content assertion for nodes with a .path
            if (node.path) {
              const token = node.path.split('/').filter(Boolean).pop(); // e.g. "availability", "operatingPoints", "tours"
              if (token && !lineContent.includes(token) && !lineContent.includes(node.path)) {
                errors.push(`Node "${node.id}" cites ${filename}:${lineNum} but that line does not mention "${token}"`);
              }
            }
          }
        }
      });
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

  // 3. Anti-Contradiction Assertion (User Spec Section E)
  // No CALLS_RPC edge may target an RPC message whose record denies a Connect REST mapping
  edges.filter(e => e.type === 'CALLS_RPC').forEach(e => {
    const rec = API_KNOWLEDGE_BASE.find(r => `RPC_SCHEMA_ibsrpc_POST_${r.rpcMessageName}` === e.target);
    if (rec && !rec.connectRestPath) {
      errors.push(`Edge "${e.id}" asserts a REST->RPC link for "${rec.rpcMessageName}", whose source says: ${rec.source}`);
    }
  });

  if (errors.length > 0) {
    console.error(`❌ Graph Topology & Citation Verification FAILED with ${errors.length} errors:`);
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log(`✅ Graph Topology, Citation Relevance & Anti-Contradiction Verification PASSED!`);
  console.log(`  - Total Nodes: ${nodes.length}`);
  console.log(`  - Total Edges: ${edges.length}`);
  console.log(`  - Mechanical Line Citations Verified: 100% resolve to valid non-brace lines with path token relevance`);
  console.log(`  - Anti-Contradiction Rule: Verified zero fake REST->RPC links for RPC-only messages`);
}

validateGraphData();
