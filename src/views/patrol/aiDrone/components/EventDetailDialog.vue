<script lang="ts" setup>
import { Close } from "@element-plus/icons-vue"
import { uavApi } from "@/api/uav"
import { uavFileUrl, uavVideoPlayUrl } from "@/utils/ai-drone/file-url"
import { isAiResultAssessed } from "@/utils/ai-drone/ai-assessment-status"
import { isUavApiOk } from "@/utils/ai-drone/response"
import { createImageViewer } from "@/components/ImageViewer"
import { UAV_AI_EVENT_CLASS_OPTIONS } from "../constants"
import EventTrajectoryMap from "./EventTrajectoryMap.vue"

interface Props {
  detail: Record<string, unknown> | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const activeTab = ref("first")
const eventDetail = ref<Record<string, unknown>>({})
const trajectoryPayload = ref<Record<string, unknown> | null>(null)

/** 以接口原始记录为准；表单里会预填「正确」，不能用来判断是否已研判 */
const assessed = computed(() => (props.detail ? isAiResultAssessed(props.detail) : false))

/** 数值展示 */
function formatNumber(val: unknown, digits = 2) {
  if (val === null || val === undefined || val === "") return "-"
  const num = Math.abs(Number(val))
  if (Number.isNaN(num)) return "-"
  return num.toFixed(digits).replace(/0+$/, "").replace(/\.$/, "")
}

function mediaUrl(field: string) {
  return uavFileUrl(String(eventDetail.value[field] || ""))
}

function videoUrl(field: string) {
  return uavVideoPlayUrl(String(eventDetail.value[field] || ""))
}

function preview(url: string) {
  if (!url) return
  createImageViewer({ urlList: [url], hideOnClickModal: true })
}

async function loadFlyPoints(resultId: number) {
  if (!resultId) {
    trajectoryPayload.value = null
    return
  }
  const res = (await uavApi.GetDroneFlyPoints({ resultId })) as {
    success?: boolean
    response?: { longitude: number; latitude: number }[]
  }
  if (!isUavApiOk(res) || !Array.isArray(res.response) || res.response.length === 0) {
    trajectoryPayload.value = {
      longitude: eventDetail.value.longitude,
      latitude: eventDetail.value.latitude,
      geom: []
    }
    return
  }
  trajectoryPayload.value = {
    ...eventDetail.value,
    geom: res.response
  }
}

function syncDetail(raw: Record<string, unknown>) {
  eventDetail.value = {
    ...raw,
    assessment_result: raw.assessment_result || "正确",
    class_name: raw.class_name || ""
  }
  activeTab.value = "first"
  loadFlyPoints(Number(raw.resultId ?? raw.id ?? 0))
}

watch(
  () => props.detail,
  (value) => {
    if (value) syncDetail(value)
  },
  { immediate: true }
)

function onAssessmentChange(val: string) {
  if (val === "正确") {
    eventDetail.value.class_name = props.detail?.class_name ?? eventDetail.value.class_name
  } else {
    eventDetail.value.class_name = ""
  }
}

async function submit() {
  if (!String(eventDetail.value.class_name || "")) {
    ElMessage.error("请选择类别名称")
    return
  }
  const res = (await uavApi.PutDroneAiResult({
    resultId: eventDetail.value.resultId,
    assessment_result: eventDetail.value.assessment_result,
    assessment_class_name:
      eventDetail.value.assessment_result === "正确"
        ? (props.detail?.class_name ?? eventDetail.value.class_name)
        : eventDetail.value.class_name
  })) as { success?: boolean }
  if (!isUavApiOk(res)) {
    ElMessage.error("研判提交失败")
    return
  }
  ElMessage.success("处理成功")
  emit("saved")
  emit("close")
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="detail"
      class="ai-event-detail-shell"
    >
      <div
        class="ai-event-detail__scrim"
        aria-hidden="true"
        @click="emit('close')"
      />
      <div
        class="ai-event-detail"
        role="dialog"
        aria-modal="true"
        aria-label="抓拍详情"
      >
        <header class="ai-event-detail__toolbar">
          <h2 class="ai-event-detail__title">抓拍详情</h2>
          <button
            type="button"
            class="ai-event-detail__close"
            @click="emit('close')"
          >
            <el-icon><Close /></el-icon>
            <span>关闭</span>
          </button>
        </header>

        <div class="ai-event-detail__body">
          <section class="ai-event-detail__media">
            <header class="ai-event-detail__section-head">
              <span class="ai-event-detail__dot" />
              <span>抓拍记录</span>
            </header>
            <div class="ai-event-detail__media-body">
              <el-tabs
                v-model="activeTab"
                type="card"
                class="ai-event-detail__tabs"
              >
                <el-tab-pane
                  label="识别图片"
                  name="first"
                >
                  <div
                    v-if="mediaUrl('image_url_local')"
                    class="ai-event-detail__preview"
                  >
                    <img
                      :src="mediaUrl('image_url_local')"
                      alt="识别图片"
                      @click="preview(mediaUrl('image_url_local'))"
                    />
                  </div>
                  <el-empty
                    v-else
                    description="暂无识别图片"
                  />
                </el-tab-pane>
                <el-tab-pane
                  label="识别视频"
                  name="second"
                >
                  <div
                    v-if="videoUrl('video_url_local')"
                    class="ai-event-detail__preview"
                  >
                    <video
                      :src="videoUrl('video_url_local')"
                      controls
                    />
                  </div>
                  <el-empty
                    v-else
                    description="暂无识别视频"
                  />
                </el-tab-pane>
                <el-tab-pane
                  label="原图"
                  name="third"
                >
                  <div
                    v-if="mediaUrl('raw_image_url_local')"
                    class="ai-event-detail__preview"
                  >
                    <img
                      :src="mediaUrl('raw_image_url_local')"
                      alt="原图"
                      @click="preview(mediaUrl('raw_image_url_local'))"
                    />
                  </div>
                  <el-empty
                    v-else
                    description="暂无原图"
                  />
                </el-tab-pane>
                <el-tab-pane
                  label="原视频"
                  name="four"
                >
                  <div
                    v-if="videoUrl('raw_video_url_local')"
                    class="ai-event-detail__preview"
                  >
                    <video
                      :src="videoUrl('raw_video_url_local')"
                      controls
                    />
                  </div>
                  <el-empty
                    v-else
                    description="暂无原视频"
                  />
                </el-tab-pane>
                <el-tab-pane
                  v-if="mediaUrl('assessment_img_local')"
                  label="复核图片"
                  name="five"
                >
                  <div class="ai-event-detail__preview">
                    <img
                      :src="mediaUrl('assessment_img_local')"
                      alt="复核图片"
                      @click="preview(mediaUrl('assessment_img_local'))"
                    />
                  </div>
                </el-tab-pane>
                <el-tab-pane
                  v-if="videoUrl('assessment_video_local')"
                  label="复核视频"
                  name="six"
                >
                  <div class="ai-event-detail__preview">
                    <video
                      :src="videoUrl('assessment_video_local')"
                      controls
                    />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </section>

          <aside class="ai-event-detail__side">
            <section class="ai-event-detail__card ai-event-detail__card--trajectory">
              <header class="ai-event-detail__section-head">
                <span class="ai-event-detail__dot" />
                <span>飞行轨迹</span>
              </header>
              <div class="ai-event-detail__card-body">
                <EventTrajectoryMap :payload="trajectoryPayload" />
              </div>
            </section>

            <section class="ai-event-detail__card ai-event-detail__card--detail">
              <header class="ai-event-detail__section-head">
                <span class="ai-event-detail__dot" />
                <span>事件详情</span>
              </header>
              <div class="ai-event-detail__card-body">
                <dl class="ai-event-detail__grid">
                  <div class="ai-event-detail__grid-item">
                    <dt>设备名称</dt>
                    <dd>{{ eventDetail.droneName || eventDetail.drone_name || eventDetail.device_name || "-" }}</dd>
                  </div>
                  <div class="ai-event-detail__grid-item">
                    <dt>置信度</dt>
                    <dd>{{ formatNumber(eventDetail.max_confidence ?? eventDetail.confidence) }}</dd>
                  </div>
                  <div class="ai-event-detail__grid-item">
                    <dt>经度</dt>
                    <dd>{{ formatNumber(eventDetail.longitude, 6) }}</dd>
                  </div>
                  <div class="ai-event-detail__grid-item">
                    <dt>纬度</dt>
                    <dd>{{ formatNumber(eventDetail.latitude, 6) }}</dd>
                  </div>
                  <div class="ai-event-detail__grid-item ai-event-detail__grid-item--full">
                    <dt>事件时间</dt>
                    <dd>{{ eventDetail.create_time || "-" }}</dd>
                  </div>
                  <div class="ai-event-detail__grid-item ai-event-detail__grid-item--full">
                    <dt>设备 SN</dt>
                    <dd>{{ eventDetail.sn || eventDetail.device_sn || "-" }}</dd>
                  </div>
                  <div class="ai-event-detail__grid-item ai-event-detail__grid-item--full">
                    <dt>类别名称</dt>
                    <dd>
                      <span v-if="assessed">{{ eventDetail.class_name }}</span>
                      <el-select
                        v-else
                        v-model="eventDetail.class_name"
                        size="small"
                        class="ai-event-detail__select"
                        popper-class="custom-select-popper ai-event-detail-select-popper"
                        teleported
                        :disabled="eventDetail.assessment_result === '正确'"
                      >
                        <el-option
                          v-for="item in UAV_AI_EVENT_CLASS_OPTIONS"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </dd>
                  </div>
                  <div class="ai-event-detail__grid-item ai-event-detail__grid-item--full">
                    <dt>识别结果</dt>
                    <dd>
                      <span v-if="assessed">{{ eventDetail.assessment_result }}</span>
                      <el-select
                        v-else
                        v-model="eventDetail.assessment_result"
                        size="small"
                        class="ai-event-detail__select"
                        popper-class="custom-select-popper ai-event-detail-select-popper"
                        teleported
                        @change="onAssessmentChange"
                      >
                        <el-option
                          label="正确"
                          value="正确"
                        />
                        <el-option
                          label="错误"
                          value="错误"
                        />
                      </el-select>
                    </dd>
                  </div>
                </dl>
                <div
                  v-if="!assessed"
                  class="ai-event-detail__actions"
                >
                  <el-button
                    type="primary"
                    size="small"
                    @click="submit"
                  >
                    提 交
                  </el-button>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
/* 全屏容器：四边统一留白，盖住看板/抓拍条 */
.ai-event-detail-shell {
  --ai-event-detail-gutter: 16px;

  position: fixed;
  inset: 0;
  z-index: 2200;
  box-sizing: border-box;
  padding: var(--ai-event-detail-gutter);
}

.ai-event-detail__scrim {
  position: absolute;
  inset: 0;
  background: rgba(2, 8, 18, 0.58);
  backdrop-filter: blur(3px);
}

.ai-event-detail {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 12px 14px;
  overflow: hidden;
  color: #e8f2ff;
  background: linear-gradient(165deg, rgba(8, 24, 48, 0.98) 0%, rgba(5, 14, 30, 0.98) 100%);
  border: 1px solid rgba(62, 140, 210, 0.4);
  border-radius: 10px;
  box-shadow:
    0 0 0 1px rgba(126, 200, 255, 0.08) inset,
    0 16px 48px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
}

.ai-event-detail__toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: linear-gradient(180deg, rgba(22, 58, 102, 0.95), rgba(10, 28, 52, 0.92));
  border: 1px solid rgba(62, 140, 210, 0.28);
  border-radius: 8px;
}

.ai-event-detail__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;

