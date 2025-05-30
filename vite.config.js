import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://resume-builderrr.vercel.app",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy, options) => {
          // Additional proxy configuration if needed
        },
      },
    },
    cors: true,
  },
});
