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
        <div class="quick-nav-title">快捷导航</div>
        <div
          class="quick-nav"
          :class="[activedTag == item.tag ? 'actived' : '']"
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
const quickNaviList = ref<any>([
  {
    id: 3,
    tag: "mkqj",
    name: "宣教馆门口全景"
  },
  {
    id: 10,
    tag: "nb",
    name: "宣教馆内部"
  },
  {
    id: 8,
    tag: "bbg",
    name: "标本馆"
  },
  {
    id: 6,
    tag: "rwg",
    name: "人文馆"
  },
  {
    id: 5,
    tag: "zsg",
    name: "展示馆"
  },
  {
    id: 13,
    tag: "zwg",
    name: "植物馆"
  }
])
const activedTag = ref<any>("mkqj")
const changeTour = (item: any) => {
  activedTag.value = item.tag
  krpano.value.call("loadscene('scene_" + item.tag + "')")
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
        let tag = scene.replace("scene_", "")
        if (activedTag.value == tag) {
          return
        }
        activedTag.value = tag
      }, 1000)
    },
    false
  )
}
onMounted(() => {
  // @ts-ignore
  embedpano({
    //待修改
    swf: "/vtourProxy/data/vtour2/tour.swf",
    xml: "/vtourProxy/data/vtour2/tour.xml",
    target: "pano",
    html5: "auto",
    mobilescale: 1.0,
    passQueryParameters: true,
    onready(krpano_interface: any) {
      krpano.value = krpano_interface
      // krpano.value.call("loadscene(scene_rwg);")
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
      background: rgb(255, 255, 255, 0.5);
    }
  }
}
</style>
