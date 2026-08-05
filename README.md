# Blacnova Client Portal

Website management dashboard and lightweight CRM for Blacnova Development clients.

## Stack

- Vue 3 + TypeScript + Vite
- Element Plus
- Pinia + Vue Router
- Cloudflare Workers API (`blacnova-api`)

## Run

```bash
npm install
npm run dev
```

Set `VITE_API_URL` in `.env` (defaults to the deployed Worker).

## Login

Use your Blacnova account on `/login`. Owner: `nic@blacnova.net`.

## Modules

Sidebar modules come from the API (`website.modules`). Disabled modules are hidden from nav and routes.
