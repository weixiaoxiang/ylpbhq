<template>
  <div class="upload-box">
    <el-upload :id="uuid" :accept="fileType.join(',')" action="#" :before-upload="beforeUpload"
      :class="['upload', drag ? 'no-border' : '']" :drag="drag" :multiple="false" :on-error="uploadError"
      :on-success="uploadSuccess" :http-request="httpRequest1" :show-file-list="false">
      <template v-if="modelValue">
        <img :src="url" class="upload-image" />
        <div class="upload-handle" @click.stop>
          <div class="handle-icon" @click="editImg" v-if="!disabled">
            <el-icon>
              <Edit />
            </el-icon>
            <span v-if="showBtnText">编辑</span>
          </div>
          <div class="handle-icon" @click="imagePreview(http+modelValue)">
            <el-icon>
              <ZoomIn />
            </el-icon>
            <span v-if="showBtnText">详情</span>
          </div>
          <div v-if="showDelete && !disabled" class="handle-icon" @click="deleteImg">
            <el-icon>
              <Delete />
            </el-icon>
            <span v-if="showBtnText">删除</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="upload-empty">
          <slot name="empty">
            <el-icon>
              <Plus />
            </el-icon>
          </slot>
        </div>
      </template>
    </el-upload>
    <div class="el-upload__tip">
      <slot name="tip"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { UploadProps } from 'element-plus'
import { Edit, ZoomIn, Delete, Plus } from '@element-plus/icons-vue'
import { createImageViewer } from '@/components/ImageViewer'
import { useUpload1 } from '@/components/Upload/useUpload'

defineOptions({ name: 'UploadImg' })

// 接受父组件参数
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
    required: false
  },
  drag: {
    type: Boolean,
    default: true,
    required: false
  }, // 是否支持拖拽上传 ==> 非必传（默认为 true）
  disabled: {
    type: Boolean,
    default: false,
    required: false
  }, // 是否禁用上传组件 ==> 非必传（默认为 false）
  fileSize: {
    type: Number,
    default: 10,
    required: false
  }, // 图片大小限制 ==> 非必传（默认为 10M）
  fileType: {
    type: Array,
    default: () => {
      return ['image/jpeg', 'image/png', 'image/gif']
    },
    required: false
  }, // 图片类型限制 ==> 非必传（默认为 ["image/jpeg", "image/png", "image/gif"]）
  height: {
    type: String,
    default: '150px',
    required: false
  }, // 组件高度 ==> 非必传（默认为 150px）
  width: {
    type: String,
    default: '150px',
    required: false
  }, // 组件宽度 ==> 非必传（默认为 150px）
  borderradius: {
    type: String,
    default: '8px',
    required: false
  }, // 组件边框圆角 ==> 非必传（默认为 8px）
  // 是否显示删除按钮
  showDelete: {
    type: Boolean,
    default: true,
    required: false
  },
  // 是否显示按钮文字
  showBtnText: {
    type: Boolean,
    default: true,
    required: false
  }
})

const url = computed(() => {
  console.log(props.modelValue);
  
  if (props.modelValue.substring(0, 1) === '/') {
     return '/statisUrl'+props.modelValue
  } else {
    return '/statisUrl/' + props.modelValue
  }
})
onMounted(() => {
  console.log('modelValue', props.modelValue)
})
const http = ref('/statisUrl/')
// 生成组件唯一id
const uuid = ref('id-' + generateUUID())
// 查看图片
const imagePreview = (imgUrl: string) => {
  createImageViewer({
    zIndex: 9999999,
    urlList: [imgUrl]
  })
}
const emit = defineEmits(['update:modelValue'])
const deleteImg = () => {
  emit('update:modelValue', '')
}
const { httpRequest1 } = useUpload1()

const editImg = () => {
  const dom = document.querySelector(`#${uuid.value} .el-upload__input`)
  dom && dom.dispatchEvent(new MouseEvent('click'))
}

const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const imgSize = rawFile.size / 1024 / 1024 < props.fileSize
  const imgType = props.fileType
  if (!imgType.includes(rawFile.type))
  ElMessage.warning(`上传图片不符合所需的格式`)
  if (!imgSize) {
    ElMessage.warning(`上传图片大小不能超过 ${props.fileSize}M！`)
  }
  return imgType.includes(rawFile.type) && imgSize
}
// 图片上传成功提示
const uploadSuccess: UploadProps['onSuccess'] = (res: any): void => {
  ElMessage.success('上传成功')
  emit('update:modelValue', res)
}
// 图片上传错误提示
const uploadError = () => {
  ElMessage.error('图片上传失败，请您重新上传！')
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
</script>
<style lang="scss" scoped>
.is-error {
  .upload {

    :deep(.el-upload),
    :deep(.el-upload-dragger) {
      border: 1px dashed var(--el-color-danger) !important;

      &:hover {
        border-color: var(--el-color-primary) !important;
      }
    }
  }
}

:deep(.disabled) {

  .el-upload,
  .el-upload-dragger {
    cursor: not-allowed !important;
    background: var(--el-disabled-bg-color);
    border: 1px dashed var(--el-border-color-darker) !important;

    &:hover {
      border: 1px dashed var(--el-border-color-darker) !important;
    }
  }
}

.upload-box {
  .no-border {
    :deep(.el-upload) {
      border: none !important;
    }
  }

  :deep(.upload) {
    .el-upload {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: v-bind(width);
      height: v-bind(height);
      overflow: hidden;
      border: 1px dashed var(--el-border-color-darker);
      border-radius: v-bind(borderradius);
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: var(--el-color-primary);

        .upload-handle {
          opacity: 1;
        }
      }

      .el-upload-dragger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        background-color: transparent;
        border: 1px dashed var(--el-border-color-darker);
        border-radius: v-bind(borderradius);

        &:hover {
          border: 1px dashed var(--el-color-primary);
        }
      }

      .el-upload-dragger.is-dragover {
        background-color: var(--el-color-primary-light-9);
        border: 2px dashed var(--el-color-primary) !important;
      }

      .upload-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .upload-empty {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        line-height: 30px;
        color: var(--el-color-info);

        .el-icon {
          font-size: 28px;
          color: var(--el-text-color-secondary);
        }
      }

      .upload-handle {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background: rgb(0 0 0 / 60%);
        opacity: 0;
        box-sizing: border-box;
        transition: var(--el-transition-duration-fast);
        align-items: center;
        justify-content: center;

        .handle-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 6%;
          color: aliceblue;

          .el-icon {
            margin-bottom: 40%;
            font-size: 130%;
            line-height: 130%;
          }

          span {
            font-size: 85%;
            line-height: 85%;
          }
        }
      }
    }
  }

  .el-upload__tip {
    line-height: 18px;
    text-align: center;
  }
}
</style>
