<template>
  <div
    :id="'player' + uid"
    :key="uid"
    style="width: 100%; height: 100%; background-color: #000000; margin: 0 auto; position: relative"
  ></div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { nanoid } from "nanoid"
const props = defineProps({
  videoUrl: {
    type: String,
    default: ""
  },
  currentLayout: {
    type: Number,
    default: 1
  },
  isHistory: {
    type: Boolean,
    default: false
  }
})
let player: any = {}
const uid = ref(nanoid())
watch(
  () => [props.videoUrl, props.currentLayout],
  (newVal, oldVal) => {
    if (newVal[0] != oldVal[0]) {
      console.log("视频信息", newVal)
      nextTick(() => {
        play(props.videoUrl)
      })
    }
    if (newVal[1]) {
      nextTick(() => {
        if (player[uid.value]) {
          console.log("分屏", newVal)
          player[uid.value].JS_Resize()
        }
      })
    }
  }
)

// 倍速
const speed = ref(1)
const doubleSpeed = (num: number = 2) => {
  if (speed.value < 8) {
    speed.value = speed.value * num
    player[uid.value].JS_Fast(0).then(() => {
      // 加速
      ElMessage.info(`倍速：×${speed.value}`)
    })
  } else {
    ElMessage.info("倍速已达上限")
  }
}
const slowDown = (num: number = 2) => {
  if (speed.value > 0.125) {
    speed.value = speed.value / num
    player[uid.value].JS_Slow(0).then(() => {
      // 减速
      ElMessage.info(`倍速：×${speed.value}`)
    })
  } else {
    ElMessage.info("倍速已达下限")
  }
}

// emit
const emit = defineEmits<{
  firstFrameDisplay: [any]
}>()

const init = () => {
  // 设置播放容器的宽高并监听窗口大小变化
  window.addEventListener("resize", () => {
    player[uid.value].JS_Resize()
  })
}
//创建实例
let playURL: string | null = null
const create = (url: string) => {
  playURL = url
  let mode = 0
  let index = 0
  //@ts-ignore
  player[uid.value] = new window.JSPlugin({
    szId: "player" + uid.value,
    szBasePath: "/h5player/",
    iMaxSplit: 1,
    iCurrentSplit: 1,
    openDebug: false,
    oStyle: {
      borderSelect: "transparent"
    }
  })
  if (!props.isHistory) {
    player[uid.value].JS_Play(playURL, { playURL, mode }, index).then(
      () => {},
      (e: any) => {}
    )
  }
  // 事件回调绑定
  player[uid.value].JS_SetWindowControlCallback({
    windowEventSelect: function (iWndIndex: number) {
      //插件选中窗口回调
      // console.log('windowSelect callback: ', iWndIndex);
    },
    pluginErrorHandler: function (iWndIndex: number, iErrorCode: number, oError: any) {
      //插件错误回调
      console.log("插件错误回调: ", iWndIndex, iErrorCode, oError)
      ElMessage({
        message: "播放失败，错误码：" + iErrorCode, //"0x0190003e:取流失败，详情根据错误码在运管后台进行查询",
        duration: 5000,
        type: "info"
      })
    },
    //首帧显示回调
    firstFrameDisplay: function (index, iWidth, iHeight) {
      // do you want...
      // console.log("第一帧加载完成!!!!!!")
      emit("firstFrameDisplay")
    },

    windowEventOver: function (iWndIndex: number) {
      //鼠标移过回调
      //console.log(iWndIndex);
    },
    windowEventOut: function (iWndIndex: number) {
      //鼠标移出回调
      //console.log(iWndIndex);
    },
    windowEventUp: function (iWndIndex: number) {
      //鼠标mouseup事件回调
      //console.log(iWndIndex);
    },
    windowFullCcreenChange: function (bFull: boolean) {
      //全屏切换回调
      // console.log('fullScreen callback: ', bFull);
    },
    performanceLack: function () {
      //性能不足回调
      // console.log('performanceLack callback: ');
    }
  })
  let InterruptTime = 5
  player[uid.value].JS_SetInterruptTime(index, InterruptTime).then(
    () => {
      console.info("JS_SetInterruptTime success")
      // do you want...
    },
    (err: any) => {
      console.info("JS_SetInterruptTime failed")
      // do you want...
    }
  )
  player[uid.value].JS_SetConnectTimeOut(index, InterruptTime).then(
    () => {
      console.info("JS_SetConnectTimeOut success")
      // do you want...
    },
    (err: any) => {
      console.info("JS_SetConnectTimeOut failed")
      // do you want...
    }
  )
}
//播放
const play = (url: string) => {
  console.log("播放", url)
  if (player[uid.value]) {
    console.log("销毁")
    destroy()
  }
  nextTick(() => {
    console.log("创建", url)
    create(url)
  })
}
// 大小适应
const resize = () => {
  if (player[uid.value]) {
    player[uid.value].JS_Resize()
  }
}

// 回放
const replay = (url: string, start: string, end: string) => {
  // console.log("回放", url)
  player[uid.value].JS_Play(url, { playURL: url, mode: 0 }, 0, start, end).then(
    () => {
      console.log("播放成功！")
      // this.startTimer()
    },
    (e: any) => {
      console.error(e)
    }
  )
}

//暂停
const playbackPause = () => {
  player[uid.value].JS_Pause(1).then(
    () => {
      console.log("playbackPause success")
    },
    (e: any) => {
      console.error(e)
    }
  )
}
//继续播放
const playbackResume = () => {
  player[uid.value].JS_Resume(1).then(
    () => {},
    (e: any) => {
      console.error(e)
    }
  )
}
//停止
const stopPlay = () => {
  player[uid.value].JS_Stop().then(
    () => {
      // this.playback.rate = 0; console.log('stop realplay success')
    },
    (e: any) => {
      console.error(e)
    }
  )
}
//销毁
const destroy = () => {
  if (player[uid.value]) {
    player[uid.value].JS_StopRealPlayAll().then(
      () => {
        console.log("stopAllPlay success")
      },
      (e: any) => {
        console.error(e)
      }
    )
  }
  player[uid.value] = null
  uid.value = nanoid()
}
defineExpose({
  init,
  stopPlay,
  playbackPause,
  playbackResume,
  play,
  destroy,
  resize,
  replay,
  doubleSpeed,
  slowDown
}) // 提供 open 方法，用于打开弹窗
onMounted(() => {
  if (props.videoUrl) {
    console.log("创建视频")
    nextTick(() => {
      play(props.videoUrl)
    })
  }
})
onBeforeUnmount(() => {
  console.log("销毁视频回放")
  if (player[uid.value]) {
    player[uid.value].JS_StopRealPlayAll().then(
      () => {
        console.log("stopAllPlay success")
      },
      (e: any) => {
        console.error(e)
      }
    )
  }
  player[uid.value] = null
})
</script>
