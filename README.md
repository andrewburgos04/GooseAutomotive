# Goose Shop

Internal shop-management app for Goose Automotive — a Tekmetric-style workflow for advisors and technicians across all nine Goose locations.

The public marketing site still lives in `website/`. This app is what the shop floor uses.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:4173`. Sign in as **Andi Garcia** (PIN `1002`) or **Marco Reyes** (PIN `2001`) at Bandera Road. Use **Reset demo** in the sidebar if tickets look stale.

Shop data is shared through `GET/PUT /api/state` (written to `data/shop.json` by the Vite API plugin). Logins stay in this browser (`sessionStorage`) so two people can be signed in at once against the same tickets.

## Shop floor

- Job board (Estimates / WIP / Completed) with RO labels
- Tech board with labor assignment, job clocks, and efficiency
- 32-point DVI with photos on yellow/red findings
- One-click canned jobs from inspection findings (Tekmetric-style sub-estimates)
- Employee time clock (in / out / break), separate from job clocks
- VIN decode (live NHTSA) + vehicle history: past ROs, declined jobs, mileage, fleet unit numbers
- Appointment calendar (replaces the Tekmetric booking iframe) plus public `/book`
- Reports: car count, ARO, close ratio, tech efficiency, declined jobs, DVI completion, and a 9-shop org table
- Print / PDF: inspection, estimate, invoice
- Digital signature on customer approval (`/approve/:id`)
- Fleet / GSA accounts with company billing

## Integrations (HTTP adapters)

These hit real `/api/*` endpoints. Swap the adapter URLs for live vendor credentials; the demo plugin logs confirmations to `data/integrations.jsonl`.

- Parts ordering: PartsTech / Nexpart / NAPA (`POST /api/vendors/:id/order`)
- Inventory + vendor POs
- Payments: card, Apple Pay, text-to-pay (`POST /api/pay`) auto-post to the RO
- Two-way SMS / email estimates (`POST /api/sms`, `POST /api/email`)
- Financing: Synchrony, American First, EasyPay (`POST /api/finance`)
- Labor guide and parts/labor matrices
- QuickBooks invoice sync (`POST /api/qb`) and payroll export (`GET /api/payroll`)
- Review / reminder / declined-job marketing
- PIN login (`POST /api/login`)

## Suggested walkthrough

1. Sign in as **Andi Garcia**.
2. Open **GO-4822** (Honda CR-V, grinding brakes). The DVI already has a red pad photo.
3. Send the estimate (SMS), open **customer approval**, sign, and authorize the front brakes.
4. Clock in on **Time clock** (payroll), then sign out and sign in as **Marco Reyes**.
5. Clock into the authorized brake job, or finish the Camry DVI on **GO-4821** and add jobs from yellow/red.
6. Check **Calendar**, **Reports** (org table), **Parts & stock**, and **Settings**.
