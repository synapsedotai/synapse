import { config } from "@repo/eslint-config/base";

const base = Array.isArray(config) ? config : [config];

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  {
    ignores: [
      "**/node_modules/**",
      "**/.prisma/**",
      "**/.turbo/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "src/generated/**",
      "src/generated/prisma/**",
    ],
  },
];


