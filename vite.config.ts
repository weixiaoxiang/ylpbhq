/// <reference types="vitest" />

import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"
import path, { resolve } from "path"
import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import svgLoader from "vite-svg-loader"
import { createHtmlPlugin } from "vite-plugin-html"
import { visualizer } from "rollup-plugin-visualizer"
import viteCompression from "vite-plugin-compression"

const pathSrc = path.resolve(__dirname, "src")
/** 配置项文档：https://cn.vitejs.dev/config */
export default ({ mode }: ConfigEnv): UserConfigExport => {
  const viteEnv = loadEnv(mode, process.cwd()) as ImportMetaEnv
  const { VITE_PUBLIC_PATH, VITE_APP_TITLE } = viteEnv
  return {
    /** 打包时根据实际情况修改 base */
    base: VITE_PUBLIC_PATH,
    resolve: {
      alias: {
        /** @ 符号指向 src 目录 */
        "@": resolve(__dirname, "./src")
      }
    },
    server: {
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host: true, // host: "0.0.0.0"
      /** 端口号 */
      port: 3333,
      /** 是否自动打开浏览器 */
      open: false,
      /** 跨域设置允许 */
      cors: true,
      /** 端口被占用时，是否直接退出 */
      strictPort: false,
      /** 接口代理 */
      proxy: {
        "/api": {
          target: "http://192.168.43.113:7761",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true
          // rewrite: (path) => path.replace(/^\/api/, "")
        },
        "/statisUrl": {
          target: "http://192.168.43.113:7761",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/statisUrl/, "")
        },
        "/mapUrl": {
          target: "http://49.4.30.141:8011",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/mapUrl/, "")
        },
        "/geowebcacheMap": {
          target: "http://127.0.0.1:8081",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/geowebcacheMap/, "")
        },
        "/nginxData": {
          target: "http://127.0.0.1:8082/data",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/nginxData/, "")
        }
      },
      /** 预热常用文件，提高初始页面加载速度 */
      warmup: {
        clientFiles: ["./src/layouts/**/*.vue"]
      }
    },
    build: {
      /** 单个 chunk 文件的大小超过 2048KB 时发出警告 */
      chunkSizeWarningLimit: 2048,
      /** 禁用 gzip 压缩大小报告 */
      reportCompressedSize: true,
      /** 打包后静态资源目录 */
      assetsDir: "static",
      rollupOptions: {
        output: {
          /**
           * 分块策略
           * 1. 注意这些包名必须存在，否则打包会报错
           * 2. 如果你不想自定义 chunk 分割策略，可以直接移除这段配置
           */
          manualChunks: {
            map: ["ol", "cesium"],
            vue: ["vue", "vue-router", "pinia"],
            element: ["element-plus", "@element-plus/icons-vue"],
            vxe: ["vxe-table", "vxe-table-plugin-element", "xe-utils"]
          }
        },
        plugins: [
          // gzip压缩文件
          viteCompression({
            verbose: true, // 输出压缩结果
            disable: false, // 是否禁用
            deleteOriginFile: false, // 是否删除源文件
            threshold: 10240, // 10kb 只有大小大于该值的资源会被处理，单位是字节
            algorithm: "gzip", // 压缩算法
            ext: ".gz" // 生成的压缩包后缀
          }),
          // 生成report报告页面
          visualizer({
            filename: "dist/report.html",
            open: true,
            gzipSize: true,
            brotliSize: true
          })
        ]
      }
    },
    /** 混淆器 */
    esbuild:
      mode === "development"
        ? undefined
        : {
            /** 打包时移除 console.log */
            pure: ["console.log"],
            /** 打包时移除 debugger */
            drop: ["debugger"],
            /** 打包时移除所有注释 */
            legalComments: "none"
          },
    /** Vite 插件 */
    plugins: [
      vue(),
      // 动态修改index.html的title
      createHtmlPlugin({
        inject: {
          data: {
            title: VITE_APP_TITLE
          }
        }
      }),
      vueJsx(),
      /** 将 SVG 静态图转化为 Vue 组件 */
      svgLoader({ defaultImport: "url" }),
      /** SVG */
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), "src/icons/svg")],
        symbolId: "icon-[dir]-[name]"
      }),
      /** 自动导入函数 */
      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "pinia",
          // ol
          {
            ol: [
              // 命名导入，相当于会自动添加 import { Map as olMap } from "ol";
              // 不能使用Map命名，不然与js内置的Map函数同名，导致ts类型推导出现错误
              ["Map", "OlMap"],
              "View",
              "Feature",
              "Overlay"
            ],
            "ol/style": [
              ["Circle", "CircleStyle"],
              "Fill",
              "Icon",
              ["Image", "OlImage"],
              "Stroke",
              "Style",
              ["Text", "OlText"]
            ],
            "ol/layer": [
              ["Tile", "TileLayer"],
              ["Vector", "VectorLayer"]
            ],
            "ol/source": ["WMTS", "OSM", "TileWMS", ["Tile", "TileSource"], ["Vector", "VectorSource"]],
            "ol/geom": ["CircleGeom", "LineString", "MultiLineString", "Point", "Polygon"],
            "ol/control": ["ScaleLine", ["defaults", "defaultsControls"]],
            "ol/interaction": [["defaults", "defaultInteractions"]],
            "ol/proj": [["get", "getProjection"]],
            "ol/extent": ["getWidth", "getTopLeft"],
            "ol/tilegrid/WMTS": [["default", "WMTSTileGrid"]],
            "ol/tilegrid/tilegrid": [["default", "TileGrid"]],
            "ol/format": ["GeoJSON", "WKT"]
          }
        ],
        resolvers: [ElementPlusResolver()],
        dts: path.resolve(pathSrc + "/autoImport", "auto-imports.d.ts"),
        // 自动导入方法所在的文件目录 - 这里添加utils 和 store
        dirs: [path.resolve(pathSrc + "/utils"), path.resolve(pathSrc + "/store")]
      }),
      /** 自动导入组件 */
      Components({
        // 其他自定义组件
        resolvers: [ElementPlusResolver()],
        // 自动导入组件所在的文件目录
        dirs: [path.resolve(pathSrc + "/components")],
        // 生成的 .d.ts 文件路径
        dts: path.resolve(pathSrc + "/autoImport", "components.d.ts")
      })
    ],
    /** Vitest 单元测试配置：https://cn.vitest.dev/config */
    test: {
      include: ["tests/**/*.test.ts"],
      environment: "jsdom"
    }
  }
}
