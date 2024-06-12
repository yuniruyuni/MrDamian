import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

import path from 'path';
import fs from 'fs/promises';

import { checkDependency, generateDependencyLicenses } from './src/utils/dependency';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: [
      "resources",
    ],
  },
  rebuildConfig: {},
  hooks: {
    generateAssets: async () => {
      const mods = await checkDependency();
      const html = await generateDependencyLicenses(mods);

      const dst = path.join(__dirname, 'resources', 'LICENSES.dependency.html');
      await fs.mkdir(path.dirname(dst), { recursive: true });
      await fs.writeFile(dst, html);
    },
  },
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}),
    new MakerDMG({}),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // TODO: implement auto (sub-component's) config generation that scans index.html in src/** dirs.
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
        },
        {
          entry: 'src/editor/preload.ts',
          config: 'vite.preload.config.ts',
        },
      ],
      renderer: [
        {
          name: 'editor',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
