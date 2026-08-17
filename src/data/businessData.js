export const OMS_ARCHITECTURE_TOPOLOGY = {
  title: "iTravel OMS Gateway & Integration Topology",
  subtitle: "Single Point of Orchestration: Frontend UI talks ONLY to iTravel OMS Gateway",
  diagram: `
+-------------------------------------------------------------------+
|                        FRONTEND CLIENT UI                          |
|             (B2B Web Portal / B2C Web Cart / Mobile)              |
+-------------------------------------------------------------------+
                                  |
                                  |  Single Unified REST API Request
                                  |  (e.g., POST /api/v6/createBooking)
                                  v
+-------------------------------------------------------------------+
|                   iTRAVEL OMS GATEWAY / ADAPTER                   |
|                  (Single Point of Orchestration)                  |
|                                                                   |
|  * Unified OAuth 2.0 Auth & Channel Context (BookingOwner)       |
|  * Configurable Rules Engine (Transit Buffers & Combined Promos)  |
|  * Super PNR Basket Composition & Single Customer Invoice         |
+-------------------------------------------------------------------+
                |                                   |
    Internal    |                                   |  Internal Adapter
    GRPC/REST   |                                   |  REST Call
                v                                   v
+-------------------------------+   +-------------------------------+
|  iTRAVEL CRUISE SERVICE V6.0  |   |    TRAVCORP V4 ADAPTER LAYER  |
|   (Uniworld Ship Inventory)   |   |   (Tropics / Longitude Sync)  |
+-------------------------------+   +-------------------------------+
`,
  keyTakeaways: [
    "NO Direct V4 Calls from UI: The frontend web portal or mobile app NEVER makes direct API calls to TravCorp V4 or Tropics/Longitude.",
    "iTravel OMS as Unified Gateway: The UI communicates exclusively with iTravel OMS REST endpoints.",
    "Internal Backend Orchestration: When the UI requests a multi-modal booking, iTravel OMS internally calls the iTravel Cruise engine for ship cabins AND the V4 Adapter for land tours.",
    "Single Super PNR & Invoice: iTravel OMS aggregates the responses, calculates bundled pricing/discounts, creates sub-records in Tropics, and returns one unified Super PNR payload to the UI.",
    "Future-Proof Abstraction: Replacing legacy systems (Tropics/Longitude) in the future requires zero changes to the UI codebase."
  ]
};

