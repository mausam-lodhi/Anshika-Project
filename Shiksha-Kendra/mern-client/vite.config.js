import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), flowbiteReact()],
  // Vite automatically handles SPA routing in dev mode
  // For production, ensure your server is configured to serve index.html for all routes
})