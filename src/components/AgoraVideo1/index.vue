<script lang="ts" setup>
import AgoraRTC, {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack
} from "agora-rtc-sdk-ng"
import { onBeforeUnmount, onMounted, ref } from "vue"
import { ElMessage } from "element-plus"
import axios from "axios"
import StreamPlayer from "./StreamPlayer.vue"
/**
 * 音视频会议面板组件
 * 用于管理本地和远程用户的音视频流
 */

// Agora 配置
const appId = "71ded812263049b089243fcb5974b71f" // 替换为您的 Agora App ID
const channel = "7d72365eb983485397e3e3f9d460bdde" // 频道名称
const uid = 11112471 // 确保同一个频道中 UID 不重复就行
const appCertificate = "624eaaed49ba4cafb62765d440557637"
/**
 * Agora 客户端实例
 */
const client = ref<IAgoraRTCClient | null>(null)

/**
 * 本地音视频流
 * 包含本地用户的摄像头视频和麦克风音频
 */
interface LocalStreamType {
  videoTrack: ICameraVideoTrack | null
  audioTrack: IMicrophoneAudioTrack | null
  hasHangup: boolean
}

const localStream = ref<LocalStreamType>({
  videoTrack: null,
  audioTrack: null,
  hasHangup: true
})

/**
 * 远程音视频流数组
 * 存储所有远程用户的音视频流
 */
interface RemoteStreamType {
  uid: string | number
  videoTrack: IRemoteVideoTrack | null
  audioTrack: IRemoteAudioTrack | null
  hasVideo: boolean
  hasAudio: boolean
}

const remoteStreams = ref<RemoteStreamType[]>([])

/**
 * 添加远程流
 * @param uid 用户ID
 * @param videoTrack 视频轨道（可选）
 * @param audioTrack 音频轨道（可选）
 */
const addRemoteStream = (
  uid: string | number,
  videoTrack?: IRemoteVideoTrack | null,
  audioTrack?: IRemoteAudioTrack | null
) => {
  // 检查是否已存在该用户的流
  const existingIndex = remoteStreams.value.findIndex((stream) => stream.uid === uid)

  if (existingIndex !== -1) {
    // 如果已存在，更新流信息
    const stream = remoteStreams.value[existingIndex]
    if (videoTrack !== undefined) {
      stream.videoTrack = videoTrack
      stream.hasVideo = !!videoTrack
    }
    if (audioTrack !== undefined) {
      stream.audioTrack = audioTrack
      stream.hasAudio = !!audioTrack
    }
    console.log(`更新远程用户 ${uid} 的流`)
  } else {
    // 如果不存在，添加新的流
    const newStream: RemoteStreamType = {
      uid,
      videoTrack: videoTrack || null,
      audioTrack: audioTrack || null,
      hasVideo: !!videoTrack,
      hasAudio: !!audioTrack
    }
    remoteStreams.value.push(newStream)
    console.log(`添加远程用户 ${uid} 的流`)
  }
}

/**
 * 删除远程流
 * @param uid 用户ID
 */
const removeRemoteStream = (uid: string | number) => {
  const index = remoteStreams.value.findIndex((stream) => stream.uid === uid)
  if (index !== -1) {
    // 停止播放轨道
    const stream = remoteStreams.value[index]
    if (stream.videoTrack) {
      stream.videoTrack.stop?.()
    }
    if (stream.audioTrack) {
      stream.audioTrack.stop?.()
    }

    // 从数组中移除
    remoteStreams.value.splice(index, 1)
    console.log(`删除远程用户 ${uid} 的流`)
  }
}

/**
 * 清空所有远程流
 */
const clearRemoteStreams = () => {
  // 停止所有远程流
  remoteStreams.value.forEach((stream) => {
    if (stream.videoTrack) {
      stream.videoTrack.stop?.()
    }
    if (stream.audioTrack) {
      stream.audioTrack.stop?.()
    }
  })

  // 清空数组
  remoteStreams.value = []
  console.log("清空所有远程流")
}

/**
 * 获取指定用户的远程流
 * @param uid 用户ID
 * @returns 远程流对象或undefined
 */
const getRemoteStream = (uid: string | number) => {
  return remoteStreams.value.find((stream) => stream.uid === uid)
}

/**
 * 更新远程流的媒体轨道
 * @param uid 用户ID
 * @param mediaType 媒体类型
 * @param track 轨道对象
 */
