// vite.config.ts
import path from "path";
import react from "file:///C:/xampp/htdocs/digitalrakshak-project/digitalrakshak-io-console/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/xampp/htdocs/digitalrakshak-project/digitalrakshak-io-console/node_modules/@tailwindcss/vite/dist/index.mjs";
import { defineConfig } from "file:///C:/xampp/htdocs/digitalrakshak-project/digitalrakshak-io-console/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\xampp\\htdocs\\digitalrakshak-project\\digitalrakshak-io-console";
var rawPort = process.env.PORT || "5000";
var port = Number(rawPort);
var basePath = process.env.BASE_PATH || "/";
var vite_config_default = defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "src"),
      "@workspace/api-client-react": path.resolve(__vite_injected_original_dirname, "src/lib/api-client-react.ts"),
      "@assets": path.resolve(__vite_injected_original_dirname, "public")
    },
    dedupe: ["react", "react-dom"]
  },
  root: path.resolve(__vite_injected_original_dirname),
  build: {
    outDir: path.resolve(__vite_injected_original_dirname, "dist"),
    emptyOutDir: true
  },
  server: {
    port: port || 5e3,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false
    }
  },
  preview: {
    port: port || 5e3,
    host: "0.0.0.0",
    allowedHosts: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFx4YW1wcFxcXFxodGRvY3NcXFxcZGlnaXRhbHJha3NoYWstcHJvamVjdFxcXFxkaWdpdGFscmFrc2hhay1pby1jb25zb2xlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFx4YW1wcFxcXFxodGRvY3NcXFxcZGlnaXRhbHJha3NoYWstcHJvamVjdFxcXFxkaWdpdGFscmFrc2hhay1pby1jb25zb2xlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi94YW1wcC9odGRvY3MvZGlnaXRhbHJha3NoYWstcHJvamVjdC9kaWdpdGFscmFrc2hhay1pby1jb25zb2xlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xuXG5jb25zdCByYXdQb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCAnNTAwMCc7XG5jb25zdCBwb3J0ID0gTnVtYmVyKHJhd1BvcnQpO1xuY29uc3QgYmFzZVBhdGggPSBwcm9jZXNzLmVudi5CQVNFX1BBVEggfHwgJy8nO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBiYXNlOiBiYXNlUGF0aCxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgdGFpbHdpbmRjc3MoKSxcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShpbXBvcnQubWV0YS5kaXJuYW1lLCAnc3JjJyksXG4gICAgICAnQHdvcmtzcGFjZS9hcGktY2xpZW50LXJlYWN0JzogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsICdzcmMvbGliL2FwaS1jbGllbnQtcmVhY3QudHMnKSxcbiAgICAgICdAYXNzZXRzJzogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsICdwdWJsaWMnKSxcbiAgICB9LFxuICAgIGRlZHVwZTogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcbiAgfSxcbiAgcm9vdDogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUpLFxuICBidWlsZDoge1xuICAgIG91dERpcjogcGF0aC5yZXNvbHZlKGltcG9ydC5tZXRhLmRpcm5hbWUsICdkaXN0JyksXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IHBvcnQgfHwgNTAwMCxcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcbiAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICAgIGZzOiB7XG4gICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgIH0sXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiBwb3J0IHx8IDUwMDAsXG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIGFsbG93ZWRIb3N0czogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0WCxPQUFPLFVBQVU7QUFDN1ksT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsb0JBQW9CO0FBSDdCLElBQU0sbUNBQW1DO0FBS3pDLElBQU0sVUFBVSxRQUFRLElBQUksUUFBUTtBQUNwQyxJQUFNLE9BQU8sT0FBTyxPQUFPO0FBQzNCLElBQU0sV0FBVyxRQUFRLElBQUksYUFBYTtBQUUxQyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQXFCLEtBQUs7QUFBQSxNQUM1QywrQkFBK0IsS0FBSyxRQUFRLGtDQUFxQiw2QkFBNkI7QUFBQSxNQUM5RixXQUFXLEtBQUssUUFBUSxrQ0FBcUIsUUFBUTtBQUFBLElBQ3ZEO0FBQUEsSUFDQSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsRUFDL0I7QUFBQSxFQUNBLE1BQU0sS0FBSyxRQUFRLGdDQUFtQjtBQUFBLEVBQ3RDLE9BQU87QUFBQSxJQUNMLFFBQVEsS0FBSyxRQUFRLGtDQUFxQixNQUFNO0FBQUEsSUFDaEQsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU0sUUFBUTtBQUFBLElBQ2QsWUFBWTtBQUFBLElBQ1osTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLElBQ2QsSUFBSTtBQUFBLE1BQ0YsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNLFFBQVE7QUFBQSxJQUNkLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxFQUNoQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
