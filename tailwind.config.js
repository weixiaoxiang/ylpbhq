/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography"
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff0000",
        secondary: "#f5f5f5"
      },
      fontFamily: {
        sans: ["微软雅黑", "sans-serif"]
      },
      fontSize: {
        12: ["12px", { lineHeight: "2em" }]
      },
      borderColor: {
        DEFAULT: "red"
      },
      boxShadow: {
        base: "0 0 5px 1px rgba(0,0,0,0.3)"
      }
    }
  },
  // typography:在长文本标签添加prose类名，可以自动应用合适的样式
  plugins: [typography],
  // corePlugins:禁用某些插件
  corePlugins: {
    opacity: false
  }
}
