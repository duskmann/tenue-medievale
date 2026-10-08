import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: base must match your GitHub repo name for GitHub Pages to
// find the built assets. If your repo is github.com/<user>/tenue-medievale,
// base should be '/tenue-medievale/'. If you're deploying to a custom
// domain or to <user>.github.io itself (not a project page), set base to '/'.
export default defineConfig({
  plugins: [react()],
  base: "/tenue-medievale/",
});
