export const ARCHITECTURE_RISKS_QA = [
  {
    category: "Architecture Validations & Decisions",
    items: [
      {
        question: "Ensure that the final solution caters for all brands hosted in Tropics (i.e. AA, BV, CH, CS, GE, IV, LG, TT)",
        answered: "YES",
        evidence: "The TravCorp V4 Adapter layer communicates with Tropics brand IDs (brandCode parameter in /api/v4/tourDepartures). The iTravel OMS BookingOwner and LineItem schemas support all 8 Tropics brands dynamically via brand routing rules.",
        apiRef: "v4 /api/v4/tourDepartures & iTravel LineItem.BrandCode"
      },
      {
        question: "Third party APIs integration strategy",
        answered: "YES",
        evidence: "iTravel OMS Gateway acts as a BFF (Backend-For-Frontend), exposing REST/JSON for external partners while orchestrating internal third-party calls (Amadeus, Cybersource, V4 Adapter, Uniworld Cruise Engine).",
        apiRef: "iTravel OMS REST API Gateway"
      },
      {
        question: "Dynamica integration (into OMS or not?)",
        answered: "YES",
        evidence: "Dynamica (CRM / Tour Operations) integrates via async webhook events emitted by iTravel OMS on POST /api/v6/createBooking and modify lifecycle events rather than direct UI polling.",
        apiRef: "iTravel Webhook Event Bus (/api/v6/webhooks/orders)"
      },
      {
        question: "Master vs. system of record booking management (incl. retrieval of master booking if not all channels are on iTravel front end)",
        answered: "YES",
        evidence: "iTravel OMS acts as the Master Super PNR Store for multi-modal orders, while generating sub-booking PNRs in Tropics (v4BookingRef) for legacy channel retrieval via /api/v4/bookings/{id}.",
        apiRef: "iTravel Super PNR & v4 /api/v4/bookings/{id}"
      },
      {
        question: "Payment system direct integration in iTravel vs. existing Cybersource/Elavon integration and acquirer links.",
        answered: "YES",
        evidence: "iTravel Connect supports direct tokenized payment Gateway integration (paymentToken parameter in createBookingRQ), decoupling card processing from legacy acquirers while mapping payment status to Tropics.",
        apiRef: "createBookingRQ -> PaymentDetails.PaymentToken"
      }
    ]
  },
  {
    category: "Travel Agent Identification",
    items: [
      {
        question: "Disparate IDs across systems; requires mapping or centralised solution.",
        answered: "YES",
        evidence: "Resolved via Master translation layer (Salesforce MDM / iTravel Agency Module). Maps legacy Tropics Agent ID (AG-101) to canonical BookingOwner.RequestorID and x-pcc header in iTravel (Longitude is decommissioned).",
        apiRef: "v4 /api/v4/travelAgents & BookingOwner.RequestorID"
      },
      {
        question: "Consultant-level booking tracking adds complexity.",
        answered: "YES",
        evidence: "BookingOwner object explicitly contains RequestingUserID (Consultant level) alongside RequestorID (Agency level) and OrgUnitCode (Branch level) in every API request.",
        apiRef: "BookingOwner.RequestingUserID"
      },
      {
        question: "AAA / TST consultant level API keys",
        answered: "YES",
        evidence: "OAuth 2.0 /oauth/token grant carries consultant-level claims inside the signed JWT bearer token, passing AgencyConsortium = 'AAA' or 'TST' in header context.",
        apiRef: "OAuth 2.0 JWT Claims & BookingOwner.AgencyConsortium"
      }
    ]
  },
  {
    category: "Data Mastering & Standardisation",
    items: [
      {
        question: "Customer Data mastering",
        answered: "YES",
        evidence: "Salesforce CRM serves as Customer MDM. GuestProfile array in createBookingRQ passes MDMCustomerID to synchronize guest history across iTravel and Tropics.",
        apiRef: "createBookingRQ -> GuestProfile.MDMCustomerID"
      },
      {
        question: "Handling of canonical destinations and transfer logic.",
        answered: "YES",
        evidence: "Uses UN-LOCODE / IATA location masters in /api/v6/masters/locations matched against V4 /api/v4/operatingPoints and /api/v4/locations.",
        apiRef: "v4 /api/v4/operatingPoints & iTravel Location Masters"
      },
      {
        question: "IBS agency management module vs. MDM/Salesforce/Tropics IDs/TAP login/Firebase (Note: iTravel replaces Longitude)",
        answered: "YES",
        evidence: "TTC Open Decision Point: Salesforce MDM (Option A) or iTravel OMS (Option B) acts as the Golden Agency Master. Note: Longitude is fully decommissioned as iTravel Connect replaces it.",
        apiRef: "Salesforce MDM / iTravel Agency Module Sync (Longitude Replaced)"
      },
      {
        question: "Current models (e.g., Tropics airport-based) may not fully support geolocation needs.",
        answered: "YES",
        evidence: "iTravel OMS Rules Engine converts airport-based Tropics codes to exact lat/long geo-coordinates for GIS buffer validation.",
        apiRef: "iTravel Rules Engine GIS Distance Validator"
      },
      {
        question: "Customer profiles in iTravel (incl. credits & FTCs) vs. all other TTC profiles",
        answered: "YES",
        evidence: "Future Travel Credits (FTC) and guest loyalty tiers are validated via Salesforce MDM and passed into createBookingRQ under PaymentDetails.FormOfPayment = 'FTC'.",
        apiRef: "PaymentDetails.FormOfPayment = 'FTC'"
      }
    ]
  },
  {
    category: "Authentication Migration & GDPR Compliance",
    items: [
      {
        question: "Legacy logins vs new unified login approach.",
        answered: "YES",
        evidence: "Okta / Salesforce SSO issues OAuth 2.0 JWTs carrying both modern claims and legacy Tropics/iTravel credentials.",
        apiRef: "OAuth 2.0 /oauth/token Bearer JWT"
      },
      {
        question: "Need for re-registration of agents.",
        answered: "YES",
        evidence: "Okta migration scripts bulk-provision agent profiles from Salesforce MDM, eliminating manual agent re-registration.",
        apiRef: "Okta / Salesforce MDM User Sync"
      },
      {
        question: "Ensure GDPR compliance while having data and profiles scattered across platforms",
        answered: "YES",
        evidence: "PII data anonymization webhooks propagate Right-To-Be-Forgotten (RTBF) requests from Salesforce MDM down to iTravel OMS and Tropics DB.",
        apiRef: "iTravel GDPR Anonymization API (/api/v6/privacy/anonymize)"
      }
    ]
  },
  {
    category: "Rules Engine & Policy Management",
    items: [
      {
        question: "Avoid rule conflicts and overwrites.",
        answered: "YES",
        evidence: "iTravel Rules Engine Microservice enforces priority-based evaluation trees with explicit override precedence (Consortia > Promo Code > Standard Rate).",
        apiRef: "iTravel Rules Engine Microservice"
      },
      {
        question: "Ensure maintainability and transparency (historical issues with coded rules).",
        answered: "YES",
        evidence: "Externalized JSON/DMN decision tables in iTravel OMS replace hardcoded legacy C#/SQL triggers.",
        apiRef: "iTravel DMN Decision Matrix"
      },
      {
        question: "Need to amend reservation platforms to remove logic, booking integrity checks, validations and policies use.",
        answered: "YES",
        evidence: "Centralizes booking integrity checks (deposit rules, age limits, transit windows) in iTravel OMS before dispatching requests to Tropics.",
        apiRef: "iTravel Pre-Commit Validation Engine"
      },
      {
        question: "Margin Management (Amadeus Air Margin Manager is external)",
        answered: "YES",
        evidence: "Net vs Gross billing control via BookingOwner.NetPayApplicable enables margin calculations prior to external air ticketing.",
        apiRef: "BookingOwner.NetPayApplicable"
      },
      {
        question: "Get Floor price flowing from tropics to rules engine.",
        answered: "YES",
        evidence: "V4 Adapter retrieves minimumFloorPrice from Tropics /api/v4/pricing to feed the OMS Rules Engine.",
        apiRef: "v4 /api/v4/pricing -> minimumFloorPrice"
      },
      {
        question: "Different deposit, payment, and cancellation rules in Tropics vs Cruise (Note: iTravel replaces Longitude)",
        answered: "YES",
        evidence: "iTravel OMS calculates the most restrictive deposit/cancellation rule across land tour (Tropics) and river cruise (iTravel) components and presents a single unified terms schedule on the invoice.",
        apiRef: "iTravel Consolidated Terms Engine"
      },
      {
        question: "Promotions and discounts vary by brand; need logic for bundle-level offers.",
        answered: "YES",
        evidence: "fetchApplicablePromotionsRQ/RS evaluates multi-product combinability rules for bundled discounts.",
        apiRef: "fetchApplicablePromotionsRQ/RS"
      }
    ]
  },
  {
    category: "Commission & Product Management",
    items: [
      {
        question: "Multiple commission structures per brand, product, agency, groups and consortia.",
        answered: "YES",
        evidence: "BookingOwner schema evaluates AgencyConsortium (Virtuoso, AAA) and PayToSelf overrides to compute split commissions per line item.",
        apiRef: "BookingOwner.AgencyConsortium & PayToSelf"
      },
      {
        question: "Risk of misalignment when combining products.",
        answered: "YES",
        evidence: "iTravel OMS generates a line-item commission breakdown ledger in the Super PNR before syncing sub-bookings to Tropics.",
        apiRef: "iTravel Super PNR Commission Ledger"
      },
      {
        question: "Canonical model for all suppliers' products.",
        answered: "YES",
        evidence: "Unified LineItem schema (Type = CRUISE | TOUR | RAIL | TRANSFER).",
        apiRef: "iTravel LineItem Generic Schema"
      },
      {
        question: "Cabins vs rooms management",
        answered: "YES",
        evidence: "cruiseCabinAvailabilitySearch maps physical ship cabins (deck grids), while V4 Adapter maps land tour hotel room categories.",
        apiRef: "cruiseCabinAvailabilitySearch & v4 /api/v4/tourOptions"
      },
      {
        question: "Age restrictions (contractually and OP based) and validations",
        answered: "YES",
        evidence: "Rules engine validates passenger BirthDate against product minimum age constraints (e.g. Contiki 18-35 vs Uniworld 8+).",
        apiRef: "Passenger.BirthDate & Rules Engine Validation"
      }
    ]
  },
  {
    category: "Business Cycle & Post-Booking Servicing",
    items: [
      {
        question: "Notifications and alerts (e.g. hotel changes) from Tropics or OMS?",
        answered: "YES",
        evidence: "Webhook event bus (/api/v6/webhooks/itinerary-alerts) dispatches automated SMS/email alerts to guests upon hotel or schedule changes.",
        apiRef: "iTravel Webhooks (/api/v6/webhooks/itinerary-alerts)"
      },
      {
        question: "Post booking transactions, amendments, cancellations",
        answered: "YES",
        evidence: "Full post-booking lifecycle supported via modifyRQ/RS, freezeBookingRQ/RS (pessimistic lock), and cancelBookingRQ/RS.",
        apiRef: "modifyRQ/RS, freezeBookingRQ/RS, cancelBookingRQ/RS"
      },
      {
        question: "Finance processes, payments reconciliation, revenue recognition.",
        answered: "YES",
        evidence: "Super PNR ledger tracks gross cash receipts vs net revenue recognition, syncing sub-ledger entries to Tropics and SAP/Oracle Financials.",
        apiRef: "Super PNR Revenue Ledger Sync"
      }
    ]
  }
];

