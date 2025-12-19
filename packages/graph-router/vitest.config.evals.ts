import "dotenv/config";

import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: configDefaults.include.map((i) => `evals/${i}`),
    testTimeout: 120e3, // 120 seconds
  },
});
