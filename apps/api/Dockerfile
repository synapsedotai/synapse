# Use Bun as the base image (following your workspace rules)
FROM oven/bun:1 AS base

# Install OpenSSL and other required system dependencies for Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check - using Bun's built-in fetch API
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD bun run -e "fetch('http://localhost:4000/healthz').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Run the application directly with Bun (no build needed, runs TS natively)
CMD ["bun", "run", "src/server.ts"]
