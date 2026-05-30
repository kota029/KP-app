import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** VITE_GAS_API_URL からプロキシ先パスを抽出（開発時 CORS 回避） */
function gasProxyPath(gasApiUrl: string): string | null {
  try {
    const u = new URL(gasApiUrl)
    if (!u.hostname.includes('script.google.com')) return null
    return u.pathname
  } catch {
    return null
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gasUrl = env.VITE_GAS_API_URL ?? ''
  const gasPath = gasProxyPath(gasUrl)

  const proxy =
    gasPath ?
      {
        '/gas-api': {
          target: 'https://script.google.com',
          changeOrigin: true,
          secure: true,
          followRedirects: true,
          rewrite: (pathname: string) => pathname.replace(/^\/gas-api/, gasPath),
        },
      }
    : undefined

  return {
    plugins: [react(), tailwindcss()],
    server: proxy ? { proxy } : undefined,
    preview: proxy ? { proxy } : undefined,
  }
})