  &::before {
    width: 3px;
    height: 16px;
    content: "";
    background: linear-gradient(180deg, #7ec8ff, #3d8fd4);
    border-radius: 2px;
  }
}

.ai-event-detail__close {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  color: rgba(201, 215, 234, 0.85);
  cursor: pointer;
  background: rgba(12, 40, 77, 0.65);
  border: 1px solid rgba(62, 140, 210, 0.35);
  border-radius: 6px;

  &:hover {
    color: #7ec8ff;
    border-color: rgba(126, 200, 255, 0.55);
  }
}

.ai-event-detail__body {
  display: flex;
  flex: 1;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
}

.ai-event-detail__media,
.ai-event-detail__card {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: linear-gradient(180deg, rgba(16, 44, 78, 0.92), rgba(8, 24, 46, 0.98));
  border: 1px solid rgba(62, 140, 210, 0.28);
  border-radius: 8px;
}

.ai-event-detail__card {
  overflow: hidden;
}

.ai-event-detail__media {
  flex: 1;
  min-width: 0;
}

.ai-event-detail__media-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 12px 12px 12px;
  overflow: hidden;
}

.ai-event-detail__side {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 10px;
  width: min(420px, 30vw);
  min-height: 0;
  overflow: hidden;
}

.ai-event-detail__card--trajectory {
  flex: 1 1 0;
  min-height: 120px;
}

