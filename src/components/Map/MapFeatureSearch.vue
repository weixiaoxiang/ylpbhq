<!--
 * @Author: weixiaoxiang 1935394906@qq.com
 * @Date: 2024-12-25 10:34:12
 * @LastEditors: weixiaoxiang 1935394906@qq.com
 * @LastEditTime: 2025-09-08 14:28:03
 * @FilePath: \ylpbhq\src\components\Map\MapFeatureSearch.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue"

interface Props {
  features: any[]
}
const props = withDefaults(defineProps<Props>(), {
  features: () => []
})
const emit = defineEmits(["location"])
const keyWord = ref("")
// 查询搜索
const querySearch = (queryString: string, cb: any) => {
  // 黑名单,定义不需要纳入搜索的要素featureType
  const blackList = ["类型-红外相机监测网格"]
  const results = props.features.filter((item: any) => {
    return (
      item.get("name")?.toLowerCase().indexOf(queryString.toLowerCase()) > -1 &&
      !blackList.includes(item.get("featureType"))
    )
  })
  if (results.length > 0) {
    cb(
      results.map((item: any, index: number) => {
        // console.log(item)
        // const type = item.get("featureType").split("-").pop()
        return {
          value: item.get("name"),
          id: item.get("id"),
          treeid: item.get("treeid"),
          lon: item.get("lon"),
          lat: item.get("lat"),
          geom: item.get("geom"),
          geometryType: item.getGeometry().getType(),
          featureType: item.get("featureType")
        }
      })
    )
  } else {
    cb([])
  }
}
// 查询搜索下拉选择
const handleSelect = (item: any) => {
  // console.log(item)
  const { lon, lat, geometryType, geom } = item
  emit("location", { type: "搜索要素", data: [lon, lat], geometryType, geom })
}
</script>
<template>
  <el-autocomplete
    class="map-feature-search"
    v-model="keyWord"
    :fetch-suggestions="querySearch"
    style="width: 140px"
    :trigger-on-focus="true"
    clearable
    placeholder="请输入关键字"
    :suffix-icon="Search"
    popper-class="custom-autocomplete-popper"
    @select="handleSelect"
  >
    <template #default="{ item }">
      <span>{{ item.value }}</span>
    </template>
  </el-autocomplete>
</template>

<style lang="scss">
.map-feature-search {
  .el-input__wrapper {
    box-shadow: none;
    background-color: #0c284d;
    border-radius: 2px;
    border: 1px solid #304868;
    .el-input__inner {
      color: #aab4c1;
    }
  }
}
</style>
