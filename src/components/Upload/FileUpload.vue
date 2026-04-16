<template>
  <!-- 上传组件 -->
  <div class="upload-file">
    <el-upload
      @before-upload="handleBeforeUpload"
      :http-request="uploadFile"
      :show-file-list="false"
      ref="upload"
      v-model:file-list="fileList"
    >
      <!-- <el-button size="small">上传文件</el-button> -->
      <!-- <div class="upBtn"></div> -->
      <div class="btn">
        <img
          :src="$fun.getImg('forestResources/up_icon.png')"
          alt=""
        />
        上传文件
      </div>
      <template #tip>
        <div class="el-upload__tip">支持扩展名：.rar .zip .doc .docx .pdf .jpg...</div>
      </template>
    </el-upload>
    <!-- <div v-for="(file, index) in fileList" :key="index" class="file-list" v-if="fileList.length > 0">
      <el-tooltip class="item" effect="dark" :content="file.name" placement="right">
        <span>{{ file.name.length > 40 ? file.name.slice(0, 40) + '...' : file.name }} </span>
      </el-tooltip>
      <div>
        <el-button type="text" size="small" @click="handledownload(file)">下载</el-button>
        <el-button type="text" size="small" style="color: red;" @click="handleRemove(file)">删除</el-button>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { UploadRawFile, UploadRequestOptions } from "element-plus"
// import FileAPI from "@/api/file";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  }
})

const emit = defineEmits(["update:modelValue", "message"])
const files = ref<any[]>([])
// const imgUrl = useVModel(props, "modelValue", emit);
const fileList = ref<any[]>([])
/**
 * 自定义图片上传
 *
 * @param options
 */
async function uploadFile(options: UploadRequestOptions): Promise<any> {
  // imgUrl.value = ''

  ElMessage.info("正在上传，请稍等...")
  // const data = await FileAPI.upload(options.file);
  // files.value.push(data.result.fileUrl);
  // setTimeout(() => {
  //   emit("update:modelValue", files.value.join(";"));
  //   emit('message', files.value)
  //   // imgUrl.value = files.value.join(";");
  // }, 300);
}
const handledownload = (file: any) => {
  let fileLookUrl = file + "?response-content-type=application/octet-stream"
  window.open(fileLookUrl, "_blank")
}
const handleRemove = (file: any) => {
  fileList.value.splice(fileList.value.indexOf(file), 1)
}
/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > 10 * 1048 * 1048) {
    ElMessage.warning("上传文件不能大于10M")
    return false
  }
  return true
}
</script>

<style scoped lang="scss">
.single-uploader {
  overflow: hidden;
  cursor: pointer;
  border: 1px var(--el-border-color) solid;
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

.file-list {
  display: flex;
}

.upload-file {
  // height: 100px;
  overflow-y: auto;

  .upBtn {
    width: 94px;
    height: 28px;
    background: url("@/assets/images/forestResources/upload_btn.png") no-repeat;
    background-size: 100% 100%;
    margin-left: 25px;
  }

  .btn {
    margin-left: 25px;
    width: 94px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.2083vw;
    padding: 0.1563vw 0.3125vw;
    border-radius: 0.1042vw;
    border: 1px solid #2aeaf7;
    cursor: pointer;
    color: #2aeaf7;

    img {
      width: 16px;
      height: 17px;
    }
  }

  .el-upload__tip {
    margin-left: 25px;
    color: #beccdc;
    margin-bottom: 10px;
  }
}
</style>