export const OMS_ARCHITECTURE_TOPOLOGY = {
  title: "iTravel OMS Gateway & Protocol Topology",
  subtitle: "REST/JSON for External Gateway & Optional internal gRPC/HTTP2 for East-West Microservices",
  diagram: `
+-------------------------------------------------------------------+
|                        FRONTEND CLIENT UI                          |
|             (B2B Web Portal / B2C Web Cart / Mobile)              |
+-------------------------------------------------------------------+
                                  |
                                  |  REST / JSON over HTTPS (North-South)
                                  |  OAuth 2.0 Bearer JWT Auth
                                  v
+-------------------------------------------------------------------+
|                   iTRAVEL OMS GATEWAY / ADAPTER                   |
|                  (Single Point of Orchestration)                  |
|                                                                   |
|  * Public REST Gateway for External Clients & UI                  |
|  * Configurable Rules Engine (Transit Buffers & Combined Promos)  |
|  * Super PNR Basket Composition & Single Customer Invoice         |
+-------------------------------------------------------------------+
             /                    |                    \
            /  Internal           |  Internal           \  REST / JSON
           /   gRPC / HTTP2       |  gRPC / HTTP2        \ Adapter
          v                       v                       v
+-------------------+   +-------------------+   +-------------------+
|  iTRAVEL CRUISE   |   |   POWERSHOPPING   |   |    TRAVCORP V4    |
| INVENTORY ENGINE  |   |    CACHE TIER     |   |   ADAPTER LAYER   |
| (Ship Cabins)     |   | (Fast Search DB)  |   | (Tropics / Long.) |
+-------------------+   +-------------------+   +-------------------+
`,
  keyTakeaways: [
    "External Interface (North-South): REST / JSON over HTTPS with OAuth 2.0 JWT Bearer authentication is the standard protocol for all UI portals, B2B agency connections, and external integrations.",
    "Internal Microservices (East-West): gRPC over HTTP/2 with Protocol Buffers (Protobuf) can be leveraged internally between iTravel OMS microservices (e.g. Gateway <-> Powershopping Cache <-> Inventory Master) for sub-second latency.",
    "TravCorp V4 Adapter Interface: Connects via standard REST / JSON over HTTPS to TravCorp V4 endpoints (/api/v4/tourDepartures, /api/v4/operatingPoints).",
    "Protocol Summary: External clients only ever see clean REST/JSON APIs, while internal high-throughput sub-systems use gRPC for maximum speed."
  ]
};

