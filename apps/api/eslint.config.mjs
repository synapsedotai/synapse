import { config } from "@repo/eslint-config/base";

const base = Array.isArray(config) ? config : [config];

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...base,
  {
    ignores: ["dist/**", "node_modules/**", ".prisma/**"],
  },
];


