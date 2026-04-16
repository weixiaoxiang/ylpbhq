<script setup lang="ts">
import { GetGeTuiToOneByAlias } from "@/api"
import axios from "axios"
const test = async () => {
  const { data: token } = await axios.get(`/api/VideoCapture/GetGeTuiToken`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  })
  if (token) {
    const { success } = await GetGeTuiToOneByAlias({
      token,
      alias: "18654139197",
      appid: "k55tXzI7px5LsKfScpWLt2"
    })
    if (success) {
      ElMessage.success("呼叫成功")
    } else {
      ElMessage.info("呼叫失败")
    }
  }
}
onMounted(() => {})
onBeforeUnmount(() => {})
</script>
<template>
  <div class="left1">
    <div class="test">
      <span @click="test">测试Agora</span>
    </div>
    <BasePanel
      title="协调会商"
      class="overflow-hidden"
    >
      <template #contain>
        <div class="con">
          <AgoraVideo />
        </div>
      </template>
    </BasePanel>
  </div>
</template>

<style lang="scss" scoped>
.left1 {
  position: absolute;
  bottom: vh(20);
  left: 460px;
  right: 460px;
  height: 305px;
  color: #fff;
  .con {
    border: 1px solid #0c233b;
    height: 100%;
  }
  .test {
    position: fixed;
    top: 100px;
    left: 50%;
    background-color: #000;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    z-index: 1000;
  }
}
</style>
