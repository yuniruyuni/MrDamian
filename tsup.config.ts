import { defineConfig } from 'tsup';

export default defineConfig({
  target: "node18",
  entry: ['src/main.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
  dts: true,
  banner(ctx) {
    if (ctx.format === "esm") {
      return {
        js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
      };
    }
  },
});
