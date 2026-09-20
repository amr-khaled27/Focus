import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@main": resolve(__dirname, "src/main"),
        "@shared": resolve(__dirname, "src/shared"),
        "@resources": resolve(__dirname, "resources"),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@shared": resolve(__dirname, "src/shared"),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve(__dirname, "src/renderer/src"),
        "@components": resolve(__dirname, "src/renderer/src/components"),
        "@shared": resolve(__dirname, "src/shared"),
      },
    },
    plugins: [react(), tailwindcss()],
  },
});
