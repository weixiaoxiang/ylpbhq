<template>
  <div class="left-box">
    <div class="content-box status">
      <div class="patrol-searchbox">
        <div class="searchbox">
          <el-input
            v-model="searchInput"
            size="small"
            placeholder="请输入内容"
          >
            <template #append>
              <el-button
                :icon="Search"
                size="small"
                @click="search()"
              />
            </template>
          </el-input>
        </div>
      </div>
      <div class="patrol-treebox">
        <el-scrollbar height="100%">
          <el-tree
            ref="treeRef"
            :data="treeData"
            node-key="Id"
            :default-expanded-keys="[0]"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @node-click="handleNodeClick"
            @node-contextmenu="handleContextMenu"
            icon-class="el-icon-arrow-down"
          >
            <template #default="{ node, data }">
              <span
                class="custom-tree-node"
                v-if="node.level == 1"
              >
                <span class="name"> {{ data.name }}</span>
                <div class="num">
                  (<span style="font-weight: 500"
                    ><span style="color: #2ecc71">{{ data.onlinecount }}</span
                    >/{{ data.allcount }}</span
                  >)
                </div>
              </span>
              <span
                class="custom-tree-node1"
                v-if="node.level > 1"
              >
                <div
                  class="custom-tree-node-clo"
                  :class="{ off: data.status == '离线' }"
                >
                  <span
                    class="mc"
                    :title="data.name"
                  >
                    {{ data.name }}({{ data.deviceserial }})</span
                  >
                </div>
                <!-- <div class="custom-tree-node-clo">
                  <div
                    class="history"
                    @click.stop="playHistory(data)"
                  >
                    <img src="/images/geologicalDisaster/video/video-history.png" />
                  </div>
                </div> -->
              </span>
            </template>
          </el-tree>
        </el-scrollbar>
      </div>
      <div class="linefg"></div>
      <div
        v-if="false"
        class="map"
        id="map2"
      ></div>
    </div>
  </div>
  <div
    v-if="false"
    class="left-box-bottom-control"
  >
    <div
      class="control-box"
      :class="{ disabled: !currentVideo || currentVideo.model == '枪机' }"
    >
      <div class="conter-center"></div>
      <div
        class="btn top-btn"
        @mousedown="controlChange('UP', 0)"
        @mouseup="controlChange('UP', 1)"
      ></div>
      <div
        class="btn bottom-btn"
        @mousedown="controlChange('DOWN', 0)"
        @mouseup="controlChange('DOWN', 1)"
      ></div>
      <div
        class="btn left-btn"
        @mousedown="controlChange('LEFT', 0)"
        @mouseup="controlChange('LEFT', 1)"
      ></div>
      <div
        class="btn right-btn"
        @mousedown="controlChange('RIGHT', 0)"
        @mouseup="controlChange('RIGHT', 1)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { treeToList } from "@/utils/tree"
import { geologicalDisasterApi } from "@/api/geologicalDisaster"
import { Search } from "@element-plus/icons-vue"
import { useMap } from "./map"
const { initMap } = useMap()
const props = defineProps(["currentVideo", "isPlayeHistory"])
const treeRef = ref<any>()
const searchInput = ref("")
const treeData = ref<any>([])
const defaultProps = ref<any>({
  label: "name",
  children: "Children"
})
const history = ref("") //播放历史id

//树查询
const search = () => {
  treeRef.value.filter(searchInput.value)
}
const filterNode = (name: string, data: any) => {
  if (!name) return true
  return data.name.includes(name)
}

const emit = defineEmits(["clickTree", "contextMenuEvent", "controlChange", "playHistory"])
//点击树节点事件
const handleNodeClick = (data: any, node: any) => {
  console.log(data, node)
  //  判断是否data是否有Children属性
  if (Object.prototype.hasOwnProperty.call(data, "Children")) {
    return
  }
  if (!data.videos) {
    emit("clickTree", data)
  }
}
//右键树节点点击事件
const handleContextMenu = (event, data, node, element) => {
  if (data.Children && data.Children.length > 0) {
    emit("contextMenuEvent", data)
  }
}
//获取监控数据
const getVideoData = () => {
  geologicalDisasterApi.GeologicHazard_VideoTree({}).then((res: any) => {
    if (res.success) {
      treeData.value = res.response.map((item: any, index: any) => {
        item.Id = index
        return item
      })
    }
  })
}
//播放历史
const playHistory = (data) => {
  history.value = data.Id
  emit("playHistory", data)
}

//控制云台
const controlChange = (type: string, action: any = 1) => {
  if (!props.currentVideo || props.currentVideo.model === "枪机") {
    return
  }
  emit("controlChange", type, action)
}
onMounted(async () => {
  getVideoData()
  let ele = document.getElementById("map2")
  initMap(ele)
})
onBeforeUnmount(() => {})
</script>

<style lang="scss" scoped>
.left-box {
  width: 300px;
  // height: 100%;
  // margin-right: 20px;
  // background: #fff;
  background: #001124d9;
  border: 1px solid #ffffff2e;
  box-shadow: -4px -4px 12px 0px #ffffff26 inset;
}

.left-box-bottom-control {
  height: 179.75px;
  width: 179.75px;
  margin-top: 40px;
  background: url("/images/geologicalDisaster/video/control-bj.png") no-repeat center center / 100% 100%;
}

