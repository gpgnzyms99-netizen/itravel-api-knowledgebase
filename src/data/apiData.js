export const API_KNOWLEDGE_BASE = [
  {
    id: "ep_4_2",
    sectionNumber: "4.2",
    title: "cruiseAggrAvailabilitySearchRQ/RS",
    displayName: "Aggregate Sailing Availability Search",
    lifecycle: "Shopping & Search",
    lifecycleBadge: "Shopping",
    source: "PDF Sec 4.2 Pg 11 | REST: /v7/rest/public-power-shopping/cruises/fetch",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-power-shopping/cruiseAggrAvailabilitySearch",
    description: "High-throughput sailing availability search defined in PDF v6.0 Section 4.2 (Page 11). Connect REST mapping: POST /v7/rest/public-power-shopping/cruises/fetch.",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Booking channel (e.g. B2BAPI@TENANT)" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer authentication JWT" },
      { name: "x-pcc", type: "String", required: false, description: "Pseudo City Code / Agency Code" }
    ],
    parameters: [
      { name: "DepartureDateRange", type: "DateRange", required: true, description: "Start and End dates for sailing search" },
      { name: "GeographicRegion", type: "String", required: false, description: "Filter by region (e.g. MED, RHINE, DANUBE)" },
      { name: "ShipCode", type: "String", required: false, description: "Filter by specific vessel code" },
      { name: "PassengerCounts", type: "Object", required: true, description: "Adult, Child, and Infant counts" }
    ],
    requestPayload: `{
  "BookingOwner": {
    "RequestorType": "Agency",
    "RequestorID": "AGENCY_NORTH_01",
    "channel": "B2BAPI",
    "BusinessType": "B2B"
  },
  "DepartureDateRange": {
    "Start": "2027-05-01",
    "End": "2027-05-31"
  },
  "GeographicRegion": "RHINE",
  "PassengerCounts": {
    "Adults": 2,
    "Children": 0
  }
}`,
    responsePayload: `{
  "Status": "SUCCESS",
  "Sailings": [
    {
      "SailingID": "SL_UNI_2027_RH05",
      "ShipCode": "SS_ANTOINETTE",
      "ShipName": "S.S. Antoinette",
      "DepartureDate": "2027-05-10T14:00:00Z",
      "ArrivalDate": "2027-05-17T09:00:00Z",
      "PortsOfCall": ["Amsterdam", "Cologne", "Rüdesheim", "Basel"],
      "StartingPrice": { "Currency": "USD", "Amount": 3499.00 }
    }
  ]
}`,
    v4Comparison: "TravCorp V4 queries tour departures via /brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/availability; iTravel uses PDF Sec 4.2 cruiseAggrAvailabilitySearchRQ.",
    errorCodes: ["ERR_INVALID_DATE_RANGE", "ERR_NO_SAILINGS_FOUND", "ITRVL_CRUISE_AVAIL_SYS_00002"]
  },
  {
    id: "portal_oauth",
    sectionNumber: "Portal 1.1",
    title: "OAuth 2.0 /token (Client Credentials)",
    displayName: "iTravel Connect Dedicated Auth Server Token Endpoint",
    lifecycle: "Shopping & Search",
    lifecycleBadge: "Shopping",
    source: "Dedicated Auth Host | POST /token",
    method: "POST",
    endpointPath: "/token",
    description: "Issues short-lived signed JWT bearer tokens (30-minute TTL) on the dedicated Auth Host required for authenticating across all iTravel Connect API surfaces.",
    headers: [
      { name: "Content-Type", type: "String", required: true, description: "application/x-www-form-urlencoded" }
    ],
    parameters: [
      { name: "client_id", type: "String", required: true, description: "Registered channel / consumer identifier" },
      { name: "client_secret", type: "String", required: true, description: "Secret token assigned during onboarding" },
      { name: "grant_type", type: "String", required: true, description: "Must be 'client_credentials'" }
    ],
    requestPayload: `client_id=B2BAPI%40UNIWORLD&client_secret=sec_88291039&grant_type=client_credentials`,
    responsePayload: `{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 1800,
  "scope": "cruise:read cruise:write"
}`,
    v4Comparison: "V4 uses session headers/API keys; iTravel Connect uses strict 30-min JWT bearer tokens issued by POST /token on dedicated Auth host.",
    errorCodes: ["ITRVL_AUTH_401_UNAUTHORIZED", "ITRVL_AUTH_403_FORBIDDEN"]
  },
  {
    id: "ep_4_3",
    sectionNumber: "4.3",
    title: "cruiseCategoryAvailabilitySearchRQ/RS",
    displayName: "Category-Level Availability & Fare Search",
    lifecycle: "Shopping & Search",
    lifecycleBadge: "Shopping",
    source: "PDF Sec 4.3 Pg 23 | REST: /v7/rest/public-power-shopping/cruises/fetch",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-power-shopping/cruiseCategoryAvailabilitySearch",
    description: "Category availability & fare search defined in PDF v6.0 Section 4.3 (Page 23). Connect REST mapping: POST /v7/rest/public-power-shopping/cruises/fetch.",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Booking channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer authentication JWT" }
    ],
    parameters: [
      { name: "SailingID", type: "String", required: true, description: "Selected voyage code" },
      { name: "OccupancyDetails", type: "Object", required: true, description: "Passenger age breakdown and loyalty tier" }
    ],
    requestPayload: `{
  "SailingID": "SL_UNI_2027_RH05",
  "OccupancyDetails": {
    "AdultCount": 2,
    "LoyaltyNumber": "UN_VIP_8829"
  }
}`,
    responsePayload: `{
  "Status": "SUCCESS",
  "Categories": [
    {
      "CategoryCode": "SUITE_ROYAL",
      "CategoryName": "Royal Suite with Balcony",
      "AvailableCabinsCount": 3,
      "BaseFare": { "Currency": "USD", "Amount": 5299.00 },
      "TaxesAndFees": { "Currency": "USD", "Amount": 240.00 },
      "FareType": "Refundable"
    }
  ]
}`,
    v4Comparison: "V4 handles room types at tour option level via /brands/{brand}/tours/{tourId}/options/{optionId}; iTravel provides category-level availability in PDF Sec 4.3 Pg 23.",
    errorCodes: ["ERR_SAILING_NOT_FOUND", "ERR_INVALID_OCCUPANCY"]
  },
  {
    id: "ep_4_4",
    sectionNumber: "4.4",
    title: "fetchApplicablePromotionsRQ/RS",
    displayName: "Fetch Applicable Promotions & Discounts",
    lifecycle: "Promotions & Pricing",
    lifecycleBadge: "Promotions",
    source: "PDF Sec 4.4 Pg 34 | REST: /v7/rest/public-be-cruise/cruises/{cruiseCode}/promotions",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-be-cruise/fetchApplicablePromotions",
    description: "Evaluates eligible promotional codes and past-guest loyalty offers defined in PDF v6.0 Section 4.4 (Page 34). Connect REST mapping: /v7/rest/public-be-cruise/cruises/{cruiseCode}/promotions.",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" }
    ],
    parameters: [
      { name: "SailingID", type: "String", required: true, description: "Voyage code" },
      { name: "CategoryCode", type: "String", required: true, description: "Selected category code" },
      { name: "AgencyCode", type: "String", required: false, description: "Agency trade code for private promotions" }
    ],
    requestPayload: `{
  "SailingID": "SL_UNI_2027_RH05",
  "CategoryCode": "SUITE_ROYAL",
  "AgencyConsortium": "VIRTUOSO"
}`,
    responsePayload: `{
  "ApplicablePromotions": [
    {
      "PromoCode": "EARLY_BIRD_2027",
      "Description": "$500 Savings per suite for early booking",
      "DiscountAmount": { "Currency": "USD", "Amount": 500.00 },
      "IsCombinable": true
    }
  ]
}`,
    v4Comparison: "V4 evaluates tour quotes via /brands/{brand}/tours/{tourId}/options/{optionId}/departures/{departureId}/quote; iTravel evaluates combinability in PDF Sec 4.4 Pg 34.",
    errorCodes: ["ERR_INVALID_PROMO_CODE", "ERR_PROMO_EXPIRED"]
  },
  {
    id: "ep_4_5",
    sectionNumber: "4.5",
    title: "applyPromoRQ/RS",
    displayName: "Apply Promotional Discount Code",
    lifecycle: "Promotions & Pricing",
    lifecycleBadge: "Promotions",
    source: "PDF Sec 4.5 Pg 41 | REST: /v7/rest/public-be-cruise/cruises/promotions/apply",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-be-cruise/applyPromo",
    description: "Applies a validated promo code or agency override discount to an active basket as defined in PDF v6.0 Section 4.5 (Page 41).",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" }
    ],
    parameters: [
      { name: "PromoCode", type: "String", required: true, description: "Promotional discount code" }
    ],
    requestPayload: `{
  "PromoCode": "EARLY_BIRD_2027",
  "SailingID": "SL_UNI_2027_RH05"
}`,
    responsePayload: `{
  "Status": "PROMO_APPLIED",
  "DiscountApplied": { "Currency": "USD", "Amount": 500.00 }
}`,
    v4Comparison: "Applies promo discount across multi-modal basket in iTravel.",
    errorCodes: ["ERR_INVALID_PROMO"]
  },
  {
    id: "ep_4_6",
    sectionNumber: "4.6",
    title: "cruiseCabinAvailabilitySearchRQ/RS",
    displayName: "Physical Cabin Availability Search",
    lifecycle: "Cabin Selection",
    lifecycleBadge: "Cabins",
    source: "PDF Sec 4.6 Pg 56 | RPC: /iTravel/selling/api/public-cruise/cruiseCabinAvailabilitySearch",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-cruise/cruiseCabinAvailabilitySearch",
    description: "Physical cabin availability search defined in Section 4.6 (Pages 56–69) and Section 5.6 (Pages 152–153) of the 241-page PDF. Returns available physical cabin numbers, deck levels, and bed configurations.",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Booking channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" }
    ],
    parameters: [
      { name: "SailingID", type: "String", required: true, description: "Selected voyage ID" },
      { name: "CategoryCode", type: "String", required: true, description: "Category code" },
      { name: "DeckNumber", type: "Int", required: false, description: "Filter by deck level" },
      { name: "AccessibleCabinsOnly", type: "Boolean", required: false, description: "Filter for ADA accessible cabins" }
    ],
    requestPayload: `{
  "SailingID": "SL_UNI_2027_RH05",
  "CategoryCode": "SUITE_ROYAL",
  "DeckNumber": 3
}`,
    responsePayload: `{
  "Status": "SUCCESS",
  "Cabins": [
    {
      "CabinNumber": "301",
      "DeckNumber": 3,
      "BedConfiguration": "KING_OR_TWIN",
      "BalconyType": "FRENCH_BALCONY",
      "IsAccessible": false
    }
  ]
}`,
    v4Comparison: "V4 relies on hotel room option codes; iTravel Cruise API Sec 4.6 Pg 56 maintains physical ship deck grid and cabin mappings.",
    errorCodes: ["ERR_NO_CABINS_AVAILABLE", "ERR_INVALID_DECK"]
  },
  {
    id: "ep_4_8",
    sectionNumber: "4.8",
    title: "cruiseCabinHoldRQ/RS",
    displayName: "Physical Cabin Inventory Hold",
    lifecycle: "Inventory Lock",
    lifecycleBadge: "Holds",
    source: "PDF Sec 4.8 Pg 77 | REST: /v7/rest/public-be-cruise/cruises/{cruiseCode}/cabins/hold",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-be-cruise/cruiseCabinHold",
    description: "Places a temporary inventory hold on a cabin defined in PDF v6.0 Section 4.8 (Page 77). Connect REST mapping: /v7/rest/public-be-cruise/cruises/{cruiseCode}/cabins/hold.",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" },
      { name: "x-pcc", type: "String", required: false, description: "Agency Code" }
    ],
    parameters: [
      { name: "SailingID", type: "String", required: true, description: "Voyage ID" },
      { name: "CabinNumber", type: "String", required: true, description: "Selected cabin number" },
      { name: "HoldDurationMinutes", type: "Int", required: true, description: "Duration of temporary hold (e.g. 15 mins)" }
    ],
    requestPayload: `{
  "SailingID": "SL_UNI_2027_RH05",
  "CabinNumber": "301",
  "HoldDurationMinutes": 15
}`,
    responsePayload: `{
  "Status": "HOLD_CONFIRMED",
  "HoldID": "HOLD_9921_301",
  "ExpirationTimestamp": "2026-08-17T17:48:00Z"
}`,
    v4Comparison: "Temporary holds in iTravel auto-release upon expiration, preventing inventory lockouts.",
    errorCodes: ["ERR_CABIN_ALREADY_HELD", "ERR_HOLD_DURATION_EXCEEDED"]
  },
  {
    id: "ep_4_11",
    sectionNumber: "4.11",
    title: "createBookingRQ/RS",
    displayName: "Create Reservation (PDF Sec 4.11 Pg 108 & POST /v7/rest/bookings)",
    lifecycle: "Booking Creation",
    lifecycleBadge: "Booking",
    source: "PDF Sec 4.11 Pg 108 | REST: POST /v7/rest/bookings",
    method: "POST",
    endpointPath: "/v7/rest/bookings",
    description: "Validates basket, computes taxes, fees, deposit schedules, and commits the order. Defined in PDF v6.0 Section 4.11 (Page 108) as createBookingRQ/RS; exposed on Connect REST as POST /v7/rest/bookings.",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" },
      { name: "x-pcc", type: "String", required: true, description: "Agency PCC / Code" }
    ],
    parameters: [
      { name: "IsPreview", type: "Boolean", required: true, description: "True = DRY RUN validation; False = COMMIT order" },
      { name: "BookingOwner", type: "Object", required: true, description: "Agency, Agent, Consortium, and Net/Gross billing mode" },
      { name: "ItineraryDetails", type: "Object", required: true, description: "Sailing, Cabin, Dining, Ancillaries" },
      { name: "Passengers", type: "Array", required: true, description: "Passenger contact, passport, and loyalty details" }
    ],
    requestPayload: `{
  "IsPreview": false,
  "BookingOwner": {
    "RequestorType": "Agency",
    "RequestorID": "AGENCY_NORTH_01",
    "RequestingUserID": "AGENT_789",
    "AgencyConsortium": "VIRTUOSO",
    "NetPayApplicable": true
  },
  "SailingID": "SL_UNI_2027_RH05",
  "CabinNumber": "301",
  "Passengers": [
    {
      "PaxRefID": "PAX_1",
      "FirstName": "Jane",
      "LastName": "Doe",
      "DOB": "1980-04-12"
    }
  ]
}`,
    responsePayload: `{
  "Status": "BOOKING_CONFIRMED",
  "SuperPNRNumber": "SPNR_UNI_882019",
  "ReservationID": "RES_900122",
  "TotalAmount": { "Currency": "USD", "Amount": 5299.00 },
  "DepositDue": { "Currency": "USD", "Amount": 500.00 },
  "DepositDueDate": "2026-08-24T23:59:59Z"
}`,
    v4Comparison: "V4 creates a tour booking reference via POST /booking; iTravel creates a Super PNR via POST /v7/rest/bookings (or createBookingRQ/RS in PDF Sec 4.11 Pg 108).",
    errorCodes: ["ERR_PAYMENT_DECLINED", "ERR_INVALID_PASSENGER_DATA", "ERR_EXPIRED_HOLD"]
  },
  {
    id: "ep_5_3",
    sectionNumber: "5.3",
    title: "freezeBookingRQ/RS",
    displayName: "Freeze Reservation (Servicing Lock)",
    lifecycle: "Servicing & Modification",
    lifecycleBadge: "Servicing",
    source: "PDF Sec 5.3 Pg 147 | RPC: /iTravel/selling/api/public-booking/freezeBooking",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-booking/freezeBooking",
    description: "Applies a pessimistic servicing session lock on a booking as defined in PDF v6.0 Section 5.3 (Page 147).",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" }
    ],
    parameters: [
      { name: "ReservationID", type: "String", required: true, description: "Target reservation identifier" }
    ],
    requestPayload: `{
  "ReservationID": "RES_900122"
}`,
    responsePayload: `{
  "Status": "BOOKING_FROZEN",
  "LockToken": "LOCK_441029",
  "ExpiresInSeconds": 300
}`,
    v4Comparison: "Prevents race conditions when web agent and call centre advisor access the same booking.",
    errorCodes: ["ERR_BOOKING_ALREADY_LOCKED", "ERR_BOOKING_NOT_FOUND"]
  },
  {
    id: "ep_5_9",
    sectionNumber: "5.9",
    title: "modifyRQ/RS",
    displayName: "Modify Reservation (Amendments & Upgrades)",
    lifecycle: "Servicing & Modification",
    lifecycleBadge: "Servicing",
    source: "PDF Sec 5.9 Pg 158 | RPC: /iTravel/selling/api/public-booking/modify",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-booking/modify",
    description: "Executes price-neutral or price-affecting modifications as defined in PDF v6.0 Section 5.9 (Page 158).",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" }
    ],
    parameters: [
      { name: "ReservationID", type: "String", required: true, description: "Reservation ID" },
      { name: "LockToken", type: "String", required: true, description: "Active freeze token" },
      { name: "ModificationDetails", type: "Object", required: true, description: "Fields to be modified" }
    ],
    requestPayload: `{
  "ReservationID": "RES_900122",
  "LockToken": "LOCK_441029",
  "ModifyType": "CATEGORY_UPGRADE",
  "NewCategoryCode": "SUITE_GRAND"
}`,
    responsePayload: `{
  "Status": "MODIFICATION_SUCCESS",
  "PriceDelta": { "Currency": "USD", "Amount": 1200.00 },
  "NewTotalAmount": { "Currency": "USD", "Amount": 6499.00 }
}`,
    v4Comparison: "iTravel dynamically recalculates full basket pricing and recalculates deposits/commission upon amendment.",
    errorCodes: ["ERR_LOCK_EXPIRED", "ERR_MODIFICATION_NOT_ALLOWED"]
  },
  {
    id: "ep_6_2",
    sectionNumber: "6.2",
    title: "cancelBookingRQ/RS",
    displayName: "Cancel Booking & Penalty Evaluation",
    lifecycle: "Cancellation & Repricing",
    lifecycleBadge: "Cancellation",
    source: "PDF Sec 6.2 Pg 196 | RPC: /iTravel/selling/api/public-booking/cancelBooking",
    method: "POST",
    endpointPath: "/iTravel/selling/api/public-booking/cancelBooking",
    description: "Cancels full booking or specific line items and evaluates cancellation penalties as defined in PDF v6.0 Section 6.2 (Page 196).",
    headers: [
      { name: "x-auth-channel", type: "String", required: true, description: "Channel ID" },
      { name: "x-auth-token", type: "String", required: true, description: "Bearer JWT" }
    ],
    parameters: [
      { name: "ReservationID", type: "String", required: true, description: "Target reservation" },
      { name: "CancellationReason", type: "String", required: true, description: "Reason code" }
    ],
    requestPayload: `{
  "ReservationID": "RES_900122",
  "CancellationReason": "CUSTOMER_REQUEST"
}`,
    responsePayload: `{
  "Status": "CANCELLED",
  "CancellationReference": "CAN_109282",
  "CancellationPenalty": { "Currency": "USD", "Amount": 500.00 },
  "RefundableAmount": { "Currency": "USD", "Amount": 4799.00 }
}`,
    v4Comparison: "Automatically recalls agency commission and creates GL credit notes.",
    errorCodes: ["ERR_BOOKING_ALREADY_CANCELLED", "ERR_INVALID_CANCELLATION_REASON"]
  }
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which parameter inside the BookingOwner object determines if an agency pays net (after commission) or gross?",
    options: ["PayToSelf", "NetPayApplicable", "AgencyConsortium", "BusinessType"],
    correctAnswer: 1,
    explanation: "NetPayApplicable = true specifies that the agency pays net after deducting commission at the point of booking."
  },
  {
    id: 2,
    question: "What is the key difference between IsPreview = true and IsPreview = false in createBookingRQ / POST /v7/rest/bookings?",
    options: [
      "Preview creates a temporary hold; Commit cancels the hold",
      "Preview dry-runs pricing/penalties without saving state; Commit creates the Super PNR and commits payment",
      "Preview is for B2C; Commit is for B2B",
      "Preview is for single products; Commit is for packages"
    ],
    correctAnswer: 1,
    explanation: "IsPreview = true allows dry-run pricing validation without modifying the database state."
  },
  {
    id: 3,
    question: "Which mechanism does iTravel use to prevent concurrent editing collisions on the same booking?",
    options: ["OAuth refresh tokens", "freezeBookingRQ / unfreezeBookingRQ pessimistic locking", "Database read-only replicas", "WebSocket ping/pong"],
    correctAnswer: 1,
    explanation: "freezeBookingRQ applies a pessimistic session lock on a reservation during active servicing."
  },
  {
    id: 4,
    question: "What happens when a cabin hold duration expires without booking creation?",
    options: [
      "The agent's account is flagged",
      "The cabin automatically converts to a confirmed booking",
      "The hold automatically expires and releases inventory back to open availability",
      "The system sends an email to the customer"
    ],
    correctAnswer: 2,
    explanation: "Unconfirmed holds automatically expire and release inventory back to open availability."
  },
  {
    id: 5,
    question: "How are consortia benefits (e.g. Virtuoso, AAA overrides) passed in iTravel REST API requests?",
    options: [
      "Via URL query string parameters",
      "Inside the AgencyConsortium field of the BookingOwner object",
      "As a custom HTTP header x-consortium",
      "In the passenger passport profile"
    ],
    correctAnswer: 1,
    explanation: "AgencyConsortium in BookingOwner triggers preferred pricing, overrides, and consortia benefits."
  },
  {
    id: 6,
    question: "What is the Time-To-Live (TTL) of the signed OAuth 2.0 JWT access token issued by iTravel Connect?",
    options: ["15 minutes", "30 minutes", "12 hours", "24 hours"],
    correctAnswer: 1,
    explanation: "iTravel Connect OAuth 2.0 tokens issued via POST /token on the dedicated Auth Host have a 30-minute expiration period."
  }
];
