<script lang="ts" setup>
import { GetFamousTreesQjListByPage } from "@/api"
import { nanoid } from "nanoid"

const currentWztp = ref<any>({})
const wztpList = ref<any>([])
// 获得全景列表
let originPanoramaList: any = []
const page = ref<any>(1)
const pageSize = 3
const getPanoramaList = async () => {
  const { response } = await GetFamousTreesQjListByPage()
  response.forEach((item: any) => {
    if (item.springqj) {
      originPanoramaList.push({
        ...item,
        title: item.mc + "（春）",
        qjpath: item.springqj,
        id: nanoid()
      })
    }
    if (item.summerqj) {
      originPanoramaList.push({
        ...item,
        title: item.mc + "（夏）",
        qjpath: item.summerqj,
        id: nanoid()
      })
    }
    if (item.autumnqj) {
      originPanoramaList.push({
        ...item,
        title: item.mc + "（秋）",
        qjpath: item.autumnqj,
        id: nanoid()
      })
    }
    if (item.winterqj) {
      item.title = item.mc + "（冬）"
      originPanoramaList.push({
        ...item,
        title: item.mc + "（冬）",
        qjpath: item.winterqj,
        id: nanoid()
      })
    }
    delete item.springqj
    delete item.summerqj
    delete item.autumnqj
    delete item.winterqj
  })
  // 不影响原数据originPanoramaList的数据
  wztpList.value = originPanoramaList.slice((page.value - 1) * pageSize, page.value * pageSize)
  currentWztp.value = wztpList.value[0]
}
// 上一页下一页
const paging = (type: string) => {
  if (type === "prev") {
    if (page.value > 1) {
      page.value--
    } else {
      return ElMessage.warning("已经是第一页")
    }
  } else {
    if (page.value < Math.ceil(originPanoramaList.length / pageSize)) {
      page.value++
    } else {
      return ElMessage.warning("已经是最后一页")
    }
  }
  // 不影响原数据originPanoramaList的数据
  wztpList.value = originPanoramaList.slice((page.value - 1) * pageSize, page.value * pageSize)
}
// 切换全景
const changePanorama = (item: any) => {
  currentWztp.value = item
}
onMounted(() => {
  getPanoramaList() // 获得全景列表
})
</script>

