import React, { useState, useMemo } from 'react';
import { API_KNOWLEDGE_BASE } from '../data/apiData';
import { ELEVATE_REQUIREMENTS, ARCHITECTURE_RISKS_QA } from '../data/businessData';
import { V4_CANONICAL_ALIASES } from '../data/graphData';
import { Search, Sparkles, AlertTriangle, CheckCircle, Copy, Check, ArrowRight, Compass, XCircle } from 'lucide-react';

// Sample PM Scenarios & Architectural Decision Queries
const PRESET_SCENARIOS = [
  {
    id: 'v4_direct_basket',
    title: '🛑 Decision: Should I use V4 directly to create a basket?',
    query: 'Should I use V4 directly to create a basket?',
    category: 'Arch Decision'
  },
  {
    id: 'agent_portal',
    title: 'Personalized Travel Agent Home Page & Portal SSO',
    query: 'I need to build a Travel agent experience where I can personalise a home page using my login',
    category: 'Agent Portal'
  },
  {
    id: 'cart_checkout',
    title: 'Unified Multi-Brand Cart Checkout & Deposit Holds',
    query: 'Book multiple products in a single cart with variable deposit policies and inventory holds',
    category: 'Checkout & Booking'
  },
  {
    id: 'cancellation',
    title: 'Sub-Booking Cancellation & Penalty Calculation',
    query: 'Cancel a specific tour or cruise line item, calculate cancellation penalties, and refund deposit',
    category: 'Servicing'
  },
  {
    id: 'invoice',
    title: 'Single Customer Invoice & Itinerary Generation',
    query: 'Consolidate invoices from Tropics tour and iTravel cruise onto a single customer document',
    category: 'Invoicing'
  },
  {
    id: 'commissions',
    title: 'Salesforce MDM Agent Identity & Consortium Commissions',
    query: 'Identify agents across Tropics and iTravel, map consortium relationships, and calculate commissions',
    category: 'Commissions'
  },
  {
    id: 'power_shopping',
    title: 'Multi-Modal Power Shopping (Land Tour + Cruise)',
    query: 'Power shopping for combined river cruise and land tour with 3-hour transit buffers',
    category: 'Shopping'
  }
];

