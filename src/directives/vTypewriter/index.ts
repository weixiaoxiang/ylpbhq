import { Directive, DirectiveBinding } from "vue"

// 配置项接口
interface TypewriterOptions {
  charInterval?: number
  showCursor?: boolean
  cursorChar?: string
  showCursorAfterComplete?: boolean
  onStart?: () => void
  onComplete?: () => void
}

// 元素扩展接口
interface TypewriterElement extends HTMLElement {
  _originalText?: string
  _timer?: number
  _cleanup?: () => void
}

// 生成唯一ID
function generateId(): string {
  return "_" + Math.random().toString(36).substr(2, 9)
}

// 创建样式
function createStyles(id: string, cursorChar: string = "|"): HTMLStyleElement {
  const styleId = `typewriter-style-${id}`
  let style = document.getElementById(styleId) as HTMLStyleElement

  if (!style) {
    style = document.createElement("style")
    style.id = styleId
    style.textContent = `
      [data-typewriter-id="${id}"] {
        white-space: pre-wrap;
        word-break: break-word;
        position: relative;
      }
      [data-typewriter-id="${id}"] .typewriter-content,
      [data-typewriter-id="${id}"] .typewriter-display {
        font: inherit;
        color: inherit;
        margin: inherit;
        padding: inherit;
        white-space: pre-wrap;
        word-break: break-word;
      }
      [data-typewriter-id="${id}"] .typewriter-content {
        visibility: hidden;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      [data-typewriter-id="${id}"].typing.with-cursor .typewriter-display::after {
        content: "${cursorChar}";
        animation: blink-${id} 0.7s infinite;
        font: inherit;
        color: inherit;
      }
      @keyframes blink-${id} {
        50% { opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  return style
}

// 开始打字效果
function startTyping(el: TypewriterElement, binding: DirectiveBinding<TypewriterOptions>): void {
  // 获取配置
  const options = binding.value || {}
  const {
    charInterval = 100,
    showCursor = true,
    cursorChar = "|",
    showCursorAfterComplete = true,
    onStart,
    onComplete
  } = options

  // 生成唯一标识
  const id = generateId()
  el.setAttribute("data-typewriter-id", id)

  // 创建样式
  const styleElement = createStyles(id, cursorChar)

  // 保存原始文本并创建显示结构
  const originalText = el.textContent || ""
  el._originalText = originalText

  // 创建内容容器
  const contentSpan = document.createElement("span")
  contentSpan.className = "typewriter-content"
  contentSpan.textContent = originalText
  contentSpan.setAttribute("aria-hidden", "true")

  // 创建显示容器
  const displaySpan = document.createElement("span")
  displaySpan.className = "typewriter-display"
  displaySpan.textContent = ""

  // 保存原始样式
  const computedStyle = window.getComputedStyle(el)
  const originalStyles = {
    font: computedStyle.font,
    color: computedStyle.color,
    margin: computedStyle.margin,
    padding: computedStyle.padding
  }

  // 清空原容器并添加新元素
  el.textContent = ""
  el.appendChild(contentSpan)
  el.appendChild(displaySpan)

  // 添加样式类
  el.classList.add("typing")
  if (showCursor) {
    el.classList.add("with-cursor")
  }

  // 调用开始回调
  if (typeof onStart === "function") {
    onStart()
  }

  // 开始打字
  let index = 0
  const maxIndex = originalText.length

  // 清理之前的定时器
  if (el._timer) {
    clearInterval(el._timer)
  }

  // 创建打字定时器
  el._timer = window.setInterval(() => {
    if (index < maxIndex) {
      displaySpan.textContent = originalText.slice(0, index + 1)
      index++
    } else {
      if (el._timer) {
        clearInterval(el._timer)
        el._timer = undefined
      }

      // 根据配置决定是否保留光标
      if (!showCursorAfterComplete) {
        el.classList.remove("with-cursor")
      }

      // 调用完成回调
      if (typeof onComplete === "function") {
        onComplete()
      }
    }
  }, charInterval)

  // 保存清理函数
  el._cleanup = () => {
    if (el._timer) {
      clearInterval(el._timer)
      el._timer = undefined
    }
    el.classList.remove("typing", "with-cursor")
    el.removeAttribute("data-typewriter-id")
    el.textContent = originalText // 恢复原始文本
    styleElement.remove()
  }
}

const typewriterDirective: Directive = {
  // 绑定时
  mounted(el: TypewriterElement, binding: DirectiveBinding<TypewriterOptions>) {
    if (!el.textContent?.trim()) {
      console.warn("[v-typewriter] 元素内容为空")
      return
    }
    startTyping(el, binding)
  },

  // 更新时
  updated(el: TypewriterElement, binding: DirectiveBinding<TypewriterOptions>) {
    // 如果文本内容变化，重新开始打字
    const contentEl = el.querySelector(".typewriter-content")
    const newText = contentEl ? contentEl.textContent : el.textContent
    if (newText !== el._originalText) {
      if (el._cleanup) {
        el._cleanup()
      }
      startTyping(el, binding)
    }
  },

  // 解绑时
  unmounted(el: TypewriterElement) {
    // 清理资源
    if (el._cleanup) {
      el._cleanup()
    }
  }
}

export default typewriterDirective
