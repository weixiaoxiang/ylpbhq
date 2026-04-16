<script lang="ts" setup>
import { PropType } from 'vue'
// import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'ImageViewer' })

// const props = defineProps({
//   urlList: {
//     type: Array as PropType<string[]>,
//     default: (): string[] => []
//   },
//   zIndex: propTypes.number.def(200),
//   initialIndex: propTypes.number.def(0),
//   infinite: propTypes.bool.def(true),
//   hideOnClickModal: propTypes.bool.def(false),
//   appendToBody: propTypes.bool.def(false),
//   show: propTypes.bool.def(false)
// })
const props = defineProps({
  urlList: {
    type: Array as PropType<string[]>,
    default: (): string[] => []
  },
  zIndex: {
    type: Number,
    default: (): number => 200
  },
  initialIndex: {
    type: Number,
    default: (): number => 0
  },
  infinite: {
    type: Boolean,
    default: (): boolean => true
  },
  hideOnClickModal: {
    type: Boolean,
    default: (): boolean => false
  },
  appendToBody: {
    type: Boolean,
    default: (): boolean => false
  },
  show: {
    type: Boolean,
    default: (): boolean => false
  }
})

const getBindValue = computed(() => {
  const propsData: any = { ...props }
  delete propsData.show
  return propsData
})

const show = ref(props.show)

const close = () => {
  show.value = false
}
</script>

<template>
  <ElImageViewer v-if="show" v-bind="getBindValue" @close="close" />
</template>
