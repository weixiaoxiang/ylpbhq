<script lang="ts" setup>
import { ref, watch } from "vue"

/**
 * 音视频播放器组件
 * 用于显示本地或远程用户的音视频流，并提供控制功能
 */

/**
 * 组件属性定义
 */
interface Props {
  /** 显示名称，如"本地频道"或"远程用户1" */
  name: string
  /** DOM元素ID，用于挂载视频流 */
  domId: string
  /** 音视频流对象，包含视频轨道和音频轨道 */
  stream: {
    videoTrack?: any
    audioTrack?: any
    hasVideo?: boolean
    hasAudio?: boolean
    hasHangup?: boolean
    uid?: string | number
  } | null
  /** 流类型，区分本地流和远程流 */
  type?: "local" | "remote"
}

/**
 * 设置属性默认值
 */
const props = withDefaults(defineProps<Props>(), {
  name: "",
  domId: "",
  stream: null,
  type: "local"
})

/**
 * 定义组件事件
 */
const emit = defineEmits<{
  /** 视频开关状态变化事件 */
  (e: "onVideoToggle", data: { enabled: boolean; uid: string | number; type: "local" | "remote" }): void
  /** 音频开关状态变化事件 */
  (e: "onAudioToggle", data: { enabled: boolean; uid: string | number; type: "local" | "remote" }): void
  /** 挂断事件 */
  (e: "onHang", hasHangup: boolean): void
  /** 全屏事件 */
  (e: "onFullscreen"): void
}>()

/**
 * 控制按钮状态
 */
const isVideoEnabled = ref(true) // 视频是否启用
const isAudioEnabled = ref(true) // 音频是否启用
const isHangup = ref(true) // 是否挂断,默认是挂断的

/**
 * 视频开关控制
 * 切换视频轨道的启用状态
 */
const toggleVideo = () => {
  if (props.stream?.videoTrack) {
    isVideoEnabled.value = !isVideoEnabled.value
    props.stream.videoTrack.setEnabled(isVideoEnabled.value)
    emit("onVideoToggle", {
      enabled: isVideoEnabled.value,
      uid: props.stream?.uid || "",
      type: props.type
    })
  }
}

/**
 * 音频开关控制
 * 切换音频轨道的启用状态
 */
const toggleAudio = () => {
  if (props.stream?.audioTrack) {
    isAudioEnabled.value = !isAudioEnabled.value
    props.stream.audioTrack.setEnabled(isAudioEnabled.value)
    emit("onAudioToggle", {
      enabled: isAudioEnabled.value,
      uid: props.stream?.uid || "",
      type: props.type
    })
  }
}

/**
 * 处理挂断操作
 * 触发挂断事件
 */
const handleHang = () => {
  isHangup.value = !isHangup.value
  emit("onHang", isHangup.value)
}

/**
 * 处理全屏操作
 * 将视频元素设置为全屏显示
 */
const handleFullscreen = () => {
  const element = document.getElementById(props.domId)
  if (element?.requestFullscreen) {
    element.requestFullscreen()
  }
  emit("onFullscreen")
}

/**
 * 监听流变化，更新按钮状态
 */
watch(
  () => props.stream,
  (newStream) => {
    if (newStream?.videoTrack) {
      isVideoEnabled.value = newStream.videoTrack.enabled
    }
    if (newStream?.audioTrack) {
      isAudioEnabled.value = newStream.audioTrack.enabled
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="stream-player">
    <!-- 标题栏 -->
    <div class="stream-title">
      <span>{{ name }}</span>
    </div>

    <!-- 视频容器 -->
    <div
      class="stream-video"
      :id="domId"
    >
      <!-- 默认头像，当没有视频流时显示 -->
      <div
        v-if="!stream?.videoTrack"
        class="default-avatar"
      >
        <img src="@/assets/images/emergencyCommand/defaultAvator.png" />
      </div>
    </div>

    <!-- 控制按钮栏 -->
    <div class="stream-controls">
      <!-- 视频开关按钮 -->
      <img
        :src="$fun.getImg(`emergencyCommand/${isVideoEnabled ? 'video-active' : 'video'}.png`)"
        @click="toggleVideo"
      />
      <!-- 音频开关按钮 -->
      <img
        :src="$fun.getImg(`emergencyCommand/${isAudioEnabled ? 'voice-active' : 'voice'}.png`)"
        @click="toggleAudio"
      />
      <!-- 挂断按钮 -->
      <img
        v-if="type === 'local'"
        :src="$fun.getImg(`emergencyCommand/${isHangup ? 'phone-active' : 'phone'}.png`)"
        @click="handleHang"
      />
      <!-- 全屏按钮 -->
      <img
        src="@/assets/images/emergencyCommand/fullscreen.png"
        @click="handleFullscreen"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 视频播放器容器 */
.stream-player {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgb(15, 44, 75);
  border-radius: 8px;
  overflow: hidden;

  /* 标题栏样式 */
  .stream-title {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 4px;

    span {
      color: #fff;
      font-size: 14px;
    }
  }

  /* 视频容器样式 */
  .stream-video {
    width: 100%;
    height: 100%;

    /* 默认头像样式 */
    .default-avatar {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 20%;
        object-fit: cover;
      }
    }
  }

  /* 控制按钮栏样式 */
  .stream-controls {
    position: absolute;
    bottom: 5px;
    right: 5px;
    display: flex;
    gap: 5px;
    z-index: 10;

    /* 按钮样式 */
    img {
      width: 20px;
      height: 20px;
      cursor: pointer;
      transition: all 0.3s;

      /* 鼠标悬停效果 */
      &:hover {
        transform: scale(1.1);
      }

      /* 点击效果 */
      &:active {
        transform: scale(0.9);
      }
    }
  }
}

/* 全屏模式样式 */
:deep(.fullscreen) {
  .stream-video {
    object-fit: contain;
  }

  .stream-controls {
    bottom: 30px;
  }
}
</style>
