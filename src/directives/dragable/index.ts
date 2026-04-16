import type { Directive, DirectiveBinding } from "vue"
import { debounce } from "lodash-es"

interface DragOptions {
  // 是否禁用
  disabled?: boolean
  // 边界
  boundary?: {
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  }
  containParent?: boolean // 是否被限制在父元素中
  onDragStart?: (e: MouseEvent) => void
  onDragging?: (e: MouseEvent) => void
  onDragEnd?: (e: MouseEvent) => void
}

declare module "@vue/runtime-core" {
  interface HTMLElement {
    _dragCleanup?: () => void
  }
}

export const vDrag: Directive<HTMLElement, DragOptions> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<DragOptions>) {
    const options: DragOptions = {
      containParent: false,
      ...binding.value
    }

    if (options.disabled) return

    let startX = 0
    let startY = 0
    let isDragging = false
    let initialLeft = 0
    let initialTop = 0
    let currentLeft = 0
    let currentTop = 0

    function getParentBoundary() {
      const parent = el.parentElement
      if (!parent) return null

      const parentRect = parent.getBoundingClientRect()
      const parentStyle = window.getComputedStyle(parent)
      const parentPaddingLeft = parseFloat(parentStyle.paddingLeft) || 0
      const parentPaddingTop = parseFloat(parentStyle.paddingTop) || 0
      const parentPaddingRight = parseFloat(parentStyle.paddingRight) || 0
      const parentPaddingBottom = parseFloat(parentStyle.paddingBottom) || 0

      return {
        minX: parentPaddingLeft,
        maxX: parentRect.width - el.offsetWidth - parentPaddingRight,
        minY: parentPaddingTop,
        maxY: parentRect.height - el.offsetHeight - parentPaddingBottom
      }
    }

    const debouncedDrag = debounce((e: MouseEvent) => {
      options.onDragging?.(e)
    }, 16)

    function initPosition() {
      const computedStyle = window.getComputedStyle(el)
      const position = computedStyle.position

      // 获取初始位置
      if (position === "fixed") {
        initialLeft = parseFloat(computedStyle.left) || 0
        initialTop = parseFloat(computedStyle.top) || 0
      } else {
        initialLeft = el.offsetLeft
        initialTop = el.offsetTop
      }

      currentLeft = initialLeft
      currentTop = initialTop

      // 设置定位方式
      if (position === "static") {
        el.style.position = "absolute"
      }
    }

    function isDisabledTarget(target: HTMLElement): boolean {
      // 检查点击的元素是否包含禁用类名
      if (target.classList.contains("v-dragable--disable")) {
        return true
      }

      // 检查点击的元素的父级是否包含禁用类名（向上查找直到当前拖动元素）
      let current = target.parentElement
      while (current && current !== el) {
        if (current.classList.contains("v-dragable--disable")) {
          return true
        }
        current = current.parentElement
      }

      return false
    }
    function handleMouseDown(e: MouseEvent) {
      if (e.button !== 0) return

      // 检查目标元素是否禁用拖动
      const target = e.target as HTMLElement
      if (isDisabledTarget(target)) {
        return
      }

      e.preventDefault()
      isDragging = true

      // 记录鼠标按下时的初始位置
      startX = e.clientX - currentLeft
      startY = e.clientY - currentTop

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      options.onDragStart?.(e)
    }

    function handleMouseMove(e: MouseEvent) {
      if (!isDragging) return
      e.preventDefault()

      // 计算新位置（相对于初始位置的偏移）
      let newX = e.clientX - startX
      let newY = e.clientY - startY

      // 处理边界
      let boundary = options.boundary
      if (options.containParent) {
        boundary = getParentBoundary() || boundary
      }

      if (boundary) {
        const { minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity } = boundary

        newX = Math.min(Math.max(newX, minX), maxX)
        newY = Math.min(Math.max(newY, minY), maxY)
      }

      // 更新位置
      currentLeft = newX
      currentTop = newY
      el.style.left = `${newX}px`
      el.style.top = `${newY}px`

      debouncedDrag(e)
    }

    function handleMouseUp(e: MouseEvent) {
      if (!isDragging) return
      e.preventDefault()

      isDragging = false
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      options.onDragEnd?.(e)
    }

    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return

      // 检查目标元素是否禁用拖动
      const target = e.target as HTMLElement
      if (isDisabledTarget(target)) {
        return
      }

      e.preventDefault()

      const touch = e.touches[0]
      const mouseEvent = new MouseEvent("mousedown", {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0
      })
      handleMouseDown(mouseEvent)
    }

    function handleTouchMove(e: TouchEvent) {
      if (e.touches.length !== 1) return
      e.preventDefault()

      const touch = e.touches[0]
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
      })
      handleMouseMove(mouseEvent)
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault()
      const mouseEvent = new MouseEvent("mouseup")
      handleMouseUp(mouseEvent)
    }

    // 初始化样式和位置
    el.style.cursor = "move"
    el.style.userSelect = "none"
    el.style.touchAction = "none"

    // 确保父元素是相对定位
    if (options.containParent && el.parentElement) {
      const parentStyle = window.getComputedStyle(el.parentElement)
      if (parentStyle.position === "static") {
        el.parentElement.style.position = "relative"
      }
    }

    // 初始化位置
    initPosition()

    // 添加事件监听
    el.addEventListener("mousedown", handleMouseDown)
    el.addEventListener("touchstart", handleTouchStart, { passive: false })
    el.addEventListener("touchmove", handleTouchMove, { passive: false })
    el.addEventListener("touchend", handleTouchEnd)

    // 存储清理函数
    el._dragCleanup = () => {
      el.removeEventListener("mousedown", handleMouseDown)
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove", handleTouchMove)
      el.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      debouncedDrag.cancel()
    }
  },

  beforeUnmount(el: HTMLElement) {
    el._dragCleanup?.()
  },

  updated(el: HTMLElement, binding: DirectiveBinding<DragOptions>) {
    const oldValue = binding.oldValue
    const newValue = binding.value

    if (oldValue?.disabled !== newValue?.disabled) {
      if (newValue?.disabled) {
        el.style.cursor = "default"
        el._dragCleanup?.()
      } else {
        el.style.cursor = "move"
        vDrag.mounted(el, binding)
      }
    }
  }
}