export const ELEVATE_REQUIREMENTS = [
  {
    id: "req_1",
    category: "Unified Booking Basket",
    requirement: "Ability to book multiple products (e.g. tours, cruises, rail) in a single shopping cart while maintaining records in legacy systems (Tropics, Longitude).",
    itravelApi: "createBookingRQ/RS (Super PNR Basket Mode - REST/JSON)",
    v4Api: "v4 /api/v4/tourDepartures & /api/v4/bookings (REST/JSON)",
    howItWorks: "UI calls iTravel OMS createBooking via REST/JSON. iTravel OMS internally calls V4 Adapter to write land tour records to Tropics, while saving cruise line items in iTravel. UI receives one Super PNR."
  },
  {
    id: "req_2",
    category: "Flexible Booking Conditions",
    requirement: "Support variable deposit policies, payment schedules, cancellation rules, and bundled promotional pricing across brands.",
    itravelApi: "fetchApplicablePromotionsRQ/RS & createBookingRQ/RS (IsPreview = true)",
    v4Api: "v4 /api/v4/pricing & promotion rules",
    howItWorks: "UI calls iTravel preview mode via REST. iTravel OMS orchestrates pricing queries across V4 land tours and iTravel cruises, returning a single unified deposit schedule and bundled promo discounts."
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
    itravelApi: "OAuth 2.0 /token Endpoint with JWT Claims (REST/JSON)",
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
    tagline: "UI calls iTravel OMS (REST/JSON) -> OMS queries Cruise + V4 Land Tour internally",
    description: "Customer searches for a combined European holiday (7-Day Swiss Land Tour + 7-Day Rhine River Cruise). UI makes ONE REST call to iTravel OMS Gateway.",
    businessValue: "Drives higher yield per booking by cross-selling land tours and river cruises in a single search flow.",
    uiCall: "POST /api/v6/omni/search (REST/JSON over HTTPS)",
    v4Call: "iTravel OMS calls V4 -> /api/v4/tourDepartures (REST/JSON)",
    itravelCall: "iTravel OMS calls Cruise Engine / Powershopping Cache (gRPC / HTTP2)",
    rulesEngineCall: "Evaluates canonical hub geolocation to verify tour end-point connects to cruise pier."
  },
  {
    step: 2,
    stageName: "2. Synchronized Room & Cabin Selection",
    tagline: "UI selects Room + Cabin -> iTravel OMS queries V4 options + Ship deck grid",
    description: "Advisor selects hotel room extension via Tropics V4 and specific river cruise suite on Deck 3 via iTravel.",
    businessValue: "Provides a seamless upsell experience across both land accommodations and ship categories.",
    uiCall: "POST /api/v6/omni/options (REST/JSON over HTTPS)",
    v4Call: "iTravel OMS calls V4 -> /api/v4/tourOptions & /api/v4/locations",
    itravelCall: "iTravel OMS calls /api/v6/cruiseCabinAvailabilitySearch (gRPC / REST)",
    rulesEngineCall: "Validates bed configuration consistency across hotel and ship suite."
  },
  {
    step: 3,
    stageName: "3. Rules Engine & Transit Buffer Validation",
    tagline: "Validate Check-In/Check-Out Logic & Minimum Connection Times",
    description: "Configurable rules engine calculates buffer time between land tour hotel check-out and ship embarkation check-in.",
    businessValue: "Eliminates operational mis-connections and customer dissatisfaction caused by impossible transfer timelines.",
    uiCall: "Handled internally inside iTravel OMS Rules Engine Microservice (gRPC)",
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
    uiCall: "POST /api/v6/fetchApplicablePromotions (REST/JSON over HTTPS)",
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
    uiCall: "POST /api/v6/cruiseCabinHold (REST/JSON over HTTPS)",
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
    uiCall: "POST /api/v6/createBooking (REST/JSON over HTTPS)",
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
    uiCall: "POST /api/v6/freezeBooking & /api/v6/modify (REST/JSON over HTTPS)",
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