const updateRemoteStreamTrack = (
  uid: string | number,
  mediaType: "video" | "audio",
  track: IRemoteVideoTrack | IRemoteAudioTrack | null
) => {
  const stream = getRemoteStream(uid)
  if (stream) {
    if (mediaType === "video") {
      stream.videoTrack = track as IRemoteVideoTrack
      stream.hasVideo = !!track
    } else if (mediaType === "audio") {
      stream.audioTrack = track as IRemoteAudioTrack
      stream.hasAudio = !!track
    }
    console.log(`更新远程用户 ${uid} 的 ${mediaType} 轨道`)
  }
}

/**
 * 初始化 Agora 客户端
 */
const initAgoraClient = () => {
  // 创建 Agora 客户端
  client.value = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  // 注册事件处理函数
  client.value.on("user-published", handleUserPublished)
  client.value.on("user-unpublished", handleUserUnpublished)
  client.value.on("user-joined", handleUserJoined)
  client.value.on("user-left", handleUserLeft)
  console.log("Agora 客户端初始化完成")
}

/**
 * 获得agora的token
 */
const getAgoraToken = async () => {
  const { data }: any = await axios.post(`/agoraToken/builderToken`, {
    appCertificate: appCertificate,
    appId: appId,
    channelName: channel,
    uid: uid
  })
  return data.token
}

/**
 * 加入频道
 */
const joinChannel = async () => {
  if (!client.value) return

  try {
    const token = await getAgoraToken()
    if (!token) {
      return ElMessage.info("获取Agora的鉴权失败")
    }
    // 加入频道
    await client.value.join(appId, channel, token, uid)
    console.log("成功加入频道:", channel)

    // 创建并发布本地音视频流
    await createLocalStream()
  } catch (error) {
    console.error("加入频道失败:", error)
  }
}

/**
 * 创建本地音视频流
 */
const createLocalStream = async () => {
  if (!client.value) return

  try {
    // 创建本地视频轨道
    const videoTrack = await AgoraRTC.createCameraVideoTrack()
    localStream.value.videoTrack = videoTrack

    // 创建本地音频轨道
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    localStream.value.audioTrack = audioTrack

    // 发布本地流
    await client.value.publish([videoTrack, audioTrack])
    console.log("本地流发布成功")

    // 播放本地视频
    videoTrack.play("local-video")
  } catch (error) {
    console.error("创建本地流失败:", error)
  }
}

/**
 * 处理远程用户发布流事件
 */
const handleUserPublished = async (user: any, mediaType: "video" | "audio") => {
  console.log(user, mediaType, "处理远程用户发布流事件111")

  if (!client.value) return

  try {
    // 订阅远程用户的流
    await client.value.subscribe(user, mediaType)
    console.log(`订阅远程用户 ${user.uid} 的 ${mediaType} 流成功`)

    // 检查用户是否已存在，如果不存在则添加
    let stream = getRemoteStream(user.uid)
    if (!stream) {
      addRemoteStream(user.uid)
      stream = getRemoteStream(user.uid)
    }

    // 更新对应的媒体轨道
    if (mediaType === "video" && stream) {
      updateRemoteStreamTrack(user.uid, "video", user.videoTrack)
      // 播放远程视频
      const streamIndex = remoteStreams.value.findIndex((s) => s.uid === user.uid)
      if (streamIndex !== -1) {
        user.videoTrack.play(`remote-video-${streamIndex}`)
      }
    } else if (mediaType === "audio") {
      updateRemoteStreamTrack(user.uid, "audio", user.audioTrack)
    }
  } catch (error) {
    console.error(`订阅远程用户 ${user.uid} 的 ${mediaType} 流失败:`, error)
  }
}

/**
 * 处理远程用户取消发布流事件
 */
const handleUserUnpublished = (user: any, mediaType: string) => {
  // console.log(`远程用户 ${user.uid} 取消发布 ${mediaType} 流`)
  console.log(user, mediaType, "处理远程用户取消发布流事件111")

  // 更新对应的媒体轨道为null
  if (mediaType === "video") {
    updateRemoteStreamTrack(user.uid, "video", null)
  } else if (mediaType === "audio") {
    updateRemoteStreamTrack(user.uid, "audio", null)
  }
}

/**
 * 处理远程用户加入事件
 */
const handleUserJoined = (user: any) => {
  // console.log(`远程用户 ${user.uid} 加入频道`)
  console.log(user, "处理远程用户加入事件111")

  // 检查是否已有该用户的流，如果没有则添加
  const existingStream = getRemoteStream(user.uid)
  if (!existingStream) {
    addRemoteStream(user.uid)
  }
}

/**
 * 处理远程用户离开事件
 */
