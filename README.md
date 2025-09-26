# Synapse

[![Frontend Status](https://img.shields.io/badge/Frontend-Online-brightgreen?style=flat-square&logo=nextdotjs)](https://synapse.elia.vc/)
[![Backend Status](https://img.shields.io/badge/Backend-Online-brightgreen?style=flat-square&logo=typescript)](https://api.synapse.elia.vc/)

Synapse Monorepo based on [Turborepo](https://turborepo.com).

## Stack

### Frontend

The Synapse frontend uses [Next.js](https://nextjs.org/) with [TailwindCSS](https://tailwindcss.com/), [Jotai](https://jotai.org/), and is deployed on [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/).

It's deployed at [synapse.elia.vc](https://synapse.elia.vc).

Icons are from [Heroicons](https://heroicons.com/).

### Backend

The Synapse backend uses [Express.js](https://expressjs.com/) with [Prisma](https://www.prisma.io/) as ORM & [PostgreSQL](https://www.postgresql.org/) (via Supabase) as DB, deployed via [Coolify](https://coolify.io).

It's deployed at [api.synapse.elia.vc](https://api.synapse.elia.vc).

Claude + AI usage (backend):
- Topic extraction: Anthropic Claude (Haiku) via Messages API, returning normalized topics + confidence
- Agentic reasoning: Claude (Sonnet) ranks experts (score × freshness) and powers the matchmaker orchestration
- Embeddings: OpenAI embeddings API; semantic chunking improves recall; vectors stored in pgvector

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) frontend
- `api`: an [Express.js](https://expressjs.com/) api
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).



## For Judges (Anthropic Hackathon)

- Live MVP with connected frontend and backend
  - Frontend: https://synapse.elia.vc/
  - Backend: https://api.synapse.elia.vc/
- What it does
  - Friday check-ins → Claude (topics, summaries) → employee profiles
  - Search → semantic chunking + OpenAI embeddings + pgvector
  - Expert Matchmaker agent → Claude reasoning to rank experts; auto-scheduling meetings
- Verify quickly
  - Health: https://api.synapse.elia.vc/healthz
  - API contracts and curl examples: `apps/api/README.md`