.content-box {
  height: 100%;
}

.patrol-searchbox {
  padding: 16px 20px 0;

  .searchbox {
    width: 100%;
    color: #fff;
    position: relative;

    :deep(.el-icon) {
      --color: inherit;
      align-items: center;
      display: inline-flex;
      height: 1em;
      justify-content: center;
      line-height: 1em;
      position: relative;
      width: 1em;
      fill: currentColor;
      color: #fff;
      font-size: inherit;
    }

    :deep(.el-input) {
      outline: none;
      border: none;
      text-indent: 25px;
      background-color: transparent;
      font-size: 14px;
      height: 32px;
      border-radius: 1px;
      border: 1px solid rgba(217, 217, 217, 1);
      color: #fff;
      input {
        color: #fff;
      }
      .el-input__wrapper {
        padding: 0px 7px;
        box-shadow: unset;
        background-color: transparent;

        .el-input__inner {
          color: #fff;
        }

        .el-input__inner::placeholder {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        &.is-focus {
          box-shadow: unset;
        }
      }

      .el-input-group__append {
        background-color: transparent;
        color: rgba(0, 0, 0, 0.6);
        box-shadow: unset;

        .el-button {
          padding: 3px 11px;
          font-weight: 550;
        }
      }
    }
  }
}

.patrol-treebox {
  margin: 16px 20px;
  height: vh(267);
  box-sizing: border-box;
  // overflow: auto;

  :deep(.el-tree) {
    background-color: transparent;
    color: rgba(0, 0, 0, 1);
    --el-tree-node-hover-bg-color: unset;

    .el-tree-node__content:hover {
      background-color: transparent;
    }

    .el-checkbox__inner {
      background-color: transparent;
      border: 1px solid #333;
    }
    .el-tree-node__content:hover {
      background: rgba(0, 82, 217, 0.4);
      color: #fff !important;
    }

    .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
      background: rgba(0, 82, 217, 0.4);
      color: #fff;
    }

    .el-tree-node__expand-icon {
      color: rgba(0, 0, 0, 1);
      font-size: 18px;
    }
    .el-tree-node__expand-icon {
      color: #beccdc;
    }

    .el-tree-node__content {
      position: relative;
      height: 40px;
      padding-left: 0 !important;
      color: #beccdc;
      .custom-tree-node {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        font-size: 16px;
        .name {
          color: #beccdc;
        }
        img {
          width: 16px;
          height: 16px;
          margin-right: 10px;
        }
        .mc {
          // flex: 1;
          //max-width: 155px;
          padding-right: 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #beccdc;
        }
        .history {
          img {
            width: 16px;
            height: 16px;
            margin-right: 20px;
          }
        }
        .num {
          color: rgba(102, 102, 102, 1);
          margin-left: 16px;
        }
        .icon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1ed345;
          margin-right: 10px;
        }
        &.disabled {
          cursor: not-allowed;
          .icon {
            background: red;
          }
        }
      }
      .custom-tree-node1 {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        justify-content: space-between;

        // padding: 0 10px;

        font-size: 16px;

        .custom-tree-node-clo {
          display: flex;
        }
        img {
          width: 16px;
          height: 16px;
          margin-right: 10px;
        }
        .mc {
          // flex: 1;
          //max-width: 155px;
          padding-right: 10px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .off {
          cursor: not-allowed;
          .mc {
            color: #666;
          }
        }
        .history {
          img {
            width: 16px;
            height: 16px;
            margin-right: 20px;
          }
        }
        .num {
          color: rgba(102, 102, 102, 1);
          margin-left: 16px;
        }
        .icon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1ed345;
          margin-right: 10px;
        }
        &.disabled {
          cursor: not-allowed;
          .icon {
            background: red;
          }
        }
      }
      .active {
        background: rgba(0, 82, 217, 0.4);
      }
    }
  }
}
.linefg {
  height: 1px;
  margin-bottom: 2px;
  background: url("/images/geologicalDisaster/video/line-fg.png") no-repeat center center / 100% 100%;
}
.map {
  width: 100%;
  height: 135px;
  padding: 0px 7px 7px 7px;

  // background-color: #99eaab;
}
.control-box {
  position: relative;
  height: 180px;

  .conter-center {
    background: url("/images/geologicalDisaster/video/center-circle.png") no-repeat;
    background-size: 100% 100%;
    width: 37px;
    height: 37px;
    position: absolute;
    left: 50%;

    top: 50%;
    transform: translate(-50%, -50%); /* 合并水平和垂直居中 */
  }
  .btn {
    position: absolute;
    width: 34px;
    height: 17px;
    background: url("/images/geologicalDisaster/video/control-btn.png") no-repeat;
    background-size: 100% 100%;
    //    cursor: pointer;

    &.top-btn {
      left: 50%;
      bottom: 120px;
      transform: translateX(-50%);
    }
    &.bottom-btn {
      left: 50%;
      bottom: 44px;
      transform: translateX(-50%) rotate(180deg);
    }
    &.left-btn {
      left: 35px;
      bottom: 85px;
      transform: rotate(270deg);
    }
    &.right-btn {
      right: 35px;
      bottom: 85px;
      transform: rotate(90deg);
    }
    &:hover {
      z-index: 9;
      cursor: pointer;
    }
  }
  &.disabled .btn {
    // pointer-events: none;
    cursor: not-allowed;
  }
}
</style>
