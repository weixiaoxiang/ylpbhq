<script lang="ts" setup>
import { Picture as IconPicture } from "@element-plus/icons-vue"
import { danieFileUrl } from "@/utils/ai-drone/file-url"

interface Props {
  list: Record<string, unknown>[]
  activeId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  activeId: ""
})

const emit = defineEmits<{
  select: [Record<string, unknown>]
}>()

/** 每页 4 条，与一张图最新抓拍轮播一致 */
function chunkVideos(rows: Record<string, unknown>[]) {
  const pages: Record<string, unknown>[][] = []
  let batch: Record<string, unknown>[] = []
  rows.forEach((row, index) => {
    batch.push(row)
    if (batch.length === 4 || index === rows.length - 1) {
      pages.push([...batch])
      batch = []
    }
  })
  return pages
}

const pages = computed(() => chunkVideos(props.list))

function displayName(item: Record<string, unknown>) {
  return String(item.name || item.taskUuid || item.id || "—")
}

function displayDrone(item: Record<string, unknown>) {
  return String(item.drone_name || item.device_name || "—")
}

function displayTime(item: Record<string, unknown>) {
  return String(item.create_time || item.start_time || "")
}
</script>

<template>
  <div class="video-library-carousel">
    <el-carousel
      :interval="6000"
      arrow="hover"
      indicator-position="none"
    >
      <el-carousel-item
        v-for="(page, pageIndex) in pages"
        :key="pageIndex"
      >
        <div
          v-for="item in page"
          :key="String(item.id)"
          class="video-item"
          :class="{ 'is-active': activeId === item.id }"
          @click="emit('select', item)"
        >
          <div class="video-item__img-box">
            <el-image
              class="video-item__img"
              :src="danieFileUrl(String(item.cover_path_local || ''))"
              fit="contain"
            >
              <template #error>
                <div class="video-item__fallback">
                  <el-icon><IconPicture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="video-item__name">{{ displayName(item) }}</div>
          <div class="video-item__meta">
            <span>{{ displayDrone(item) }}</span>
            <span>{{ displayTime(item) }}</span>
          </div>
        </div>
      </el-carousel-item>
      <el-carousel-item v-if="pages.length === 0">
        <div class="video-item--empty">暂无视频</div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss">
/* 布局对齐 oneMap/CaptureCarousel.vue，图片区固定比例，文字区始终保留 */
.video-library-carousel {
  width: 100%;
  flex: 1;
  min-height: 168px;
  overflow: hidden;

  :deep(.el-carousel) {
    height: 100%;
    padding: 4px 32px 2px;

    .el-carousel__container {
      height: 100%;
    }

    .el-carousel__item {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      height: 100%;
      box-sizing: border-box;
      overflow: visible;
    }

    .el-carousel__arrow {
      width: 28px;
      height: 28px;
      background: rgba(12, 40, 77, 0.92);
      border: 1px solid rgba(126, 200, 255, 0.45);
    }

    .el-carousel__arrow--left {
      left: 2px;
    }

    .el-carousel__arrow--right {
      right: 2px;
    }
  }
}

.video-item {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto auto;
  min-width: 0;
  min-height: 0;
  height: 100%;
  padding: 8px;
  cursor: pointer;
  background: rgba(11, 24, 40, 0.55);
  border: 1px solid rgba(62, 140, 210, 0.28);
  border-radius: 6px;
  box-sizing: border-box;
  overflow: hidden;

  &.is-active {
    border-color: rgba(126, 200, 255, 0.85);
    box-shadow: 0 0 0 1px rgba(126, 200, 255, 0.35) inset;
  }
}

.video-item--empty {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
}

.video-item__img-box {
  position: relative;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  background: rgba(8, 22, 40, 0.65);
  border-radius: 4px;

  .video-item__img {
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
}

.video-item__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 96px;
  background: rgba(16, 52, 96, 0.35);

  .el-icon {
    font-size: 32px;
    color: rgba(255, 255, 255, 0.6);
  }
}

.video-item__name {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.55);

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
