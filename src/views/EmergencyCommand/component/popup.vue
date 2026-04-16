<script lang="ts" setup>
import FhPopup from "./fhPopup.vue"
import XhPopup from "./xhPopup.vue"

let props = defineProps(["popupInfo"])

watch(
  () => props.popupInfo,
  async (newVal, oldVal) => {}
)
const emit = defineEmits(["close"])

const close = () => {
  emit("close")
}
</script>
<template>
  <div>
    <!-- 防火弹框 -->
    <FhPopup
      v-if="popupInfo?.pointType === '防火监控'"
      :popupInfo="popupInfo"
      @close="close"
    />
    <!-- 巡护弹框 -->
    <XhPopup
      v-else-if="popupInfo?.pointType === '巡护'"
      :popupInfo="popupInfo"
      @close="close"
    />
  </div>
</template>

<style lang="scss" scoped></style>
