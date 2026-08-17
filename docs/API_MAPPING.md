# iTravel API Mapping & Schema Guide

This directory documents the API mapping between legacy TravCorp V4 endpoints and iTravel Connect v6.0 REST services.

## Core Mappings

| Legacy V4 Domain | iTravel Connect REST Service | Description |
| :--- | :--- | :--- |
| Tour Search | `cruiseAggrAvailabilitySearchRQ/RS` | High-throughputPowershopping search |
| Room Category Lookup | `cruiseCategoryAvailabilitySearchRQ/RS` | Ship deck & cabin category availability |
| Promotions | `fetchApplicablePromotionsRQ/RS` & `applyPromoRQ/RS` | Multi-product promotion rules engine |
| Cabin Hold | `cruiseCabinHoldRQ/RS` | Temporary inventory locking |
| Booking Commitment | `createBookingRQ/RS` | Basket validation (Preview) and Super PNR creation (Commit) |
| Servicing Lock | `freezeBookingRQ/RS` | Pessimistic session locking |
