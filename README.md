# Food Bank Management App

A full-stack food bank management platform with:

- Public donor dashboard with Critical / Low / Stable stock visibility.
- Private admin portal behind login (`admin` / `foodbank123`).
- Admin stock controls (`+` / `-`) and urgent item toggle.

## Primary stack (app source)

- React + Vite
- Tailwind CSS
- Lucide React icons
- Express API

## Run the full app (when npm registry access is available)

```bash
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000

## Instant local preview (no dependency install)

If package install is blocked in your environment, use the standalone preview page:

```bash
python3 -m http.server 4173
# then open http://localhost:4173/preview.html
```

This preview mirrors the donor dashboard and admin flows (including login, +/- stock updates, and urgent toggles) in a single self-contained file.
