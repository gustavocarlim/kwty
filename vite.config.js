import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Em produção a Vercel publica api/track.js; este plugin faz o mesmo no `vite dev`.
function localApi(mode) {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      // descarta valores de uma carga anterior para reler o .env.local
      for (const key of globalThis.__dbEnvKeys ?? []) delete process.env[key]
      const env = loadEnv(mode, server.config.root, 'DB_')
      globalThis.__dbEnvKeys = Object.keys(env).filter((key) => !(key in process.env))
      Object.assign(process.env, env)

      server.middlewares.use('/api/track', async (req, res, next) => {
        try {
          const { default: handler } = await server.ssrLoadModule('/api/track.js')
          await handler(req, res)
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), localApi(mode)],
}))
