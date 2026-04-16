<template>
  <!-- 上传组件 -->
  <el-upload
    v-model="imgUrl"
    class="single-uploader"
    :show-file-list="false"
    :before-upload="handleBeforeUpload"
    :http-request="uploadFile"
  >
    <img
      v-if="imgUrl"
      :src="imgUrl"
      class="single-uploader__image"
    />
    <!-- <el-icon v-else class="single-uploader__icon"><i-ep-plus /></el-icon> -->
    <el-text
      v-else
      class="mx-1"
      type="primary"
      >上传</el-text
    >
  </el-upload>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions } from "element-plus"
// import FileAPI from "@/api/file";
// import { getImagesUrl } from '@/components/hooks/changeImagesUrl'

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  },
  isBanner: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(["update:modelValue"])
// const imgUrl = useVModel(props, "modelValue", emit);
const imgUrl = ref(props.modelValue)
/**
 * 自定义图片上传
 *
 * @param options
 */
async function uploadFile(options: UploadRequestOptions): Promise<any> {
  // const data: any = await FileAPI.uploadImage(options.file);
  // if (data.code === 0) {
  //   ElMessage.success("上传成功");
  //   imgUrl.value = getImagesUrl(data.data)
  // }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > 2 * 1048 * 1048) {
    ElMessage.warning("上传图片不能大于2M")
    return false
  }

  // let sizeBoolen =  asyncImgChecked(file)
  // if (props.isBanner&&sizeBoolen) {

  // }
  return true
}
// function asyncImgChecked (file:any) {
//     let reader = new FileReader()
//     reader.readAsDataURL(file.raw) // 必须用file.raw
//     reader.onload = () => { // 让页面中的img标签的src指向读取的路径
//       let img = new Image()
//       img.src = reader.result
//       if (img.complete) { // 如果存在浏览器缓存中
//         if (img.width < 750 || img.height < 440) {
//           return false
//         } else {
//           return true
//         }
//       } else {
//         img.onload = () => {
//           if (img.width < 750 || img.height < 440) {
//             return false
//           } else {
//             return true
//           }
//         }
//       }
//     }
// }
</script>

<style scoped lang="scss">
.single-uploader {
  overflow: hidden;
  cursor: pointer;
  // border: 1px var(--el-border-color) solid;
  border-radius: 6px;

  &:hover {
    border-color: var(--el-color-primary);
  }

  &__image {
    display: block;
    width: 178px;
    height: 178px;
  }

  &___icon {
    width: 178px;
    height: 178px;
    font-size: 28px;
    color: #8c939d;
    text-align: center;
  }
}
</style>
