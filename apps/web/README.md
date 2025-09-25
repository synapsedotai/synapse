# Synapse Web

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://synapse-ai.pages.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)

This is a [Next.js](https://nextjs.org) project deployed on [Cloudflare Workers](https://workers.cloudflare.com/) using [OpenNext](https://opennext.js.org/).

## Getting Started

First, run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy to Cloudflare Workers

This app is deployed on [Cloudflare Workers](https://workers.cloudflare.com/) using [OpenNext](https://opennext.js.org/).

### Development Commands

```bash
bun run dev      # Start development server
bun run build    # Build for production
bun run preview  # Preview in Workers runtime locally
bun run deploy   # Deploy to Cloudflare Workers
```

### Deployment

The app is automatically deployed to Cloudflare Workers. You can also deploy manually:

```bash
bun run deploy
```

Check out the [OpenNext Cloudflare documentation](https://opennext.js.org/cloudflare) for more details.
