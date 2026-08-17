# iTravel API Knowledge Base & Assessment Hub

> **CURRENT STATUS: PRODUCTION READY (v1.0.0)**  
> This repository contains a fully functional React/Vite web application providing an interactive knowledge base, searchable API catalog, deep payload inspector, trade rules reference, and team assessment quiz for the iTravel Connect and iTravel Cruise v6.0 REST API ecosystem.

---

## Current vs. Target Capability Matrix

| Feature / Capability | Current Status | Notes |
| :--- | :--- | :--- |
| **Interactive API Catalog** | **Implemented** | 22+ iTravel Cruise & Connect endpoints indexed with OpenAPI schemas |
| **Fuzzy Search Bar** | **Implemented** | Filter by title, path, headers, error codes, and descriptions |
| **Deep Endpoint Inspector** | **Implemented** | View & copy JSON request/response payloads, mandatory headers |
| **Trade & Agency Rules** | **Implemented** | Parent/child hierarchy, consortia, commission, net/gross invoicing |
| **V4 vs iTravel Matrix** | **Implemented** | Structural comparison between TravCorp V4 and iTravel OMS |
| **Team Assessment Quiz** | **Implemented** | Interactive quiz with score tracking and explanations |
| **Live Web Deployment** | **Deployed** | Deployed on Vercel & hosted on public GitHub |

---

## Local Setup & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Launch local dev server:
   ```bash
   npm run dev
   ```

3. Build production bundle:
   ```bash
   npm run build
   ```

---

## Repository Structure

* `src/` — React application source code and API dataset (`src/data/apiData.js`)
* `tests/` — Unit test suite for dataset and application verification
* `docs/` — API mapping documentation (`docs/API_MAPPING.md`)
* `config/` — Environment and telemetry configuration (`config/app.config.json`)
* `README.md` — Project overview and capability matrix
