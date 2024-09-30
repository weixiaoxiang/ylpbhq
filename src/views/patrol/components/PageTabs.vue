<script lang="ts" setup>
const route = useRoute()

const router = useRouter()
const active = ref("")
const tabs = ref([
  {
    name: "巡护概况",
    img: "patrol/page-tab1.svg",
    activeimg: "patrol/active-page-tab1.svg",
    route: "/patrol/survey"
  },
  {
    name: "巡护统计",
    img: "patrol/page-tab2.svg",
    activeimg: "patrol/active-page-tab2.svg",
    route: "/patrol/statistics"
  },
  {
    name: "巡护记录",
    img: "patrol/page-tab3.svg",
    activeimg: "patrol/active-page-tab3.svg",
    route: "/patrol/record"
  },
  {
    name: "任务管理",
    img: "patrol/page-tab4.svg",
    activeimg: "patrol/active-page-tab4.svg",
    route: "/patrol/task"
  }
])
const toRoute = (tab: any) => {
  router.push(tab.route)
}
onMounted(() => {
  active.value = route.path
})
</script>
<template>
  <div class="pages-tabs flexbox-col z-10 w-max gap-5 text-base text-custom4">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="bg bgbox flexbox h-[65px] w-[190px] cursor-pointer"
      :style="{
        backgroundImage: 'url(' + $fun.getImg(tab.route === active ? tab.activeimg : tab.img) + ')'
      }"
      @click="toRoute(tab)"
    >
      {{ tab.name }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pages-tabs {
  background-color: rgba(11, 18, 39, 0.3);
  padding: 10px;
}
</style>
