export const ARCHITECTURE_RISKS_QA = [
  {
    category: "Architecture Validations & Decisions",
    items: [
      {
        question: "Ensure that the final solution caters for all brands hosted in Tropics (i.e. AA, BV, CH, CS, GE, IV, LG, TT)",
        answered: "YES",
        evidence: "The TravCorp V4 Adapter layer communicates with Tropics brand IDs via /brands/{brand}/tours/{tourId}/options/{optionId}/departures endpoints. The iTravel OMS BookingOwner and LineItem schemas support all 8 Tropics brands dynamically via brand routing rules.",
        apiRef: "V4 /brands/{brand}/tours & iTravel LineItem.BrandCode"
      },
      {
        question: "Third party APIs integration strategy",
        answered: "YES",
        evidence: "iTravel OMS Gateway acts as a BFF (Backend-For-Frontend), exposing REST/JSON under /v7/rest/bookings for external partners while orchestrating internal third-party calls (Amadeus, Cybersource, V4 Adapter, Uniworld Cruise Engine).",
        apiRef: "iTravel OMS /v7/rest/bookings API Gateway"
      },
      {
        question: "Dynamica integration (into OMS or not?)",
        answered: "YES",
        evidence: "Dynamica (CRM / Tour Operations) integrates via async outbound webhook events emitted by iTravel OMS on createBookingRQ/RS and modifyRQ/RS lifecycle events rather than direct UI polling.",
        apiRef: "iTravel Async Outbound Event Bus"
      },
      {
        question: "Master vs. system of record booking management (incl. retrieval of master booking if not all channels are on iTravel front end)",
        answered: "YES",
        evidence: "iTravel OMS acts as the Master Super PNR Store for multi-modal orders, while generating sub-booking PNRs in Tropics (v4BookingRef) for legacy channel retrieval via V4 /bookings/{bookingReference}.",
        apiRef: "iTravel Super PNR & V4 /bookings/{bookingReference}"
      },
      {
        question: "Payment system direct integration in iTravel vs. existing Cybersource/Elavon integration and acquirer links.",
        answered: "YES",
        evidence: "iTravel Connect supports direct tokenized payment Gateway integration (paymentToken parameter in createBookingRQ), decoupling card processing from legacy acquirers while mapping payment status to Tropics.",
        apiRef: "createBookingRQ -> PaymentDetails.PaymentToken"
      },
      {
        question: "Multi-Currency Pricing & Settlement (USD, GBP, EUR, AUD, CAD)",
        answered: "YES",
        evidence: "iTravel OMS Financial Engine executes real-time FX conversion between Tropics tour departure currency and Uniworld cruise currency, presenting a unified single-currency cart to the guest.",
        apiRef: "iTravel OMS FX Currency Conversion Engine"
      }
    ]
  },
  {
    category: "Travel Agent Identification",
    items: [
      {
        question: "Disparate IDs across systems; requires mapping or centralised solution.",
        answered: "YES",
        evidence: "Resolved via Master translation layer (Salesforce MDM / iTravel Agency Module). Maps legacy Tropics Agent ID (AG-101) to canonical BookingOwner.RequestorID and x-pcc header in iTravel Connect.",
        apiRef: "V4 /internal/sellingCompany/{sellingCompanyCode}/marketVariation/{marketVariation}/departure/{departureCode}/commissions & BookingOwner.RequestorID"
      },
      {
        question: "Consultant-level booking tracking adds complexity.",
        answered: "YES",
        evidence: "BookingOwner schema explicitly encapsulates RequestorType, RequestorID (Agency), RequestingUserID (Consultant), OrgUnitCode (Branch), AgencyConsortium, PayToSelf, PayOutAgencyCode, NetPayApplicable, channel, and BusinessType in every request.",
        apiRef: "BookingOwner Complete Schema (RequestorType, RequestingUserID, PayOutAgencyCode, etc.)"
      },
      {
        question: "AAA / TST consultant level API keys",
        answered: "YES",
        evidence: "OAuth 2.0 POST /token grant on the dedicated Auth host carries consultant-level claims inside the signed JWT bearer token, passing AgencyConsortium = 'AAA' or 'TST' in header context.",
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
        evidence: "Uses UN-LOCODE / IATA location masters in iTravel Location Master matched against V4 SSP transfer sub-resources.",
        apiRef: "V4 SSP Transfers & iTravel Location Masters"
      },
      {
        question: "IBS agency management module vs. MDM/Salesforce/Tropics IDs/TAP login/Firebase",
        answered: "YES",
        evidence: "TTC Open Decision Point: Salesforce MDM (Option A) or iTravel OMS (Option B) acts as the Golden Agency Master. Note: Longitude is currently active in Uniworld operations and is contracted to be replaced by iTravel Connect by End of 2027.",
        apiRef: "Salesforce MDM / iTravel Agency Module Sync (Target Replacement End 2027)"
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
    category: "Rules Engine & Policy Management",
    items: [
      {
        question: "Priority evaluation when multiple rules apply.",
        answered: "YES",
        evidence: "Rules engine evaluates discounts in strict hierarchy: Consortia (Virtuoso/AAA) > Promo Code > Standard Rate, enforcing floor price controls from V4.",
        apiRef: "iTravel Rules Engine Priority Matrix"
      },
      {
        question: "Need single business logic rule repository across brands.",
        answered: "YES",
        evidence: "iTravel Rules Engine serves as the centralized policy authority for transit buffers, age restrictions, payment schedules, and cancellation penalty tiers.",
        apiRef: "iTravel Rules Engine Central Policy Store"
      }
    ]
  },
  {
    category: "Commission Complexity & Settlement",
    items: [
      {
        question: "Splitting commission across combined products and multi-agency payouts.",
        answered: "YES",
        evidence: "Supported via BookingOwner object and per-line-item commission calculation rules in iTravel OMS, producing a blended commission ledger.",
        apiRef: "BookingOwner.PayOutAgencyCode & Commission Ledger"
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
        evidence: "Category availability search maps ship categories, while V4 Adapter maps land tour hotel room categories via /brands/{brand}/tours/{tourId}/options/{optionId}.",
        apiRef: "Category Availability & V4 Tour Options"
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
        evidence: "Async event bus dispatches automated SMS/email alerts to guests upon hotel or schedule changes.",
        apiRef: "iTravel Outbound Notifications"
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
  subtitle: "REST Resource Surface & IBS RPC Services",
  keyTakeaways: [
    "External Interface (North-South): REST / JSON over HTTPS with OAuth 2.0 JWT Bearer authentication (issued via POST /token on dedicated Auth host) is the standard protocol for all UI portals, B2B agency connections, and external integrations.",
    "iTravel Connect Surface: Canonical REST booking resource is POST /v7/rest/bookings, while power-shopping endpoints reside under /v7/rest/public-power-shopping/cruises/fetch.",
    "TravCorp V4 Adapter Interface: Connects via standard REST / JSON over HTTPS to TravCorp V4 endpoints (/brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/availability, /booking, /bookings/{bookingReference}).",
    "Protocol Summary: All client and internal integration flows run over clean REST/JSON APIs on HTTPS."
  ]
};

export const ELEVATE_REQUIREMENTS = [
  {
    id: "req_1",
    category: "Unified Booking Basket",
    requirement: "Ability to book multiple products (e.g. tours, cruises, rail) in a single shopping cart while maintaining records in legacy systems (Tropics, Longitude).",
    itravelApi: "POST /v7/rest/bookings (Connect REST) & createBookingRQ/RS (IBS RPC)",
    v4Api: "V4 /brands/{brand}/.../departures/{id}/book & /booking (REST/JSON)",
    howItWorks: "UI calls iTravel OMS createBooking via REST/JSON (POST /v7/rest/bookings). iTravel OMS internally calls V4 Adapter to write land tour records to Tropics, while saving cruise line items in iTravel. UI receives one Super PNR."
  },
  {
    id: "req_2",
    category: "Flexible Booking Conditions",
    requirement: "Support variable deposit policies, payment schedules, cancellation rules, and bundled promotional pricing across brands.",
    itravelApi: "fetchApplicablePromotionsRQ/RS & POST /v7/rest/bookings (IsPreview = true)",
    v4Api: "V4 /brands/{brand}/.../departures/{id}/quote & promotion rules",
    howItWorks: "UI calls iTravel preview mode via REST. iTravel OMS orchestrates pricing queries across V4 land tours and iTravel cruises, returning a single unified deposit schedule and bundled promo discounts."
  },
  {
    id: "req_3",
    category: "Single Customer Invoice",
    requirement: "Consolidate invoices for all products into one unified document for the guest.",
    itravelApi: "iTravel Invoice & Itinerary Generation API / Super PNR",
    v4Api: "V4 /bookings/{bookingReference} (Tropics Sub-Booking Sync)",
    howItWorks: "iTravel OMS aggregates line items from Tropics (tour) and iTravel (cruise) onto a single, brand-aligned customer invoice with consolidated payment terms."
  },
  {
    id: "req_4",
    category: "Travel Agent Integration",
    requirement: "Correctly identify agents across systems (different IDs in Tropics vs iTravel), handle consortia relationships, and compute accurate bundled commissions.",
    itravelApi: "BookingOwner Object (NetPayApplicable, PayToSelf, AgencyConsortium)",
    v4Api: "V4 /internal/sellingCompany/{sellingCompanyCode}/marketVariation/{marketVariation}/departure/{departureCode}/commissions & Salesforce MDM",
    howItWorks: "Salesforce/MDM resolves agent IDs between Tropics and iTravel, mapping them to the iTravel BookingOwner context to trigger consortia benefits and calculate blended commission."
  },
  {
    id: "req_5",
    category: "Central Rules Engine",
    requirement: "Enforce business logic for minimum transit/connection buffers, age limits, and floor prices across brands.",
    itravelApi: "iTravel Configurable Rules Engine (Ancillary & Transit Modules)",
    v4Api: "V4 Operating Points & Min Floor Price Controls",
    howItWorks: "Rules engine validates arrival/departure location coordinates and times, preventing bookings if the transfer buffer between a land tour and cruise is less than 3 hours."
  },
  {
    id: "req_6",
    category: "Canonical Data Model",
    requirement: "Standardize product representations, guest profiles, locations, and pricing across all TTC systems.",
    itravelApi: "iTravel Canonical Schema (GuestProfile, LineItem, OperatingPoint)",
    v4Api: "V4 /api/v4/operatingPoints & /api/v4/locations",
    howItWorks: "Maps legacy Tropics structures to standardized JSON schema with UN-LOCODE / IATA location codes, enabling cross-brand compatibility."
  },
  {
    id: "req_7",
    category: "Auth & SSO Integration",
    requirement: "Support seamless login for travel advisors and internal staff using Okta / Salesforce SSO.",
    itravelApi: "OAuth 2.0 Auth Host (POST /token) & Bearer JWT Validation",
    v4Api: "V4 Partner API Keys & Market Variation Context",
    howItWorks: "Advisors authenticate via SSO to obtain a 30-minute OAuth 2.0 JWT token, which carries agency PCC, advisor ID, and consortia claims in every API call."
  },
  {
    id: "req_8",
    category: "Scalability & Extensibility",
    requirement: "Ensure platform can expand to incorporate additional TTC brands, rail products, or third-party inventory.",
    itravelApi: "iTravel Generic LineItem Schema (Type = CRUISE | TOUR | RAIL | TRANSFER)",
    v4Api: "V4 Tour Options & Ancillary Extensions",
    howItWorks: "The Super PNR basket is built on an extensible JSON array of line items, allowing rail or transfer components to be attached seamlessly."
  },
  {
    id: "req_9",
    category: "Salesforce / MDM Integration",
    requirement: "Leverage Salesforce / MDM for travel agent ID mapping and potential use of order management sync.",
    itravelApi: "Salesforce Account Sync & Outbound Order Webhooks",
    v4Api: "V4 Agent Sync via Salesforce MDM",
    howItWorks: "Syncs agency profile updates, credit limits, and agent status bi-directionally between Salesforce CRM and iTravel OMS."
  },
  {
    id: "req_10",
    category: "Timeline Awareness (4Q2026 Rollout & End-2027 Target)",
    requirement: "Initial Omni rollout expected by 4Q2026; iTravel Connect contracted to replace Longitude by End of 2027.",
    itravelApi: "iTravel Connect API Surface",
    v4Api: "V4 Distribution API Surface",
    howItWorks: "Phased deployment delivering single-product cruise/tour carts by 4Q2026 followed by multi-modal bundled carts and full Longitude replacement by End of 2027."
  }
];

export const MULTI_MODAL_JOURNEYS = [
  {
    step: 1,
    stageName: "1. Multi-Modal Search & Hub Connectivity",
    tagline: "UI calls iTravel OMS -> OMS queries Cruise + V4 Land Tour internally",
    description: "A travel advisor or guest searches on the B2B/B2C website for a multi-product European vacation (e.g., a 7-day Trafalgar Swiss Alps Land Tour combined with a 7-day Uniworld Rhine River Cruise). To prevent frontend complexity, the UI executes ONE single REST request to the iTravel OMS Gateway.",
    businessValue: "Drives substantial revenue growth by cross-selling land tours and luxury river cruises in a single search session, eliminating the need for advisors to search two separate reservation systems.",
    uiCall: "POST /v7/rest/public-power-shopping/cruises/fetch (REST/JSON over HTTPS) | PDF Sec 4.2 Pg 11 (cruiseAggrAvailabilitySearch)",
    uiCallBusinessDetails: "How it works: The UI sends destination codes (e.g. 'RHINE_SWISS'), departure date ranges, and passenger counts. The iTravel OMS Gateway acts as a Backend-For-Frontend (BFF), taking this single search request and parallelizing internal queries out to inventory engines.",
    v4Call: "iTravel OMS calls V4 -> /brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/availability",
    v4CallBusinessDetails: "How it works: iTravel OMS queries the TravCorp V4 Distribution API to fetch real-time land tour availability, hotel allotment dates, and operating points directly from the Tropics tour reservation engine.",
    itravelCall: "iTravel OMS queries Connect public-power-shopping tier (PDF Sec 4.2 Pg 11)",
    itravelCallBusinessDetails: "How it works: iTravel OMS queries its high-speed PowerShopping cache tier to fetch matching Uniworld river cruise sailings, cabin category starting fares, and vessel embarkation ports.",
    rulesEngineCall: "Evaluates canonical hub geolocation (UN-LOCODE / IATA) to verify the land tour drop-off point connects geographically to the river cruise pier.",
    rulesEngineBusinessDetails: "Why it's here & How it works: The Rules Engine executes an automated GIS proximity check between the land tour ending operating point (e.g. Zurich Hotel drop-off) and the ship embarkation pier (e.g. Basel Rhine Pier). If the distance or travel time is infeasible, the combination is automatically filtered out before presenting options to the user."
  },
  {
    step: 2,
    stageName: "2. Synchronized Room Type & Cabin Category Selection",
    tagline: "UI selects Tour Room Type + Cruise Stateroom -> iTravel OMS queries V4 room options + Ship categories",
    description: "The advisor selects specific accommodation parameters for both segments: Tour Room Type & Occupancy (Single / Double / Twin / Triple room plus optional pre/post hotel nights) for the Trafalgar land tour segment in Tropics (V4), and Stateroom Category (e.g. Category 1 French Balcony Suite, Cabin 204) for the Uniworld river vessel in iTravel Connect.",
    businessValue: "Delivers a seamless upsell experience across both land tour room occupancy types and ship stateroom deck categories in real time.",
    uiCall: "POST /v7/rest/public-power-shopping/cruises/fetch | PDF Sec 4.3 Pg 23 (cruiseCategoryAvailabilitySearch) & PDF Sec 4.6 Pg 56 (cruiseCabinAvailabilitySearch)",
    uiCallBusinessDetails: "How it works: The UI submits passenger counts (e.g., 2 Adults) and requests available Tour Room Types (Twin/Double) from Tropics alongside live Cruise Stateroom Deck Grids and Cabin Numbers from Uniworld.",
    v4Call: "iTravel OMS calls V4 -> /brands/{brand}/tours/{tourId}/options/{optionId}",
    v4CallBusinessDetails: "How it works: iTravel OMS queries Tropics V4 to fetch tour room type availability (Single, Twin, Double, Triple), single supplement surcharges, pre/post hotel night room extensions, and optional tour experience packages.",
    itravelCall: "iTravel OMS queries category availability (PDF Sec 4.3 Pg 23) and cabin deck grid (PDF Sec 4.6 Pg 56)",
    itravelCallBusinessDetails: "How it works: iTravel OMS queries the Uniworld Cruise Engine to pull live stateroom deck grids, category availability (e.g. French Balcony), physical cabin availability (e.g. Cabin 204 on Deck 2), and bed setup options (Twin vs Queen).",
    rulesEngineCall: "Validates bed configuration consistency and passenger occupancy limits across hotel room types and ship staterooms.",
    rulesEngineBusinessDetails: "Why it's here & How it works: Evaluates passenger counts against max occupancy rules for both the Tropics tour room type (e.g. Single vs Double) and the Uniworld stateroom. Prevents mis-matched configurations (e.g. selecting a Single room for the land tour but a Double-occupancy cabin for the cruise)."
  },
  {
    step: 3,
    stageName: "3. Rules Engine & Transit Buffer Validation",
    tagline: "Validate Check-In/Check-Out Logic & Minimum Connection Times",
    description: "Before allowing the advisor to proceed to checkout, the centralized iTravel Rules Engine evaluates the physical timeline connection between the land tour drop-off and the ship embarkation time.",
    businessValue: "Eliminates high-cost operational mis-connections, emergency transfer dispatch fees, and guest dissatisfaction caused by impossible transit schedules.",
    uiCall: "Handled internally inside iTravel OMS Rules Engine Microservice | PDF Sec 4.9 Pg 84 (fetchApplicableAncillaryRule)",
    uiCallBusinessDetails: "How it works: The UI submits the selected tour departure and cruise sailing. The OMS Gateway triggers the internal Rules Engine without requiring the frontend to calculate complex time zone or transfer mathematics.",
    v4Call: "V4 -> SSP Transfers (Hotel drop-off operating point & drop-off timestamp)",
    v4CallBusinessDetails: "How it works: Fetches exact tour end-point schedule from Tropics, including expected motorcoach arrival time at the final transfer drop-off location.",
    itravelCall: "iTravel Embarkation Schedule API (Pier boarding cutoff time & vessel departure)",
    itravelCallBusinessDetails: "How it works: Retrieves Uniworld vessel boarding windows (e.g., Boarding Opens: 14:00, All-Aboard Cutoff: 17:00) for the Basel pier.",
    rulesEngineCall: "Enforces 3-hour minimum transit buffer window between land tour drop-off and pier boarding cutoff.",
    rulesEngineBusinessDetails: "Why it's here & How it works: The Rules Engine subtracts the Tropics land tour drop-off timestamp from the Uniworld pier cutoff timestamp. If the gap is less than the mandatory 3-hour buffer (e.g., only 1.5 hours due to traffic/distance), the system flags a 'TRANSIT_BUFFER_VIOLATION' error and prompts the user to add a pre-cruise hotel night or private transfer."
  },
  {
    step: 4,
    stageName: "4. Bundled Promotions & Consortia Overrides",
    tagline: "Combine Multi-Product Discounts & Virtuoso Benefits",
    description: "The advisor applies promotional codes (e.g., 'SAVE1000' for booking Tour + Cruise together) and inputs the agency's Virtuoso consortia membership.",
    businessValue: "Incentivizes multi-product package sales while enforcing strict floor-price controls to protect gross margin.",
    uiCall: "POST /v7/rest/cruises/promotions/{cruise-code} | PDF Sec 4.4 Pg 34 (fetchApplicablePromotions) & PDF Sec 4.5 Pg 41 (applyPromotion)",
    uiCallBusinessDetails: "How it works: UI submits promo code 'SAVE1000' and agency consortia code 'VIRTUOSO'. iTravel OMS evaluates applicable discounts across both land and cruise line items.",
    v4Call: "iTravel OMS calls V4 -> /brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/quote",
    v4CallBusinessDetails: "How it works: iTravel OMS calls V4 quote endpoint to calculate discounted land tour fare, verify minimum floor price constraints in Tropics, and check land tour promo eligibility.",
    itravelCall: "Evaluates multi-product bundle promo codes (PDF Sec 4.4 Pg 34 & Sec 4.5 Pg 41)",
    itravelCallBusinessDetails: "How it works: iTravel OMS queries promotion rules engine to apply cruise percentage discounts and attach complimentary Virtuoso shipboard credit ($250 per suite).",
    rulesEngineCall: "Checks combinability matrix for Virtuoso / AAA agency consortia codes against early-bird promo discounts.",
    rulesEngineBusinessDetails: "Why it's here & How it works: Rules Engine executes a combinability matrix check. If 'SAVE1000' and 'VIRTUOSO_VIP' are marked mutually exclusive, the engine applies the higher-value benefit and alerts the advisor, ensuring total discounts never breach minimum floor margins."
  },
  {
    step: 5,
    stageName: "5. Agent SSO & Inventory Holds",
    tagline: "Resolve Tropics Agent IDs & Place Synchronized Holds",
    description: "The advisor authenticates via Okta/Salesforce SSO. The system resolves their disparate IDs across Tropics and iTravel, then places a temporary 15-minute hold on both the ship cabin and land tour hotel allotment.",
    businessValue: "Protects inventory across land and river for 15 minutes while advisor collects guest passport details and credit card authorization.",
    uiCall: "POST /v7/rest/public-be-cruise/cruises/{cruiseCode}/cabins/hold | PDF Sec 4.8 Pg 77 (cruiseCabinHold)",
    uiCallBusinessDetails: "How it works: UI passes cabin selection and guest details. iTravel OMS locks stateroom 204 for 15 minutes and returns a hold expiration timer.",
    v4Call: "iTravel OMS calls V4 -> /internal/sellingCompany/{sellingCompanyCode}/marketVariation/{marketVariation}/departure/{departureCode}/commissions & Tropics Hold",
    v4CallBusinessDetails: "How it works: iTravel OMS places a temporary seat/room hold in Tropics via V4 Adapter and looks up agency commission tiers based on selling company code.",
    itravelCall: "Connect public-be-cruise hold endpoint (PDF Sec 4.8 Pg 77 - Holds Cabin for 15 minutes)",
    itravelCallBusinessDetails: "How it works: iTravel Cruise Engine flags cabin 204 as 'HELD_PENDING_BOOKING' in the vessel inventory database, preventing double-booking by other channels.",
    rulesEngineCall: "Maps Agent ID AG-101 (Tropics) <-> Advisor User ID in Salesforce MDM <-> iTravel PCC context.",
    rulesEngineBusinessDetails: "Why it's here & How it works: Resolves agency identity across systems. Translates Tropics Agent ID 'AG-101' into canonical `BookingOwner` object (`RequestorType=AGENCY`, `RequestorID=AG-101`, `RequestingUserID=USER-45`, `OrgUnitCode=LON_BRANCH`, `AgencyConsortium=VIRTUOSO`, `NetPayApplicable=true`), establishing correct commission entitlement."
  },
  {
    step: 6,
    stageName: "6. Unified Basket & Single Customer Invoice",
    tagline: "Dry-Run Preview & Commit to Super PNR Basket",
    description: "The advisor commits the booking. iTravel OMS executes a dry-run validation, creates a master Super PNR shopping cart, generates a single unified customer invoice, and writes sub-records to Tropics and iTravel.",
    businessValue: "Delivers a single consolidated guest invoice and master PNR reference for the entire trip, eliminating guest confusion from receiving separate bills from Trafalgar and Uniworld.",
    uiCall: "POST /v7/rest/bookings | PDF Sec 4.11 Pg 108 (createBooking)",
    uiCallBusinessDetails: "How it works: UI submits the full multi-product payload (`IsPreview=false`, guest profiles, tokenized payment token). OMS Gateway creates the order and returns master Super PNR reference 'SUPER-88492'.",
    v4Call: "iTravel OMS calls V4 -> /booking & /bookings/{bookingReference} (Creates sub-record in Tropics)",
    v4CallBusinessDetails: "How it works: iTravel OMS invokes V4 /booking to commit the land tour sub-booking in Tropics, receiving a real numeric Tropics sub-booking reference (e.g. Tropics Booking Ref `1048291`).",
    itravelCall: "iTravel OMS creates master Super PNR basket & single customer invoice (PDF Sec 4.11 Pg 108)",
    itravelCallBusinessDetails: "How it works: iTravel OMS writes the master Super PNR record containing both line items (Tour + Cruise), generates the single guest invoice PDF, and stores payment authorization.",
    rulesEngineCall: "Calculates consolidated deposit due dates, payment schedule milestones, and Net vs Gross agency billing terms.",
    rulesEngineBusinessDetails: "Why it's here & How it works: Blends deposit policies. Land tour requires $200 deposit; river cruise requires $500 deposit. Rules Engine consolidates these into a single $700 deposit line on the guest invoice due within 7 days, with final balance due 90 days prior to departure."
  },
  {
    step: 7,
    stageName: "7. Bundled Servicing & Commission Settlement",
    tagline: "Collision-Free Modifications & Centralized Blended Commission Payout",
    description: "Handles post-booking modifications using pessimistic session locking (freezePnrs) and calculates centralized blended travel advisor commission payouts across bundled products.",
    businessValue: "Prevents concurrent editing race conditions during call-center servicing and ensures a single consolidated agency commission check/remittance out of iTravel OMS rather than dual separate payments.",
    uiCall: "POST /iTravel/selling/api/public-booking/v1/rest/bkg/pnr/freezePnrs & cancel | PDF Sec 5.3 Pg 147 (freezePnrs), PDF Sec 5.9 Pg 158 (modify - No URL published) & PDF Sec 6.2 Pg 196 (cancel)",
    uiCallBusinessDetails: "How it works: When a call-center agent opens the Super PNR to add an optional tour or change guest passport details, UI calls `freezePnrs` to obtain an exclusive pessimistic edit lock (`LockToken`).",
    v4Call: "iTravel OMS syncs land tour pricing to Tropics sub-ledger (/internal/sellingCompany/{sellingCompanyCode}/.../departure/{departureCode}/commissions)",
    v4CallBusinessDetails: "How it works: iTravel OMS syncs final land tour pricing to Tropics for internal brand revenue recognition journal entries. All travel agency commission disbursements are centralized and paid out of iTravel OMS (not Tropics).",
    itravelCall: "Pessimistic session lock & post-booking amendments (PDF Sec 5.3 Pg 147, Sec 5.9 Pg 158 & Sec 6.2 Pg 196)",
    itravelCallBusinessDetails: "How it works: iTravel OMS manages the master Super PNR modification lifecycle (`modifyRQ/RS`), recalculating total package price and issuing updated customer invoices.",
    rulesEngineCall: "Calculates blended commission (e.g. 15% on cruise + 12% on land tour) based on BookingOwner context and NetPayApplicable flag.",
    rulesEngineBusinessDetails: "Why it's here & How it works: Evaluates `BookingOwner.NetPayApplicable`. If `true` (Net Billing), guest is charged Total Price minus Commission, and agency retains commission at source. If `false` (Gross Billing), guest pays 100% and iTravel OMS Central Financial Ledger dispatches a single consolidated $1,110 blended commission payout ($750 cruise + $360 tour) to the agency."
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
      "UI calls ONLY iTravel OMS REST/RPC endpoints (e.g. POST /v7/rest/bookings)",
      "iTravel OMS Gateway encapsulates V4 Adapter calls internally"
    ]
  },
  {
    id: "persona_trade",
    title: "Travel Agency & Commercial Leads",
    focus: "Salesforce MDM ID Mapping, Consortia & Net Billing",
    keyQuestions: [
      "How does the system map an agent who has different IDs in Tropics vs Salesforce?",
      "How are commissions calculated for bundled tour + cruise bookings?"
    ],
    recommendedAPIs: [
      "V4 Commissions & Salesforce/MDM ID Translation Service",
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
      "V4 SSP Transfers & Configurable Rules Engine transfer validator",
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
