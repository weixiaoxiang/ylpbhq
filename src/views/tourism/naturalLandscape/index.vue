<script lang="ts" setup>
import { GetReservePanorama } from "@/api"

// 获得全景列表
let originPanoramaList: any = []
const page = ref<any>(1)
const pageSize = 3
const panoramaList = ref<any>([])
const currentPanorama = ref<any>({})
const getPanoramaList = async () => {
  const { response } = await GetReservePanorama()
  originPanoramaList = response
  // 不影响原数据originPanoramaList的数据
  panoramaList.value = originPanoramaList.slice((page.value - 1) * pageSize, page.value * pageSize)
  currentPanorama.value = panoramaList.value[0]
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
  panoramaList.value = originPanoramaList.slice((page.value - 1) * pageSize, page.value * pageSize)
}
// 切换全景
const changePanorama = (item: any) => {
  currentPanorama.value = item
}
onMounted(() => {
  getPanoramaList() // 获得全景列表
})
</script>
<template>
  <div class="naturalLandscape">
    <div class="img-box ban">
      <el-image
        :src="'/statisUrl/ecotourism/temp19.png'"
        fit="cover"
      />
      <el-image
        class="tip-img"
        :src="'/statisUrl/ecotourism/temp20.png'"
        fit="cover"
      />
    </div>
    <div class="part part1">
      <div class="part-ban">
        <div class="part-bd1">
          <p>
            安徽鹞落坪国家级自然保护区位于皖西南安庆市岳西县西北部、皖鄂两省三县交界的大别山腹地。保护区地理坐标为：东经116°02'-116°11'，北纬30°57'-31°06'。保护区始建于1991年，1994年经国务院批准晋升为国家级自然保护区，1999年被纳入中国人与生物圈保护区网络。
          </p>
          <p>
            鹞落坪自然保护区属于森林生态系统类型自然保护区，主要保护对象为大别山区典型代表性的森林生态系统和国家珍稀的濒危野生动植物，并作为淮河流域磨子潭和佛子岭水库的重要水源涵养林保护区。进一步整合优化后总面积12371公顷,核心区5228公顷,一般控制区7143公顷。
          </p>
        </div>
      </div>
    </div>
    <div class="part part2">
      <div class="part-ban">
        <div class="part-title">
          <div>山</div>
          <img
            :src="'/statisUrl/ecotourism/h7.png'"
            alt=""
          />
        </div>
        <div class="part-bd1">
          <p>
            鹞落坪自然保护区区域内千米以上山峰60余座，包括小松尖、川岭、天河尖、多枝尖、石壁沟、牛脊背骨、麒麟沟等海拔超过
            1600m的山峰，最高峰天河尖二峰海拔1771米，呈 U
            型分布在保护区的东、南、西三面外围地带，是大别山主峰区。这些山峰共同构成了鹞落坪独特的自然风光。
          </p>
        </div>
        <div class="part-bd2">
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/i1.png'"
              alt=""
            />
            <span>冬暖夏凉，避暑胜地</span>
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/i2.png'"
              alt=""
            />
            <span>山峰挺拔，气势恢宏</span>
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/i3.png'"
              alt=""
            />
            <span>植被葱郁，绿意盎然</span>
          </div>
        </div>
        <div class="part-bd3">
          <el-image
            :src="'/statisUrl/ecotourism/temp21.png'"
            fit="cover"
          />
          <el-image
            :src="'/statisUrl/ecotourism/temp22.png'"
            fit="cover"
          />
          <div class="part-bd3-text">
            <div class="part-bd3-text-title">
              <img
                :src="'/statisUrl/ecotourism/i4.png'"
                alt=""
              />
              多枝尖
            </div>
            <p>
              多枝尖是岳西县的第二高峰，海拔1721米，自然风光优美，植被保存完好，人文资源丰富多彩。登顶多枝尖的徒步路线全程约8公里，累计拔高585米，以野道为主，但整体路况较好，仅最后30米为碎石路
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="part part3">
      <div class="part-ban">
        <div class="part-title">
          <div>谷</div>
          <img
            :src="'/statisUrl/ecotourism/h7.png'"
            alt=""
          />
        </div>
        <div class="part-bd1">
          <div class="item">
            <div class="item-title">幽谷深长，绿意盎然。</div>
            <el-image
              :src="'/statisUrl/ecotourism/temp23.png'"
              fit="cover"
            />
          </div>
          <div class="item">
            <div class="item-title">谷壑纵横，清幽静谧。</div>
            <el-image
              :src="'/statisUrl/ecotourism/temp24.png'"
              fit="cover"
            />
          </div>
          <div class="item">
            <div class="item-title">深谷回响，绿意满盈。</div>
            <el-image
              :src="'/statisUrl/ecotourism/temp25.png'"
              fit="cover"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="part part4">
      <div class="part-bd1">
        <el-image
          :src="'/statisUrl/ecotourism/temp26.png'"
          fit="cover"
        />
      </div>
    </div>
    <div class="part part5">
      <div class="part-ban">
        <div class="part-title">
          <div>林</div>
          <img
            :src="'/statisUrl/ecotourism/h7.png'"
            alt=""
          />
        </div>
        <div class="part-bd1">
          <p>
            鹞落坪的森林是大自然的绿色宝库，拥有丰富的物种资源和生态价值。这里的森林覆盖率高达90%以上，是大别山区森林保护最为完好的区域之一。森林内植被茂盛，物种繁多，是许多珍稀濒危物种的栖息地。
          </p>
        </div>
        <div class="part-bd2">
          <div class="item">
            <el-image
              :src="'/statisUrl/ecotourism/temp47.png'"
              fit="cover"
            />
            <span>大别山五针松</span>
          </div>
          <div class="item">
            <el-image
              :src="'/statisUrl/ecotourism/temp48.png'"
              fit="cover"
            />
            <span>香果树</span>
          </div>
          <div class="item">
            <el-image
              :src="'/statisUrl/ecotourism/temp49.png'"
              fit="cover"
            />
            <span>都支杜鹃</span>
          </div>
          <div class="item">
            <el-image
              :src="'/statisUrl/ecotourism/temp50.png'"
              fit="cover"
            />
            <span>长梗胡颓子</span>
          </div>
        </div>
      </div>
    </div>
    <div class="part part6">
      <div class="part-ban">
        <div class="part-title">
          <div>岩</div>
          <img
            :src="'/statisUrl/ecotourism/h7.png'"
            alt=""
          />
        </div>
        <div class="part-bd1">
          <div class="part-bd1-text1">
            <p>岩壁嶙峋，峰峦叠嶂。</p>
            <p>奇石林立，岩骨铮铮。</p>
            <p>岩骨苍劲，峰峦挺秀。</p>
          </div>
          <div class="part-bd1-text2">
            <p>
              鹞落坪的岩石不仅是地质构造的见证，更是大自然雕塑的艺术品。这里的岩石形态各异，有的如刀削斧劈般陡峭，有的则圆润光滑，充满了岁月的痕迹。岩石与植被、水流相互映衬，共同构成了独特的自然景观
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="part part7">
      <div class="part-ban">
        <div class="part-title">
          <div>水</div>
          <img
            :src="'/statisUrl/ecotourism/h7.png'"
            alt=""
          />
        </div>
        <div class="part-bd1">
          <p>
            安徽鹞落坪国家级自然保护区是大别山区重要的水源涵养林区，其边界的山脉都是河流的源头，东、东北源于金钢岭、鸡笼尖、大川岭的青天河、石升河及马家河为淮河流域淠河水系淠河支干流黄尾河的源头及支流，流向东北；源于多枝尖东南的大河、栏牛石河及天河为长河流域皖河水系潜水干流潜水河的一、二级支流，流向东南；源于黄茅尖西的董家河为长江流域皖河水系长河的干流店前河的源头河，流向南；源于李家寨、牛脊背骨西南的草盘河是长江流域浠水水系白莲河的源头河，流向西。
          </p>
        </div>
        <div class="part-bd2">
          <el-image
            :src="'/statisUrl/ecotourism/temp28.png'"
            fit="cover"
          />
          <el-image
            :src="'/statisUrl/ecotourism/temp29.png'"
            fit="cover"
          />
          <el-image
            :src="'/statisUrl/ecotourism/temp30.png'"
            fit="cover"
          />
        </div>
      </div>
    </div>
    <div class="part part8">
      <div class="part-bd1">
        <el-image
          :src="'/statisUrl/ecotourism/temp26.png'"
          fit="cover"
        />
      </div>
    </div>
    <div class="part part9">
      <div class="part-ban">
        <div class="part-title">
          <div>潭</div>
          <img
            :src="'/statisUrl/ecotourism/h7.png'"
            alt=""
          />
        </div>
        <div class="part-bd1">
          <div class="part-bd1-text1">
            <p>潭水清澈，碧波荡漾。</p>
            <p>深潭幽静，碧水悠悠。</p>
            <p>碧潭如镜，水波不兴。</p>
          </div>
          <div class="part-bd1-text2">
            <p>
              在鹞落坪保护区中，“潭”通常指的是山间溪流或瀑布汇聚形成的深水坑，这些潭水清澈见底，四周绿树环绕，云雾缭绕，形成了独特的山水画卷。潭水不仅为游客提供了观赏美景的绝佳位置，还承载着自然生态的纯净与和谐，是保护区中不可或缺的自然元素。
            </p>
          </div>
          <div class="part-bd1-img">
            <el-image
              :src="'/statisUrl/ecotourism/temp31.png'"
              fit="cover"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="part part10">
      <div class="part-bd1">
        <iframe
          v-if="currentPanorama.filepath"
          class="iframe"
          :src="'/statisUrl/' + currentPanorama.filepath"
          frameborder="0"
        ></iframe>
      </div>
      <div class="tabs">
        <div
          class="left-arrow"
          @click="paging('prev')"
        ></div>
        <div
          class="right-arrow"
          @click="paging('next')"
        ></div>
        <div
          v-for="item in panoramaList"
          :key="item.id"
          :class="{ current: currentPanorama.id === item.id }"
          @click="changePanorama(item)"
        >
          {{ item.filename }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.naturalLandscape {
  margin-top: 30px;
  font-size: 0.8333vw;
  font-family: "楷体";
  color: #222222;
  height: 7136px;
  .ban {
    width: 90.625vw;
    margin: 0 auto;
  }
  .img-box {
    position: relative;
    text-align: center;
    .el-image {
      margin: 0 auto;
      width: 100%;
      height: 718px;
    }
    .tip-img {
      position: absolute;
      bottom: 0;
      right: 10.4167vw;
      transform: translateY(50%);
      width: 12.5vw;
      height: 12.5vw;
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
    margin-top: 40px;
  }
  .part1 {
    height: 508px;
    margin-top: 100px;
    background: url("/statisUrl/ecotourism/h6.png") no-repeat center bottom / 100% 100%;
    .part-bd1 {
      width: 36.4583vw;
      p {
        line-height: 2em;
        text-indent: 2em;
      }
    }
  }

  .part-title {
    position: relative;
    width: 60px;
    height: 139px;
    text-align: center;
    margin: 0 auto;
    color: #78312b;
    font-size: 1.4583vw;
    img {
      position: absolute;
      inset: 0;
      width: 100%;
      z-index: 0;
    }
    div {
      margin-top: 20px;
    }
  }
  .part2 {
    > div {
      display: flex;
      flex-direction: column;
      gap: 20px;
      .part-bd1 {
        padding-left: 5.2083vw;
        line-height: 3em;
        p {
          text-indent: 2em;
        }
      }
      .part-bd2 {
        display: flex;
        justify-content: space-around;
        height: 180px;
        border: 2px solid rgba(34, 34, 34, 0.2);
        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 1.25vw;
        }
      }
      .part-bd3 {
        position: relative;
        display: flex;
        justify-content: space-between;
        gap: 0.5208vw;
        .el-image {
          height: 606px;
        }
        .part-bd3-text {
          position: absolute;
          bottom: 10px;
          left: 0.5208vw;
          display: flex;
          flex-direction: column;
          gap: 1.0417vw;
          width: 31.25vw;
          color: #fff;
          .part-bd3-text-title {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 0.3125vw;
            width: 6.25vw;
            height: 34px;
            border-bottom: 3px solid rgba(255, 255, 255, 0.5);
            img {
              width: 1.25vw;
            }
          }
          p {
            font-size: 0.7292vw;
            line-height: 2em;
          }
        }
      }
    }
  }
  .part3 {
    > div {
      display: flex;
      flex-direction: column;
      gap: 20px;
      .part-bd1 {
        display: flex;
        justify-content: space-around;
        gap: 1.0417vw;
        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
          font-size: 1.25vw;
          .item-title {
            text-decoration: underline;
          }
          .el-image {
            height: 235px;
          }
        }
      }
    }
  }
  .part4 {
    .part-bd1 {
      .el-image {
        width: 100%;
        height: 473px;
      }
    }
  }
  .part5 {
    > div {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .part-bd1 {
        width: 53.3333vw;
        margin: 0 auto;
        p {
          line-height: 2em;
        }
      }
      .part-bd2 {
        display: flex;
        justify-content: space-between;
        gap: 1.5625vw;
        .item {
          position: relative;
          flex: 1;
          .el-image {
            height: 280px;
          }
          span {
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 1.25vw;
            letter-spacing: 8px; //控制字符间距
            writing-mode: vertical-rl; //文字从上到下竖直排序;
            color: #fff;
          }
        }
      }
    }
  }
  .part6 {
    > div {
      display: flex;
      flex-direction: column;
      gap: 20px;
      .part-bd1 {
        position: relative;
        line-height: 2em;
        height: 450px;
        background: url("/statisUrl/ecotourism/i5.png") no-repeat center bottom / 100% 100%;
        .part-bd1-text1 {
          position: absolute;
          top: 100px;
          left: 1.0417vw;
          width: 12.5vw;
          color: #222222;
          font-size: 1.25vw;
          p {
            text-decoration: underline;
          }
        }
        .part-bd1-text2 {
          position: absolute;
          bottom: 40px;
          left: 1.0417vw;
          width: 39.3229vw;
          color: rgba(34, 34, 34, 0.65);
        }
      }
    }
  }
  .part7 {
    position: relative;
    gap: 20px;
    height: 610px;
    margin-top: 220px;
    background: url("/statisUrl/ecotourism/i6.png") no-repeat center bottom / 100% 100%;
    > div {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      height: 100%;
      .part-title {
        position: absolute;
        top: -160px;
        left: 50%;
        transform: translateX(-50%);
      }
      .part-bd1 {
        display: flex;
        justify-content: flex-end;
        p {
          width: 34.5833vw;
          line-height: 2em;
          color: rgba(34, 34, 34, 0.65);
        }
      }
      .part-bd2 {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 1.5625vw;
        .el-image {
          width: 27.0833vw;
          &:nth-child(1) {
            height: 228px;
          }
          &:nth-child(2) {
            height: 228px;
          }
          &:nth-child(3) {
            height: 228px;
          }
        }
      }
    }
  }
  .part8 {
    height: 473px;
    .part-bd1 {
      .el-image {
        width: 100%;
        height: 100%;
      }
    }
  }
  .part9 {
    > div {
      display: flex;
      flex-direction: column;
      gap: 20px;
      .part-bd1 {
        position: relative;
        line-height: 2em;
        height: 427px;
        background-color: #ebe0c6;
        .part-bd1-text1 {
          position: absolute;
          top: 10px;
          left: 1.0417vw;
          width: 12.5vw;
          color: #222222;
          font-size: 1.25vw;
          p {
            text-decoration: underline;
          }
        }
        .part-bd1-text2 {
          position: absolute;
          bottom: 100px;
          right: 1.0417vw;
          width: 39.3229vw;
          color: rgba(34, 34, 34, 0.65);
          p {
            text-align: right;
          }
        }
        .part-bd1-img {
          position: absolute;
          bottom: 20px;
          left: 1.0417vw;
          .el-image {
            width: 22.0313vw;
            height: 200px;
          }
        }
      }
    }
  }
  .part10 {
    position: relative;
    height: 473px;
    .part-bd1 {
      height: 100%;
      .el-image {
        width: 100%;
        height: 100%;
      }
      .iframe {
        width: 100%;
        height: 100%;
      }
    }
    .tabs {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1.0417vw;
      > div {
        width: 20.8333vw;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(38, 43, 50, 0.25);
        color: #fff;
        font-size: 1.0417vw;
        cursor: pointer;
        &.current {
          background-color: #ebe0c6;
          color: #b41112;
        }
      }
      .left-arrow {
        position: absolute;
        left: -0.5208vw;
        top: 50%;
        transform: translate(-100%, -50%);
        width: 1.0417vw;
        height: 1.0417vw;
        background: url("/statisUrl/backgroundResources/b6.png") no-repeat center center / 100% 100%;
        cursor: pointer;
      }
      .right-arrow {
        position: absolute;
        right: -0.5208vw;
        top: 50%;
        transform: translate(100%, -50%);
        width: 1.0417vw;
        height: 1.0417vw;
        background: url("/statisUrl/backgroundResources/b7.png") no-repeat center center / 100% 100%;
        cursor: pointer;
      }
    }
  }
}
</style>
