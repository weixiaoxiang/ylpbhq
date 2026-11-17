<script lang="ts" setup>
import type { FlightPlanCreateForm } from "./flight-plan-utils"

/** 新建计划表单：分组布局 + 深色分段控件（无 Element 白底 radio） */
defineOptions({ name: "FlightPlanCreatePanel" })

interface Props {
  form: FlightPlanCreateForm
  deviceLabel: string
  deviceOnline?: boolean
  deviceWorking?: boolean
  droneName?: string
  waylineLabel: string
  waylineType?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  cancel: []
  submit: []
  pickDevice: []
  pickWayline: []
}>()

function setField<K extends keyof FlightPlanCreateForm>(key: K, value: FlightPlanCreateForm[K]) {
  props.form[key] = value
}

function selectGnss() {
  if (props.form.wayline_precision_type === "gps") return
  ElMessageBox.confirm("切换为 GNSS 模式后任务将无法高精度执行，是否切换？", "提示", {
    confirmButtonText: "切换",
    cancelButtonText: "取消",
    type: "warning",
    customClass: "ai-flight-plan-message-box"
  })
    .then(() => {
      setField("wayline_precision_type", "gps")
    })
    .catch(() => {})
}
</script>

<template>
  <div class="flight-plan-create">
    <div class="flight-plan-create__scroll ai-scroll">
      <el-form
        label-position="top"
        class="flight-plan-create__form fp-dark-form"
      >
        <!-- 基础信息 -->
        <section class="fp-block">
          <header class="fp-block__title">基础信息</header>

          <div class="fp-field">
            <div class="fp-field__head">
              <span class="fp-field__label">选择设备</span>
              <button
                type="button"
                class="fp-action-link"
                @click="emit('pickDevice')"
              >
                {{ form.sn ? "重新选择" : "选择设备" }}
              </button>
            </div>
            <div
              v-if="form.sn"
              class="fp-card"
            >
              <div class="fp-card__row">
                <strong>{{ deviceLabel }}</strong>
                <span
                  class="fp-tag"
                  :class="deviceOnline ? 'fp-tag--ok' : 'fp-tag--danger'"
                >
                  {{ deviceOnline ? "在线" : "不在线" }}
                </span>
              </div>
              <p class="fp-card__meta">{{ deviceWorking ? "设备工作中" : "设备空闲中" }} · {{ droneName || "—" }}</p>
            </div>
            <p
              v-else
              class="fp-hint"
            >
              请先选择机场设备
            </p>
          </div>

          <div class="fp-field">
            <label class="fp-field__label">计划名称</label>
            <el-input
              v-model="form.name"
              placeholder="输入计划名称"
              clearable
            />
          </div>

          <div class="fp-field">
            <div class="fp-field__head">
              <span class="fp-field__label">执行航线</span>
              <button
                type="button"
                class="fp-action-link"
                @click="emit('pickWayline')"
              >
                {{ form.wayline_uuid ? "重新选择" : "选择航线" }}
              </button>
            </div>
            <div
              v-if="form.wayline_uuid"
              class="fp-card"
            >
              <div class="fp-card__row">
                <strong>{{ waylineLabel }}</strong>
                <span class="fp-tag fp-tag--info">{{ waylineType || "航线" }}</span>
              </div>
            </div>
            <p
              v-else
              class="fp-hint"
            >
              选择航线后可在地图预览
            </p>
          </div>
        </section>

        <!-- 任务配置 -->
        <section class="fp-block">
          <header class="fp-block__title">任务配置</header>

          <div class="fp-field">
            <span class="fp-field__label">任务精度</span>
            <div class="fp-segment">
              <button
                type="button"
                class="fp-segment__item"
                :class="{ 'is-active': form.wayline_precision_type === 'rtk' }"
                @click="setField('wayline_precision_type', 'rtk')"
              >
                高精度 RTK
              </button>
              <button
                type="button"
                class="fp-segment__item"
                :class="{ 'is-active': form.wayline_precision_type === 'gps' }"
                @click="selectGnss"
              >
                GNSS
              </button>
            </div>
          </div>

          <div class="fp-field">
            <span class="fp-field__label">任务策略</span>
            <div class="fp-segment fp-segment--quad">
              <button
                v-for="item in [
                  { k: 'immediate', t: '立即' },
                  { k: 'timed', t: '单次定时' },
                  { k: 'recurring', t: '重复定时' },
                  { k: 'continuous', t: '连续执行' }
                ]"
                :key="item.k"
                type="button"
                class="fp-segment__item"
                :class="{ 'is-active': form.task_type === item.k }"
                @click="setField('task_type', item.k as FlightPlanCreateForm['task_type'])"
              >
                {{ item.t }}
              </button>
            </div>
          </div>

          <div
            v-if="form.task_type === 'timed'"
            class="fp-field"
          >
            <label class="fp-field__label">执行时间</label>
            <el-date-picker
              v-model="form.begin_at"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="选择日期时间"
              popper-class="ai-flight-plan-popper"
              teleported
            />
          </div>

          <template v-if="form.task_type === 'recurring' || form.task_type === 'continuous'">
            <div class="fp-field">
              <label class="fp-field__label">执行日期</label>
              <el-date-picker
                v-model="form.scheduleDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                popper-class="ai-flight-plan-popper"
                teleported
              />
            </div>

            <div class="fp-field">
              <span class="fp-field__label">重复频率</span>
              <div class="fp-repeat-row">
                <span class="fp-repeat-row__prefix">每</span>
                <el-input-number
                  v-model="form.repeat_option.interval"
                  class="fp-repeat-row__interval"
                  :min="1"
                  :controls="true"
                  controls-position="right"
                />
                <div class="fp-segment fp-segment--compact">
                  <button
                    v-for="item in [
                      { k: 'daily', t: '天' },
                      { k: 'weekly', t: '周' },
                      { k: 'monthly', t: '月' }
                    ]"
                    :key="item.k"
                    type="button"
                    class="fp-segment__item"
                    :class="{ 'is-active': form.repeat_type === item.k }"
                    @click="setField('repeat_type', item.k as FlightPlanCreateForm['repeat_type'])"
                  >
                    {{ item.t }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-if="form.task_type === 'recurring'"
              class="fp-field"
            >
              <label class="fp-field__label">执行时间</label>
              <el-time-picker
                v-model="form.recurring_task_start_time_list[0]"
                value-format="HH:mm"
                format="HH:mm"
                placeholder="选择时间"
                popper-class="ai-flight-plan-popper"
                teleported
              />
            </div>

            <div
              v-if="form.task_type === 'continuous'"
              class="fp-field"
            >
              <label class="fp-field__label">执行时段</label>
              <el-time-picker
                v-model="form.continuous_task_periods[0]"
                is-range
                value-format="HH:mm"
                format="HH:mm"
                range-separator="至"
                popper-class="ai-flight-plan-popper"
                teleported
              />
            </div>

            <div
              v-if="form.task_type === 'continuous'"
              class="fp-field"
            >
              <label class="fp-field__label">最低执行电量 (%)</label>
              <el-input-number
                v-model="form.min_battery_capacity"
                :min="0"
                :max="100"
                controls-position="right"
              />
            </div>
          </template>
        </section>

        <!-- 飞行安全 -->
        <section class="fp-block">
          <header class="fp-block__title">飞行安全</header>

          <div class="fp-switch-row">
            <span class="fp-switch-row__label">自动断点续飞</span>
            <el-switch
              v-model="form.resumable_status"
              active-value="auto"
              inactive-value="manual"
            />
          </div>

          <div class="fp-switch-row">
            <span class="fp-switch-row__label">智能规划返航路线</span>
            <el-switch
              v-model="form.rth_mode"
              active-value="optimal"
              inactive-value="preset"
            />
          </div>

          <div class="fp-field">
            <label class="fp-field__label">最低返航高度 (m)</label>
            <el-input-number
              v-model="form.rth_altitude"
              :min="0"
              :max="1500"
              controls-position="right"
            />
          </div>

          <div class="fp-field">
            <span class="fp-field__label">航线飞行中失联</span>
            <div class="fp-segment">
              <button
                type="button"
                class="fp-segment__item"
                :class="{ 'is-active': form.out_of_control_action_in_flight === 'return_home' }"
                @click="setField('out_of_control_action_in_flight', 'return_home')"
              >
                返航
              </button>
              <button
                type="button"
                class="fp-segment__item"
                :class="{ 'is-active': form.out_of_control_action_in_flight === 'continue_task' }"
                @click="setField('out_of_control_action_in_flight', 'continue_task')"
              >
                继续执行
              </button>
            </div>
          </div>
        </section>
      </el-form>
    </div>

    <footer class="flight-plan-create__footer">
      <button
        type="button"
        class="fp-footer-btn"
        @click="emit('cancel')"
      >
        取消
      </button>
      <button
        type="button"
        class="fp-footer-btn fp-footer-btn--primary"
        @click="emit('submit')"
      >
        确定
      </button>
    </footer>
  </div>
</template>

<style scoped lang="scss">
@import "./flight-plan-theme.scss";

.flight-plan-create {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.flight-plan-create__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
}

.flight-plan-create__form {
  @include fp-element-dark;
}

.fp-block {
  margin-bottom: 18px;
  padding: 14px 12px 12px;
  border-radius: 8px;
  border: 1px solid rgba(56, 98, 140, 0.35);
  background: linear-gradient(165deg, rgba(10, 32, 58, 0.72), rgba(6, 18, 36, 0.55));
  box-shadow: inset 0 1px 0 rgba(126, 200, 255, 0.06);

  &:last-of-type {
    margin-bottom: 8px;
  }
}

.fp-block__title {
  margin: 0 0 14px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: #9ad4ff;
  border-bottom: 1px solid rgba(56, 98, 140, 0.4);
}

.fp-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.fp-field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fp-field__label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(201, 215, 234, 0.88);
}