export const ELEVATE_REQUIREMENTS = [
  {
    id: "req_1",
    category: "Unified Booking Basket",
    requirement: "Ability to book multiple products (e.g. tours, cruises, rail) in a single shopping cart while maintaining records in legacy systems (Tropics, Longitude).",
    itravelApi: "createBookingRQ/RS (Super PNR Basket Mode)",
    v4Api: "v4 /api/v4/tourDepartures & /api/v4/bookings",
    howItWorks: "UI calls iTravel OMS createBooking. iTravel OMS internally calls V4 Adapter to write land tour records to Tropics, while saving cruise line items in iTravel. UI receives one Super PNR."
  },
  {
    id: "req_2",
    category: "Flexible Booking Conditions",
    requirement: "Support variable deposit policies, payment schedules, cancellation rules, and bundled promotional pricing across brands.",
    itravelApi: "fetchApplicablePromotionsRQ/RS & createBookingRQ/RS (IsPreview = true)",
    v4Api: "v4 /api/v4/pricing & promotion rules",
    howItWorks: "UI calls iTravel preview mode. iTravel OMS orchestrates pricing queries across V4 land tours and iTravel cruises, returning a single unified deposit schedule and bundled promo discounts."
  },
  {
    id: "req_3",
    category: "Single Customer Invoice",
    requirement: "Consolidate invoices for all products into one unified document for the guest.",
    itravelApi: "iTravel Invoice & Itinerary Generation API / Super PNR",
    v4Api: "v4 /api/v4/bookings/documents (Tropics Sub-Booking Sync)",
    howItWorks: "iTravel OMS aggregates line items from Tropics (tour) and iTravel (cruise) onto a single, brand-aligned customer invoice with consolidated payment terms."
  },
  {
    id: "req_4",
    category: "Travel Agent Integration",
    requirement: "Correctly identify agents across systems (different IDs in Tropics vs Longitude), handle consortia relationships, and compute accurate bundled commissions.",
    itravelApi: "BookingOwner Object (NetPayApplicable, PayToSelf, AgencyConsortium)",
    v4Api: "v4 /api/v4/travelAgents & Salesforce MDM Translation",
    howItWorks: "Salesforce/MDM resolves agent IDs between Tropics and Longitude, mapping them to the iTravel BookingOwner context to trigger consortia benefits and calculate blended commission."
  },
  {
    id: "req_5",
    category: "Configurable Rules Engine",
    requirement: "Implement a configurable rules engine to manage product combinations (tours + cruises), transfer times, check-in/check-out logic, and pricing.",
    itravelApi: "iTravel Rules Engine Microservice / Transfer Buffer Validator",
    v4Api: "v4 /api/v4/operatingPoints & /api/v4/locations",
    howItWorks: "Queries V4 /api/v4/operatingPoints for land tour drop-off times/hubs and compares against iTravel pier embarkation cutoff, enforcing a minimum 3-hour transfer buffer."
  },
  {
    id: "req_6",
    category: "Canonical Data Model",
    requirement: "Standardise location and destination data for linking components, supporting geolocation and hub-based connectivity.",
    itravelApi: "iTravel Location & Hub Master APIs (/api/v6/masters/locations)",
    v4Api: "v4 /api/v4/locations & /api/v4/destinations",
    howItWorks: "Uses canonical UN-LOCODE / IATA location codes and geo-coordinates to link hotel drop-off hubs with river cruise docking piers."
  },
  {
    id: "req_7",
    category: "Authentication & Single Sign-On",
    requirement: "Single sign-on for travel agents having different IDs in Longitude and Tropics, managing legacy logins during migration.",
    itravelApi: "OAuth 2.0 /token Endpoint with JWT Claims",
    v4Api: "v4 /oauth/token (Legacy Tropics / Longitude Auth Proxy)",
    howItWorks: "Agents authenticate once via Okta/Salesforce SSO; signed JWT bearer tokens carry normalized agent identities down to both V4 and iTravel APIs."
  },
  {
    id: "req_8",
    category: "Scalability for Future Products",
    requirement: "Prepare for additional product types (e.g. rail, chartered ships, transfers) without major redesign.",
    itravelApi: "iTravel Generic LineItem Schema (Type = CRUISE | TOUR | RAIL | TRANSFER)",
    v4Api: "v4 /api/v4/options & Ancillary Extensions",
    howItWorks: "The Super PNR basket is built on an extensible JSON array of line items, allowing rail or transfer components to be attached seamlessly."
  },
  {
    id: "req_9",
    category: "Salesforce / MDM Integration",
    requirement: "Leverage Salesforce / MDM for travel agent ID mapping and potential use of PCQI for order management.",
    itravelApi: "Salesforce PCQI & Account Sync Webhooks",
    v4Api: "v4 /api/v4/travelAgents/sync",
    howItWorks: "Syncs agency profile updates, credit limits, and agent status bi-directionally between Salesforce CRM and iTravel OMS."
  },
  {
    id: "req_10",
    category: "Timeline Awareness (4Q2026 Rollout)",
    requirement: "Initial Omni rollout expected by 4Q2026 (new online booking cart for Uniworld & Touring brands); bundled capability needed between April & September.",
    itravelApi: "iTravel Omni-Basket API v6.0",
    v4Api: "v4 /api/v4/tourDepartures Distribution API",
    howItWorks: "Phased deployment delivering single-product cruise/tour carts by 4Q2026 followed by multi-modal bundled carts for the 2027 selling season."
  }
];

