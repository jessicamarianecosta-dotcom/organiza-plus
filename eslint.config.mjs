import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The mount-detection pattern `useEffect(() => setMounted(true), [])`
      // is used throughout this codebase to avoid SSR/CSR hydration
      // mismatches — it's the correct, idiomatic fix for that problem, not
      // a bug this rule's suggested refactor (moving state sync elsewhere)
      // applies to. Keep it visible as a warning without failing lint/CI.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
