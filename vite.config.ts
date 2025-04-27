import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginBundleObfuscator from "vite-plugin-bundle-obfuscator";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginBundleObfuscator({
      excludes: [],
      enable: true,
      log: true,
      autoExcludeNodeModules: true,
      threadPool: true,
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: false,
        debugProtection: false,
        debugProtectionInterval: 0,
        disableConsoleOutput: false,
        identifierNamesGenerator: "hexadecimal",
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: false,
        ignoreImports: true,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.5,
        stringArrayEncoding: [],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: "variable",
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false,
      },
    }),
  ],
  build: {
    minify: "terser", // 使用 terser 来支持更多压缩配置
    terserOptions: {
      compress: {
        drop_console: true, // 移除 console
        dead_code: true, // 删除未使用代码
      },
      format: {
        comments: false, // 移除注释
      },
    },
  },
});