<template>
  <div class="oldAndFamousTrees">
    <div class="img-box ban">
      <el-carousel height="100%">
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp46.png'"
            fit="cover"
          />
        </el-carousel-item>
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp46-1.png'"
            fit="cover"
          />
        </el-carousel-item>
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp46-2.png'"
            fit="cover"
          />
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="part part1">
      <div class="part-ban">
        <div class="part-title">资源评价</div>
        <div class="part-bd1">
          <p>
            鹞落坪自然保护区49株古树名木，隶属12科16属，金钱松、银杏等都是第三纪孑遗树种，具有珍贵优良的物种基因。这些古树既是国家重点保护的生物基因种，又是历史悠久的古树名木，是保护中的重点对象。而大别山五针松、都支杜鹃等鹞落坪自然保护区特有的珍贵基因物种，古树数量特别稀少，有着极其重要的科研价值，鹞落坪自然保护区正是这些珍稀物种仅有的天然保育基地。在49株古树中，大别山五针松模式标本采集树，被安徽省初步公布为全省127株名木之一，具有极高历史文化价值。
          </p>
        </div>
      </div>
    </div>
    <div class="part part2">
      <div class="part-title">树种图谱</div>
      <div class="part-bd1 part-ban">
        <div
          class="left-arrow"
          @click="paging('prev')"
        >
          <img
            :src="'/statisUrl/ecotourism/i8.png'"
            alt=""
          />
        </div>
        <div class="center">
          <div
            v-for="(item, i) in wztpList"
            :key="item.id"
            class="wztp-item"
            @click="changePanorama(item)"
          >
            <div
              class="wztp-item-name"
              :class="{ current: currentWztp.id === item.id }"
            >
              {{ item.title }}
            </div>
            <img
              v-if="i < wztpList.length - 1"
              :src="'/statisUrl/ecotourism/i11.png'"
              alt=""
            />
          </div>
        </div>
        <div
          class="right-arrow"
          @click="paging('next')"
        >
          <img
            :src="'/statisUrl/ecotourism/i9.png'"
            alt=""
          />
        </div>
      </div>
      <div class="part-bd2">
        <iframe
          v-if="currentWztp.qjpath"
          :key="currentWztp.id"
          class="iframe"
          :src="'/statisUrl/' + currentWztp.qjpath"
          frameborder="0"
        ></iframe>
      </div>
      <div class="part-bd3 part-ban">
        <p>
          名称： {{ currentWztp.mc }}，拉丁名：<span class="latin-text">{{ currentWztp.ldmc }}</span
          >，经度：{{ currentWztp.lon }}，纬度：{{ currentWztp.lat }}，科名：{{ currentWztp.ke }}，属名：{{
            currentWztp.shu
          }}，胸径：{{ currentWztp.gs_xj }}毫米,株高：{{ currentWztp.gs_zg }}米，数目：{{
            currentWztp.gs_sm
          }}棵，树龄：{{ currentWztp.gs_sl }}年，级别：{{ currentWztp.gs_jb }}，生存环境：{{
            currentWztp.schj
          }}，特征特性：{{ currentWztp.tztx }}习性：{{ currentWztp.habit }}，用途：{{ currentWztp.yt }}
        </p>
      </div>
    </div>
    <div class="part part3">
      <div class="part-ban">
        <div class="part-title">保护对策</div>
        <div class="part-bd1">保护区古树名木保护管理办法</div>
        <div class="part-bd2">
          <div class="part-bd2-item">
            <div class="part-bd2-item-number">一</div>
            <p>确定古树群保护中心，加强其生态环境的重点保护。</p>
          </div>
          <div class="part-bd2-item">
            <div class="part-bd2-item-number">二</div>
            <p>立古树名木档案。对古树名木进行编号、登记，定期调查生长势与环境因素。</p>
          </div>
          <div class="part-bd2-item">
            <div class="part-bd2-item-number">三</div>
            <p>
              开展科学研究。对濒临灭绝的，尤其是鹞落坪自然保护区特有的珍稀古树种质资源，如大别山五针松、都支杜鹃等加强人工繁育试验研究，在做好就地保存的前提下，做好遗传基因的迁地保存工作。
            </p>
          </div>
          <div class="part-bd2-item">
            <div class="part-bd2-item-number">四</div>
            <p>设置警示牌，定时定点开展巡护。严格控制人为折枝、剥皮、题刻等伤害事件的发生。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.oldAndFamousTrees {
  margin-top: 30px;
  font-size: 0.8333vw;
  font-family: "楷体";
  color: #222222;
  height: 3432px;
  .ban {
    width: 90.625vw;
    margin: 0 auto;
  }
  .img-box {
    position: relative;
    text-align: center;
    height: 718px;
    margin: 0 auto;
    .el-carousel {
      height: 100%;
      .el-image {
        width: 100%;
        height: 100%;
      }
    }
  }
  .part-ban {
    position: relative;
    width: 65.2083vw;
    margin: 0 auto;
  }
  .part {
    position: relative;
    width: 100%;
    margin-top: 150px;
  }
  .part-title {
    position: absolute;
    left: 50%;
    top: -20px;
    transform: translateX(-50%) translateY(-100%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 8.9583vw;
    height: 68px;
    color: #fff;
    font-size: 1.4583vw;
    background: url("/statisUrl/ecotourism/i7.png") no-repeat center / 100% 100%;
  }
  .part1 {
    .part-title {
      transform: translateX(-50%) translateY(0);
    }
    > div {
      position: relative;
      .part-bd1 {
        position: relative;
        width: 64.5833vw;
        height: 658px;
        background: url("/statisUrl/ecotourism/temp33.png") no-repeat center / 100% 100%;
        p {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 52.0833vw;
          height: 128px;
          line-height: 2em;
        }
      }
    }
  }
  .part2 {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 36px;
    margin-top: 150px;
    background-color: rgba(189, 138, 80, 0.2);
    .part-bd1 {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 125px;
      .left-arrow,
      .right-arrow {
        width: 40px;
        height: 40px;
        cursor: pointer;
      }
      .center {
        display: flex;
        .wztp-item {
          display: flex;
          align-items: center;
          .wztp-item-name {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 12.5vw;
            height: 56px;
            background: url("/statisUrl/ecotourism/i12.png") no-repeat center center / 100% 100%;
            cursor: pointer;
            &.current {
              background: url("/statisUrl/ecotourism/i10.png") no-repeat center center / 100% 100%;
            }
          }
          img {
            width: 1.25vw;
            height: 24px;
            margin: 0 0.5208vw;
          }
        }
      }
    }
    .part-bd2 {
      height: 473px;
      // .el-image {
      //   width: 100%;
      //   height: 100%;
      // }
      .iframe {
        width: 100%;
        height: 100%;
      }
    }
    .part-bd3 {
      p {
        line-height: 2em;
      }
    }
  }
  .part3 {
    > div {
      position: relative;
      .part-bd1 {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 125px;
        color: #a67435;
        font-size: 1.0417vw;
      }
      .part-bd2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 1fr; // 自动将每行设置为相等高度
        gap: 1.0417vw;
        height: 450px;
        .part-bd2-item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 10px;
          .part-bd2-item-number {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 100px;
            font-size: 0.9375vw;
            color: #cb8558;
            background: url("/statisUrl/ecotourism/i13.png") no-repeat center center / 100% 100%;
          }
          p {
            width: 26.0417vw;
            text-align: center;
            line-height: 2em;
          }
        }
      }
    }
  }
}
</style>
