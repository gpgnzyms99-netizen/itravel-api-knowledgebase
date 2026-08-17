# OMS Knowledge Base & Architecture Reference

> **CURRENT STATUS: PRODUCTION READY & DEPLOYED LIVE**  
> **Live Production URL:** [https://itravel-api-knowledgebase.vercel.app](https://itravel-api-knowledgebase.vercel.app)  
> **Passcode:** `itravel2026` or `ttc2026`  
> **GitHub Repository:** [https://github.com/gpgnzyms99-netizen/itravel-api-knowledgebase](https://github.com/gpgnzyms99-netizen/itravel-api-knowledgebase)

---

## 📌 Executive Overview

The **OMS Knowledge Base & Architecture Reference** is an enterprise-grade interactive portal designed for The Travel Corporation (TTC) and IBS Software. It provides complete, 100% specification-verified technical documentation, payload inspectors, multi-modal journey maps, trade commission rules, and architectural decision records for the **iTravel Connect**, **iTravel Cruise Engine v6.0**, and **TravCorp V4 Adapter** systems.

---

## 📊 Capability & Verification Matrix

| Capability / Surface | Implementation Status | Ground-Truth Verification Details |
| :--- | :--- | :--- |
| **iTravel Connect REST API Surface** | **100% Verified** | 16 canonical endpoints (e.g. `POST /v7/rest/bookings`, `POST /token`, `/v7/rest/public-power-shopping/cruises/fetch`) |
| **TravCorp V4 Adapter Surface** | **100% Verified** | Aligned with `travcorp_v4_spec.yaml` (`/brands/{brand}/tours/.../departures/{id}/availability`, `/quote`, `/book`, `/booking`, `/bookings/{bookingReference}`) |
| **BookingOwner Schema** | **100% Verified** | Canonical 9-field schema (`RequestorType`, `RequestorID`, `RequestingUserID`, `OrgUnitCode`, `AgencyConsortium`, `PayToSelf`, `PayOutAgencyCode`, `NetPayApplicable`, `BusinessType`) |
| **Preview vs Commit Modes** | **100% Verified** | Ground-truth `IsNotCommit` parameter per PDF Sec 4.11 Pg 108 (`IsNotCommit: true` = Preview / Dry-Run, `IsNotCommit: false` = Commit) |
| **Customer & Payment Schemas** | **100% Verified** | Uses exact Connect fields: `Passengers[].CustomerProfileId`, `Passengers[].CrmID`, `Payments[].FopType`, `Payments[].FopCode` |
| **Multi-Modal Journey Stepper** | **100% Verified** | End-to-end 7-step B2B advisor workflow for combined Trafalgar Land Tour + Uniworld River Cruise |
| **Agency & Commission Engine** | **100% Verified** | Centralized iTravel OMS commission ledger ($1,110 blended payout), Net/Gross billing rules, host/IC split, and multi-currency FX lock |
| **TTC Elevate Requirements** | **100% Verified** | Complete 10-requirement traceability matrix mapping business intent to exact REST & RPC endpoints |
| **Longitude Decommissioning** | **100% Verified** | Framing: *"Currently active in Uniworld operations today; contracted for replacement by iTravel Connect by End of 2027."* |
| **Interactive Assessment Quiz** | **100% Verified** | Team learning and knowledge verification quiz with score tracking and explanations |

---

## 🏗️ Architectural Invariants

1. **North-South Protocol Isolation:**
   - B2B Advisor Portals and B2C Web Frontends communicate **EXCLUSIVELY** with the iTravel OMS Gateway (`POST /v7/rest/bookings`).
   - Client UIs **NEVER** call TravCorp V4 endpoints directly.
2. **Centralized Financial Ledger:**
   - iTravel OMS collects 100% of guest payments, generates the single unified customer invoice, and dispatches a single consolidated agency commission check.
   - Tropics V4 receives inter-company revenue recognition journal entries only.
3. **Canonical Data Mastering:**
   - Guest Identity: Salesforce CRM MDM synced via `Passengers[].CustomerProfileId` and `Passengers[].CrmID`.
   - Locations: UN-LOCODE / IATA location codes mapped against V4 operating points.

---

## 🛠️ Local Development & Build Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Test production build
npm run build

# 4. Deploy to Vercel Production
vercel deploy --prod --yes
```

---

## 📁 Repository Structure

```
├── index.html               # Main HTML entry point & title branding
├── src/
│   ├── App.jsx              # Main application UI, tab routing, & search
│   ├── index.css            # Tier 3 semantic styling system & CSS variables
│   ├── data/
│   │   ├── apiData.js       # 16 Verbatim Connect & Cruise v6.0 REST specs & Q&A
│   │   └── businessData.js  # Multi-modal steps, Elevate requirements, & topology
├── config/
│   └── app.config.json      # Telemetry & application configuration
└── README.md                # System documentation & ground-truth verification matrix
```

---

*© 2026 The Travel Corporation (TTC) & IBS Software. Built using OpenAPI 3.0 Specs & Architecture Reference.*