.fp-action-link {
  padding: 0;
  font-size: 13px;
  font-weight: 500;
  color: #6ec4ff;
  border: none;
  background: transparent;
  cursor: pointer;

  &:hover {
    color: #9ad8ff;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

.fp-hint {
  margin: 0;
  font-size: 12px;
  color: rgba(148, 172, 200, 0.7);
}

.fp-card {
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(56, 98, 140, 0.45);
  background: rgba(8, 24, 48, 0.65);
}

.fp-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;

  strong {
    font-size: 14px;
    font-weight: 600;
    color: #e8f2ff;
  }
}

.fp-card__meta {
  margin: 0;
  font-size: 12px;
  color: rgba(168, 192, 218, 0.78);
}

.fp-tag {
  flex-shrink: 0;
  padding: 0 8px;
  font-size: 11px;
  line-height: 20px;
  border-radius: 3px;
  border: 1px solid transparent;

  &--ok {
    color: #7ec8ff;
    border-color: rgba(126, 200, 255, 0.4);
    background: rgba(126, 200, 255, 0.1);
  }

  &--danger {
    color: #f0a0a0;
    border-color: rgba(240, 160, 160, 0.4);
    background: rgba(240, 160, 160, 0.08);
  }

  &--info {
    color: #c9d7ea;
    border-color: rgba(201, 215, 234, 0.35);
    background: rgba(201, 215, 234, 0.06);
  }
}

.fp-segment {
  @include fp-segment-group;

  &--quad .fp-segment__item {
    flex: 1 1 calc(50% - 6px);
    min-width: calc(50% - 6px);
  }

  &--compact {
    flex: 1;
    min-width: 0;
  }
}

.fp-segment__item {
  @include fp-segment-item;
}

.fp-repeat-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  &__prefix {
    font-size: 13px;
    color: rgba(190, 204, 220, 0.82);
  }

  /* 窄数字框：覆盖表单内 el-input-number 的 42px 左右 padding，否则数字被挤没 */
  :deep(.fp-repeat-row__interval.el-input-number) {
    width: 116px;
    flex-shrink: 0;

    .el-input__wrapper {
      padding-left: 10px !important;
      padding-right: 32px !important;
    }

    .el-input__inner {
      text-align: left;
    }

    .el-input-number__decrease,
    .el-input-number__increase {
      width: 28px !important;
    }
  }
}

