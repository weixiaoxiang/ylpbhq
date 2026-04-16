/// <reference types="vitest" />

import vue from "@vitejs/plugin-vue"
import vueJsx from "@vitejs/plugin-vue-jsx"
import path, { resolve } from "path"
import { visualizer } from "rollup-plugin-visualizer"
import copy from "rollup-plugin-copy"
import AutoImport from "unplugin-auto-import/vite"
import IconsResolver from "unplugin-icons/resolver"
import Icons from "unplugin-icons/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import Components from "unplugin-vue-components/vite"
import { type ConfigEnv, type UserConfigExport, loadEnv } from "vite"
import viteCompression from "vite-plugin-compression"
import { createHtmlPlugin } from "vite-plugin-html"
import { createSvgIconsPlugin } from "vite-plugin-svg-icons"
import svgLoader from "vite-svg-loader"
const pathSrc = path.resolve(__dirname, "src")
/** 配置项文档：https://cn.vitejs.dev/config */
export default (configEnv: ConfigEnv): UserConfigExport => {
  const viteEnv = loadEnv(configEnv.mode, process.cwd()) as ImportMetaEnv
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
    css: {
      // CSS 预处理器
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          api: "modern-compiler",
          additionalData: `
            @use "@/styles/variables.scss" as *;
          `
        }
      }
    },
    server: {
      /** 设置 HMR */
      hmr: true,
      /** 设置 host: true 才可以使用 Network 的形式，以 IP 访问项目 */
      host: true, // host: "0.0.0.0"
      /** 端口号 */
      port: 4173,
      /** 是否自动打开浏览器 */
      open: false,
      /** 跨域设置允许 */
      cors: true,
      /** 端口被占用时，是否直接退出 */
      strictPort: false,
      /** 接口代理 */
      proxy: {
        "/api": {
          // target: "http://192.16.16.2:9001",
          // target: "http://192.16.16.85:9289",
          // target: "http://183.162.224.56:9001",
          target: "http://39.145.39.46:9001",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true
          // rewrite: (path) => path.replace(/^\/api/, "")
        },
        "/statisUrl": {
          // target: "http://192.16.16.2:9001",
          // target: "http://183.162.224.56:9001",
          target: "http://39.145.39.46:9001",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/statisUrl/, "")
        },
        "/wrjUrl": {
          // target: "http://192.16.16.2:9001",
          // target: "http://183.162.224.56:9001",
          target: "http://39.145.39.46:9000",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/wrjUrl/, "")
        },
        // 车辆静态资源
        "/vehicleStaticUrl": {
          // target: "http://49.4.7.55:6040",
          target: "http://39.145.39.46:9001",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/vehicleStaticUrl/, "")
        },
        // 火情预警静态资源
        "/fireStaticUrl": {
          // target: "http://119.3.240.181:8032",
          target: "http://39.145.39.46:9001/", // 20250821修改
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/fireStaticUrl/, "")
        },
        // 红外相机静态资源
        "/infraRedStaticUrl": {
          target: "http://112.26.83.124:8005/fileApi/",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/infraRedStaticUrl/, "")
        },
        // 红外相机静态资源2
        "/redCareamStaticUrl": {
          // target: "http://ylp.ecoheze.com:8028/weed/",
          target: "http://39.145.39.46:9001/",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/redCareamStaticUrl/, "")
        },
        // 保护区简介视频静态资源
        "/briefIntroductionVideo": {
          target: "http://183.162.224.56:9001/",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/briefIntroductionVideo/, "")
        },
        "/vtourProxy": {
          target: "http://119.3.240.181:8032/",
          ws: true,
          /** 是否允许跨域 */
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/vtourProxy/, "")
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
        },
        "/imageApi": {
          // target: "http://192.16.16.2:9003/",
          target: "http://39.145.39.46:9001/",
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp("^" + "/imageApi"), "")
        },
        // 声网sdk-token
        "/agoraToken": {
          // target: "http://192.16.16.2:9003/",
          target: "http://114.115.134.190:8006",
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp("^" + "/agoraToken"), "")
        }
      },
      /** 预热常用文件，提高初始页面加载速度 */
      warmup: {
        clientFiles: ["./src/layouts/**/*.vue"]
      }
    },
    build: {
      /** 自定义打包输出目录 */
      outDir: "鹞落坪Web_dist",
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
            vue: ["element-plus", "@element-plus/icons-vue"],
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
          })
          // 生成report报告页面
          // visualizer({
          //   filename: "dist/report.html",
          //   open: false,
          //   gzipSize: true,
          //   brotliSize: true
          // })
        ]
      }
    },
    // optimizeDeps: {
    //   exclude: ["ol/style"] // 排除 ol/style 的预构建
    // },
    /** 混淆器 */
    esbuild:
      configEnv.mode === "development"
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
      copy({
        targets: [
          {
            src: "node_modules/@liveqing/liveplayer-v3/dist/component/liveplayer-lib.min.js",
            dest: "public/liveplayer-v3"
          }
        ]
      }),
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
        // 自动导入的库
        imports: [
          "vue",
          "vue-router",
          "pinia",
          {
            axios: [
              // 自动导入 axios 的默认导出
              ["default", "axios"]
            ]
          },
          // ol
          {
            ol: [
              // 命名导入，相当于会自动添加 import { Map as olMap } from "ol";
              // 不能使用Map命名，不然与js内置的Map函数同名，导致ts类型推导出现错误,还有Image、Text
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
            "ol/layer": [["Tile", "TileLayer"], ["Vector", "VectorLayer"], "VectorImage"],
            "ol/source": [
              "WMTS",
              "OSM",
              "XYZ",
              "TileWMS",
              ["Tile", "TileSource"],
              ["Vector", "VectorSource"],
              "Cluster"
            ],
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
        resolvers: [
          // 自动导入图标组件步骤1
          IconsResolver({
            prefix: "Icon"
          }),
          ElementPlusResolver()
        ],
        dts: path.resolve(pathSrc + "/autoImport", "auto-imports.d.ts"),
        // 自动导入方法所在的文件目录 - 这里添加utils 和 store
        dirs: [
          path.resolve(pathSrc + "/hooks/**/*"),
          path.resolve(pathSrc + "/utils/**/*"),
          path.resolve(pathSrc + "/store/**/*")
        ],
        // ESLint配置文件,不然npm run lint:eslint会报错
        eslintrc: {
          enabled: true, // 生成 ESLint 配置文件
          filepath: "./.eslintrc-auto-import.js", // 配置文件路径
          globalsPropValue: true // 将自动导入的函数添加到全局变量
        }
      }),
      /** 自动导入组件 */
      Components({
        // 其他自定义组件
        resolvers: [
          // 自动导入图标组件步骤2
          IconsResolver({
            enabledCollections: ["ep"]
          }),
          // 使用unplugin-vue-components按需加载样式，开发环境会导致项目异常卡顿
          // 导致原因：vite会预加载style，当首次启动 vite 服务时会对 style 进行依赖预构建，，因为element-plus的按需样式会导入大量style文件，导致页面会卡住直至style构建完成
          // https://github.com/antfu/unplugin-vue-components/issues/361
          //  这里开发环境不按需加载样式，生产环境才按需加载样式
          ElementPlusResolver({
            importStyle: configEnv.mode === "development" ? false : "sass"
          })
        ],
        // 自动导入组件所在的文件目录
        dirs: [path.resolve(pathSrc + "/components")],
        // 生成的 .d.ts 文件路径
        dts: path.resolve(pathSrc + "/autoImport", "components.d.ts")
      }),
      // 使用unplugin-vue-components按需加载样式，开发环境会导致项目异常卡顿
      // 导致原因：vite会预加载style，当首次启动 vite 服务时会对 style 进行依赖预构建，，因为element-plus的按需样式会导入大量style文件，导致页面会卡住直至style构建完成
      // https://github.com/antfu/unplugin-vue-components/issues/361
      // 这里自定义一个vite插件，更改src/main.js内容，开发环境全局引入样式
      {
        name: "import-element-plus-style",
        transform(code, id) {
          if (/src\/main.ts$/.test(id)) {
            if (configEnv.mode === "development") {
              return {
                code: `${code};import 'element-plus/dist/index.css';`,
                map: null
              }
            } else {
              return {
                code: `${code};import 'element-plus/theme-chalk/src/message-box.scss';import 'element-plus/theme-chalk/src/message.scss';`,
                map: null
              }
            }
          }
        }
      },
      /** 自动导入图标组件步骤3 */
      Icons({
        autoInstall: true,
        compiler: "vue3"
      })
    ],
    /** Vitest 单元测试配置：https://cn.vitest.dev/config */
    test: {
      include: ["tests/**/*.test.ts"],
      environment: "jsdom"
    }
  }
}
