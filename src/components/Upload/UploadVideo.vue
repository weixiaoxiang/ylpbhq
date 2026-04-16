<template>
  <div class="upload-box">
    <el-upload class="upload-demo" :id="uuid" :accept="fileType.join(',')" action="#" :before-upload="beforeUpload"
      :multiple="false" :on-error="uploadError" :on-success="uploadSuccess" :http-request="httpRequest"
      :show-file-list="true" :file-list="fileList" :before-remove="beforeRemove" :on-remove="handleRemove">
      <el-button type="primary">上传视频</el-button>
      <template #tip>
        <div class="el-upload__tip">
          支持上传mp4格式视频，最大500M
        </div>
      </template>
    </el-upload>
  </div>
</template>

<script lang="ts" setup>
import type { UploadProps } from 'element-plus'
import { useUpload } from '@/components/Upload/useUpload'
defineOptions({ name: 'UploadVideo' })
const fileList = ref<any[]>([])
// 接受父组件参数
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
    required: false
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false
  }, // 是否禁用上传组件 ==> 非必传（默认为 false）
  fileSize: {
    type: Number,
    default: 500,
    required: false
  }, // 图片大小限制 ==> 非必传（默认为 10M）
  fileType: {
    type: Array,
    default: () => {
      return ['video/mp4']
    },
    required: false
  }, // 图片类型限制 ==> 非必传（默认为 ["image/jpeg", "image/png", "image/gif"]）
})
// 监听模型绑定值变动
watch(
  () => props.modelValue,
  (val: string | string[]) => {
    console.log('监听模型绑定值变动', val)
    if (!val) {
      fileList.value = [] // fix：处理掉缓存，表单重置后上传组件的内容并没有重置
      return
    }
    let url:any = val
    fileList.value = [{ name: url.substring(url.lastIndexOf('/') + 1), url }] // 保障数据为空

  }
)
onMounted(() => {
  if (props.modelValue) {
    let url = props.modelValue
    fileList.value = [
      {
        name: url.substring(url.lastIndexOf('/') + 1), url
    }]
  } else {
    fileList.value = []
  }
})

const http = ref('/imageApi/')
// 生成组件唯一id
const uuid = ref('id-' + generateUUID())

const emit = defineEmits(['update:modelValue'])
const { httpRequest } = useUpload()

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const imgSize = rawFile.size / 1024 / 1024 < props.fileSize
  const imgType = props.fileType
  if (!imgType.includes(rawFile.type))
  ElMessage.warning(`上传文件不符合所需的格式`)
  if (!imgSize) {
    ElMessage.warning(`上传文件大小不能超过 ${props.fileSize}M！`)
  }
  return imgType.includes(rawFile.type) && imgSize
}
// 图片上传成功提示
const uploadSuccess: UploadProps['onSuccess'] = (res: any): void => {
  // ElMessage.success('上传成功')
  emit('update:modelValue', res)
}
// 图片上传错误提示
const uploadError = () => {
  ElMessage.error('文件上传失败，请您重新上传！')
}
//生成唯一ID
function generateUUID() {
  if (typeof crypto === 'object') {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof crypto.getRandomValues === 'function' && typeof Uint8Array === 'function') {
      const callback = (c: any) => {
        const num = Number(c)
        return (num ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (num / 4)))).toString(
          16
        )
      }
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, callback)
    }
  }
  let timestamp = new Date().getTime()
  let performanceNow =
    (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let random = Math.random() * 16
    if (timestamp > 0) {
      random = (timestamp + random) % 16 | 0
      timestamp = Math.floor(timestamp / 16)
    } else {
      random = (performanceNow + random) % 16 | 0
      performanceNow = Math.floor(performanceNow / 16)
    }
    return (c === 'x' ? random : (random & 0x3) | 0x8).toString(16)
  })
}
const beforeRemove: UploadProps['beforeRemove'] = (file, fileList) => {
  return confirm('确认删除该文件吗？')
}
const handleRemove = (file: any, fileList: any) => {
    emit('update:modelValue', '')
}
</script>
<style lang="scss" scoped>
</style>