const handleUserLeft = (user: any) => {
  // console.log(`远程用户 ${user.uid} 离开频道`)
  console.log(user, "处理远程用户离开事件111")

  // 删除该用户的流
  removeRemoteStream(user.uid)
}

/**
 * 离开频道
 */
const leaveChannel = async () => {
  if (!client.value) return

  try {
    // 停止并关闭本地流
    if (localStream.value.videoTrack) {
      localStream.value.videoTrack.stop()
      localStream.value.videoTrack.close()
    }
    if (localStream.value.audioTrack) {
      localStream.value.audioTrack.stop()
      localStream.value.audioTrack.close()
    }
    localStream.value.videoTrack = null
    localStream.value.audioTrack = null

    // 清空所有远程流
    clearRemoteStreams()

    // 离开频道
    await client.value.leave()
    console.log("成功离开频道")
  } catch (error) {
    console.error("离开频道失败:", error)
  }
}

/**
 * 处理视频开关事件
 * @param data 包含启用状态、用户ID和类型的数据对象
 */
const handleVideoToggle = (data: { enabled: boolean; uid: string | number; type: "local" | "remote" }) => {
  console.log("视频状态:", data)

  if (data.type === "local") {
    // 控制本地视频
    if (localStream.value.videoTrack) {
      localStream.value.videoTrack.setEnabled(data.enabled)
    }
  } else {
    // 控制远程视频（通常远程视频由远程用户控制，这里可以做一些UI反馈）
    const stream = getRemoteStream(data.uid)
    if (stream?.videoTrack) {
      // 可以通过信令服务器通知远程用户，或者本地静音远程视频
      console.log(`请求远程用户 ${data.uid} ${data.enabled ? "开启" : "关闭"} 视频`)
    }
  }
}

/**
 * 处理音频开关事件
 * @param data 包含启用状态、用户ID和类型的数据对象
 */
const handleAudioToggle = (data: { enabled: boolean; uid: string | number; type: "local" | "remote" }) => {
  console.log("音频状态:", data)

  if (data.type === "local") {
    // 控制本地音频
    if (localStream.value.audioTrack) {
      localStream.value.audioTrack.setEnabled(data.enabled)
    }
  } else {
    // 控制远程音频播放
    const stream = getRemoteStream(data.uid)
    if (stream?.audioTrack) {
      // 本地可以控制是否播放远程音频
      stream.audioTrack.setVolume(data.enabled ? 100 : 0)
    }
  }
}

/**
 * 处理挂断事件
 * 当用户点击挂断按钮时触发
 */
const handleHang = (hasHangup: boolean) => {
  console.log("挂断", hasHangup)
  if (hasHangup) {
    leaveChannel()
  } else {
    joinChannel()
  }
}

// 组件挂载时初始化并加入频道
onMounted(() => {
  initAgoraClient()
  // joinChannel()
})

// 组件卸载前离开频道
onBeforeUnmount(() => {
  leaveChannel()
})

// 暴露方法供外部调用
defineExpose({
  // 流管理方法
  addRemoteStream,
  removeRemoteStream,
  clearRemoteStreams,
  getRemoteStream,
  updateRemoteStreamTrack,

  // 频道管理方法
  joinChannel,
  leaveChannel,

  // 获取当前状态
  remoteStreams: remoteStreams.value,
  localStream: localStream.value,
  client: client.value
})
</script>

<template>
  <div class="agora-video-panel">
    <div class="agora-view">
      <!-- 本地视频区域 -->
      <div class="agora-video-local">
        <StreamPlayer
          name="本地频道"
          :stream="localStream"
          domId="local-video"
          type="local"
          @onVideoToggle="handleVideoToggle"
          @onAudioToggle="handleAudioToggle"
          @onHang="handleHang"
        />
      </div>

      <!-- 远程视频区域 -->
      <div class="agora-video-remote">
        <StreamPlayer
          v-for="(stream, index) in remoteStreams"
          :key="index"
          :name="`远程用户 ${stream.uid}`"
          :stream="stream"
          :domId="`remote-video-${index}`"
          type="remote"
          @onVideoToggle="handleVideoToggle"
          @onAudioToggle="handleAudioToggle"
          @onHang="handleHang"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 视频会议面板容器 */
.agora-video-panel {
  height: 100%;
  width: 100%;

  /* 视频视图布局 */
  .agora-view {
    height: 100%;
    width: 100%;
    display: flex;
    gap: 10px;

    /* 本地视频区域样式 */
    .agora-video-local {
      width: 40%;
      height: 100%;
    }

    /* 远程视频区域样式 */
    .agora-video-remote {
      width: 60%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-rows: 1fr;
      gap: 10px;
    }
  }
}
</style>
