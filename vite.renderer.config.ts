import type { ConfigEnv, UserConfig } from 'vite';
import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";
import { pluginExposeRenderer } from './vite.base.config';

import path from 'path';

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>;
  const { root, mode, forgeConfigSelf } = forgeEnv;
  const name = forgeConfigSelf.name ?? '';

  return {
    root: `${root}/src/${name}`,
    mode,
    base: `./`,
    build: {
      outDir: path.join(__dirname, `.vite/renderer/${name}`),
    },
    plugins: [react(), pluginExposeRenderer(name)],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
    // workaround to "504 (Outdated Optimize Dep)" problem.
    optimizeDeps: {
      force: true,
    }
  } as UserConfig;
});
