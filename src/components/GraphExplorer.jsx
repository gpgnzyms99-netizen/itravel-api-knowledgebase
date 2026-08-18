import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Network, Search, RefreshCw, X, ArrowRight, ArrowLeft,
  FileText, Code2
} from 'lucide-react';
import { generateGraphTopology, NODE_CATEGORIES } from '../data/graphData';
import { trackTelemetry } from '../utils/telemetry';

export function GraphExplorer() {
  const { nodes: allNodes, edges: allEdges } = useMemo(() => generateGraphTopology(), []);

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Position calculation for Tiered Network Layout (1600px Virtual Canvas Width)
  const tieredNodes = useMemo(() => {
    const marginX = 90;
    const marginY = 60;
    const tierHeights = { 1: 90, 2: 210, 3: 340, 4: 470, 5: 600 };

    // Group nodes by tier
    const tiers = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    allNodes.forEach(node => {
      const tier = node.tier || 3;
      tiers[tier].push(node);
    });

    const positioned = [];
    Object.keys(tiers).forEach(tierKey => {
      const tierNum = parseInt(tierKey, 10);
      const rowNodes = tiers[tierNum];
      const count = rowNodes.length;
      const availableWidth = 1600 - marginX * 2;

      rowNodes.forEach((node, index) => {
        const spacingX = count > 1 ? availableWidth / (count - 1) : 0;
        const x = count === 1 ? 800 : marginX + index * spacingX;
        const y = tierHeights[tierNum] || marginY + tierNum * 120;

        positioned.push({
          ...node,
          x,
          y,
          radius: 18,
          indexInTier: index
        });
      });
    });

    return positioned;
  }, [allNodes]);

  // Filter nodes based on activeCategory & searchQuery
  const filteredNodes = useMemo(() => {
    return tieredNodes.filter(node => {
      const matchesCategory = activeCategory === 'ALL' || node.category === activeCategory;
      const matchesSearch = searchQuery === '' ||
        node.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.description && node.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [tieredNodes, activeCategory, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return allEdges.filter(edge => filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target));
  }, [allEdges, filteredNodeIds]);

  // Handle Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const width = 1600;
    const height = 700;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear Canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Edges
    filteredEdges.forEach(edge => {
      const sourceNode = tieredNodes.find(n => n.id === edge.source);
      const targetNode = tieredNodes.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        const isHighlighted = selectedNode && (selectedNode.id === edge.source || selectedNode.id === edge.target);

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = isHighlighted ? '#0284c7' : '#cbd5e1';
        ctx.lineWidth = isHighlighted ? 2.5 : 1.2;
        if (!isHighlighted) ctx.setLineDash([4, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw Edge Label Pill if highlighted
        if (isHighlighted && edge.label) {
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          ctx.font = 'bold 10px sans-serif';
          const textWidth = ctx.measureText(edge.label).width;
          const pillWidth = textWidth + 14;
          const pillHeight = 20;

          // White Pill Background Box
          ctx.fillStyle = '#ffffff';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight, 6);
          } else {
            ctx.rect(midX - pillWidth / 2, midY - pillHeight / 2, pillWidth, pillHeight);
          }
          ctx.fill();
          ctx.stroke();

          // Pill Text
          ctx.fillStyle = '#0f172a';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(edge.label, midX, midY);
        }
      }
    });

    // Draw Nodes
    tieredNodes.forEach(node => {
      const isVisible = filteredNodeIds.has(node.id);
      if (!isVisible) return;

      const isSelected = selectedNode && selectedNode.id === node.id;
      const isHovered = hoveredNode && hoveredNode.id === node.id;

      // Color mapping
      const categoryMeta = NODE_CATEGORIES[node.category] || NODE_CATEGORIES.REST_API;
      let nodeColor = '#0284c7';
      if (node.category === 'RPC_SCHEMA') nodeColor = '#9333ea';
      if (node.category === 'V4_ADAPTER') nodeColor = '#059669';
      if (node.category === 'REQUIREMENT') nodeColor = '#d97706';
      if (node.category === 'BRAND') nodeColor = '#854d0e';
      if (node.category === 'PLATFORM') nodeColor = '#475569';
      if (node.category === 'FINANCIAL') nodeColor = '#e11d48';

      // Selection/Hover Glow
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? 'rgba(2, 132, 199, 0.25)' : 'rgba(203, 213, 225, 0.4)';
        ctx.fill();
      }

      // Main Circle Body
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Node Badge Text Inside Circle
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(categoryMeta.badge, node.x, node.y);

      // Compact Base Label Below Circle
      const isEven = (node.indexInTier || 0) % 2 === 0;
      const labelYOffset = isEven ? (node.radius + 12) : (node.radius + 24);

      ctx.font = isSelected ? 'bold 10.5px sans-serif' : '10px sans-serif';
      ctx.fillStyle = isSelected ? '#0f172a' : '#475569';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      let shortLabel = node.displayName;
      if (shortLabel.length > 12) shortLabel = shortLabel.substring(0, 11) + '…';
      ctx.fillText(shortLabel, node.x, node.y + labelYOffset);

      // Floating Callout Card Tooltip for Selected/Hovered Node
      if (isSelected || isHovered) {
        const fullLabel = node.displayName;
        ctx.font = 'bold 11px sans-serif';
        const labelWidth = ctx.measureText(fullLabel).width + 20;
        const boxHeight = 24;
        const boxX = Math.max(10, Math.min(1600 - labelWidth - 10, node.x - labelWidth / 2));
        const boxY = node.y - node.radius - boxHeight - 8;

        // Dark Tooltip Background Box
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(boxX, boxY, labelWidth, boxHeight, 6);
        } else {
          ctx.rect(boxX, boxY, labelWidth, boxHeight);
        }
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pointer Arrow
        ctx.beginPath();
        ctx.moveTo(node.x - 5, boxY + boxHeight);
        ctx.lineTo(node.x + 5, boxY + boxHeight);
        ctx.lineTo(node.x, boxY + boxHeight + 5);
        ctx.closePath();
        ctx.fillStyle = '#0f172a';
        ctx.fill();

        // Tooltip Text
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fullLabel, boxX + labelWidth / 2, boxY + boxHeight / 2);
      }
    });

  }, [tieredNodes, filteredEdges, filteredNodeIds, selectedNode, hoveredNode]);

  // Mouse Move Handler for Hover
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * (1600 / rect.width);
    const mouseY = (e.clientY - rect.top) * (700 / rect.height);

    const hovered = filteredNodes.find(node => {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 8;
    });

    setHoveredNode(hovered || null);
    canvas.style.cursor = hovered ? 'pointer' : 'default';
  };

  // Canvas Click Handler
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (1600 / rect.width);
    const clickY = (e.clientY - rect.top) * (700 / rect.height);

    const clicked = filteredNodes.find(node => {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 8;
    });

    if (clicked) {
      setSelectedNode(clicked);
      trackTelemetry({
        block_type: 'graph_explorer',
        block_id: clicked.id,
        interaction_type: 'NODE_CLICK',
        node_category: clicked.category
      });
    } else {
      setSelectedNode(null);
    }
  };

  // Derived Payload Keys from JSON
  const derivedPayloadKeys = useMemo(() => {
    if (!selectedNode || !selectedNode.records || !selectedNode.records[0]?.requestPayload) {
      if (selectedNode?.record?.requestPayload) {
        try {
          const parsed = JSON.parse(selectedNode.record.requestPayload);
          return Object.keys(parsed);
        } catch {
          return [];
        }
      }
      return [];
    }
    try {
      const parsed = JSON.parse(selectedNode.records[0].requestPayload);
      return Object.keys(parsed);
    } catch {
      return [];
    }
  }, [selectedNode]);

  // Selected Node Incoming & Outgoing Connections
  const connectedEdges = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    const incoming = allEdges
      .filter(e => e.target === selectedNode.id)
      .map(e => ({ edge: e, node: tieredNodes.find(n => n.id === e.source) }));
    const outgoing = allEdges
      .filter(e => e.source === selectedNode.id)
      .map(e => ({ edge: e, node: tieredNodes.find(n => n.id === e.target) }));
    return { incoming, outgoing };
  }, [selectedNode, allEdges, tieredNodes]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200">
                Specification-Grounded Macro Graph
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {allNodes.length} Nodes • {allEdges.length} Edges
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Architecture & API Entity Graph Explorer
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Dual-layer protocol map connecting Connect REST v7.0, Cruise RPC v6.0, TravCorp V4 Adapters, Elevate Requirements, and Tropics Brands.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveCategory('ALL');
              setSearchQuery('');
              setSelectedNode(null);
              trackTelemetry({ block_type: 'graph_explorer', block_id: 'reset_view', interaction_type: 'RESET' });
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset View
          </button>
        </div>

        {/* Filter Controls & Category Tabs */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              All Categories ({allNodes.length})
            </button>
            {Object.values(NODE_CATEGORIES).map(cat => {
              const count = allNodes.filter(n => n.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    trackTelemetry({ block_type: 'graph_explorer', block_id: cat.id, interaction_type: 'CATEGORY_FILTER' });
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter nodes by path or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Canvas Column */}
        <div className={`card overflow-hidden transition-all ${
          selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Network className="w-4 h-4 text-cyan-600" />
              <span>Tiered Protocol Topology (Hover/Select Nodes to View Titles)</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span> Connect REST</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Cruise RPC</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> V4 Adapter</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Requirement</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-800"></span> Brand</span>
            </div>
          </div>

          <div ref={containerRef} className="relative w-full overflow-x-auto rounded-lg border border-slate-300">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer rounded-lg bg-white block"
              style={{ minWidth: '1600px', width: '1600px', height: '700px' }}
            />
          </div>
        </div>

        {/* Inspector Drawer Column */}
        {selectedNode && (
          <div className="lg:col-span-4 card space-y-6 animate-fadeIn" style={{ border: '2px solid var(--slate-300)' }}>
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-900 text-white uppercase tracking-wider">
                  {selectedNode.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">
                  {selectedNode.displayName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Composite Key Box */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-300">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Composite Node Key
              </span>
              <code className="text-xs font-mono font-bold text-cyan-700 break-all mt-1 block">
                {selectedNode.id}
              </code>
            </div>

            {/* Provenance Citation */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                Specification Provenance Citation
              </span>
              <p className="text-xs text-slate-700 bg-amber-50 p-3 rounded-lg border border-amber-300 font-mono font-medium">
                {selectedNode.sourceCitation || 'Documented in businessData.js & apiData.js'}
              </p>
            </div>

            {/* Derived Payload Schema Keys */}
            {derivedPayloadKeys.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-cyan-600" />
                  Derived Request Payload Schema Keys
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {derivedPayloadKeys.map(key => (
                    <span key={key} className="px-2 py-0.5 text-[11px] font-mono font-bold bg-cyan-50 text-cyan-800 rounded border border-cyan-300">
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Node Description */}
            {selectedNode.description && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-800">Description & Context</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedNode.description}
                </p>
              </div>
            )}

            {/* Connected Network Links */}
            <div className="border-t border-slate-200 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Graph Relationships
              </h4>

              {/* Incoming Connections */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  Incoming Connections ({connectedEdges.incoming.length})
                </span>
                {connectedEdges.incoming.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No incoming connections</p>
                ) : (
                  <div className="space-y-1.5">
                    {connectedEdges.incoming.map(({ edge, node }) => (
                      <button
                        key={edge.id}
                        onClick={() => setSelectedNode(node)}
                        className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-900 truncate">{node?.displayName}</span>
                        <span className="text-[10px] text-cyan-800 font-extrabold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{edge.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Connections */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  Outgoing Connections ({connectedEdges.outgoing.length})
                </span>
                {connectedEdges.outgoing.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No outgoing connections</p>
                ) : (
                  <div className="space-y-1.5">
                    {connectedEdges.outgoing.map(({ edge, node }) => (
                      <button
                        key={edge.id}
                        onClick={() => setSelectedNode(node)}
                        className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-900 truncate">{node?.displayName}</span>
                        <span className="text-[10px] text-cyan-800 font-extrabold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{edge.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