.fp-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid rgba(48, 72, 104, 0.45);
  background: rgba(8, 24, 48, 0.45);

  &__label {
    font-size: 13px;
    font-weight: 500;
    color: rgba(201, 215, 234, 0.9);
  }
}

.flight-plan-create__footer {
  flex-shrink: 0;
  display: flex;
  gap: 10px;
  margin-top: 4px;
  padding: 12px 0 2px;
  border-top: 1px solid rgba(56, 98, 140, 0.45);
  background: linear-gradient(180deg, transparent, rgba(6, 18, 36, 0.85));
}

.fp-footer-btn {
  flex: 1;
  height: 38px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(201, 215, 234, 0.92);
  border: 1px solid rgba(56, 98, 140, 0.65);
  border-radius: 6px;
  background: rgba(10, 32, 58, 0.92);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: rgba(88, 186, 241, 0.45);
    background: rgba(16, 48, 82, 0.95);
  }

  &--primary {
    color: #e8f2ff;
    border-color: rgba(110, 196, 255, 0.55);
    background: linear-gradient(180deg, rgba(70, 147, 190, 0.95), rgba(40, 96, 132, 0.98));
    box-shadow: 0 0 12px rgba(88, 186, 241, 0.25);

    &:hover {
      border-color: rgba(154, 212, 255, 0.65);
      background: linear-gradient(180deg, rgba(88, 186, 241, 0.95), rgba(52, 109, 141, 0.98));
    }
  }
}

.ai-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(62, 140, 210, 0.5) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(62, 140, 210, 0.45);
    border-radius: 4px;
  }
}
</style>
