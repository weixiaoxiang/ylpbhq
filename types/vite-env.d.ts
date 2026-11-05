/// <reference types="vite/client" />
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const vueComponent: DefineComponent<{}, {}, any>
  export default vueComponent
}
interface ImportMetaEnv {
  [key: string]: any
  BASE_URL: string
  MODE: string
  DEV: boolean
  PROD: boolean
  SSR: boolean
  readonly VITE_APP_TITLE: string
  readonly VITE_BASE_API: string
  readonly VITE_ROUTER_HISTORY: "hash" | "html5"
  readonly VITE_PUBLIC_PATH: string
  /** 大疆司空 OpenAPI Token，仅 AI 无人机航飞计划使用 */
  readonly VITE_SIKONG_TOKEN: string
  /** 大鲵无人机业务接口 token，未配置时 /danieApi 会返回 401 */
  readonly VITE_DANIE_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
