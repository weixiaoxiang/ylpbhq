<template>
  <div class="sort-controls">
    <div
      v-for="(item, index) in sortItems"
      :key="index"
      class="sort-item"
      :class="{ active: item.label === activeItem.label }"
      @click="handleSort(item)"
    >
      <span class="label">{{ item.label }}</span>
      <div class="sort-icons">
        <div
          class="triangle-up"
          :class="{ active: item.direction === 'asc' && item.label === activeItem.label }"
        />
        <div
          class="triangle-down"
          :class="{ active: item.direction === 'desc' && item.label === activeItem.label }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  sortItems: {
    type: Array as PropType<
      Array<{
        label: string
        value: string
        direction?: "asc" | "desc"
      }>
    >,
    required: true
  }
})

const emit = defineEmits(["sort-change"])
const activeItem = ref<any>({})
const handleSort = (item: any) => {
  if (activeItem.value.label === item.label) {
    item.direction = item.direction === "asc" ? "desc" : "asc"
  } else {
    item.direction = "asc"
  }
  activeItem.value = item
  emit("sort-change", item)
}
</script>

<style lang="scss" scoped>
.sort-controls {
  display: flex;
  justify-content: flex-start;
  align-items: center; // 垂直居中
  padding: 0.4167vw 0;
  // background: #172f4b;
  border-radius: 0.2083vw;
  color: #0fe0ef;
  user-select: none;

  .sort-item {
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;
    padding: 0.1563vw 0.1563vw;
    border-radius: 0.1042vw;
    font-size: 0.625vw;

    &.active {
      background-color: #3e4040;
    }

    .sort-icon {
      opacity: 0.6;

      &.active {
        opacity: 1;
        color: #0fe1f0;
      }

      &.desc {
        transform: rotate(180deg);
      }
    }
  }
}

.sort-icons {
  display: flex;
  flex-direction: column;
  gap: 0.1042vw;
  margin-left: 0.1563vw;
}

.triangle-up,
.triangle-down {
  width: 0;
  height: 0;
  border-left: 0.2083vw solid transparent;
  border-right: 0.2083vw solid transparent;
  transition: all 0.3s;
}

.triangle-up {
  border-bottom: 0.2083vw solid #909399;
}

.triangle-down {
  border-top: 0.2083vw solid #909399;
}

.active.triangle-up {
  border-bottom-color: #0fe1f0;
}

.active.triangle-down {
  border-top-color: #0fe1f0;
}
</style>
