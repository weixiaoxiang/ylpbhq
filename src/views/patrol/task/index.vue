<script lang="ts" setup>
import PageTabs from "../components/PageTabs.vue"
import MapPopup from "../components/Popup.vue"
import MapTool from "../components/MapTool.vue"

defineOptions({
  name: "Task"
})
const popup = ref<any>(null)
const { closePopup, map } = useOlMap(popup)
</script>

<template>
  <div class="task">
    <PageTabs class="pages-tabs" />
    <div
      class="map-box"
      id="map"
    >
      <MapPopup
        ref="popup"
        :type="3"
        @close="closePopup"
      />
      <MapTool
        v-if="map"
        :map="map"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.task {
  position: relative;
  height: 100%;
  .pages-tabs {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
  .map-box {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
<style lang="scss">
.task {
}
</style>