export const MULTI_MODAL_JOURNEYS = [
  {
    step: 1,
    stageName: "1. Multi-Modal Search & Hub Connectivity",
    tagline: "UI calls iTravel OMS -> iTravel OMS queries Cruise + V4 Land Tour internally",
    description: "Customer searches for a combined European holiday (7-Day Swiss Land Tour + 7-Day Rhine River Cruise). UI makes ONE call to iTravel OMS Gateway.",
    businessValue: "Drives higher yield per booking by cross-selling land tours and river cruises in a single search flow.",
    uiCall: "POST /api/v6/omni/search (To iTravel OMS Gateway)",
    v4Call: "iTravel OMS calls V4 -> /api/v4/tourDepartures (Tropics land tour)",
    itravelCall: "iTravel OMS calls /api/v6/cruiseAggrAvailabilitySearch (Uniworld cruise)",
    rulesEngineCall: "Evaluates canonical hub geolocation to verify tour end-point connects to cruise pier."
  },
  {
    step: 2,
    stageName: "2. Synchronized Room & Cabin Selection",
    tagline: "UI selects Room + Cabin -> iTravel OMS queries V4 options + Ship deck grid",
    description: "Advisor selects hotel room extension via Tropics V4 and specific river cruise suite on Deck 3 via iTravel.",
    businessValue: "Provides a seamless upsell experience across both land accommodations and ship categories.",
    uiCall: "POST /api/v6/omni/options (To iTravel OMS Gateway)",
    v4Call: "iTravel OMS calls V4 -> /api/v4/tourOptions & /api/v4/locations",
    itravelCall: "iTravel OMS calls /api/v6/cruiseCabinAvailabilitySearch (Ship cabin grid)",
    rulesEngineCall: "Validates bed configuration consistency across hotel and ship suite."
  },
  {
    step: 3,
    stageName: "3. Rules Engine & Transit Buffer Validation",
    tagline: "Validate Check-In/Check-Out Logic & Minimum Connection Times",
    description: "Configurable rules engine calculates buffer time between land tour hotel check-out and ship embarkation check-in.",
    businessValue: "Eliminates operational mis-connections and customer dissatisfaction caused by impossible transfer timelines.",
    uiCall: "Handled internally inside iTravel OMS Rules Engine Microservice",
    v4Call: "V4 -> /api/v4/operatingPoints (Hotel drop-off operating point & ETA)",
    itravelCall: "iTravel Embarkation Schedule API (Pier boarding cutoff time)",
    rulesEngineCall: "Enforces 3-hour minimum transfer buffer window between land tour drop-off and pier boarding."
  },
  {
    step: 4,
    stageName: "4. Bundled Promotions & Consortia Overrides",
    tagline: "Combine Multi-Product Discounts & Virtuoso Benefits",
    description: "Evaluates combined promotions (e.g. '$1,000 Off when booking Tour + Cruise together') plus consortia perks.",
    businessValue: "Incentivizes multi-product bookings while enforcing strict discount combinability rules.",
    uiCall: "POST /api/v6/fetchApplicablePromotions (To iTravel OMS Gateway)",
    v4Call: "iTravel OMS calls V4 -> /api/v4/promotions",
    itravelCall: "/api/v6/fetchApplicablePromotions (Evaluates multi-product bundle promo codes)",
    rulesEngineCall: "Checks combinability matrix for Virtuoso / AAA agency consortia codes."
  },
  {
    step: 5,
    stageName: "5. Agent SSO & Inventory Holds",
    tagline: "Resolve Tropics/Longitude Agent IDs & Place Synchronized Holds",
    description: "Translates travel agent identities across legacy systems and places temporary holds on both tour allotment and ship cabin.",
    businessValue: "Protects inventory across land and water for 15 minutes while guest passport details are collected.",
    uiCall: "POST /api/v6/cruiseCabinHold (To iTravel OMS Gateway)",
    v4Call: "iTravel OMS calls V4 -> /api/v4/travelAgents & Tropics Allotment Hold",
    itravelCall: "/api/v6/cruiseCabinHold (Holds Cabin 301 for 15 minutes)",
    rulesEngineCall: "Maps Agent ID 789 (Tropics) <-> Agent User 456 (Longitude) <-> iTravel PCC."
  },
  {
    step: 6,
    stageName: "6. Unified Basket & Single Customer Invoice",
    tagline: "Dry-Run Preview & Commit to Super PNR Basket",
    description: "Validates the multi-product order, generates a single unified guest invoice, and commits records to Tropics and iTravel.",
    businessValue: "Delivers a single customer invoice and Super PNR reference while preserving legacy backend records.",
    uiCall: "POST /api/v6/createBooking (To iTravel OMS Gateway)",
    v4Call: "iTravel OMS calls V4 -> /api/v4/bookings (Creates sub-record in Tropics)",
    itravelCall: "iTravel OMS creates master Super PNR basket & single customer invoice",
    rulesEngineCall: "Calculates consolidated deposit due dates and Net vs Gross agency billing."
  },
  {
    step: 7,
    stageName: "7. Bundled Servicing & Commission Settlement",
    tagline: "Collision-Free Modifications & Blended Commission Payout",
    description: "Handles post-booking servicing with freeze locks and calculates accurate agent commissions across bundled products.",
    businessValue: "Prevents concurrent editing race conditions and ensures accurate agency payouts across multi-brand packages.",
    uiCall: "POST /api/v6/freezeBooking & /api/v6/modify (To iTravel OMS Gateway)",
    v4Call: "iTravel OMS updates Tropics Commission Ledger via V4 /api/v4/commissions",
    itravelCall: "/api/v6/freezeBooking & /api/v6/modify (Pessimistic session lock)",
    rulesEngineCall: "Calculates blended commission (e.g. 15% on cruise + 12% on land tour) based on BookingOwner rules."
  }
];

