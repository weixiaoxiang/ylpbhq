<template>
  <div class="panorama">
    <div class="panorama-box">
      <div id="pano">
        <noscript>
          <table style="width: 100%; height: 100%">
            <tr style="vertical-align: middle">
              <td>
                <div style="text-align: center">
                  ERROR:
                  <br />
                  <br />Javascript not activated
                  <br />
                  <br />
                </div>
              </td>
            </tr>
          </table>
        </noscript>
      </div>
      <div class="panorama-control">
        <div class="pano-title">当前位置：{{ panoTitle }}</div>
        <div class="pano-map">
          <img
            v-if="panoTitle != '入口'"
            class="qy"
            :src="'/images/ScienceEducation/qy/' + panoTitle + '.png'"
            alt=""
          />
          <img
            v-if="isHover && panoTitle != '入口'"
            class="qy"
            :src="'/images/ScienceEducation/qy/' + hoverTitle + '.png'"
            alt=""
          />
          <img
            src="/images/ScienceEducation/map.png"
            alt=""
          />

          <div
            class="dot"
            :class="['dot' + item.id, activedId == item.id ? 'actived' : '']"
            :key="index"
            v-for="(item, index) in locList"
            @mouseenter="showHover(item, index)"
            @mouseleave="closeHover(item, index)"
            @click="changeTour(item, index)"
          >
            <span :title="item.name">
              <i></i>
            </span>
          </div>
        </div>
        <div class="quick-nav-title">快捷导航</div>
        <div
          class="quick-nav"
          :class="[panoTitle == item.name ? 'actived' : '']"
          :key="index"
          v-for="(item, index) in quickNaviList"
          @click="changeTour(item, index)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="panorama-close">
        <CircleClose @click="closePanora()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { CircleClose } from "@element-plus/icons-vue"
// import { getAssetsImages } from "@/hooks/useAssetsImages"
const { proxy } = getCurrentInstance() as any
const krpano = ref<any>(null)
krpano.value = document.querySelector("#krpanoSWFObject")
const panoTitle = ref<any>("序厅")
const locList = ref<any>([
  {
    id: 1,
    name: "入口"
  },
  {
    id: 2,
    name: "入口"
  },
  {
    id: 3,
    name: "序厅"
  },
  {
    id: 4,
    name: "序厅"
  },
  {
    id: 5,
    name: "保护区建设展区"
  },
  {
    id: 6,
    name: "野生动物展区"
  },
  {
    id: 7,
    name: "野生动物展区"
  },
  {
    id: 8,
    name: "鱼类、植物展区"
  },
  {
    id: 9,
    name: "昆虫、蝴蝶展区"
  },
  {
    id: 10,
    name: "自然风光展区"
  },
  {
    id: 11,
    name: "自然风光展区"
  },
  {
    id: 12,
    name: "自然风光展区"
  },
  {
    id: 13,
    name: "昆虫、蝴蝶展区"
  }
])
const quickNaviList = ref<any>([
  // {
  //   id: 1,
  //   name: '入口',
  // },
  {
    id: 3,
    name: "序厅"
  },
  {
    id: 10,
    name: "自然风光展区"
  },
  {
    id: 8,
    name: "鱼类、植物展区"
  },
  {
    id: 6,
    name: "野生动物展区"
  },
  {
    id: 5,
    name: "保护区建设展区"
  },
  {
    id: 13,
    name: "昆虫、蝴蝶展区"
  }
])
const activedId = ref<any>(3)
const changeTour = (item: any, index: any) => {
  activedId.value = item.id
  panoTitle.value = item.name
  krpano.value.call("loadscene('scene_" + item.id + "')")
}
const isHover = ref<any>(false)
const hoverTitle = ref<any>("序厅")
const showHover = (item: any, index: any) => {
  hoverTitle.value = item.name
  isHover.value = true
}
const closeHover = (item: any, index: any) => {
  isHover.value = false
}
const onreadyok = (krpano: any) => {
  krpano.value = krpano
  //隐藏下方自带控制条
  krpano.value.set("layer[map].visible", false)
  krpano.value.set("layer[skin_control_bar].visible", false)
  krpano.value.set("layer[skin_splitter_bottom].visible", false)
  krpano.value.set("layer[skin_scroll_window].visible", false)
  krpano.value.call("playsound(bgsnd);")

  //热点移动事件初始化
  let pano = document.querySelector("#pano")
}
const closePanora = () => {
  proxy.$mitt.emit("closeSpecimenMuseum")
}
const getlocation = () => {
  window.addEventListener(
    "click",
    function () {
      setTimeout(() => {
        const scene = krpano.value.get("xml.scene")
        let name = scene.replace("scene_", "")
        if (activedId.value == name) {
          return
        }
        activedId.value = name
        panoTitle.value = locList.value.find((item: any) => item.id == name)?.name || ""
      }, 1000)
    },
    false
  )
}
onMounted(() => {
  embedpano({
    //待修改
    swf: "/vtour/tour.swf",
    xml: "https://qlf.ahhsgef.com/vtourBBG/tour.xml",
    target: "pano",
    html5: "auto",
    mobilescale: 1.0,
    passQueryParameters: true,
    onready(krpano_interface: any) {
      krpano.value = krpano_interface
      krpano.value.call("loadscene(scene_3);")
      // setTimeout(function () {
      //   onreadyok(krpano.value)
      // }, 1000)
    }
  })
  getlocation()
})
onBeforeUnmount(() => {})
</script>

