<script lang="ts" setup>
import { Picture as IconPicture } from "@element-plus/icons-vue"
import { createImageViewer } from "@/components/ImageViewer"
import { danieUavApi } from "@/api/danieUav"
import { danieFileUrl } from "@/utils/ai-drone/file-url"
import { isDanieOk } from "@/utils/ai-drone/response"
import { AI_DRONE_KEY } from "../context"
import icoBg from "@/assets/images/ai-drone/capture/ico_bg.png"
import icoFd from "@/assets/images/ai-drone/capture/ico_fd.png"
import icoDw from "@/assets/images/ai-drone/capture/ico_dw.png"
import icoSc from "@/assets/images/ai-drone/capture/ico_sc.png"
import icoScOn from "@/assets/images/ai-drone/capture/ico_sc_on.png"

/** 底部最新抓拍：每页 4 张，自动轮播（对齐大鲵一张图） */
defineOptions({ name: "AiDroneCaptureCarousel" })

const drone = inject(AI_DRONE_KEY)!
const pages = ref<Record<string, unknown>[][]>([])
const activeId = ref<number>(0)

/** 将接口列表按 4 条一组分页，供 el-carousel 使用 */
function chunkCaptures(rows: Record<string, unknown>[]) {
  const result: Record<string, unknown>[][] = []
  let batch: Record<string, unknown>[] = []
  rows.forEach((row, index) => {
    batch.push(row)
    if (batch.length === 4 || index === rows.length - 1) {
      result.push([...batch])
      batch = []
    }
  })
  return result
}

async function loadData() {
  const res = (await danieUavApi.GetAISnapshot({ take: 16 })) as { response?: Record<string, unknown>[] }
  const rows = Array.isArray(res.response) ? res.response : []
  pages.value = chunkCaptures(rows)
}

function previewImage(item: Record<string, unknown>) {
  const url = danieFileUrl(String(item.image_url_local || ""))
  if (!url) return
  createImageViewer({ urlList: [url], hideOnClickModal: true })
}

function toggleMap(item: Record<string, unknown>) {
  const id = Number(item.resultId)
  if (activeId.value === id) {
    activeId.value = 0
    drone.focusSnap(null)
    return
  }
  activeId.value = id
  drone.focusSnap(item)
}

async function toggleCollect(item: Record<string, unknown>) {
  const next = !item.is_collection
  try {
    await ElMessageBox.confirm(`是否确认${next ? "" : "取消"}收藏此条数据?`, "提示", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning"
    })
  } catch {
    return
  }
  const res = (await danieUavApi.PutAIResultCollection({
    resultId: item.resultId,
    collection: next
  })) as { success?: boolean; msg?: string }
  if (!isDanieOk(res)) {
    ElMessage.error(String(res.msg || "收藏失败"))
    return
  }
  ElMessage.success(next ? "收藏成功" : "取消收藏成功")
  loadData()
}

onMounted(() => {
  loadData()
})

defineExpose({ reload: loadData })
</script>

<template>
  <div class="capture-carousel">
    <el-carousel
      :interval="5000"
      arrow="hover"
      indicator-position="none"
    >
      <el-carousel-item
        v-for="(page, pageIndex) in pages"
        :key="pageIndex"
      >
        <div
          v-for="item in page"
          :key="String(item.resultId)"
          class="capture-item"
          :class="{ active: activeId === Number(item.resultId) }"
          @click="drone.openEventDetail(item)"
        >
          <div class="img-box">
            <el-image
              class="img"
              :src="danieFileUrl(String(item.image_url_local || ''))"
              fit="contain"
            >
              <template #error>
                <div class="img-fallback">
                  <el-icon><IconPicture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="ico-box">
              <div
                class="ico"
                :style="{ backgroundImage: `url(${icoBg})` }"
                @click.stop="previewImage(item)"
              >
                <img
                  :src="icoFd"
                  alt=""
                />
              </div>
              <div
                class="ico"
                :style="{ backgroundImage: `url(${icoBg})` }"
                @click.stop="toggleMap(item)"
              >
                <img
                  :src="icoDw"
                  alt=""
                />
              </div>
              <div
                class="ico"
                :style="{ backgroundImage: `url(${icoBg})` }"
                @click.stop="toggleCollect(item)"
              >
                <img
                  :src="item.is_collection ? icoScOn : icoSc"
                  alt=""
                />
              </div>
            </div>
            <div class="label">{{ item.class_name }}</div>
          </div>
          <div class="time">{{ item.create_time }}</div>
          <div class="name">{{ item.droneName || item.device_name || "—" }}</div>
        </div>
      </el-carousel-item>
      <el-carousel-item
        v-if="pages.length === 0"
        class="no-data"
      >
        暂无抓拍数据
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss">
.capture-carousel {
  width: 100%;
  height: 100%;
  min-height: 0;

  .no-data {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.65);
    font-size: 14px;
  }

  :deep(.el-carousel) {
    height: 100%;
    padding: 4px 28px 6px;

    .el-carousel__container {
      height: 100%;
    }

    /* 每页 4 张：网格铺满，避免底部大块留白 */
    .el-carousel__item {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      height: 100%;
      box-sizing: border-box;
      /* 避免裁切卡片底部图片 */
      overflow: visible;
    }

    .el-carousel__arrow {
      width: 26px;
      height: 26px;
      background: rgba(12, 40, 77, 0.92);
      border: 1px solid rgba(126, 200, 255, 0.4);
    }

    .el-carousel__arrow--left {
      left: 2px;
    }

    .el-carousel__arrow--right {
      right: 2px;
    }
  }
}

.capture-item {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  min-width: 0;
  height: 100%;
  padding: 8px;
  cursor: pointer;
  background: rgba(11, 24, 40, 0.55);
  border: 1px solid rgba(62, 140, 210, 0.28);
  border-radius: 6px;
  box-sizing: border-box;
  overflow: hidden;

  &.active {
    border-color: rgba(126, 200, 255, 0.85);
    box-shadow: 0 0 0 1px rgba(126, 200, 255, 0.35) inset;
  }

  .img-box {
    position: relative;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    background: rgba(8, 22, 40, 0.65);
    border-radius: 4px;

    .img {
      display: block;
      width: 100%;
      height: 100%;
    }

    :deep(.el-image) {
      display: block;
      width: 100%;
      height: 100%;
    }

    :deep(.el-image__wrapper) {
      width: 100% !important;
      height: 100% !important;
    }

    :deep(.el-image__inner) {
      width: 100%;
      height: 100%;
      object-fit: contain;
      vertical-align: top;
    }

    .img-fallback {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: rgba(16, 52, 96, 0.35);

      .el-icon {
        font-size: 32px;
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .ico-box {
      position: absolute;
      top: 4px;
      left: 4px;
      display: flex;
      gap: 4px;

      .ico {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background-size: 100% 100%;
        cursor: pointer;

        img {
          width: 14px;
          height: 14px;
        }
      }
    }

    .label {
      position: absolute;
      right: 4px;
      bottom: 4px;
      max-width: calc(100% - 8px);
      padding: 0 6px;
      overflow: hidden;
      font-size: 12px;
      font-weight: 700;
      line-height: 22px;
      color: #0b1a2a;
      text-overflow: ellipsis;
      white-space: nowrap;
      background: linear-gradient(90deg, #7ec8ff, #5aa8e8);
      border-radius: 2px;
    }
  }

  .time {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;
    color: #fff;
  }

  .name {
    margin-top: 2px;
    overflow: hidden;
    font-size: 12px;
    line-height: 16px;
    color: rgba(255, 255, 255, 0.55);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
