import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ✅ Extend Next.js + TypeScript recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  {
    rules: {
      // Allow console in development
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

// ✅ Assign to a variable before exporting (fixes eslintimport/no-anonymous-default-export)
export default eslintConfig;
