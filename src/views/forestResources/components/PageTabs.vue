<script lang="ts" setup>
const { menus } = storeToRefs(useConfigStore())
const route = useRoute()
const router = useRouter()
const active = ref("")

const tabs = ref(
  menus.value.classB.map((item: any, index: number) => {
    return {
      id: item.id,
      name: item.name,
      class: "page-tab" + (index + 1),
      fullPath: item.fullPath
    }
  })
)
const toRoute = (tab: any) => {
  router.push(tab.fullPath)
}
onMounted(() => {
  active.value = route.path
})
</script>
<template>
  <div class="pages-tabs z-10 flex w-max flex-col gap-5 text-base text-custom4">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      v-permission="tab.id"
      class="bg bgbox flex h-[65px] w-[190px] cursor-pointer items-center pl-16"
      :class="[tab.class, tab.fullPath === active ? 'active' : '']"
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
  .page-tab1 {
    background-image: url("@/assets/images/forestResources/page-tab1.svg");
    &.active {
      background-image: url("@/assets/images/forestResources/active-page-tab1.png");
    }
  }
  .page-tab2 {
    background-image: url("@/assets/images/forestResources/page-tab2.svg");
    &.active {
      background-image: url("@/assets/images/forestResources/active-page-tab2.png");
    }
  }
  .page-tab3 {
    background-image: url("@/assets/images/forestResources/page-tab3.svg");
    &.active {
      background-image: url("@/assets/images/forestResources/active-page-tab3.png");
    }
  }
}
</style>
