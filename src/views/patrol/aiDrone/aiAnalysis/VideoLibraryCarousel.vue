<script lang="ts" setup>
import { Picture as IconPicture, VideoPlay } from "@element-plus/icons-vue"
import { uavFileUrl } from "@/utils/ai-drone/file-url"
import { getVideoItemKey } from "@/utils/ai-drone/video-lib-item"

interface Props {
  list: Record<string, unknown>[]
  /** 当前选中视频的稳定键 */
  activeKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  activeKey: ""
})

const emit = defineEmits<{
  /** 选中卡片：联动右侧研判，不弹播放窗 */
  select: [Record<string, unknown>]
  /** 点击播放钮：打开录像弹窗 */
  play: [Record<string, unknown>]
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

function isItemActive(item: Record<string, unknown>) {
  const key = getVideoItemKey(item)
  if (!props.activeKey || !key) return false
  return props.activeKey === key
}

function itemKey(item: Record<string, unknown>) {
  return getVideoItemKey(item) || displayName(item) + displayTime(item)
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
          :key="itemKey(item)"
          class="video-item"
          :class="{ 'is-active': isItemActive(item) }"
          @click.stop="emit('select', item)"
        >
          <span
            v-if="isItemActive(item)"
            class="video-item__badge"
            >当前</span
          >
          <div class="video-item__img-box">
            <el-image
              class="video-item__img"
              :src="uavFileUrl(String(item.cover_path_local || ''))"
              fit="contain"
            >
              <template #error>
                <div class="video-item__fallback">
                  <el-icon><IconPicture /></el-icon>
                </div>
              </template>
            </el-image>
            <!-- 仅点击播放按钮才触发弹窗，避免误触整卡 -->
            <button
              type="button"
              class="video-item__play"
              aria-label="播放视频"
              @click.stop="emit('play', item)"
            >
              <el-icon :size="22"><VideoPlay /></el-icon>
            </button>
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
      pointer-events: auto;
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
  position: relative;
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
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(.is-active) {
    border-color: rgba(88, 186, 241, 0.45);
    background: rgba(14, 42, 78, 0.5);
  }

  /* 选中：与航飞计划列表、右侧研判高亮同一套蓝色强调 */
  &.is-active {
    z-index: 1;
    border-color: rgba(88, 186, 241, 0.95);
    background: linear-gradient(165deg, rgba(22, 78, 140, 0.58), rgba(11, 36, 68, 0.78));
    outline: 2px solid rgba(126, 200, 255, 0.75);
    outline-offset: 0;
    box-shadow:
      0 0 0 1px rgba(126, 200, 255, 0.4),
      0 0 16px rgba(62, 140, 210, 0.28);

    &::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 3px;
      background: linear-gradient(180deg, #58baf1, #346d8d);
      border-radius: 6px 0 0 6px;
    }

    .video-item__name {
      color: #9edcff;
    }

    .video-item__img-box {
      box-shadow: 0 0 0 1px rgba(126, 200, 255, 0.55) inset;
    }

    .video-item__play {
      border-color: rgba(160, 220, 255, 0.95);
      background: rgba(32, 98, 168, 0.88);
    }
  }
}

.video-item__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  line-height: 16px;
  color: #fff;
  pointer-events: none;
  background: linear-gradient(90deg, #58baf1, #4693be);
  border-radius: 2px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
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

/* 居中播放钮（不用 transform，符合项目动画约束） */
.video-item__play {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  margin-top: -22px;
  margin-left: -22px;
  color: #fff;
  cursor: pointer;
  background: rgba(8, 28, 52, 0.72);
  border: 1px solid rgba(126, 200, 255, 0.65);
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  transition:
    background 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    background: rgba(20, 72, 128, 0.88);
    border-color: rgba(160, 220, 255, 0.95);
  }

  &:focus-visible {
    outline: 2px solid rgba(126, 200, 255, 0.9);
    outline-offset: 2px;
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