.ai-event-detail__card--detail {
  flex: 0 1 auto;
  max-height: 52%;
  min-height: 0;
}

.ai-event-detail__section-head {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  align-items: center;
  height: 40px;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid rgba(62, 140, 210, 0.18);
}

.ai-event-detail__dot {
  width: 6px;
  height: 6px;
  background: #7ec8ff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(126, 200, 255, 0.45);
}

.ai-event-detail__card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 10px 12px;
  overflow-y: auto;
}

.ai-event-detail__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: rgba(4, 12, 24, 0.65);
  border-radius: 6px;

  img,
  video {
    width: auto;
    max-width: 100%;
    height: auto;
    max-height: 100%;
    cursor: zoom-in;
    object-fit: contain;
  }

  video {
    cursor: default;
  }
}

.ai-event-detail__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 12px;
  margin: 0;

  &-item {
    min-width: 0;
    margin: 0;

    &--full {
      grid-column: 1 / -1;
    }

    dt {
      margin: 0 0 4px;
      font-size: 12px;
      color: rgba(201, 215, 234, 0.72);
    }

    dd {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      line-height: 1.5;
      word-break: break-all;
    }
  }
}

.ai-event-detail__select {
  width: 100%;

  :deep(.el-select__wrapper) {
    min-height: 28px;
    background-color: rgba(12, 40, 77, 0.85) !important;
    box-shadow: 0 0 0 1px rgba(62, 140, 210, 0.35) inset !important;
  }

  :deep(.el-select__selected-item),
  :deep(.el-select__placeholder) {
    font-size: 13px;
    color: #e8f2ff;
  }
}