export const BUSINESS_PERSONAS = [
  {
    id: "persona_pm",
    title: "Product Managers & Business Analysts",
    focus: "Single API Gateway Abstraction for UI",
    keyQuestions: [
      "Does the UI make direct API calls to TravCorp V4 or Tropics?",
      "How do we ensure UI code never breaks if Tropics is upgraded?"
    ],
    recommendedAPIs: [
      "UI calls ONLY iTravel OMS REST endpoints (e.g. POST /api/v6/createBooking)",
      "iTravel OMS Gateway encapsulates V4 Adapter calls internally"
    ]
  },
  {
    id: "persona_trade",
    title: "Travel Agency & Commercial Leads",
    focus: "Salesforce MDM ID Mapping, Consortia & Net Billing",
    keyQuestions: [
      "How does the system map an agent who has different IDs in Tropics and Longitude?",
      "How are commissions calculated for bundled tour + cruise bookings?"
    ],
    recommendedAPIs: [
      "v4 /api/v4/travelAgents & Salesforce/MDM ID Translation Service",
      "BookingOwner in createBookingRQ — NetPayApplicable & bundled commission ledger"
    ]
  },
  {
    id: "persona_ops",
    title: "Operations & Contact Center Leads",
    focus: "Transfer Time Rules Engine & Freeze Locks",
    keyQuestions: [
      "What prevents booking a land tour drop-off that arrives after the cruise pier boarding cutoff?",
      "How do we lock a booking while an advisor updates guest details?"
    ],
    recommendedAPIs: [
      "v4 /api/v4/operatingPoints & Configurable Rules Engine transfer validator",
      "iTravel freezeBookingRQ/RS — Pessimistic lock token (LockToken)"
    ]
  },
  {
    id: "persona_finance",
    title: "Finance & Revenue Management",
    focus: "Single Customer Invoice, Penalties & Tropics Sync",
    keyQuestions: [
      "Can we issue one single consolidated invoice to the guest for both tour and cruise?",
      "How are cancellation penalties split between Tropics and iTravel?"
    ],
    recommendedAPIs: [
      "iTravel Super PNR Invoice Engine — Consolidated guest billing document",
      "iTravel cancelBookingRQ/RS + V4 Cancel — Automated penalty & credit note sync"
    ]
  }
];
