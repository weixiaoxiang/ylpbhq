<script lang="ts" setup></script>
<template>
  <div class="briefIntroduction">
    <div class="img-box">
      <el-carousel
        height="100%"
        direction="vertical"
      >
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp1.png'"
            fit="cover"
          />
        </el-carousel-item>
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp1-1.png'"
            fit="cover"
          />
        </el-carousel-item>
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp1-2.png'"
            fit="cover"
          />
        </el-carousel-item>
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp1-3.png'"
            fit="cover"
          />
        </el-carousel-item>
        <el-carousel-item>
          <el-image
            :src="'/statisUrl/ecotourism/temp1-4.png'"
            fit="cover"
          />
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="zf-jj">
      <div class="zf">
        <p class="value3">岳西</p>
        <p class="value2">一九九九年八月</p>
        <p class="value1">岳西县人民政府</p>
      </div>
      <div class="text">
        <p>鹞落坪得名于鹞落山，盖其山似鹞飞落之影，又谓古时有白鸟齐集于此，以鹞为首，故名之。</p>
        <p>
          鹞落坪地处安徽西南隅，比邻霍山、英山，过渡南北，襟带东西。生物物种极丰，凡国家重点保护动物三十一种，植物三十三种。生物群落繁杂，常绿林、落叶阔叶混交林、针叶林广布，森林覆盖越什之九，水土得以保持；涵养水源近十五万方，山水经磨子潭、佛子岭水库、淠史杭渠入淮，可澄澈其水。
        </p>
        <p>
          鹞落坪自然保护区，一九九一年十二月经安徽省人民政府批准成立，一九九四年四月，国务院批准晋升为国家级自然保护区。由安徽省环境保护行政部门管理。
        </p>
        <p>
          保护区以东部之石佛寺、大川岭，西部之麒麟沟、石屋冲，中部之吊灌井、燎原渠，南部之多枝尖、黄柏山为核心区，擅入厉禁；其外围设缓冲区，伐猎不允；更外乃实验区，可按律拓用。保护区延褒一百二十三平方公里，自此草木滋硕，禽兽群集，百姓乐业。
        </p>
        <p>
          诗曰：“荏染柔木，君子树之”，生态系统，民众护之。鹞落坪蹈萃路蓝缕之精神，俾万物各得其和以生，各得其养以成，维桑古梓，必恭敬上！
        </p>
        <p>特立此碑，以志之。</p>
      </div>
    </div>
    <div class="survey">
      <img
        class="title"
        :src="'/statisUrl/ecotourism/survey-img.png'"
        alt=""
      />
      <div class="box">
        <p>
          安徽鹞落坪国家级自然保护区位于皖西南安庆市岳西县西北部、皖鄂两省三县交界的大别山腹地。保护区地理坐标为：东经116°02'-116°11'，北纬30°57'-31°06'。保护区始建于1991年，1994年经国务院批准晋升为国家级自然保护区，1999年被纳入中国人与生物圈保护区网络。鹞落坪自然保护区属于森林生态系统类型自然保护区，主要保护对象为大别山区典型代表性的森林生态系统和国家珍稀的濒危野生动植物，并作为淮河流域磨子潭和佛子岭水库的重要水源涵养林保护区。进一步整合优化后总面积12371公顷，核心区5228公顷，一般控制区7143公顷.
        </p>
        <div class="video">
          <VideoPlayer
            :src="'/briefIntroductionVideo/file/video/ylp.mp4'"
            :posterUrl="'/statisUrl/ecotourism/video-fm.png'"
          />
        </div>
      </div>
    </div>
    <div class="part part1">
      <div class="number number1"></div>
      <div class="part-title">绿色宝库<br />植物基因库</div>
      <div class="part-bd1">
        <p>
          鹞落坪自然保护区处于亚热带常绿阔叶林与暖温带落叶林的过渡带，地带性植被以北亚热带落叶阔叶林和常绿阔叶混交林为主要类型。森林植被覆盖率达95.08
          %。植被类型可划分为针叶林、阔叶林、灌草丛、沼泽和水生植被以及栽培植被5个植被型组，天然林划分为暖性针叶林、温性针叶林、常绿落叶阔叶混交林等15个植被型及暖性常绿针叶林、暖性落叶针叶林和典型落叶阔叶林等17个植被亚型和马尾松林、黄山松林、短柄枹栎林等49个群系。
        </p>
        <div class="part-con">
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp3.png'"
              alt=""
            />
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp4.png'"
              alt=""
            />
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp5.png'"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
    <div class="part part2">
      <div class="number number2"></div>
      <div class="part-title">天然动物园</div>
      <div class="part-bd2">
        <div class="text">
          <p>
            鹞落坪保护区动物资源丰富，共有1424种，其中国家I级重点保护野生动物白冠长尾雉、安徽麝和金雕等6种，国家Ⅱ级重点保护动物拉步甲、勺鸡、赤腹鹰、雀鹰、中国大鲵等40种。省I级重点保护动物宽尾凤蝶、金斑剑凤蝶、安徽树蛙等28种，省Ⅱ重点保护动物中华蟾蜍、环颈雉、大树蛙等26种。
          </p>
        </div>
        <div class="part-con">
          <div class="item">
            <div class="name">金雕</div>
            <img
              :src="'/statisUrl/ecotourism/temp35.png'"
              alt=""
            />
          </div>
          <div class="item">
            <div class="name">安徽麝</div>
            <img
              :src="'/statisUrl/ecotourism/temp36.png'"
              alt=""
            />
          </div>
          <div class="item">
            <div class="name">勺鸡</div>
            <img
              :src="'/statisUrl/ecotourism/temp37.png'"
              alt=""
            />
          </div>
          <div class="item">
            <div class="name">商城肥鲵</div>
            <img
              :src="'/statisUrl/ecotourism/temp38.png'"
              alt=""
            />
          </div>
          <div class="item">
            <div class="name">红嘴蓝鹊</div>
            <img
              :src="'/statisUrl/ecotourism/temp39.png'"
              alt=""
            />
          </div>
          <div class="item">
            <div class="name">大别山原矛头蝮</div>
            <img
              :src="'/statisUrl/ecotourism/temp40.png'"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
    <div class="part part3">
      <div class="number number3"></div>
      <div class="part-title">百草药园</div>
      <div class="part-bd3">
        <p>
          鹞落坪自然保护区生态资源极为丰富，自然条件优越，动植物区系复杂，保存有大面积的天然次生林和一批珍稀、古老孑遗物种，初步调查有2000多种高等维管束植物，100多种大型真菌等。
        </p>
        <div class="part-con">
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp41.png'"
              alt=""
            />
            <div class="name-box">
              <div class="name-text">黄裙竹荪</div>
            </div>
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp42.png'"
              alt=""
            />
            <div class="name-box">
              <div class="name-text">天女花</div>
            </div>
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp43.png'"
              alt=""
            />
            <div class="name-box">
              <div class="name-text">草芍药</div>
            </div>
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp44.png'"
              alt=""
            />
            <div class="name-box">
              <div class="name-text">云锦杜鹃</div>
            </div>
          </div>
          <div class="item">
            <img
              :src="'/statisUrl/ecotourism/temp45.png'"
              alt=""
            />
            <div class="name-box">
              <div class="name-text">鸡油菌</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="part part4">
      <div class="number number4"></div>
      <div class="part-title">濒危动物避难所</div>
      <div class="part-bd4">
        <p>
          鹞落坪保护区有濒危动植物避难所之称，是因为该区地处北亚热带向暖温带过渡地带，地质历史古老，且受第四纪冰川影响不大，为许多古老植物提供了理想的避难场所，保存了大批古老孑遗植物及系统演化上原始或孤立的科、属，同时这里也是珍稀濒危野生动植物的栖息地，生物多样性保存完好
        </p>
        <div class="img-boxs">
          <div class="item">
            <el-image
              :src="'/statisUrl/ecotourism/temp9.png'"
              fit="cover"
            />
            <el-image
              :src="'/statisUrl/ecotourism/temp10.png'"
              fit="cover"
            />
          </div>
          <div class="item">
            <el-image
              :src="'/statisUrl/ecotourism/temp8.png'"
              fit="cover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.briefIntroduction {
  margin-top: 30px;
  font-size: 0.8333vw;
  font-family: "楷体";
  color: #222222;
  .img-box {
    width: 100%;
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

  .zf-jj {
    display: flex;
    justify-content: space-between;
    margin: 60px auto 0;
    position: relative;
    background: url("/statisUrl/ecotourism/zfjj-bg.png") no-repeat center center / 100% 100%;
    width: 61.6146vw;
    height: 523px;
    .zf {
      width: 11.4583vw;
      display: flex;
      justify-content: center;
      padding-top: 160px;
      p {
        letter-spacing: 2px;
        writing-mode: vertical-rl;
        text-align: start;
        margin: 5px;
        font-family: "宋体";
      }
      .value1 {
        font-size: 1.25vw;
        color: #222222;
        font-weight: bold;
      }
      .value2 {
        font-size: 0.9375vw;
        color: #6a6763;
      }
      .value3 {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1.7188vw;
        height: 72px;
        font-size: 1.1458vw;
        color: #ffffff;
        background: url("/statisUrl/ecotourism/zf-name-bg.png") no-repeat;
      }
    }
    .text {
      letter-spacing: 4px;
      writing-mode: vertical-rl;
      text-align: start;
      padding: 50px 3.6458vw 40px 2.0833vw;
      color: #373736;
    }
    p {
      line-height: 1.3542vw;
      font-size: 0.9375vw;
    }
  }
  .survey {
    margin: 150px auto 140px;
    width: 68.75vw;
    .title {
      display: flex;
      width: 18.6458vw;
      margin: 0 auto 30px;
    }
    .box {
      height: 712px;
      background: url("/statisUrl/ecotourism/survey-bg.png") no-repeat center center / 100% 100%;
      padding: 80px 3.125vw;
      font-size: 0.8333vw;
      line-height: 1.6667vw;
      .video {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 33.3333vw;
        height: 19.5833vw;
        padding: 1.5625vw 1.5625vw 1.0417vw 1.5625vw;
        margin: auto;
        background: url("/statisUrl/ecotourism/survey-video-bg.png") no-repeat center center / 100% 100%;
      }
    }
  }
  .part1 {
    height: 820px;
  }
  .part2 {
    height: 649px;
  }
  .part3 {
    height: 822px;
    .part-title {
      color: #cfb787 !important;
    }
  }
  .part4 {
    height: 1092px;
  }
  .part {
    position: relative;
    padding-top: 165px;
    width: 66.5104vw;
    margin: 0 auto;
    .number {
      position: absolute;
      top: 80px;
      left: 0;
      width: 56px;
      height: 56px;
    }
    .number1 {
      background: url("/statisUrl/ecotourism/part-number-bg1.png") no-repeat;
    }
    .number2 {
      background: url("/statisUrl/ecotourism/part-number-bg2.png") no-repeat;
    }
    .number3 {
      background: url("/statisUrl/ecotourism/part-number-bg3.png") no-repeat;
    }
    .number4 {
      background: url("/statisUrl/ecotourism/part-number-bg4.png") no-repeat;
    }
    .part-title {
      width: 11.25vw;
      height: 88px;
      font-size: 1.0417vw;
      color: #222222;
      font-weight: 700;
      display: flex;
      background: url("/statisUrl/ecotourism/part-title-bg.png") no-repeat;
    }
    .part-bd1 {
      line-height: 1.6667vw;
      .part-con {
        margin-top: 40px;
        height: 250px;
        display: flex;
        justify-content: space-between;
        gap: 0.5208vw;
        .item {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          // width: 20.0521vw;
          height: 250px;
          background: url("/statisUrl/ecotourism/img-bg.png") no-repeat center center / 100% 100%;
          // cursor: pointer;
          img {
            width: 80%;
            height: 80%;
            border-radius: 5px;
          }
        }
      }
    }
    .part-bd2 {
      display: flex;
      line-height: 1.6667vw;
      .text {
        p {
          width: 30.2083vw;
        }
      }
      .part-con {
        flex: 1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5208vw;
        .item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          .name {
            border-top: 6px solid #78312b;
            padding-top: 5px;
            display: flex;
            width: 1.5625vw;
            letter-spacing: 4px;
            writing-mode: vertical-rl;
          }
          img {
            width: 7.3958vw;
          }
        }
      }
    }
    .part-bd3 {
      color: #fff;
      line-height: 1.6667vw;
      letter-spacing: 2px;
      .part-con {
        margin-top: 60px;
        display: flex;
        justify-content: space-between;
        .item {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 0.5208vw;

          cursor: pointer;
          img {
            width: 9.375vw;
            // height: 250px;
            filter: drop-shadow(0 0 2px #fff) drop-shadow(0 0 5px #e67e22);
          }
          .name-box {
            padding: 2px;
            background-color: #cfb787;
            font-size: 0.9375vw;
            color: #222;
            .name-text {
              padding: 0 0.4167vw;
              line-height: 1.5em;
              border-left: 3px solid #7a312c;
              border-right: 3px solid #7a312c;
            }
          }
        }
      }
    }
    .part-bd4 {
      line-height: 1.6667vw;
      letter-spacing: 2px;
      .img-boxs {
        margin-top: 40px;
        display: flex;
        justify-content: center;
        .item {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex: 1;
          margin: 0 0.3125vw;
          height: 500px;
          .el-image {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
