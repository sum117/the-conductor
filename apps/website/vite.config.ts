import react from "@vitejs/plugin-react";
import {defineConfig} from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/website",
  build: {
    outDir: "build",
    assetsDir: ".",
  },
  plugins: [react()],
});
