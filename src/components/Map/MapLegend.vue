<script lang="ts" setup>
interface Props {
  style?: { [key: string]: string }
  list?: any[]
}
withDefaults(defineProps<Props>(), {
  name: "",
  style: () => {
    return {
      position: "absolute",
      bottom: "10px",
      left: "10px"
    }
  },
  list: () => [
    {
      label: "巡护起点",
      icon: "legend-icon1.png"
    },
    {
      label: "巡护终点",
      icon: "legend-icon2.png"
    },
    {
      label: "采集点",
      icon: "legend-icon3.png"
    },
    {
      label: "计划打卡点",
      icon: "legend-icon4.png"
    },
    {
      label: "实际打卡点",
      icon: "legend-icon5.png"
    }
  ]
})
</script>
<template>
  <div
    class="map-legend"
    :style="style"
  >
    <div
      v-for="item in list"
      :key="item.label"
      class="legend-item"
    >
      <img
        :src="$fun.getImg('patrol/' + item.icon)"
        alt=""
      />
      {{ item.label }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-legend {
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background-color: rgba(9, 28, 37, 0.8);
  border-radius: 4px;
  padding: 10px 15px;
  color: #fff;
  font-size: 14px;
  box-shadow: 0 0 3px 1px rgba(255, 255, 255, 0.06);
  border: 1px solid #3e4a50;
  gap: 10px;
  z-index: 999;
  .legend-item {
    height: 100%;
    display: flex;
    gap: 5px;
    align-items: center;
  }
}
</style>
