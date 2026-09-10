import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const buildTarget = process.env.UPGRADE_BUILD_TARGET;

if (buildTarget !== "spa" && buildTarget !== "vike") {
  throw new Error(
    'UPGRADE_BUILD_TARGET must be either "spa" or "vike" for production builds.',
  );
}

export default defineConfig({
  base: "/",
  css: {
    postcss: {
      plugins: [
        (await import("tailwindcss")).default,
        (await import("autoprefixer")).default,
      ],
    },
  },
  plugins: [
    ...(buildTarget === "vike"
      ? [(await import("vike/plugin")).default()]
      : []),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(
      import.meta.dirname,
      buildTarget === "spa" ? "dist-spa" : "dist-vike",
    ),
    emptyOutDir: true,
  },
});