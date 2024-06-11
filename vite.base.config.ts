import { builtinModules } from 'node:module';
import type { AddressInfo } from 'node:net';
import type { ConfigEnv, Plugin, UserConfig } from 'vite';
import pkg from './package.json';
import path from 'path';

export const builtins = ['electron', ...builtinModules.map((m) => [m, `node:${m}`]).flat()];

export const external = [...builtins, ...Object.keys('dependencies' in pkg ? (pkg.dependencies as Record<string, unknown>) : {})];

export function getBuildConfig(env: ConfigEnv<'build'>): UserConfig {
  const { root, mode, command } = env;
  const entry = env.forgeConfigSelf.entry ?? '';
  const dir = path.dirname(entry as string);

  return {
    root,
    mode,
    build: {
      // Prevent multiple builds from interfering with each other.
      emptyOutDir: false,
      // 🚧 Multiple builds may conflict.
      outDir: `.vite/build/${dir}`,
      watch: command === 'serve' ? {} : null,
      minify: command === 'build',
    },
    clearScreen: false,
  };
}

export function getDefineKey(names: string[]) {
  const define: { [name: string]: VitePluginRuntimeKey } = {};

  return names.reduce((acc, name) => {
    const NAME = name.replace("/", "_").toUpperCase();
    const key: VitePluginRuntimeKey = `VITE_${NAME}_HOTLOAD`;

    return { ...acc, [name]: key };
  }, define);
}

export function getBuildDefine(env: ConfigEnv<'build'>) {
  const { command, forgeConfig } = env;
  const names = forgeConfig.renderer.map(({ name }) => name).filter((name) => name != null);
  const defineKeys = getDefineKey(names);
  const define = Object.entries(defineKeys).reduce((acc, [name, key]) => {
    const def = {
      [key]: JSON.stringify({
        url: command === 'serve' ? process.env[key] : undefined,
        path: `.vite/renderer/${name}/index.html`,
      }),
    };
    return { ...acc, ...def };
  }, {} as Record<string, { [key: string]: string }>);

  return define;
}

export function pluginExposeRenderer(name: string): Plugin {
  const key = getDefineKey([name])[name];

  return {
    name: '@electron-forge/plugin-vite:expose-renderer',
    configureServer(server) {
      process.viteDevServers ??= {};
      // Expose server for preload scripts hot reload.
      process.viteDevServers[name] = server;

      server.httpServer?.once('listening', () => {
        const addressInfo = server.httpServer?.address() as AddressInfo | null;
        // Expose env constant for main process use.
        process.env[key] = `http://localhost:${addressInfo?.port}/src/${name}/index.html`;
      });
    },
  };
}

export function pluginHotRestart(command: 'reload' | 'restart'): Plugin {
  return {
    name: '@electron-forge/plugin-vite:hot-restart',
    closeBundle() {
      if (command === 'reload') {
        for (const server of Object.values(process.viteDevServers)) {
          // Preload scripts hot reload.
          server.ws.send({ type: 'full-reload' });
        }
      } else {
        // Main process hot restart.
        // https://github.com/electron/forge/blob/v7.2.0/packages/api/core/src/api/start.ts#L216-L223
        process.stdin.emit('data', 'rs');
      }
    },
  };
}
