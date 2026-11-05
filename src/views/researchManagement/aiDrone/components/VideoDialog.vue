<script lang="ts" setup>
import { danieVideoPlayUrl } from "@/utils/ai-drone/file-url"

interface Props {
  info: Record<string, unknown> | null
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()

const src = computed(() =>
  danieVideoPlayUrl(String(props.info?.video_path_local || props.info?.video_url || props.info?.cover_path_local || ""))
)
const title = computed(() => String(props.info?.name || "航飞录像"))
</script>

<template>
  <el-dialog
    :model-value="!!info"
    :title="title"
    width="760px"
    append-to-body
    align-center
    destroy-on-close
    class="ai-drone-video-dialog"
    modal-class="ai-drone-video-dialog__overlay"
    @close="emit('close')"
  >
    <div class="ai-drone-video-dialog__player-wrap">
      <video
        v-if="src"
        class="ai-drone-video-dialog__player"
        :src="src"
        controls
        autoplay
        controlslist="nodownload"
      />
      <div
        v-else
        class="ai-drone-video-dialog__empty"
      >
        暂无录像地址
      </div>
    </div>
  </el-dialog>
</template>

<!-- 挂载 body，弹框深色主题需非 scoped -->
<style lang="scss">
.ai-drone-video-dialog__overlay {
  background-color: rgba(2, 8, 18, 0.62) !important;
  backdrop-filter: blur(4px);
}

.ai-drone-video-dialog {
  --el-dialog-bg-color: transparent;
  --el-dialog-padding-primary: 0;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;

  .el-dialog__header {
    margin: 0;
    padding: 14px 18px 12px;
    border-radius: 8px 8px 0 0;
    border: 1px solid rgba(62, 140, 210, 0.45);
    border-bottom: none;
    background: linear-gradient(180deg, rgba(22, 58, 102, 0.98), rgba(10, 32, 62, 0.96));
  }

  .el-dialog__title {
    max-width: calc(100% - 40px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 600;
    color: #e8f2ff;
  }

  .el-dialog__headerbtn {
    top: 12px;
    right: 14px;
    width: 32px;
    height: 32px;

    .el-dialog__close {
      color: rgba(190, 204, 220, 0.9);
      font-size: 18px;

      &:hover {
        color: #7ec8ff;
      }
    }
  }

  .el-dialog__body {
    padding: 12px 18px 16px;
    border: 1px solid rgba(62, 140, 210, 0.45);
    border-top: 1px solid rgba(48, 72, 104, 0.55);
    border-radius: 0 0 8px 8px;
    background: linear-gradient(165deg, rgba(8, 24, 48, 0.98) 0%, rgba(5, 14, 30, 0.98) 100%);
    box-shadow:
      0 0 0 1px rgba(126, 200, 255, 0.06) inset,
      0 20px 56px rgba(0, 0, 0, 0.55);
  }
}

.ai-drone-video-dialog__player-wrap {
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid rgba(48, 72, 104, 0.75);
  background: #020810;
}

.ai-drone-video-dialog__player {
  display: block;
  width: 100%;
  max-height: min(62vh, 520px);
  vertical-align: middle;
  background: #000;
}

.ai-drone-video-dialog__empty {
  padding: 48px 16px;
  text-align: center;
  font-size: 14px;
  color: rgba(190, 204, 220, 0.65);
}
</style>
