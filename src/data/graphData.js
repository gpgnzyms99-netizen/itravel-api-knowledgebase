import { API_KNOWLEDGE_BASE } from './apiData';
import { ELEVATE_REQUIREMENTS } from './businessData';

// Tier 1 & 2 Node Categories
export const NODE_CATEGORIES = {
  REST_API: {
    id: 'REST_API',
    label: 'Connect REST v7.0',
    colorVar: 'var(--color-node-rest)',
    bgVar: 'var(--node-rest-bg)',
    badge: 'REST',
    description: 'iTravel Connect v7.0 REST API Gateway Surface'
  },
  RPC_SCHEMA: {
    id: 'RPC_SCHEMA',
    label: 'Cruise RPC v6.0',
    colorVar: 'var(--color-node-rpc)',
    bgVar: 'var(--node-rpc-bg)',
    badge: 'RPC',
    description: 'IBS iTravel Cruise v6.0 RPC Message Schemas'
  },
  V4_ADAPTER: {
    id: 'V4_ADAPTER',
    label: 'TravCorp V4 Adapter',
    colorVar: 'var(--color-node-v4)',
    bgVar: 'var(--node-v4-bg)',
    badge: 'V4',
    description: 'Legacy TravCorp V4 Land Tour Microservices'
  },
  REQUIREMENT: {
    id: 'REQUIREMENT',
    label: 'Elevate Business Requirements',
    colorVar: 'var(--color-node-req)',
    bgVar: 'var(--node-req-bg)',
    badge: 'REQ',
    description: 'Elevate Transformation Architecture Requirements'
  },
  BRAND: {
    id: 'BRAND',
    label: 'Tropics Brands',
    colorVar: 'var(--color-node-brand)',
    bgVar: 'var(--node-brand-bg)',
    badge: 'BRAND',
    description: 'TravCorp Operating Brand Identifiers (businessData.js:6)'
  },
  PLATFORM: {
    id: 'PLATFORM',
    label: 'Legacy Platforms',
    colorVar: 'var(--color-node-platform)',
    bgVar: 'var(--node-platform-bg)',
    badge: 'PLAT',
    description: 'Legacy Reservation Systems & Core Engine'
  },
  FINANCIAL: {
    id: 'FINANCIAL',
    label: 'Financial & Ledger Rules',
    colorVar: 'var(--color-node-fin)',
    bgVar: 'var(--node-fin-bg)',
    badge: 'FIN',
    description: 'Commission, Net Billing & GL Accounting Rules'
  }
};

// Explicit V4 Canonical Alias Table (8 Canonical Endpoints)
export const V4_CANONICAL_ALIASES = [
  {
    id: "v4_availability",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/availability",
    displayName: "V4 Departure Availability",
    method: "UNSPEC",
    sourceCitation: "businessData.js:142 & apiData.js:55",
    aliases: ["/brands/{brand}/.../departures/{id}/availability"]
  },
  {
    id: "v4_tours",
    canonicalPath: "/brands/{brand}/tours",
    displayName: "V4 Tour Listing",
    method: "UNSPEC",
    sourceCitation: "businessData.js:184 & apiData.js:55",
    aliases: ["/brands/{brand}/tours"]
  },
  {
    id: "v4_tour_options",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}",
    displayName: "V4 Tour Options Search",
    method: "UNSPEC",
    sourceCitation: "businessData.js:142 & businessData.js:296",
    aliases: ["/brands/{brand}/tours/{tourId}/options/{optionId}"]
  },
  {
    id: "v4_quote",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/quote",
    displayName: "V4 Quote Calculation",
    method: "UNSPEC",
    sourceCitation: "businessData.js:195 & apiData.js:164",
    aliases: ["/brands/{brand}/.../departures/{id}/quote", "/quote"]
  },
  {
    id: "v4_book",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/book",
    displayName: "V4 Tour Departure Book (Inferred Expansion)",
    method: "UNSPEC",
    sourceCitation: "businessData.js:195 (Elided /departures/{id}/book)",
    aliases: ["/brands/{brand}/.../departures/{id}/book"]
  },
  {
    id: "v4_booking",
    canonicalPath: "/booking",
    displayName: "V4 Commit Land Tour Sub-Booking",
    method: "POST", // Sourced at businessData.js:357
    sourceCitation: "businessData.js:184, :195, :357 (POST /booking)",
    aliases: ["/booking"]
  },
  {
    id: "v4_booking_ref",
    canonicalPath: "/bookings/{bookingReference}",
    displayName: "V4 Master Booking Retrieval",
    method: "UNSPEC",
    sourceCitation: "businessData.js:9 & ARCHITECTURE_RISKS_QA",
    aliases: ["/bookings/{bookingReference}."]
  },
  {
    id: "v4_commissions",
    canonicalPath: "/internal/sellingCompany/{sellingCompanyCode}/marketVariation/{marketVariation}/departure/{departureCode}/commissions",
    displayName: "V4 Selling Company Commissions",
    method: "UNSPEC",
    sourceCitation: "businessData.js:142 & ARCHITECTURE_RISKS_QA",
    aliases: ["/internal/sellingCompany/{sellingCompanyCode}/.../departure/{departureCode}/commissions"]
  }
];

