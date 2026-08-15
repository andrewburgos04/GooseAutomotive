# TechSync Systems — Client Ticketing Portal

Client-facing support ticketing for **TechSync Systems**, with an admin inbox for triage and updates.

## Features

- **Landing page** branded for TechSync Systems
- **Submit a ticket** — name, email, company, category, priority, subject, description
- **Track a ticket** — lookup by ticket ID + requester email (internal notes stay hidden)
- **Admin inbox** — filter by status, assign, change priority/status, add public or internal updates

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

- Default password: `techsync-admin`
- Override with `ADMIN_PASSWORD`
- Optional session secret: `ADMIN_SESSION_SECRET`

## Data

Tickets are stored in `data/tickets.json` (created automatically with sample tickets on first use).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — run production server
- `npm run lint` — ESLint
