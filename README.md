# Munchify Frontend (React + TypeScript + Vite)

Basic UI for the `Munchify-Backend` FastAPI service.

## Configure

Copy the example env file:

```bash
cp .env.example .env
```

If your backend runs elsewhere, update:
- `VITE_API_BASE` (default `http://127.0.0.1:8000`)

## Run locally

```bash
npm install
npm run dev
```

## What’s implemented
- **Login**: calls `POST /auth/login` (OAuth2 password form) and stores JWT in `localStorage`
- **Recommendations**: calls `GET /recommendations` with repeated `k` params (e.g. `?k=3&k=5`)
- **Activity**: click/order/rate flows (`/activity/*`)