.ai-event-detail__actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  margin-top: auto;
}

:deep(.ai-event-detail__tabs) {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;

  .el-tabs__header {
    flex-shrink: 0;
    margin: 0 0 10px;
    padding-top: 2px;
    border: none;
  }

  /* card 类型 Tab 默认 overflow:hidden 会裁切上边框 */
  .el-tabs__nav-wrap,
  .el-tabs__nav-scroll {
    overflow: visible !important;
  }

  .el-tabs__nav {
    gap: 6px;
    border: none;
  }

  .el-tabs__item {
    box-sizing: border-box;
    height: 34px;
    padding: 0 12px;
    font-size: 13px;
    line-height: 32px;
    color: rgba(201, 215, 234, 0.75);
    border: 1px solid rgba(62, 140, 210, 0.25) !important;
    border-radius: 4px;

    &.is-active {
      color: #e8f2ff;
      background: rgba(62, 140, 210, 0.22);
      border-color: rgba(126, 200, 255, 0.55) !important;
    }
  }

  .el-tabs__content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .el-tab-pane {
    height: 100%;
    min-height: 0;
  }
}

:deep(.el-empty__description) {
  color: rgba(201, 215, 234, 0.65);
}
</style>

<!-- 下拉挂 body，需高于抓拍详情壳层 z-index: 2200 -->
<style lang="scss">
.ai-event-detail-select-popper.el-popper {
  z-index: 2300 !important;
}
</style>
