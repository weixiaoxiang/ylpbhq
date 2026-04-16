<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"

interface Props {
  /** 同时存在的气泡最大数量 */
  maxBubbles?: number
  /** 同时存在的气泡最小数量 */
  minBubbles?: number
  /** 气泡最小尺寸(px) */
  minSize?: number
  /** 气泡最大尺寸(px) */
  maxSize?: number
  /** 动画最短持续时间(s) */
  minDuration?: number
  /** 动画最长持续时间(s) */
  maxDuration?: number
  /** 最小上升距离(px) */
  minDistance?: number
  /** 最大上升距离(px) */
  maxDistance?: number
  /** 气泡颜色数组 */
  colors?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  maxBubbles: 10,
  minBubbles: 5,
  minSize: 10,
  maxSize: 30,
  minDuration: 3,
  maxDuration: 8,
  minDistance: 100,
  maxDistance: 300,
  colors: () => ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeead"]
})

const containerRef = ref<HTMLElement>()
const bubbles: HTMLElement[] = []
let animationFrameId: number
let lastBubbleTime = 0
const BUBBLE_INTERVAL = 200 // 减少间隔时间

// 生成随机数的工具函数
function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// 随机获取颜色数组中的一个颜色
function getRandomColor(): string {
  return props.colors[Math.floor(Math.random() * props.colors.length)]
}

// 创建单个气泡
function createBubble(isInitial = false) {
  if (bubbles.length >= props.maxBubbles) return

  const bubble = document.createElement("div")
  bubble.className = "bubble"

  // 随机初始属性
  const size = random(props.minSize, props.maxSize)
  const left = random(size / 2, 100 - size / 2)
  const duration = random(props.minDuration, props.maxDuration)
  const distance = random(props.minDistance, props.maxDistance)
  const color = getRandomColor()

  // 减少延迟时间，使用更小的范围
  const delay = isInitial
    ? bubbles.length * 0.1 // 初始气泡延迟更短
    : random(0, 0.2) // 后续气泡延迟更短

  // 设置气泡样式
  bubble.style.cssText = `
    left: ${left}%;
    width: ${size}px;
    height: ${size}px;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
    --distance: ${-distance}px;
    --size: ${size}px;
    --bubble-color: ${color};
  `

  containerRef.value?.appendChild(bubble)
  bubbles.push(bubble)

  // 监听动画结束后移除气泡
  bubble.addEventListener("animationend", () => {
    const index = bubbles.indexOf(bubble)
    if (index > -1) {
      bubbles.splice(index, 1)
      bubble.remove()
      checkAndCreateBubbles()
    }
  })
}

// 检查是否需要创建新气泡
function checkAndCreateBubbles() {
  const currentCount = bubbles.length
  if (currentCount < props.minBubbles) {
    const needCreate = props.minBubbles - currentCount
    for (let i = 0; i < needCreate; i++) {
      createBubble(false)
    }
  }
}

// 持续生成气泡的动画循环
function animate(timestamp: number) {
  checkAndCreateBubbles()

  if (timestamp - lastBubbleTime > BUBBLE_INTERVAL && bubbles.length < props.maxBubbles) {
    createBubble(false)
    lastBubbleTime = timestamp
  }

  animationFrameId = requestAnimationFrame(animate)
}

// 初始化时创建气泡
function initBubbles() {
  for (let i = 0; i < props.minBubbles; i++) {
    createBubble(true)
  }
}

onMounted(() => {
  initBubbles()
  animate(0)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  bubbles.forEach((bubble) => bubble.remove())
})

defineExpose({
  createBubble
})
</script>
<template>
  <div
    class="bubble-animation-container"
    ref="containerRef"
  >
    <!-- 气泡会通过 JS 动态生成 -->
  </div>
</template>
<style lang="scss">
.bubble-animation-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 20px;
  box-sizing: border-box;
  .bubble {
    position: absolute;
    bottom: calc(var(--size) * -0.5);
    transform: translateX(-50%) translateY(0);
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, var(--bubble-color), rgba(255, 255, 255, 0.3));
    opacity: 0;
    animation: float cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
    will-change: transform, opacity;
    pointer-events: none;
  }

  @keyframes float {
    0% {
      transform: translateX(-50%) translateY(10px) scale(0.8);
      opacity: 0;
    }

    5% {
      transform: translateX(-50%) translateY(0) scale(1);
      opacity: 0.7;
    }

    95% {
      transform: translateX(-50%) translateY(calc(var(--distance) * 0.95)) scale(0.5);
      opacity: 0.2;
    }

    100% {
      transform: translateX(-50%) translateY(var(--distance)) scale(0.3);
      opacity: 0;
    }
  }
}
</style>
