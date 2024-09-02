<template>
  <div class="preview">
    <PDFViewer v-if="PDFSrc" page-scale="page-fit" theme="dark" :src="PDFSrc" :key="path" @loaded="onLoaded" />
  </div>
</template>

<script lang="ts" setup>
interface Props {
  path: string
}
const props = withDefaults(defineProps<Props>(), {
  path: ""
})

const PDFSrc = ref<string>("")
const baseURL = import.meta.env.VITE_BASE_URL
const onLoaded = (pdfApp: any) => {
  console.info("loaded app:", pdfApp)
}
// 切换pdf文件
watch(
  () => props.path,
  (newVal) => {
    if (newVal) {
      PDFSrc.value = baseURL + newVal
    }
  },
  {
    immediate: true
  }
)
</script>

<style lang="scss" scoped>
.preview {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
