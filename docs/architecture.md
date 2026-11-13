# Clothify Unified Architecture

Clothify is now maintained as one application tree. The former store-management and catalog projects are consolidated under one `frontend` and one `backend`.

## Frontend
Next.js is the single frontend runtime. Domain features live under `features/`, while `app/` contains route entry points.

## Backend
Express is the single API runtime. Business domains live under `src/modules/`. Catalog, inventory and store-management APIs share the same database contract and process.

## Database
The catalog schema/migration history is used as the unified database baseline because it contains the complete catalog, inventory and store entities.

## Commerce workflows
The sales module owns the POS catalog, checkout, sale history, invoice data, and return/exchange records. A checkout decrements branch inventory in the same database transaction that creates its sale and items. Returns restock the original variants; exchanges also create a replacement sale and atomically decrement replacement stock.

The analytics module derives restock recommendations from each inventory record's reorder level and calculates size/color movement from completed sale items over a requested date range. Return records are stored in the `SaleReturn` and `SaleReturnItem` tables introduced by the `20261013180300_add_sales_returns` migration.
