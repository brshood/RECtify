import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const FIGMA_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="48">' +
      '<rect width="100%" height="100%" fill="#e2e8f0"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="10">image</text>' +
    '</svg>'
  )

export default defineConfig({
  plugins: [
    // Strip version suffixes like "package@1.2.3" → "package"
    {
      name: 'strip-version-suffixes',
      enforce: 'pre',
      resolveId(id) {
        if (id.includes('@')) {
          const cleaned = id.replace(/([^\/])@[\w.-]+/g, '$1')
          if (cleaned !== id) return cleaned
        }
      },
    },
    // Provide a tiny inline image for figma:asset/* imports
    {
      name: 'figma-asset-placeholder',
      enforce: 'pre',
      resolveId(id) {
        if (id.startsWith('figma:asset/')) {
          return id
        }
      },
      load(id) {
        if (id.startsWith('figma:asset/')) {
          return `export default "${FIGMA_PLACEHOLDER}"`
        }
      },
    },
    react(),
  ],
  resolve: {
    alias: [
      { find: 'motion/react', replacement: 'framer-motion' },
    ],
  },
  publicDir: 'public',
  base: './',
  server: { port: 5173, open: true },
})