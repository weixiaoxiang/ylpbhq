<template>
  <div class="editor">
    <Toolbar class="editor-bar" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor class="editor-con" v-model="modelValue" @on-change="handleChange" :defaultConfig="editorConfig" :mode="mode"
      @onCreated="handleCreated" />
  </div>
</template>

<script lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css"; // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { UploadPicToFile } from "@/api/upload"

const props = defineProps({
  text: {
    type: String,
    default: "",
  },
  modelValue: {
    type: [String],
    default: '',
  },
});
const emit = defineEmits(['update:modelValue']);
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref("");

watchEffect(() => {
  valueHtml.value = props.text!;
});
// 模拟 ajax 异步获取内容
onMounted(() => {});
const mode = ref("default");
const toolbarConfig = reactive({
  toolbarKeys: [
    'clearStyle',
    '|',
    'bold',
    'underline',
    'italic',
    'through',
    'headerSelect',
    'fontSize',
    'fontFamily',
    '|',
    'sub',
    'sup',
    'color',
    'bgColor',
    'bulletedList',
    'numberedList',
    '|',
    'indent',
    'delIndent',
    'justifyLeft',
    'justifyCenter',
    'justifyRight',
    'lineHeight',
    '|',
    'uploadImage',
    'insertImage',
    // '|',
    // 'uploadVideo',
    // 'insertVideo',
    '|',
    'insertLink',
    '|',
    'fullScreen',
  ],
});

// const modelValue = useVModel(props, 'modelValue', emit)
const modelValue = ref(props.modelValue)
const editorConfig = {
  MENU_CONF: {
    uploadImage: {
      // 自定义图片上传
      async customUpload(file: any, insertFn: any) {
        const formData = new FormData()
        formData.append('file', file)
        UploadPicToFile(formData).then((res:any) => {
          if (res.success) {
            insertFn('/imageApi/' + res.response)
          } else {
            ElMessage.error(res.msg)
          }
        })
      },
    },
  },
}
const handleCreated = (editor: any) => {
  editorRef.value = editor
}
const handleChange = (editor: any) => {
  modelValue.value = editor.isEmpty() ? '' : editor.getHtml()
  emit('update:modelValue', modelValue.value)
}
// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
  height: 300px;
  border: 2px solid var(--el-color-primary);
  display: flex;
  flex-direction: column;
  .editor-bar {
    border-bottom: 1px solid #ccc;
  }
  .editor-con {
    flex: 1;
    overflow-y: scroll;
  }
}
</style>
