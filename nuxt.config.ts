// https://nuxt.com/docs/api/configuration/nuxt-config
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import { loadEnv } from 'vite'

interface VITE_ENV_CONFIG {
  VITE_PACK_ENV: string
  VITE_API_HOST: string
}

const envScript = (process.env as any).npm_lifecycle_script.split(' ')
const envName = envScript[envScript.length - 1] // 通过启动命令区分环境
const envData = loadEnv(envName, 'env') as unknown as VITE_ENV_CONFIG

export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'WonHot | 万花筒'
    }
  },
  runtimeConfig: {
    public: envData
  },
  devtools: { enabled: true },
  modules: [
    'nuxt-icon',
    '@pinia/nuxt'
  ],
  components: true,
  build: {
    transpile:
      process.env.NODE_ENV === 'production'
        ? [
            'naive-ui',
            'vueuc',
            '@css-render/vue3-ssr',
            '@juggle/resize-observer'
          ]
        : ['@juggle/resize-observer']
  },
  css: ['@/assets/css/main.css'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/css/_main.scss" as *;',
        }
      }
    },
    plugins: [
      Components({
          resolvers: [NaiveUiResolver()], // Automatically register all components in the `components` directory
      }),
    ],
    // @ ts-expect-error: Missing ssr key
    ssr: {
        noExternal: ['moment', 'naive-ui', '@juggle/resize-observer', '@css-render/vue3-ssr'],
    },
    optimizeDeps: {
        include: process.env.NODE_ENV === 'development'
        ? ['naive-ui', 'vueuc', 'date-fns-tz/formatInTimeZone']
        : []
    }
  },
  devServer: {
    port: 3004
  },
  nitro: {
    output: {
        dir: '~/dist'
    }
  }
})