// Brand Metadata (Codes from businessData.js:6, full names explicitly marked Inferred)
export const TROPICS_BRANDS = [
  { code: 'AA', name: 'Adventure World (Inferred)' },
  { code: 'BV', name: 'Boutique Voyages (Inferred)' },
  { code: 'CH', name: 'Contiki Holidays (Inferred)' },
  { code: 'CS', name: 'Costsaver (Inferred)' },
  { code: 'GE', name: 'Grand European Travel (Inferred)' },
  { code: 'IV', name: 'Insight Vacations (Inferred)' },
  { code: 'LG', name: 'Luxury Gold (Inferred)' },
  { code: 'TT', name: 'Trafalgar Tours (Inferred)' }
];

export const generateGraphTopology = () => {
  const nodes = [];
  const edges = [];
  const restNodeMap = new Map();

  // 1. Build REST_API Nodes (7 Unique Paths from 8 records carrying connectRestPath)
  API_KNOWLEDGE_BASE.forEach(record => {
    if (record.connectRestPath) {
      const path = record.connectRestPath;
      const method = record.connectRestMethod || record.method || 'POST';
      // Composite Key: category_layer_method_path
      const nodeId = `REST_API_connect_${method}_${path}`;

      if (!restNodeMap.has(path)) {
        const node = {
          id: nodeId,
          category: 'REST_API',
          layer: 'Connect REST v7.0',
          displayName: `${method} ${path}`,
          path: path,
          method: method,
          sectionNumber: record.sectionNumber,
          sourceCitation: record.source,
          description: record.description,
          records: [record],
          tier: 1 // Tiered layout row 1
        };
        nodes.push(node);
        restNodeMap.set(path, node);
      } else {
        restNodeMap.get(path).records.push(record);
      }
    }
  });

  // 2. Build RPC_SCHEMA Nodes (17 Message Nodes)
  API_KNOWLEDGE_BASE.forEach(record => {
    if (record.rpcMessageName) {
      const msgName = record.rpcMessageName;
      // Composite Key: category_layer_method_msgName
      const nodeId = `RPC_SCHEMA_ibsrpc_POST_${msgName}`;

      const node = {
        id: nodeId,
        category: 'RPC_SCHEMA',
        layer: 'Cruise RPC v6.0',
        displayName: msgName,
        msgName: msgName,
        sectionNumber: record.sectionNumber,
        sourceCitation: record.source,
        description: record.description,
        record: record,
        tier: 2 // Tiered layout row 2
      };
      nodes.push(node);

      // Link REST_API ➔ RPC_SCHEMA where record defines both
      if (record.connectRestPath) {
        const restNode = restNodeMap.get(record.connectRestPath);
        if (restNode) {
          edges.push({
            id: `edge_rest_rpc_${restNode.id}_${nodeId}`,
            source: restNode.id,
            target: nodeId,
            type: 'CALLS_RPC',
            label: 'Translates to RPC'
          });
        }
      }
    }
  });

  // 3. Build V4_ADAPTER Nodes (8 Canonical Endpoints)
  V4_CANONICAL_ALIASES.forEach(v4Alias => {
    // Composite Key: category_layer_method_path
    const nodeId = `V4_ADAPTER_tropics_${v4Alias.method}_${v4Alias.canonicalPath}`;

    nodes.push({
      id: nodeId,
      category: 'V4_ADAPTER',
      layer: 'TravCorp V4 Adapter',
      displayName: v4Alias.displayName,
      path: v4Alias.canonicalPath,
      method: v4Alias.method,
      sourceCitation: v4Alias.sourceCitation,
      aliases: v4Alias.aliases,
      tier: 3 // Tiered layout row 3
    });

    // Link RPC Schemas or REST Endpoints to V4 Adapters
    if (v4Alias.id === 'v4_availability') {
      const rpcAvail = nodes.find(n => n.id === 'RPC_SCHEMA_ibsrpc_POST_cruiseAggrAvailabilitySearchRQ');
      if (rpcAvail) {
        edges.push({ id: `edge_rpc_v4_avail`, source: rpcAvail.id, target: nodeId, type: 'ROUTES_TO', label: 'Queries V4 Departure' });
      }
    } else if (v4Alias.id === 'v4_quote') {
      const rpcPromo = nodes.find(n => n.id === 'RPC_SCHEMA_ibsrpc_POST_fetchApplicablePromotionsRQ');
      if (rpcPromo) {
        edges.push({ id: `edge_rpc_v4_quote`, source: rpcPromo.id, target: nodeId, type: 'ROUTES_TO', label: 'Recalculates Land Quote' });
      }
    } else if (v4Alias.id === 'v4_booking' || v4Alias.id === 'v4_book') {
      const rpcBkg = nodes.find(n => n.id === 'RPC_SCHEMA_ibsrpc_POST_createBookingRQ');
      if (rpcBkg) {
        edges.push({ id: `edge_rpc_v4_bkg`, source: rpcBkg.id, target: nodeId, type: 'ROUTES_TO', label: 'Commits Sub-Booking' });
      }
    } else if (v4Alias.id === 'v4_booking_ref') {
      const restRetrieve = nodes.find(n => n.id === 'REST_API_connect_GET_/v7/rest/bookings/{bookingReference}');
      if (restRetrieve) {
        edges.push({ id: `edge_rest_v4_bkgref`, source: restRetrieve.id, target: nodeId, type: 'ROUTES_TO', label: 'Maps Master Ref' });
      }
    }
  });

  // 4. Build REQUIREMENT Nodes (10 Elevate Requirements)
  ELEVATE_REQUIREMENTS.forEach(req => {
    const nodeId = `REQUIREMENT_elevate_SPEC_${req.id}`;
    nodes.push({
      id: nodeId,
      category: 'REQUIREMENT',
      layer: 'Elevate Requirement',
      displayName: `${req.id.toUpperCase()}: ${req.title}`,
      reqId: req.id,
      reqCategory: req.category,
      sourceCitation: `businessData.js: ELEVATE_REQUIREMENTS (${req.id})`,
      description: req.description,
      tier: 4 // Tiered layout row 4
    });
  });

  // Connect REST & RPC to Requirements
  const createBkgNode = nodes.find(n => n.id === 'REST_API_connect_POST_/v7/rest/bookings');
  if (createBkgNode) {
    const req1Node = nodes.find(n => n.id === 'REQUIREMENT_elevate_SPEC_req_1');
    const req3Node = nodes.find(n => n.id === 'REQUIREMENT_elevate_SPEC_req_3');
    if (req1Node) edges.push({ id: 'edge_bkg_req1', source: createBkgNode.id, target: req1Node.id, type: 'IMPLEMENTS', label: 'Enforces Multi-Brand' });
    if (req3Node) edges.push({ id: 'edge_bkg_req3', source: createBkgNode.id, target: req3Node.id, type: 'IMPLEMENTS', label: 'Supports Net Billing' });
  }

  const tokenNode = nodes.find(n => n.id === 'REST_API_connect_POST_/token');
  if (tokenNode) {
    const req2Node = nodes.find(n => n.id === 'REQUIREMENT_elevate_SPEC_req_2');
    if (req2Node) edges.push({ id: 'edge_token_req2', source: tokenNode.id, target: req2Node.id, type: 'IMPLEMENTS', label: 'Secures B2B Channel' });
  }

  // 5. Build BRAND Nodes (8 Tropics Brand Codes)
  TROPICS_BRANDS.forEach(brand => {
    const nodeId = `BRAND_tropics_CODE_${brand.code}`;
    nodes.push({
      id: nodeId,
      category: 'BRAND',
      layer: 'Tropics Brand',
      displayName: `${brand.code} - ${brand.name}`,
      brandCode: brand.code,
      brandName: brand.name,
      sourceCitation: 'businessData.js:6 (Brand Code Enumeration)',
      tier: 5 // Tiered layout row 5
    });

    // Link V4 Adapters to Brand Codes
    nodes.filter(n => n.category === 'V4_ADAPTER').forEach(v4Node => {
      edges.push({
        id: `edge_v4_brand_${v4Node.id}_${brand.code}`,
        source: v4Node.id,
        target: nodeId,
        type: 'SERVES_BRAND',
        label: 'Brand Tenant Routing'
      });
    });
  });

  // 6. Build PLATFORM Node (1 Legacy Platform)
  const platformNodeId = 'PLATFORM_uniworld_SYS_Longitude';
  nodes.push({
    id: platformNodeId,
    category: 'PLATFORM',
    layer: 'Legacy Platform',
    displayName: 'Longitude (Uniworld Legacy Platform)',
    sourceCitation: 'businessData.js: ELEVATE_REQUIREMENTS (req_4)',
    description: 'Uniworld legacy platform being migrated to iTravel Connect v7.0 and Super PNR master basket.',
    tier: 5
  });

  const req4Node = nodes.find(n => n.id === 'REQUIREMENT_elevate_SPEC_req_4');
  if (req4Node) {
    edges.push({ id: 'edge_plat_req4', source: req4Node.id, target: platformNodeId, type: 'MIGRATES_FROM', label: 'Replaces Legacy System' });
  }

  // 7. Build FINANCIAL Node (1 Commission Ledger Node)
  const finNodeId = 'FINANCIAL_ledger_RULE_CommissionLedger';
  nodes.push({
    id: finNodeId,
    category: 'FINANCIAL',
    layer: 'Financial & Ledger Rules',
    displayName: 'iTravel Centralized Commission Ledger',
    sourceCitation: 'businessData.js: ELEVATE_REQUIREMENTS (req_3)',
    description: 'Centralized financial ledger managing Net/Gross agency commission calculations and deposit milestones.',
    tier: 5
  });

  const paymentNode = nodes.find(n => n.id === 'REST_API_connect_POST_/v7/rest/bookings/{bookingReference}/payments');
  if (paymentNode) {
    edges.push({ id: 'edge_pay_fin', source: paymentNode.id, target: finNodeId, type: 'ENFORCES_RULE', label: 'Posts Commission Ledger' });
  }

  return { nodes, edges };
};
