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
  /** 选中卡片：绘制航线，不弹播放窗 */
  select: [Record<string, unknown>]
  /** 点击播放钮：打开录像弹窗 */
  play: [Record<string, unknown>]
}>()

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
  <ul
    v-if="list.length"
    class="video-library-list ai-scroll"
  >
    <li
      v-for="item in list"
      :key="itemKey(item)"
      class="video-item"
      :class="{ 'is-active': isItemActive(item) }"
      @click.stop="emit('select', item)"
    >
      <span
        v-if="isItemActive(item)"
        class="video-item__badge"
      >当前</span>
      <div class="video-item__img-box">
        <el-image
          class="video-item__img"
          :src="uavFileUrl(String(item.cover_path_local || ''))"
          fit="cover"
        >
          <template #error>
            <div class="video-item__fallback">
              <el-icon><IconPicture /></el-icon>
            </div>
          </template>
        </el-image>
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
        <span class="video-item__time">{{ displayTime(item) }}</span>
      </div>
    </li>
  </ul>
  <div
    v-else
    class="video-library-empty"
  >
    暂无视频
  </div>
</template>

<style scoped lang="scss">
.video-library-list {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0 2px 4px;
  list-style: none;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-library-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.45);
}

.video-item {
  position: relative;
  flex-shrink: 0;
  padding: 10px;
  cursor: pointer;
  background: rgba(11, 24, 40, 0.55);
  border: 1px solid rgba(62, 140, 210, 0.28);
  border-radius: 6px;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(.is-active) {
    border-color: rgba(88, 186, 241, 0.45);
    background: rgba(14, 42, 78, 0.5);
  }

  &.is-active {
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

.video-item__img-box {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: rgba(8, 22, 40, 0.65);
  border-radius: 4px;

  :deep(.el-image) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(.el-image__inner) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

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
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-item__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.55);

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.video-item__time {
  color: rgba(190, 204, 220, 0.72);
}
</style>