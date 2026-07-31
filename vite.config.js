import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function ipRolePlugin(devHost) {
  const configPath = path.resolve(process.cwd(), 'ip_roles.json')
  let ipRoles = {}

  function reloadRoles() {
    try {
      if (fs.existsSync(configPath)) {
        ipRoles = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      }
    } catch (e) {
      console.warn('[ip-role] Error leyendo ip_roles.json:', e.message)
    }
  }

  reloadRoles()

  return {
    name: 'ip-role-plugin',
    configureServer(server) {
      server.middlewares.use('/api/whoami', (_req, res) => {
        reloadRoles()
        const raw = _req.socket.remoteAddress || ''
        const ip = raw.replace('::ffff:', '')
        const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip === devHost
        const role = ipRoles[ip] || null

        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-cache')
        res.end(JSON.stringify({ ip, role, isServer: isLocalhost }))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), ipRolePlugin(env.DEV_HOST)],
    server: {
      host: env.DEV_HOST || 'localhost',
    },
  }
})