<style lang="scss" scoped>
.panorama {
  position: absolute;
  top: 0;
  left: 20px;
  bottom: 20px;
  right: 20px;
  background: rgb(11, 66, 56);
  z-index: 9999;
  .panorama-box {
    position: relative;
    width: 100%;
    height: 100%;
    #pano {
      width: 100%;
      height: 100%;
      font-family: "\5FAE\8F6F\96C5\9ED1";
      display: flex;
      position: relative;
    }
    .panorama-control {
      position: absolute;
      top: 20px;
      bottom: 20px;
      left: 0;
      width: 360px;
      height: 100%;
      background: rgb(0, 0, 0, 0.4);
      .pano-title {
        font-family: "Source Han Sans CN";
        font-size: 16px;
        font-weight: 550;
        color: #fff;
        padding: 10px 0 10px 0px;
        text-align: center;
        background: rgba(7, 197, 162, 0.597);
        margin-bottom: 10px;
        // &::before {
        //   content: '';
        //   position: absolute;
        //   top: 15px;
        //   left: 30px;
        //   width: 2px;
        //   height: 14px;
        //   background: rgb(7 197 162);
        // }
      }
      .pano-map {
        position: relative;
        width: 340px;
        height: 140px;
        margin: 0 0 30px 10px;
        &::after {
          content: "";
          position: absolute;
          bottom: -30px;
          left: 0;
          width: 100%;
          height: 1px;
          background: #fff;
        }
        img {
          width: 100%;
          height: 100%;
        }
        .dot {
          width: 10px;
          height: 10px;
          position: absolute;
          cursor: pointer;
          &.actived {
            transition: all 0.5s;
            i:after {
              position: absolute;
              content: "";
              width: calc(100% + 10px);
              height: calc(100% + 10px);
              border-radius: 50%;
              background-color: rgba(254, 116, 6, 0.4);
              left: -5px;
              top: -5px;
              animation: pop 1.2s infinite linear alternate;
            }
          }
          &.dot1 {
            bottom: -15px;
            left: 0px;
          }
          &.dot2 {
            bottom: -10px;
            left: 35px;
          }
          &.dot3 {
            bottom: 20px;
            left: 35px;
          }
          &.dot4 {
            bottom: 25px;
            left: 91px;
          }
          &.dot5 {
            bottom: 27px;
            left: 173px;
          }
          &.dot6 {
            bottom: 27px;
            right: 75px;
          }
          &.dot7 {
            top: 42px;
            right: 69px;
          }
          &.dot8 {
            top: 54px;
            right: 125px;
          }
          &.dot9 {
            top: 37px;
            right: 187px;
          }
          &.dot10 {
            top: 34px;
            left: 78px;
          }
          &.dot11 {
            top: 22px;
            left: 15px;
          }
          &.dot12 {
            top: 68px;
            left: 15px;
          }
          &.dot13 {
            top: 68px;
            left: 79px;
          }
          i {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #fe7407;
            position: relative;
          }
        }
        @keyframes pop {
          0% {
          }
          60% {
            width: 14px;
            height: 14px;
            left: -2px;
            top: -2px;
            opacity: 0.6;
          }
          // 60% {
          //   width: 16px;
          //   height: 16px;
          //   left: -3px;
          //   top: -3px;
          //   opacity: 0.6;
          // }
          80% {
            width: 18px;
            height: 18px;
            left: -4px;
            top: -4px;
            opacity: 0.6;
          }
          100% {
            width: 20px;
            height: 20px;
            opacity: 1;
            left: -5px;
            top: -5px;
          }
        }
        .qy {
          position: absolute;
          top: 0;
          left: 0;
        }
      }
      .quick-nav-title {
        position: relative;
        font-family: "Source Han Sans CN";
        font-size: 15px;
        font-weight: 550;
        color: #fff;
        padding: 30px 0 10px 40px;
        &::before {
          content: "";
          position: absolute;
          top: 33px;
          left: 30px;
          width: 2px;
          height: 14px;
          background: rgb(7 197 162);
        }
      }
      .quick-nav {
        width: calc(100% - 60px);
        font-family: "Source Han Sans CN";
        font-size: 16px;
        font-weight: 500;
        color: #fff;
        border-radius: 5px;
        padding: 5px 10px;
        margin: 5px auto;
        cursor: pointer;
        &.actived {
          background: rgba(7, 197, 162, 0.597);
        }
      }
    }
    .panorama-close {
      position: absolute;
      top: 0px;
      right: 0px;
      width: 40px;
      height: 40px;
      cursor: pointer;
      border-radius: 50%;
      padding: 5px;
      background: rgb(11, 66, 56, 0.1);
    }
  }
}
</style>
