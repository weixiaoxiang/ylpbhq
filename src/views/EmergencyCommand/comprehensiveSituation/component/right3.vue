<script setup lang="ts">
import { GetAlarm__XhOnlineList } from "@/api"
const proxy = getCurrentInstance()!.proxy as any
const xhUser = ref<any>([])
const input = ref("")
const getXhOnlineList = async () => {
  const { response } = await GetAlarm__XhOnlineList()
  response.forEach((item: any) => {
    item.Lat = item.Real_lat
    item.Lon = item.Real_lon
    item.Name = item.Real_name
    item.Id = item.User_id
    // item.Type = 0
  })
  xhUser.value = response
  // 添加地图数据
  proxy.$mitt.emit("updateXhOnline", {
    type: "添加",
    leafNodes: xhUser.value
  })
}
// 点击定位巡护人员
const handleLocation = () => {
  console.log(currentXhUser.value)
  proxy.$mitt.emit("locationMap", {
    type: "点击树定位巡护人员",
    data: {
      id: currentXhUser.value.Id
    }
  })
}
const changeXhUser = (index: any) => {
  page.value = index
}
const currentXhUser = computed(() => {
  return xhUser.value[page.value] || {}
})
const page = ref(0)
// 页码切换
const pageChange = (type: string) => {
  const isFirstPage = page.value === 0
  const isLastPage = page.value === xhUser.value.length - 1

  if ((type === "prev" && isFirstPage) || (type === "next" && isLastPage)) {
    return ElMessage.warning(`已经是${type === "prev" ? "第一" : "最后"}项`)
  }

  page.value += type === "prev" ? -1 : 1
}
onMounted(() => {
  getXhOnlineList()
})
</script>
<template>
  <div class="right3">
    <BasePanel title="今日巡护信息">
      <template #contain>
        <div
          v-if="xhUser.length > 0"
          class="con"
        >
          <div class="row1">
            <div
              class="btn-left"
              @click="pageChange('prev')"
            ></div>
            <div class="card">
              <div class="card-con">
                <div class="avator">
                  <img
                    :src="
                      currentXhUser.Headimg
                        ? '/fireStaticUrl/' + currentXhUser.Headimg
                        : $fun.getImg('emergencyCommand/defaultAvator.png')
                    "
                    alt=""
                  />
                </div>
                <div class="data">
                  <div class="name">姓名：{{ currentXhUser.Real_name }}</div>
                  <div class="name">状态：{{ currentXhUser.Status }}</div>
                  <div class="name">电话：{{ currentXhUser.user_tel }}</div>
                </div>
                <div class="icon">
                  <img
                    src="@/assets/images/emergencyCommand/xh-icon1.png"
                    alt=""
                    @click="handleLocation"
                  />
                  <!-- <img
                    src="@/assets/images/emergencyCommand/xh-icon1.png"
                    alt=""
                  /> -->
                </div>
              </div>
            </div>
            <div
              class="btn-right"
              @click="pageChange('next')"
            ></div>
          </div>
          <div class="row2">
            <el-scrollbar>
              <div class="scrollbar-flex-content">
                <div
                  class="item"
                  v-for="(item, index) in xhUser"
                  :key="index"
                  @click="changeXhUser(index)"
                >
                  <div class="img-box">
                    <img
                      :src="
                        item.Headimg
                          ? '/fireStaticUrl/' + item.Headimg
                          : $fun.getImg('emergencyCommand/defaultAvator.png')
                      "
                      alt=""
                    />
                  </div>
                  <div class="name">{{ item.Real_name }}</div>
                </div>
              </div>
            </el-scrollbar>
          </div>
          <div
            v-show="false"
            class="row3"
          >
            <el-input
              v-model="input"
              style="width: 100%"
              placeholder="请输入内容..."
            >
              <template #append>发送</template>
            </el-input>
          </div>
        </div>
        <EmptyData
          v-else
          description="今日暂无巡护人员！"
          :image-size="100"
        />
      </template>
    </BasePanel>
  </div>
</template>

<style lang="scss" scoped>
.right3 {
  height: 305px;
  margin-top: vh(20);
  color: #fff;

  .con {
    width: 100%;
    height: 100%;

    .row1 {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 120px;
      margin-top: vh(10);
      .card {
        flex: 1;
        height: 100%;
        padding: vw(20);
        background: url("@/assets/images/emergencyCommand/xh-card-bg.png") no-repeat;
        background-size: 100% 100%;

        .card-con {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          padding: 8px;
          background: rgba(21, 42, 66, 0.8);
          border: 0.5px solid #225e97;
          box-shadow: 0px 0px 6px 0px rgba(76, 151, 195, 0.5);

          .avator {
            // height: 100%;
            width: 60px;
            height: 60px;
            img {
              width: 100%;
              height: 100%;
            }
          }

          .data {
            font-size: vh(14);
            .name {
              &:not(:last-child) {
                margin-bottom: vh(8);
              }
            }
          }
          .icon {
            display: flex;
            gap: 5px;
            img {
              width: 50px;
              height: 50px;
              cursor: pointer;
            }
          }
        }
      }

      .btn-left {
        width: 20px;
        height: 16px;
        background: url("@/assets/images/emergencyCommand/xh-btn.png") no-repeat;
        background-size: 100% 100%;
        cursor: pointer;
      }

      .btn-right {
        width: 20px;
        height: 16px;
        background: url("@/assets/images/emergencyCommand/xh-btn.png") no-repeat;
        background-size: 100% 100%;
        transform: rotate(180deg);
        cursor: pointer;
      }
    }

    .row2 {
      margin-top: vh(16);
      padding: 0 vw(16);
      .scrollbar-flex-content {
        display: flex;
        align-items: center;
        gap: 10px;
        .item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          .img-box {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 65.87px;
            height: 65.87px;
            background: url("@/assets/images/emergencyCommand/xh-bg1.png") no-repeat;
            background-size: 100% 100%;
            overflow: hidden;
            img {
              width: 80%;
              height: 80%;
              border-radius: 50%;
            }
          }
        }
      }
    }
    .row3 {
      margin-top: vh(10);
      :deep(.el-input__wrapper) {
        background: rgba(12, 40, 77, 1);
        box-shadow: unset !important;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 0;
      }
      :deep(.el-input__inner) {
        color: #fff;
      }
      :deep(.el-input-group__append, .el-input-group__prepend) {
        background: rgba(0, 0, 0, 0.5);
        box-shadow: unset !important;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-left: 0;
        border-radius: 0;
        cursor: pointer;
      }
    }
  }
}
</style>
