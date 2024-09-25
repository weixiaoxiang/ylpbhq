/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography"

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff0000"
      },
      fontFamily: {
        sans: ["微软雅黑", "sans-serif"]
      },
      fontSize: {
        12: ["12px", { lineHeight: "2em" }]
      },
      borderColor: {
        DEFAULT: ""
      },
      boxShadow: {
        base: "0 0 5px 1px rgba(0,0,0,0.1)"
      },
      boxShadowColor: {
        DEFAULT: ""
      }
    }
  },
  plugins: [
    // typography:在长文本标签添加prose类名，可以自动应用合适的样式
    typography,
    // addComponents:添加自定义组件
    function ({ addComponents }) {
      const components = {
        ".bgbox": {
          "@apply bg-center bg-no-repeat bg-cover": {}
        },
        ".flexbox": {
          "@apply flex items-center justify-center": {}
        },
        ".flexbox-col": {
          "@apply flex flex-col items-center justify-center": {}
        }
      }
      addComponents(components)
    }
  ],
  // corePlugins:禁用某些插件
  corePlugins: {
    preflight: true,
    // 禁用媒体相关的组件样式
    container: false,
    screens: false
  }
}
