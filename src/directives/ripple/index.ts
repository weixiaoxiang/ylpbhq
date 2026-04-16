import type { Directive } from "vue"

interface RippleOptions {
  color?: string
  duration?: number
}

export const vRipple: Directive<HTMLElement, RippleOptions> = {
  mounted(el, binding) {
    const options = binding.value || {}
    function getRippleColor(): string {
      if (options.color) return options.color

      // 获取元素的背景色
      const elBgColor = window.getComputedStyle(el).backgroundColor
      // 如果背景色是透明的，使用默认的白色混合
      if (elBgColor === "rgba(0, 0, 0, 0)" || elBgColor === "transparent") {
        return "rgba(255, 255, 255, 0.35)" // 默认的半透明白色
      }

      // 将 rgb/rgba 转换为数组
      const rgbMatch = elBgColor.match(/\d+/g)
      if (!rgbMatch) return "rgba(255, 255, 255, 0.35)"

      // 与白色混合 (背景色权重 30%, 白色权重 70%)
      const r = Math.round(parseInt(rgbMatch[0]) * 0.3 + 255 * 0.7)
      const g = Math.round(parseInt(rgbMatch[1]) * 0.3 + 255 * 0.7)
      const b = Math.round(parseInt(rgbMatch[2]) * 0.3 + 255 * 0.7)

      return `rgba(${r}, ${g}, ${b}, 0.35)`
    }
    options.color = getRippleColor()
    el.style.position = "relative"
    el.style.overflow = "hidden"

    el.addEventListener("click", (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const size = Math.max(el.offsetWidth, el.offsetHeight)

      const ripple = document.createElement("span")
      ripple.className = "ripple-effect"

      ripple.style.position = "absolute"
      ripple.style.borderRadius = "50%"
      ripple.style.backgroundColor = options.color!
      ripple.style.width = ripple.style.height = `${size}px`
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`
      ripple.style.transform = "scale(0)"
      ripple.style.animation = `ripple ${options.duration || 600}ms linear`

      el.appendChild(ripple)

      ripple.addEventListener("animationend", () => {
        ripple.remove()
      })
    })
  }
}

// 添加全局样式
const style = document.createElement("style")
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)
