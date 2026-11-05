<script lang="ts" setup>
import dayjs from "dayjs"
import { danieUavApi } from "@/api/danieUav"
import { danieFileUrl } from "@/utils/ai-drone/file-url"
import { isDanieOk } from "@/utils/ai-drone/response"

interface Props {
  detail: Record<string, unknown> | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: []
}>()

const form = ref({
  resultId: 0,
  warning_result: "正报",
  is_warning_disposal: true,
  is_sms: false,
  warning_remark: ""
})
const phone = ref("")

watch(
  () => props.detail,
  (value) => {
    if (!value) return
    form.value = {
      resultId: Number(value.resultId ?? value.id ?? 0),
      warning_result: String(value.warning_result || "正报"),
      is_warning_disposal: true,
      is_sms: Boolean(value.is_sms),
      warning_remark: String(value.warning_remark || "")
    }
    phone.value = ""
  },
  { immediate: true }
)

const imageUrl = computed(() => danieFileUrl(String(props.detail?.image_url_local || "")))

async function submit() {
  if (form.value.is_sms && !/^1\d{10}$/.test(phone.value)) {
    ElMessage.error("请输入正确的手机号")
    return
  }
  const res = (await danieUavApi.PutAIWarningResult(form.value)) as { success?: boolean }
  if (!isDanieOk(res)) {
    ElMessage.error("处置失败")
    return
  }
  if (form.value.is_sms && props.detail) {
    const sms = (await danieUavApi.PostAIWarningSms({
      Device: props.detail.droneName,
      Longitude: String(props.detail.longitude || ""),
      Latitude: String(props.detail.latitude || ""),
      EventType: props.detail.class_name,
      EventDay: dayjs(String(props.detail.create_time || "")).format("YYYY年MM月DD"),
      EventTime: dayjs(String(props.detail.create_time || "")).format("HH:mm:ss"),
      Mobile: phone.value,
      AutoGetAddress: true
    })) as { success?: boolean }
    if (isDanieOk(sms)) ElMessage.success("短信发送成功")
  }
  ElMessage.success("处理成功")
  emit("saved")
  emit("close")
}
</script>

<template>
  <el-dialog
    :model-value="!!detail"
    title="预警详情"
    width="640px"
    append-to-body
    @close="emit('close')"
  >
    <div
      v-if="detail"
      class="flex gap-4"
    >
      <el-image
        class="h-[220px] w-[280px] shrink-0"
        :src="imageUrl"
        fit="cover"
        :preview-src-list="imageUrl ? [imageUrl] : []"
      />
      <el-form
        label-width="88px"
        class="flex-1"
      >
        <el-form-item label="类型">{{ detail.class_name || "-" }}</el-form-item>
        <el-form-item label="时间">{{ detail.create_time || "-" }}</el-form-item>
        <el-form-item label="处置结论">
          <el-radio-group v-model="form.warning_result">
            <el-radio label="正报">正报</el-radio>
            <el-radio label="误报">误报</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.warning_remark"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="短信通知">
          <el-switch v-model="form.is_sms" />
        </el-form-item>
        <el-form-item
          v-if="form.is_sms"
          label="手机号"
        >
          <el-input
            v-model="phone"
            maxlength="11"
            placeholder="请输入手机号"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="emit('close')">取消</el-button>
      <el-button
        type="primary"
        @click="submit"
        >提交处置</el-button
      >
    </template>
  </el-dialog>
</template>
