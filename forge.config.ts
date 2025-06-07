import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import type { ForgeConfig } from "@electron-forge/shared-types";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./src/resources/icon",
    asar: {
      unpack: "**/node_modules/@abandonware/**/*",
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel(
      {
        name: "iconsole_client",
        setupIcon: "./src/resources/icon.ico",
      },
      ["win32"]
    ),
    new MakerZIP({}, ["darwin"]),
    new MakerDeb(
      {
        options: {
          icon: "./src/resources/icon.png",
        },
      },
      ["linux"]
    ),
    new MakerRpm(
      {
        options: {
          icon: "./src/resources/icon.png",
        },
      },
      ["linux"]
    ),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig: "./webpack/webpack.main.config.js",
      renderer: {
        config: "./webpack/webpack.renderer.config.js",
        entryPoints: [
          {
            html: "./src/renderer/index.html",
            js: "./src/renderer/renderer.tsx",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
    {
      name: "@timfish/forge-externals-plugin",
      config: {
        externals: ["@abandonware/noble"],
        includeDeps: true,
      },
    },
  ],
};

export default config;
