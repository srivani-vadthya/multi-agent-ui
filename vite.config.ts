import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Render runs this app as a Node web service. Disable Cloudflare worker output
// so TanStack Start emits the standard Nitro .output server bundle.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
});
