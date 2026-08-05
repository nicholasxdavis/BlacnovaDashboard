# Blacnova Client Portal

Website management dashboard and lightweight CRM for Blacnova Development clients.

## Stack

- Vue 3 + TypeScript + Vite
- Element Plus (vue-element-admin style layout)
- Pinia + Vue Router
- Apache ECharts
- Phosphor Icons

## Run

```bash
npm install
npm run dev
```

## Modular clients

Edit `src/config/client.ts` and set `DEMO_CLIENT.modules` to control which sections appear in the sidebar and routes. Modules that are not enabled are hidden entirely.

## Demo login

Any email and password on `/login` will enter the dashboard.
