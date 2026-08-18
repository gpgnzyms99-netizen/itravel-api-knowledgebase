import { API_KNOWLEDGE_BASE } from './apiData.js';
import { ELEVATE_REQUIREMENTS } from './businessData.js';

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

// Explicit V4 Canonical Alias Table (10 Canonical Endpoints with Verified Ground-Truth Citations)
export const V4_CANONICAL_ALIASES = [
  {
    id: "v4_availability",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/availability",
    displayName: "V4 Departure Availability",
    method: "UNSPEC",
    sourceCitation: "businessData.js:281",
    aliases: ["/brands/{brand}/.../departures/{id}/availability"]
  },
  {
    id: "v4_tours",
    canonicalPath: "/brands/{brand}/tours",
    displayName: "V4 Tour Listing",
    method: "UNSPEC",
    sourceCitation: "businessData.js:9, :184",
    aliases: ["/brands/{brand}/tours"]
  },
  {
    id: "v4_tour_options",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}",
    displayName: "V4 Tour Options Search",
    method: "UNSPEC",
    sourceCitation: "businessData.js:142, :296",
    aliases: ["/brands/{brand}/tours/{tourId}/options/{optionId}"]
  },
  {
    id: "v4_quote",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/quote",
    displayName: "V4 Quote Calculation",
    method: "UNSPEC",
    sourceCitation: "businessData.js:203",
    aliases: ["/brands/{brand}/.../departures/{id}/quote", "/quote"]
  },
  {
    id: "v4_book",
    canonicalPath: "/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/book",
    displayName: "V4 Tour Departure Book (Inferred Expansion)",
    method: "UNSPEC",
    sourceCitation: "businessData.js:195",
    aliases: ["/brands/{brand}/.../departures/{id}/book"]
  },
  {
    id: "v4_booking",
    canonicalPath: "/booking",
    displayName: "V4 Commit Land Tour Sub-Booking",
    method: "POST", // Sourced at businessData.js:357
    sourceCitation: "businessData.js:184, :195, :357",
    aliases: ["/booking"]
  },
  {
    id: "v4_booking_ref",
    canonicalPath: "/bookings/{bookingReference}",
    displayName: "V4 Master Booking Retrieval",
    method: "UNSPEC",
    sourceCitation: "businessData.js:26, :27, :184, :211",
    aliases: ["/bookings/{bookingReference}"]
  },
  {
    id: "v4_commissions",
    canonicalPath: "/internal/sellingCompany/{sellingCompanyCode}/marketVariation/{marketVariation}/departure/{departureCode}/commissions",
    displayName: "V4 Selling Company Commissions",
    method: "UNSPEC",
    sourceCitation: "businessData.js:219",
    aliases: ["/internal/sellingCompany/{sellingCompanyCode}/.../departure/{departureCode}/commissions"]
  },
  {
    id: "v4_operating_points",
    canonicalPath: "/api/v4/operatingPoints",
    displayName: "V4 Operating Points",
    method: "UNSPEC",
    sourceCitation: "businessData.js:235",
    aliases: ["/api/v4/operatingPoints"]
  },
  {
    id: "v4_locations",
    canonicalPath: "/api/v4/locations",
    displayName: "V4 Locations",
    method: "UNSPEC",
    sourceCitation: "businessData.js:235",
    aliases: ["/api/v4/locations"]
  }
];

