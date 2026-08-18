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

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Position calculation for Tiered Network Layout
  const tieredNodes = useMemo(() => {
    const marginX = 80;
    const marginY = 60;
    const tierHeights = { 1: 80, 2: 200, 3: 320, 4: 440, 5: 560 };

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

      rowNodes.forEach((node, index) => {
        // Calculate X spacing dynamically based on container
        const spacingX = count > 1 ? (1100 - marginX * 2) / (count - 1) : 0;
        const x = count === 1 ? 550 : marginX + index * spacingX;
        const y = tierHeights[tierNum] || marginY + tierNum * 120;

        positioned.push({
          ...node,
          x,
          y,
          radius: 22
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

    const width = 1200;
    const height = 680;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear Canvas with Tier 3 variable
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid Lines (Light Card Border)
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

        // Draw Edge Label if highlighted
        if (isHighlighted && edge.label) {
          const midX = (sourceNode.x + targetNode.x) / 2;
          const midY = (sourceNode.y + targetNode.y) / 2;
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#334155';
          ctx.fillText(edge.label, midX + 5, midY - 5);
        }
      }
    });

    // Draw Nodes
    tieredNodes.forEach(node => {
      const isVisible = filteredNodeIds.has(node.id);
      if (!isVisible) return;

      const isSelected = selectedNode && selectedNode.id === node.id;

      // Color mapping
      const categoryMeta = NODE_CATEGORIES[node.category] || NODE_CATEGORIES.REST_API;
      let nodeColor = '#0284c7';
      if (node.category === 'RPC_SCHEMA') nodeColor = '#9333ea';
      if (node.category === 'V4_ADAPTER') nodeColor = '#059669';
      if (node.category === 'REQUIREMENT') nodeColor = '#d97706';
      if (node.category === 'BRAND') nodeColor = '#854d0e';
      if (node.category === 'PLATFORM') nodeColor = '#475569';
      if (node.category === 'FINANCIAL') nodeColor = '#e11d48';

      // Outer Selection Glow
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(2, 132, 199, 0.2)';
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
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(categoryMeta.badge, node.x, node.y);

      // Node Label Below Circle
      ctx.font = isSelected ? 'bold 11px sans-serif' : '11px sans-serif';
      ctx.fillStyle = isSelected ? '#0f172a' : '#334155';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      let labelText = node.displayName;
      if (labelText.length > 22) labelText = labelText.substring(0, 20) + '…';
      ctx.fillText(labelText, node.x, node.y + node.radius + 5);
    });

  }, [tieredNodes, filteredEdges, filteredNodeIds, selectedNode]);

  // Canvas Click Handler
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (1200 / rect.width);
    const clickY = (e.clientY - rect.top) * (680 / rect.height);

    const clicked = filteredNodes.find(node => {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius + 4;
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
        } catch (err) {
          return [];
        }
      }
      return [];
    }
    try {
      const parsed = JSON.parse(selectedNode.records[0].requestPayload);
      return Object.keys(parsed);
    } catch (err) {
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
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
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
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset View
          </button>
        </div>

        {/* Filter Controls & Category Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeCategory === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Main Canvas & Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Network Canvas Column */}
        <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm overflow-hidden ${
          selectedNode ? 'lg:col-span-8' : 'lg:col-span-12'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Network className="w-4 h-4 text-cyan-600" />
              <span>Tiered Protocol Topology</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span> Connect REST</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Cruise RPC</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> V4 Adapter</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Elevate Requirement</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-800"></span> Brand</span>
            </div>
          </div>

          <div ref={containerRef} className="relative w-full overflow-x-auto">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="w-full h-[640px] cursor-pointer rounded-lg bg-white border border-slate-100"
              style={{ minWidth: '1000px' }}
            />
          </div>
        </div>

        {/* Inspector Drawer Column */}
        {selectedNode && (
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                  {selectedNode.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedNode.displayName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Composite Key Box */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                Composite Node Key
              </span>
              <code className="text-xs font-mono font-semibold text-cyan-700 break-all mt-1 block">
                {selectedNode.id}
              </code>
            </div>

            {/* Provenance Citation */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Specification Provenance Citation
              </span>
              <p className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/80 font-mono">
                {selectedNode.sourceCitation || 'Documented in businessData.js & apiData.js'}
              </p>
            </div>

            {/* Derived Payload Schema Keys */}
            {derivedPayloadKeys.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-cyan-600" />
                  Derived Request Payload Schema Keys
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {derivedPayloadKeys.map(key => (
                    <span key={key} className="px-2 py-0.5 text-[11px] font-mono bg-cyan-50 text-cyan-800 rounded border border-cyan-200">
                      {key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Node Description */}
            {selectedNode.description && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700">Description & Context</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>
            )}

            {/* Connected Network Links */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Graph Relationships
              </h4>

              {/* Incoming Connections */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3 text-slate-400" />
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
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-800 truncate">{node?.displayName}</span>
                        <span className="text-[10px] text-cyan-700 font-semibold">{edge.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Outgoing Connections */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-slate-400" />
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
                        className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center justify-between"
                      >
                        <span className="text-xs font-medium text-slate-800 truncate">{node?.displayName}</span>
                        <span className="text-[10px] text-cyan-700 font-semibold">{edge.label}</span>
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
