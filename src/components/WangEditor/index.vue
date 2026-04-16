<template>
  <div class="wang-editor">
    <Toolbar
      class="editor-bar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
    <Editor
      class="editor-con beautify-scrollbar"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css" // 引入 css
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"

const props = defineProps({
  text: {
    type: String,
    default: ""
  }
})
const emit = defineEmits(["select"])
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref("")

watchEffect(() => {
  valueHtml.value = props.text!
})
// 模拟 ajax 异步获取内容
onMounted(() => {})
const mode = ref("default")
const toolbarConfig = reactive({
  // toolbarKeys: [
  //   "underline",
  //   "bold",
  //   "italic",
  //   "through",
  //   "code",
  //   "clearStyle",
  //   "fontSize",
  //   "headerSelect",
  //   "header1",
  //   "header2",
  //   "header3",
  //   "color",
  //   "bgColor"
  // ]
})
const editorConfig = reactive({ placeholder: "请输入内容..." })


// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
const handleChange = (editor: any) => {
  emit("select", valueHtml.value)
}
const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
</script>

<style lang="scss">
.wang-editor {
  width: 100%;
  height: 100%;
  border: 2px solid #3baea0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .editor-bar {
    border-bottom: 1px solid #ccc;
  }
  .editor-con {
    flex: 1;
    overflow-y: scroll;
  }
  // 设置滚动条样式
  .w-e-scroll,
    .w-e-select-list {
      // 整个滚动条
      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
        cursor: pointer;
      }
      // 滚动条上的滚动滑块
      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(51, 57, 69, 0.2);
      }
      &::-webkit-scrollbar-thumb:hover {
        background-color: rgba(51, 57, 69, 0.3);
        cursor: pointer;
      }
      &::-webkit-scrollbar-thumb:active {
        background-color: rgba(51, 57, 69, 0.3);
        cursor: pointer;
      }
      // 当同时有垂直滚动条和水平滚动条时交汇的部分
      &::-webkit-scrollbar-corner {
        background-color: transparent;
      }
    }
}
</style>
