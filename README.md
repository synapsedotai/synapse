# Synapse

[![Frontend Status](https://img.shields.io/badge/Frontend-Online-brightgreen?style=flat-square&logo=nextdotjs)](https://synapse.elia.vc/)
[![Backend Status](https://img.shields.io/badge/Backend-Online-brightgreen?style=flat-square&logo=typescript)](https://api.synapse.elia.vc/)

Synapse Monorepo based on [Turborepo](https://turborepo.com).

## Stack

### Frontend

The Synapse frontend uses [Next.js](https://nextjs.org/) with [TailwindCSS](https://tailwindcss.com/), [Jotai](https://jotai.org/), and is deployed on [Cloudflare Workers](https://workers.cloudflare.com/) via [OpenNext](https://opennext.js.org/).

Icons are from [Heroicons](https://heroicons.com/).

### Backend

The Synapse backend uses [Express.js](https://expressjs.com/) with [Prisma](https://www.prisma.io/) as ORM & [PostgreSQL](https://www.postgresql.org/) (via Supabase) as DB.

### Apps and Packages

- `web`: a [Next.js](https://nextjs.org/) frontend
- `api`: an [Express.js](https://expressjs.com/) api
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This repository has the following utilities set up:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting