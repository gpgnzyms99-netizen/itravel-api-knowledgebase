export const BUSINESS_JOURNEYS = [
  {
    step: 1,
    stageName: "1. Search & Discovery",
    tagline: "Find Sailings & Real-Time Rates",
    description: "Enables customers and travel advisors to search for available cruises across regions, sailings, and dates with sub-second response times.",
    businessValue: "Drives conversion by delivering instant search results across all global cruise routes without database lag.",
    apisUsed: [
      {
        title: "cruiseAggrAvailabilitySearchRQ/RS",
        role: "Aggregate Sailing Search",
        whatItDoes: "Searches thousands of voyage combinations based on travel dates, vessel code, passenger counts, and geographic regions (e.g. Rhine, Danube, Mediterranean)."
      },
      {
        title: "OAuth /token (iTravel Connect)",
        role: "Secure Authentication",
        whatItDoes: "Authenticates travel agency channels and partners using secure OAuth 2.0 bearer tokens."
      }
    ]
  },
  {
    step: 2,
    stageName: "2. Cabin Category & Fare Choice",
    tagline: "Select Room Types & Fare Conditions",
    description: "Displays available room categories (Grand Suites, French Balcony, Oceanview), deck allocations, and base fare pricing.",
    businessValue: "Maximizes yield and average order value (AOV) by encouraging category upsells to premium suites.",
    apisUsed: [
      {
        title: "cruiseCategoryAvailabilitySearchRQ/RS",
        role: "Category & Fare Breakdown",
        whatItDoes: "Fetches category-level availability, taxes/fees, refundable vs non-refundable fare types, and room upgrades."
      }
    ]
  },
  {
    step: 3,
    stageName: "3. Promotions & Consortia Benefits",
    tagline: "Apply Discounts & Trade Overrides",
    description: "Evaluates eligible promotional codes, early bird discounts, loyalty perks, and trade network overrides (Virtuoso, AAA, Signature).",
    businessValue: "Protects margins by ensuring combinability rules are strictly enforced while delivering targeted partner incentives.",
    apisUsed: [
      {
        title: "fetchApplicablePromotionsRQ/RS",
        role: "Promotions Engine",
        whatItDoes: "Evaluates combinable discounts, past-guest loyalty savings, and exclusive consortia amenities."
      }
    ]
  },
  {
    step: 4,
    stageName: "4. Physical Cabin & Inventory Lock",
    tagline: "Select Exact Cabin & Hold Inventory",
    description: "Allows guests or advisors to pick a specific physical cabin number on a deck and place a temporary 15-minute hold.",
    businessValue: "Prevents double-booking and inventory leakage while the guest completes passenger information and payment.",
    apisUsed: [
      {
        title: "cruiseCabinAvailabilitySearchRQ/RS",
        role: "Physical Cabin Search",
        whatItDoes: "Retrieves specific cabin numbers, deck locations, bed configurations (King/Twin), and accessibility features."
      },
      {
        title: "cruiseCabinHoldRQ/RS",
        role: "Temporary Cabin Hold",
        whatItDoes: "Locks a physical cabin for up to 15 minutes. Automatically releases inventory if the booking is not completed."
      }
    ]
  },
  {
    step: 5,
    stageName: "5. Multi-Product Order & Booking Confirmation",
    tagline: "Dry-Run Validation & Super PNR Creation",
    description: "Validates the complete order basket (Cruise + Hotel + Air + Tours), calculates deposit schedules, and commits the booking.",
    businessValue: "Unifies multi-product travel packages under a single Super PNR reference, supporting Net vs Gross agency billing.",
    apisUsed: [
      {
        title: "createBookingRQ/RS (Preview Mode)",
        role: "Dry-Run Basket Validation",
        whatItDoes: "Calculates total pricing, taxes, deposit due dates, and cancellation penalties without committing to the database."
      },
      {
        title: "createBookingRQ/RS (Commit Mode)",
        role: "Order Confirmation",
        whatItDoes: "Commits the booking, generates the Super PNR & Reservation ID, allocates inventory, and records trade commission."
      }
    ]
  },
  {
    step: 6,
    stageName: "6. Servicing & Modifications",
    tagline: "Manage Edits, Upgrades & Session Locks",
    description: "Handles post-booking modifications like guest name changes, cabin upgrades, date shifts, and ancillary additions.",
    businessValue: "Prevents data corruption or duplicate edits when call center agents and web self-service users access the same booking.",
    apisUsed: [
      {
        title: "freezeBookingRQ/RS",
        role: "Servicing Session Lock",
        whatItDoes: "Applies a pessimistic lock on the reservation while an advisor is actively modifying the booking."
      },
      {
        title: "modifyRQ/RS",
        role: "Booking Amendment",
        whatItDoes: "Executes price-neutral or price-affecting amendments, recalculating total pricing and deposit adjustments."
      }
    ]
  },
  {
    step: 7,
    stageName: "7. Cancellation & Financial Settlement",
    tagline: "Cancel Bookings, Penalties & Refunds",
    description: "Processes full or partial cancellations, computes contractual cancellation penalties, and issues credit vouchers.",
    businessValue: "Automates financial settlement, recalls agency commission, and posts GL credit notes accurately.",
    apisUsed: [
      {
        title: "cancelBookingRQ/RS",
        role: "Cancellation & Penalties",
        whatItDoes: "Cancels reservations, evaluates penalty schedules based on departure proximity, and releases inventory back to open stock."
      }
    ]
  }
];

export const BUSINESS_PERSONAS = [
  {
    id: "persona_pm",
    title: "Product Managers & Business Analysts",
    focus: "Mapping Business Requirements to API Capabilities",
    keyQuestions: [
      "Which API do we call to show cruise search results on our website?",
      "How do we preview total package price and deposit due dates before charging the customer?"
    ],
    recommendedAPIs: [
      "cruiseAggrAvailabilitySearchRQ/RS — High-speed search",
      "createBookingRQ/RS (IsPreview = true) — Pricing & deposit preview"
    ]
  },
  {
    id: "persona_trade",
    title: "Travel Agency & Commercial Leads",
    focus: "Agency Commission, Consortia & Net Billing",
    keyQuestions: [
      "How does the system know if an agency pays Net or Gross?",
      "How do we apply Virtuoso or AAA consortia amenities?"
    ],
    recommendedAPIs: [
      "BookingOwner payload in createBookingRQ — NetPayApplicable & PayToSelf settings",
      "fetchApplicablePromotionsRQ/RS — Consortia offer evaluation"
    ]
  },
  {
    id: "persona_ops",
    title: "Operations & Contact Center Leads",
    focus: "Preventing Editing Collisions & Temporary Holds",
    keyQuestions: [
      "What stops a web agent and a call center agent from overwriting each other's edits?",
      "How long can a cabin be held while an advisor takes guest passport details?"
    ],
    recommendedAPIs: [
      "freezeBookingRQ/RS — Session locking (LockToken)",
      "cruiseCabinHoldRQ/RS — 15-minute temporary inventory hold"
    ]
  },
  {
    id: "persona_finance",
    title: "Finance & Revenue Management",
    focus: "Deposit Schedules, Penalties & Settlement",
    keyQuestions: [
      "When is the deposit due and how are cancellation penalties computed?",
      "How does commission recall work if a travel advisor cancels a booking?"
    ],
    recommendedAPIs: [
      "createBookingRQ/RS — DepositDueDate and DepositAmount output",
      "cancelBookingRQ/RS — Penalty evaluation & commission recall"
    ]
  }
];