// Brand Metadata: Codes alone as explicitly enumerated in businessData.js:6 (AA, BV, CH, CS, GE, IV, LG, TT)
export const TROPICS_BRANDS = [
  { code: 'AA' },
  { code: 'BV' },
  { code: 'CH' },
  { code: 'CS' },
  { code: 'GE' },
  { code: 'IV' },
  { code: 'LG' },
  { code: 'TT' }
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
      const nodeId = `REST_API_connect_${method}_${path}`;
      const mapKey = `${method}_${path}`;

      if (!restNodeMap.has(mapKey)) {
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
        restNodeMap.set(mapKey, node);
      } else {
        restNodeMap.get(mapKey).records.push(record);
      }
    }
  });

  // RPC Message Catalog Grouping Node
  const rpcCatalogNodeId = 'RPC_SCHEMA_catalog_SPEC_IbsRpcCatalog';
  nodes.push({
    id: rpcCatalogNodeId,
    category: 'RPC_SCHEMA',
    layer: 'Cruise RPC v6.0 Catalog',
    displayName: 'IBS Cruise RPC v6.0 Catalog',
    sourceCitation: 'businessData.js:180',
    description: 'Centralized catalog of IBS iTravel Cruise v6.0 RPC message schemas defined in PDF Specification.',
    tier: 2
  });

  // 2. Build RPC_SCHEMA Nodes (17 Message Nodes)
  API_KNOWLEDGE_BASE.forEach(record => {
    if (record.rpcMessageName) {
      const msgName = record.rpcMessageName;
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

      // Link REST_API ➔ RPC_SCHEMA strictly where record defines connectRestPath
      if (record.connectRestPath) {
        const method = record.connectRestMethod || record.method || 'POST';
        const restNode = restNodeMap.get(`${method}_${record.connectRestPath}`);
        if (restNode) {
          edges.push({
            id: `edge_rest_rpc_${restNode.id}_${nodeId}`,
            source: restNode.id,
            target: nodeId,
            type: 'CALLS_RPC',
            label: 'Translates to RPC'
          });
        }
      } else {
        // RPC-only messages connect to RPC Catalog grouping node
        edges.push({
          id: `edge_rpc_catalog_${nodeId}`,
          source: nodeId,
          target: rpcCatalogNodeId,
          type: 'DOCUMENTED_IN',
          label: 'Documented in RPC Spec'
        });
      }
    }
  });

  // 3. Build V4_ADAPTER Nodes (10 Canonical Endpoints)
  V4_CANONICAL_ALIASES.forEach(v4Alias => {
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
    } else if (v4Alias.id === 'v4_book') {
      const rpcBkg = nodes.find(n => n.id === 'RPC_SCHEMA_ibsrpc_POST_createBookingRQ');
      if (rpcBkg) {
        edges.push({ id: `edge_rpc_v4_book`, source: rpcBkg.id, target: nodeId, type: 'ROUTES_TO', label: 'Books Tour Departure' });
      }
    } else if (v4Alias.id === 'v4_booking') {
      const rpcBkg = nodes.find(n => n.id === 'RPC_SCHEMA_ibsrpc_POST_createBookingRQ');
      if (rpcBkg) {
        edges.push({ id: `edge_rpc_v4_booking`, source: rpcBkg.id, target: nodeId, type: 'ROUTES_TO', label: 'Commits Sub-Booking' });
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
      displayName: `${req.id}: ${req.category}`,
      reqId: req.id,
      reqCategory: req.category,
      sourceCitation: `businessData.js: ELEVATE_REQUIREMENTS (${req.id})`,
      description: req.requirement,
      howItWorks: req.howItWorks,
      tier: 4 // Tiered layout row 4
    });
  });

  // 5. Build PLATFORM Node (1 Legacy Platform) & FINANCIAL Node (1 Commission Ledger Node)
  const platformNodeId = 'PLATFORM_uniworld_SYS_Longitude';
  nodes.push({
    id: platformNodeId,
    category: 'PLATFORM',
    layer: 'Legacy Platform',
    displayName: 'Longitude (Uniworld Legacy Platform)',
    sourceCitation: 'businessData.js:84 & ELEVATE_REQUIREMENTS (req_10)',
    description: 'Uniworld legacy platform being migrated to iTravel Connect v7.0 and Super PNR master basket.',
    tier: 5
  });

  const finNodeId = 'FINANCIAL_ledger_RULE_CommissionLedger';
  nodes.push({
    id: finNodeId,
    category: 'FINANCIAL',
    layer: 'Financial & Ledger Rules',
    displayName: 'iTravel Centralized Commission Ledger',
    sourceCitation: 'businessData.js:125, :131, :376 ($1,110 Deposit Rules)',
    description: 'Centralized financial ledger managing Net/Gross agency commission calculations and $1,110 deposit milestone rules (sourced businessData.js:376).',
    tier: 5
  });

  const paymentNode = nodes.find(n => n.id === 'REST_API_connect_POST_/v7/rest/bookings/{bookingReference}/payments');
  if (paymentNode) {
    edges.push({ id: 'edge_pay_fin', source: paymentNode.id, target: finNodeId, type: 'ENFORCES_RULE', label: 'Posts Commission Ledger' });
  }

  // 6. Ground-Truth Connections for Requirements (Mining itravelApi & v4Api in ELEVATE_REQUIREMENTS)
  const reqConnections = [
    // req_1: Unified Booking Basket
    { reqId: 'req_1', targetId: 'REST_API_connect_POST_/v7/rest/bookings', label: 'Implements Basket Cart' },
    { reqId: 'req_1', targetId: 'RPC_SCHEMA_ibsrpc_POST_createBookingRQ', label: 'Triggers Create Booking' },
    { reqId: 'req_1', targetId: 'V4_ADAPTER_tropics_UNSPEC_/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/book', label: 'Books Land Tour' },
    { reqId: 'req_1', targetId: 'V4_ADAPTER_tropics_POST_/booking', label: 'Commits Sub-Booking PNR' },

    // req_2: Flexible Booking Conditions
    { reqId: 'req_2', targetId: 'RPC_SCHEMA_ibsrpc_POST_fetchApplicablePromotionsRQ', label: 'Evaluates Promo Rules' },
    { reqId: 'req_2', targetId: 'REST_API_connect_POST_/v7/rest/bookings', label: 'Supports Preview Mode' },
    { reqId: 'req_2', targetId: 'V4_ADAPTER_tropics_UNSPEC_/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/quote', label: 'Quotes Land Deposit' },

    // req_3: Single Customer Invoice
    { reqId: 'req_3', targetId: 'V4_ADAPTER_tropics_UNSPEC_/bookings/{bookingReference}', label: 'Syncs Sub-Booking PNR' },

    // req_4: Travel Agent Integration
    { reqId: 'req_4', targetId: 'V4_ADAPTER_tropics_UNSPEC_/internal/sellingCompany/{sellingCompanyCode}/marketVariation/{marketVariation}/departure/{departureCode}/commissions', label: 'Calculates Commission' },

    // req_5: Central Rules Engine
    { reqId: 'req_5', targetId: 'RPC_SCHEMA_ibsrpc_POST_fetchApplicableAncillaryRuleRQ', label: 'Evaluates Transit Rules' },

    // req_6: Canonical Data Model (V4 operatingPoints & locations)
    { reqId: 'req_6', targetId: 'V4_ADAPTER_tropics_UNSPEC_/api/v4/operatingPoints', label: 'Standardizes Operating Points' },
    { reqId: 'req_6', targetId: 'V4_ADAPTER_tropics_UNSPEC_/api/v4/locations', label: 'Standardizes Locations' },

    // req_7: Auth & SSO Integration
    { reqId: 'req_7', targetId: 'REST_API_connect_POST_/token', label: 'Enforces Auth & SSO' },

    // req_8: Scalability & Extensibility
    { reqId: 'req_8', targetId: 'V4_ADAPTER_tropics_UNSPEC_/brands/{brand}/tours/{tourId}/options/{optionId}', label: 'Extends Tour Options' },

    // req_10: Timeline Awareness
    { reqId: 'req_10', targetId: 'PLATFORM_uniworld_SYS_Longitude', label: 'Replaces Longitude by 2027' }
  ];

  reqConnections.forEach(conn => {
    const reqNode = nodes.find(n => n.id === `REQUIREMENT_elevate_SPEC_${conn.reqId}`);
    const targetNode = nodes.find(n => n.id === conn.targetId);
    if (reqNode && targetNode) {
      edges.push({
        id: `edge_req_${conn.reqId}_${targetNode.id}`,
        source: reqNode.id,
        target: targetNode.id,
        type: 'IMPLEMENTS',
        label: conn.label
      });
    }
  });

  // 7. Build BRAND Nodes (8 Tropics Brand Codes)
  TROPICS_BRANDS.forEach(brand => {
    const nodeId = `BRAND_tropics_CODE_${brand.code}`;
    nodes.push({
      id: nodeId,
      category: 'BRAND',
      layer: 'Tropics Brand',
      displayName: `Brand ${brand.code}`,
      brandCode: brand.code,
      sourceCitation: 'businessData.js:6',
      description: `Tropics Brand Code ${brand.code} enumerated in businessData.js:6`,
      tier: 5 // Tiered layout row 5
    });
  });

  // Connect V4 Adapter layer (/brands/{brand}/tours) to ALL 8 Brand Codes
  const v4ToursNode = nodes.find(n => n.id === 'V4_ADAPTER_tropics_UNSPEC_/brands/{brand}/tours');
  if (v4ToursNode) {
    TROPICS_BRANDS.forEach(brand => {
      const brandNode = nodes.find(n => n.id === `BRAND_tropics_CODE_${brand.code}`);
      if (brandNode) {
        edges.push({
          id: `edge_v4_brand_routing_${brand.code}`,
          source: v4ToursNode.id,
          target: brandNode.id,
          type: 'SERVES_BRAND',
          label: 'Brand Tenant Routing'
        });
      }
    });
  }

  return { nodes, edges };
};