export function UseCaseFinder({ onNavigateToGraph }) {
  const [searchQuery, setSearchQuery] = useState(PRESET_SCENARIOS[0].query);
  const [copiedJira, setCopiedJira] = useState(false);

  // Real-Time Matching, Decision Verdict & Gap Analysis Engine
  const analysis = useMemo(() => {
    const queryLower = searchQuery.toLowerCase();
    
    // Stopwords to prevent false collisions on common English terms ("use", "should", "can", "directly", "create")
    const STOP_WORDS = new Set([
      'the', 'and', 'for', 'with', 'from', 'this', 'that', 'into', 'use', 'can',
      'how', 'what', 'where', 'should', 'directly', 'create', 'a', 'an', 'in', 'on',
      'of', 'to', 'is', 'are', 'be', 'do', 'does', 'did', 'would', 'could', 'about',
      'like', 'need', 'build', 'using', 'will', 'your', 'my', 'our'
    ]);

    // Tokenize query into significant terms
    const significantTerms = queryLower
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= 3 && !STOP_WORDS.has(w));

    // Word boundary matcher (prevents substring false matches like "use" matching "sync" or "create" matching "createbookingrq")
    const matchesQuery = (text) => {
      if (significantTerms.length === 0) return false;
      const textLower = text.toLowerCase();
      return significantTerms.some(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'i');
        return regex.test(textLower);
      });
    };

    // 1. Architectural Policy Verdict Engine
    let decisionVerdict = null;

    if (queryLower.includes('v4') && (queryLower.includes('direct') || queryLower.includes('create a basket') || queryLower.includes('basket') || queryLower.includes('cart'))) {
      decisionVerdict = {
        verdict: 'NOT SUPPORTED BY DOCUMENTED ARCHITECTURE',
        isViolation: true,
        title: 'Connect REST v7.0 Gateway is the Documented External Surface; V4 Adapters are Internal Orchestration Services.',
        summary: 'The documented architecture models Connect REST v7.0 (POST /v7/rest/bookings) as the external North-South Gateway (BFF), while V4 Adapter endpoints are internal East-West microservices invoked by iTravel OMS (businessData.js:14, :184).',
        rationale: [
          'V4 Adapter endpoints (e.g. /booking or /brands/{brand}/.../book) are documented as internal endpoints invoked by iTravel OMS to commit land tour sub-bookings to Tropics (businessData.js:184, :357).',
          'Bypassing iTravel OMS leaves land tour sub-bookings uncoordinated with river cruise/rail line items inside the Super PNR basket.',
          'Bypassing iTravel OMS conflicts with Elevate Requirement REQ_1 ("Unified Booking Basket") and REQ_3 ("Single Customer Invoice").'
        ],
        correctPattern: 'UI Portals ➔ POST /v7/rest/bookings (Connect REST Gateway) ➔ iTravel OMS Orchestrator ➔ V4 Adapter (POST /booking)'
      };
    } else if (queryLower.includes('rpc') && (queryLower.includes('direct') || queryLower.includes('ui') || queryLower.includes('portal'))) {
      decisionVerdict = {
        verdict: 'NOT SUPPORTED BY DOCUMENTED ARCHITECTURE',
        isViolation: true,
        title: 'UI Portals are documented to use Connect REST v7.0 Gateway rather than raw IBS RPCs.',
        summary: 'Connect REST v7.0 translates REST JSON payloads into IBS RPC v6.0 schemas internally.',
        rationale: [
          'Raw IBS RPCs require stateful session handling and IBS-specific message formatting.',
          'Connect REST v7.0 handles OAuth 2.0 JWT authentication and standardizes HTTP verb semantics.'
        ],
        correctPattern: 'UI Portals ➔ Connect REST Gateway (HTTPS + Bearer JWT) ➔ iTravel OMS ➔ IBS Cruise RPC v6.0 Engine'
      };
    }

    // 2. Match Elevate Requirements
    let matchedRequirements = ELEVATE_REQUIREMENTS.filter(req => {
      const text = `${req.id} ${req.category} ${req.requirement} ${req.itravelApi} ${req.v4Api} ${req.howItWorks}`;
      return matchesQuery(text);
    });

    // Contextual evidence alignment: Ensure REQ_1 and REQ_3 align with the V4 basket query verdict rationale
    if (queryLower.includes('v4') && (queryLower.includes('basket') || queryLower.includes('cart') || queryLower.includes('create'))) {
      const req1 = ELEVATE_REQUIREMENTS.find(r => r.id === 'req_1');
      const req3 = ELEVATE_REQUIREMENTS.find(r => r.id === 'req_3');
      if (req1 && !matchedRequirements.some(r => r.id === 'req_1')) matchedRequirements.push(req1);
      if (req3 && !matchedRequirements.some(r => r.id === 'req_3')) matchedRequirements.push(req3);
    }

    // 3. Match Connect REST & RPC APIs
    const matchedApis = API_KNOWLEDGE_BASE.filter(api => {
      const text = `${api.title} ${api.displayName} ${api.description} ${api.endpointPath} ${api.connectRestPath || ''} ${api.rpcMessageName || ''}`;
      return matchesQuery(text);
    });

    // 4. Match V4 Adapter Surfaces
    const matchedV4Adapters = V4_CANONICAL_ALIASES.filter(v4 => {
      const text = `${v4.displayName} ${v4.canonicalPath} ${v4.aliases.join(' ')}`;
      return matchesQuery(text);
    });

    // 5. Match Architecture Risks & Q&A
    const matchedRisks = ARCHITECTURE_RISKS_QA.filter(risk => {
      const text = `${risk.title} ${risk.risk} ${risk.resolution}`;
      return matchesQuery(text);
    });

    // 6. Dynamic Lacking Information & Gap Analysis
    const gaps = [];

    // Agent Home Page / Personalization Gaps
    if (queryLower.includes('agent') || queryLower.includes('personal') || queryLower.includes('home page') || queryLower.includes('login')) {
      gaps.push({
        type: 'MISSING_API',
        title: 'Agent Profile & UI Preferences API',
        severity: 'HIGH',
        description: 'No endpoint exists in Connect REST v7.0 to store or fetch agent layout preferences, favorite brands, or dashboard widget settings (e.g. GET/PUT /v7/rest/agent/preferences).'
      });
      gaps.push({
        type: 'MISSING_API',
        title: 'Agency Branding & Co-Branding Asset API',
        severity: 'MEDIUM',
        description: 'No API returns agency logo URLs, custom header banners, or co-branded advisor contact details.'
      });
      gaps.push({
        type: 'MISSING_API',
        title: 'Agent Performance & Target Progress Tracker API',
        severity: 'MEDIUM',
        description: 'No API endpoint returns YTD booking volume or commission tier progress (e.g. "2 bookings away from Gold Tier").'
      });
      gaps.push({
        type: 'MISSING_SCHEMA',
        title: 'Recent Client Activity & Draft Carts Feed',
        severity: 'HIGH',
        description: 'No API endpoint fetches an agent\'s recent pending quotes across multi-modal journeys (e.g. GET /v7/rest/agent/draft-baskets).'
      });
    }

    // Checkout / Cart / Deposit Gaps
    if (queryLower.includes('checkout') || queryLower.includes('cart') || queryLower.includes('deposit') || queryLower.includes('payment') || queryLower.includes('basket')) {
      gaps.push({
        type: 'MISSING_NON_FUNCTIONAL',
        title: 'Inventory Lock SLA & Timeout Policy',
        severity: 'HIGH',
        description: 'Missing explicit TTL specifications for temporary stateroom/departure holds (e.g., 15-minute checkout lock expiration).'
      });
      gaps.push({
        type: 'MISSING_SCHEMA',
        title: 'Split-Payment & Multi-Card Gateway Schema',
        severity: 'MEDIUM',
        description: 'Connect REST v7.0 payment endpoint accepts payment tokens, but lacks multi-party split credit card schema.'
      });
    }

    // Servicing / Cancellation Gaps
    if (queryLower.includes('cancel') || queryLower.includes('penalty') || queryLower.includes('refund')) {
      gaps.push({
        type: 'MISSING_API',
        title: 'Real-Time Penalty Breakdown Preview API',
        severity: 'HIGH',
        description: 'No dedicated preview endpoint exists to calculate cancellation fee schedules prior to committing the cancellation.'
      });
    }

    // Universal Gaps across all API queries
    gaps.push({
      type: 'MISSING_NON_FUNCTIONAL',
      title: 'HTTP Status Code Mappings & Retry Strategy',
      severity: 'MEDIUM',
      description: 'API specs document application error code arrays (e.g. ERR_4001), but lack standard HTTP status code mappings (e.g. 400 Bad Request vs 409 Stateroom Lock Conflict vs 502 V4 Adapter Timeout) and client retry strategies.'
    });

    gaps.push({
      type: 'MISSING_SCHEMA',
      title: 'Asynchronous Webhook Event Schemas',
      severity: 'LOW',
      description: 'Salesforce MDM and order webhooks are mentioned in citations, but formal webhook event schemas (booking.created, payment.posted) are missing.'
    });

    return {
      decisionVerdict,
      matchedRequirements,
      matchedApis,
      matchedV4Adapters,
      matchedRisks,
      gaps
    };
  }, [searchQuery]);

  const handleCopyJira = () => {
    const text = `
h2. Product Feature Blueprint & Decision: ${searchQuery}

${analysis.decisionVerdict ? `h3. Architectural Decision Verdict: ${analysis.decisionVerdict.verdict}\n${analysis.decisionVerdict.title}\n*Rationale:* ${analysis.decisionVerdict.summary}\n*Correct Pattern:* ${analysis.decisionVerdict.correctPattern}\n` : ''}

h3. 1. Available System Architecture & APIs
*Requirements Implemented:* ${analysis.matchedRequirements.map(r => `${r.id} (${r.category})`).join(', ') || 'None'}
*Connect REST APIs:* ${analysis.matchedApis.filter(a => a.connectRestPath).map(a => `${a.method || 'POST'} ${a.connectRestPath}`).join(', ') || 'None'}
*V4 Adapter Surfaces:* ${analysis.matchedV4Adapters.map(v => v.canonicalPath).join(', ') || 'None'}

h3. 2. Lacking Information & API Gaps (Request from Engineering)
${analysis.gaps.map(g => `* [${g.severity}] ${g.title}: ${g.description}`).join('\n')}

h3. 3. Recommended Action Plan
1. Ensure all North-South integrations route via Connect REST v7.0 Gateway.
2. Request Engineering contracts for missing profile/preference endpoints.
3. Validate multi-modal transit buffers against rules engine.
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedJira(true);
    setTimeout(() => setCopiedJira(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      
      {/* Header Banner */}
      <div className="card" style={{ padding: '24px', backgroundColor: 'var(--navy-900)', color: '#fff', borderLeft: '4px solid var(--gold-500)', boxShadow: 'var(--shadow-section)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Sparkles style={{ color: 'var(--gold-500)' }} size={24} />
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: 0 }}>Open-Ended Use Case & Architectural Decision Finder</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--slate-300)', margin: 0, maxWidth: '900px' }}>
          Ask any open-ended product capability question or architectural decision query (e.g. <em>"Should I use V4 directly to create a basket?"</em> or <em>"Build a travel agent home page"</em>). The engine renders architectural policy verdicts, available system assets, and information gaps.
        </p>
      </div>

      {/* Search Bar & Presets */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Query Product Use Case or Architectural Decision:
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 'Should I use V4 directly to create a basket?'..."
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--slate-300)',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            </div>
            <button
              onClick={handleCopyJira}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0 20px', whiteSpace: 'nowrap' }}
            >
              {copiedJira ? <Check size={16} color="var(--gold-500)" /> : <Copy size={16} />}
              {copiedJira ? 'Copied JIRA Spec!' : 'Export JIRA Spec'}
            </button>
          </div>

          {/* Sample Preset Pills */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--slate-500)', marginRight: '8px' }}>Sample Queries:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {PRESET_SCENARIOS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setSearchQuery(preset.query)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    border: preset.id === 'v4_direct_basket' ? '1px solid #fca5a5' : '1px solid var(--slate-200)',
                    backgroundColor: searchQuery === preset.query ? 'var(--navy-900)' : (preset.id === 'v4_direct_basket' ? '#fef2f2' : 'var(--slate-100)'),
                    color: searchQuery === preset.query ? '#fff' : (preset.id === 'v4_direct_basket' ? '#991b1b' : 'var(--navy-800)'),
                    transition: 'all 0.15s ease'
                  }}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Architectural Policy Verdict Banner (Rendered when decision detected) */}
      {analysis.decisionVerdict && (
        <div className="card" style={{ padding: '24px', backgroundColor: analysis.decisionVerdict.isViolation ? '#fef2f2' : '#f0fdf4', border: `2px solid ${analysis.decisionVerdict.isViolation ? '#ef4444' : '#22c55e'}`, boxShadow: 'var(--shadow-section)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ backgroundColor: analysis.decisionVerdict.isViolation ? '#ef4444' : '#22c55e', color: '#fff', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {analysis.decisionVerdict.isViolation ? <XCircle size={28} /> : <CheckCircle size={28} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', backgroundColor: analysis.decisionVerdict.isViolation ? '#dc2626' : '#16a34a', color: '#fff', letterSpacing: '0.05em' }}>
                  {analysis.decisionVerdict.verdict}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--navy-900)', margin: 0 }}>
                  {analysis.decisionVerdict.title}
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--slate-800)', fontWeight: '600', marginBottom: '12px' }}>
                {analysis.decisionVerdict.summary}
              </p>

              <div style={{ backgroundColor: '#fff', padding: '14px', borderRadius: 'var(--radius-accordion)', border: '1px solid var(--slate-200)', marginBottom: '12px' }}>
                <strong style={{ fontSize: '12px', color: 'var(--navy-900)', display: 'block', marginBottom: '6px' }}>Architectural Rationale:</strong>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {analysis.decisionVerdict.rationale.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div style={{ backgroundColor: 'var(--navy-900)', color: '#fff', padding: '10px 14px', borderRadius: 'var(--radius-accordion)', fontSize: '12px', fontFamily: 'monospace' }}>
                <strong style={{ color: 'var(--gold-500)', display: 'block', marginBottom: '2px', fontFamily: 'sans-serif' }}>Mandatory Integration Sequence:</strong>
                {analysis.decisionVerdict.correctPattern}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Analysis Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Column 1: Available Assets */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--slate-200)', paddingBottom: '12px' }}>
            <CheckCircle style={{ color: 'var(--color-node-v4)' }} size={20} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 }}>
              1. Available System Assets ({analysis.matchedApis.length + analysis.matchedRequirements.length + analysis.matchedV4Adapters.length})
            </h3>
          </div>

          {/* Implemented Requirements */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Implemented Requirements ({analysis.matchedRequirements.length})
            </h4>
            {analysis.matchedRequirements.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--slate-400)', italic: 'true' }}>No matching requirements found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.matchedRequirements.map(req => (
                  <div key={req.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-accordion)', backgroundColor: 'var(--node-req-bg)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-node-req)' }}>{req.id.toUpperCase()}</span>
                      <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>{req.category}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--navy-900)', margin: 0, fontWeight: '500' }}>{req.requirement}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connect REST & RPC APIs */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Matching REST & RPC APIs ({analysis.matchedApis.length})
            </h4>
            {analysis.matchedApis.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--slate-400)' }}>No matching REST/RPC APIs.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.matchedApis.map((api, idx) => (
                  <div key={idx} style={{ padding: '10px 12px', borderRadius: 'var(--radius-accordion)', backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', backgroundColor: api.connectRestPath ? 'var(--node-rest-bg)' : 'var(--node-rpc-bg)', color: api.connectRestPath ? 'var(--color-node-rest)' : 'var(--color-node-rpc)' }}>
                        {api.connectRestPath ? (api.connectRestMethod || api.method || 'REST') : 'RPC'}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)' }}>{api.title}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--slate-600)', margin: 0 }}>
                      {api.connectRestPath ? `Connect REST: ${api.connectRestPath}` : (api.endpointPath || 'RPC Schema')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* V4 Adapters */}
          {analysis.matchedV4Adapters.length > 0 && (
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '8px' }}>
                V4 Adapter Surfaces ({analysis.matchedV4Adapters.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {analysis.matchedV4Adapters.map(v4 => (
                  <div key={v4.id} style={{ padding: '8px 10px', borderRadius: 'var(--radius-accordion)', backgroundColor: 'var(--node-v4-bg)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-node-v4)' }}>{v4.displayName}</span>
                    <p style={{ fontSize: '11px', color: 'var(--navy-900)', fontFamily: 'monospace', margin: '2px 0 0 0' }}>{v4.canonicalPath}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Column 2: Lacking Information & API Gaps */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--slate-200)', paddingBottom: '12px' }}>
            <AlertTriangle style={{ color: '#ef4444' }} size={20} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 }}>
              2. Lacking Information & Feature Gaps ({analysis.gaps.length})
            </h3>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--slate-600)', margin: 0 }}>
            These missing API contracts, data schemas, or non-functional specs must be requested from engineering to deliver this use case:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {analysis.gaps.map((gap, idx) => (
              <div key={idx} style={{ padding: '12px', borderRadius: 'var(--radius-card)', backgroundColor: gap.severity === 'HIGH' ? '#fef2f2' : 'var(--slate-50)', border: `1px solid ${gap.severity === 'HIGH' ? '#fca5a5' : 'var(--slate-300)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: gap.severity === 'HIGH' ? '#991b1b' : 'var(--navy-900)' }}>
                    {gap.title}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', backgroundColor: gap.severity === 'HIGH' ? '#ef4444' : '#f59e0b', color: '#fff' }}>
                    {gap.severity} GAP
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--slate-700)', margin: 0, lineHeight: '1.4' }}>
                  {gap.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Product Blueprint & Actions */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--slate-50)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--slate-200)', paddingBottom: '12px' }}>
            <Compass style={{ color: 'var(--navy-800)' }} size={20} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy-900)', margin: 0 }}>
              3. Product Manager Action Plan
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-card)', backgroundColor: '#fff', border: '1px solid var(--slate-200)' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)', marginBottom: '4px' }}>
                Step 1: Enforce Gateway Architecture
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--slate-600)', margin: 0 }}>
                Ensure all North-South client portals route through <code>POST /v7/rest/bookings</code> (Connect REST Gateway) and authenticated via OAuth 2.0 JWT.
              </p>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-card)', backgroundColor: '#fff', border: '1px solid var(--slate-200)' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)', marginBottom: '4px' }}>
                Step 2: Request New Engineering Contracts
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--slate-600)', margin: 0 }}>
                File API contract requests for the <strong>{analysis.gaps.length} missing surfaces</strong> identified in Column 2.
              </p>
            </div>

            <div style={{ padding: '12px', borderRadius: 'var(--radius-card)', backgroundColor: '#fff', border: '1px solid var(--slate-200)' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy-900)', marginBottom: '4px' }}>
                Step 3: Graph Topology Inspection
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--slate-600)', margin: '0 0 10px 0' }}>
                View the interactive graph sub-network of nodes implementing this specific capability.
              </p>
              {onNavigateToGraph && (
                <button
                  onClick={() => onNavigateToGraph()}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px' }}
                >
                  Inspect Sub-Graph in Graph Explorer <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
