# ☕ Cafe NUX — Monorepo

> Nuxt 3 + Vue 3 + Pinia | MVVM Architecture | Real-time orders

## Apps
| App | Port | Description |
|-----|------|-------------|
| `apps/admin` | 3000 | POS Terminal + Kitchen + Manager Dashboard |
| `apps/customer` | 3001 | Customer Web Ordering App |

## Packages
| Package | Description |
|---------|-------------|
| `packages/types` | Shared TypeScript interfaces |
| `packages/utils` | Currency, date, order helpers |
| `packages/api-client` | Shared fetch client |

## Setup
```bash
pnpm install
pnpm dev:admin      # Admin app on :3000
pnpm dev:customer   # Customer app on :3001
```

## Customer QR Flow
`http://localhost:3001/menu?table=5`  → auto-assigns table 5

## Tech Stack
- Nuxt 3 (App Router, SSR)
- Vue 3 (Composition API + `<script setup>`)
- Pinia (State = ViewModel layer)
- Socket.IO (real-time orders)
- TypeScript, Vanilla CSS
- Turborepo + pnpm workspaces
