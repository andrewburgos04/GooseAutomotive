# Goose Shop

Internal shop-management app for Goose Automotive — a Tekmetric-style workflow for advisors and technicians across Goose’s Texas locations.

The public marketing site still lives in `website/`. This app is what the shop floor uses.

## What it covers

- Job board (Estimates / Work in progress / Completed)
- Tech board with labor assignment, clocks, and efficiency
- Repair orders with canned jobs, parts, and WIP notes
- Goose 32-point digital vehicle inspection (green / yellow / red)
- Customer estimate approval link
- Multi-location switcher and demo staff (Bandera, West Avenue, Colorado)

Data is stored in the browser (`localStorage`) so you can click through a full RO without a backend. Use **Reset demo** in the sidebar to restore seed tickets.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:4173`. Sign in as Andi Garcia (advisor) or Marco Reyes (technician) at Bandera Road.

```bash
npm run build
```

## Suggested walkthrough

1. Sign in as **Andi Garcia**.
2. Open **GO-4822** (Honda CR-V, grinding brakes).
3. Send the estimate, then open **customer approval** and authorize the front brakes.
4. Sign out and sign in as **Marco Reyes**.
5. Clock into the authorized brake job, or finish the Camry DVI on **GO-4821**.
