<template>
  <div class="left1 wrapair">
    <div class="wrap-header">
      <div class="title-content">
        <img
          class="title-logo"
          :src="$fun.getImg('title-icon.svg')"
          alt=""
        />
        <div class="title">基础信息</div>
      </div>
    </div>
    <div class="line"></div>
    <div class="wrap-con">
      <div class="row-wrap">
        <div class="row1">
          <div class="contain">
            <img
              src="/images/aiRemoteSensing/row1-1.png"
              alt=""
            />
            <img
              src="/images/aiRemoteSensing/row1-2.png"
              alt=""
            />
            <img
              src="/images/aiRemoteSensing/row1-3.png"
              alt=""
            />
            <div class="box1 box-bg">森林覆盖率</div>
            <div class="box2 box-bg">总面积</div>
            <div class="box3 box-bg">林地率</div>
            <div class="box4">{{ jcgkData.slfgl }}%</div>
            <div class="box5">{{ jcgkData.zmj }}hm²</div>
            <div class="box6">{{ jcgkData.ldl }}%</div>
          </div>
        </div>
        <div class="row2">
          <img
            src="/images/aiRemoteSensing/row2-1.png"
            alt=""
          />
          <div class="gnfq">功能分区</div>
          <img
            src="/images/aiRemoteSensing/row2-2.png"
            alt=""
          />
        </div>
        <div class="row3">
          <div class="left">
            <div
              class="chart"
              id="chart1"
            ></div>
          </div>
          <div class="right">
            <div class="right-1">
              <div class="right-row1">
                <div class="text1">核心区</div>
                <div class="text2">42.26</div>
                <div class="text3">%</div>
              </div>
              <div class="right-row2">
                <div class="text4">5228</div>
                <div class="text5">hm²</div>
              </div>
            </div>
            <div class="right-2">
              <div class="right-row1">
                <div class="text1">一般控制区</div>
                <div class="text2">57.74</div>
                <div class="text3">%</div>
              </div>
              <div class="right-row2">
                <div class="text4">7143</div>
                <div class="text5">hm²</div>
              </div>
            </div>
            <!-- <div class="right-3">
              <div class="right-row1">
                <div class="text1">实验区</div>
                <div class="text2">59.7</div>
                <div class="text3">%</div>
              </div>
              <div class="right-row2">
                <div class="text4">7340</div>
                <div class="text5">hm²</div>
              </div>
            </div> -->
          </div>
        </div>
        <div class="row4">
          <img
            src="/images/aiRemoteSensing/row2-1.png"
            alt=""
          />
          <div class="jcss">基础设施</div>
          <img
            src="/images/aiRemoteSensing/row2-2.png"
            alt=""
          />
        </div>
        <div class="row5">
          <div class="contain">
            <div class="box">
              <img
                :src="$fun.getImg('bigDataAnalysis/i24.png')"
                alt=""
              />
              <div class="jt"></div>
              <div class="value-box">
                <span>{{ jcssData.xjg }}</span
                >㎡
              </div>
              <div class="text-box">宣教馆</div>
            </div>
            <div class="box">
              <img
                :src="$fun.getImg('bigDataAnalysis/i25.png')"
                alt=""
              />
              <div class="jt"></div>
              <div class="value-box">
                <span>{{ jcssData.jb }}</span
                >个
              </div>
              <div class="text-box">界碑</div>
            </div>
            <div class="box">
              <img
                :src="$fun.getImg('bigDataAnalysis/i26.png')"
                alt=""
              />
              <div class="jt"></div>
              <div class="value-box">
                <span>{{ jcssData.zs }}</span
                >个
              </div>
              <div class="text-box">界桩</div>
            </div>
            <div class="box">
              <img
                :src="$fun.getImg('bigDataAnalysis/i27.png')"
                alt=""
              />
              <div class="jt"></div>
              <div class="value-box">
                <span>{{ jcssData.zp }}</span
                >个
              </div>
              <div class="text-box">指示牌</div>
            </div>
            <div class="box">
              <img
                :src="$fun.getImg('bigDataAnalysis/i28.png')"
                alt=""
              />
              <div class="jt"></div>
              <div class="value-box">
                <span>{{ jcssData.qc }}</span
                >个
              </div>
              <div class="text-box">气象观测站</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GetALargeScreenDataProfiling_Jcgk, GetALargeScreenDataProfiling_Jcss } from "@/api"
import * as echarts from "echarts"

let leftchart1: any = null
const queryForm = reactive({
  page: 1,
  intPageSize: 10,
  name: "",
  typename: "",
  typeid: ""
})
const getData = async () => {
  getJcgkData()
  getJcssData()
}
// 获得基础概况数据
const jcgkData = ref<any>({
  slfgl: 0,
  zmj: 0,
  ldl: 0
})
const getJcgkData = async () => {
  const { response } = await GetALargeScreenDataProfiling_Jcgk()
  jcgkData.value = {
    slfgl: response.find((item: any) => item.name === "森林覆盖率")?.value?.toFixed(0),
    zmj: response.find((item: any) => item.name === "总面积")?.value?.toFixed(0),
    ldl: response.find((item: any) => item.name === "林地率")?.value?.toFixed(0)
  }
}

// 获得基础设施数据
const jcssData = ref<any>({
  xjg: 0,
  jb: 0,
  zs: 0,
  zp: 0,
  qc: 0
})
const getJcssData = async () => {
  const { response } = await GetALargeScreenDataProfiling_Jcss()
  jcssData.value = {
    xjg: response.find((item: any) => item.name === "宣教馆")?.value?.toFixed(0),
    jb: response.find((item: any) => item.name === "界碑")?.value,
    zs: response.find((item: any) => item.name === "界桩")?.value,
    zp: response.find((item: any) => item.name === "指示牌")?.value,
    qc: response.find((item: any) => item.name === "气象观测站")?.value
  }
}

const initchart = () => {
  leftchart1?.dispose && leftchart1.dispose() // 销毁实例
  leftchart1 = echarts.init(document.getElementById("chart1") as HTMLDivElement)
  let option: any = null
  // if (data.length === null) {
  // option = {
  //   title: {
  //     text: "暂无数据",
  //     left: "center",
  //     top: "center",
  //     textStyle: {
  //       color: "#247C86",
  //       fontSize: "14",
  //       fontWeight: "normal"
  //     }
  //   }
  // }
  // }

  // else {

  option = {
    polar: {
      radius: ["42%", "52%"],
      center: ["50%", "50%"]
    },
    angleAxis: {
      max: 100,
      show: false
    },
    grid: {
      left: "0%", // 调整左边距
      right: "0%", // 调整右边距
      top: "0%", // 调整上边距
      bottom: "0%" // 调整下边距
    },
    radiusAxis: {
      type: "category",
      show: true,
      axisLabel: {
        show: false
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      }
    },
    series: [
      //最内环
      {
        name: "",
        type: "pie",
        radius: ["35%", "0%"],
        silent: true,
        clockwise: true,
        z: 0,
        zlevel: 0,
        label: {
          normal: {
            position: "center"
          }
        },
        data: [
          {
            value: 100,
            name: "",
            itemStyle: {
              normal: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 1,
                      color: "#648cb6"
                    },
                    {
                      offset: 0,
                      color: "#173A5F00"
                    }
                  ]
                }
              }
            }
          }
        ]
      },
      {
        name: "Nightingale Chart",
        type: "pie",
        radius: ["40%", "65%"],
        center: ["50%", "50%"],
        // roseType: "area",
        label: {
          show: false
        },

        data: [
          {
            value: 5228,
            name: "rose 1",
            itemStyle: {
              normal: {
                color: "#3CFEFF"
              }
            }
          },
          {
            value: 7143,
            name: "rose 2",
            itemStyle: {
              normal: {
                color: "#36A3FE"
              }
            }
          }
        ]
      },
      {
        name: "",
        type: "pie",
        radius: ["35%", "38%"],
        silent: true,
        clockwise: true,
        z: 2,
        zlevel: 0,
        label: {
          normal: {
            position: "center"
          }
        },
        data: [
          {
            value: 100,
            name: "",

            itemStyle: {
              normal: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 1,
                  x2: 0,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: "rgba(88, 133, 181, 0)"
                    },
                    {
                      offset: 1,
                      color: "rgba(88, 133, 181, 1)"
                    }
                  ]
                }
              }
            }
          }
        ]
      },
      {
        name: "外部圈",
        type: "gauge",
        startAngle: 0,
        endAngle: 360,
        min: 0,
        max: 0,
        splitNumber: 10,
        radius: "95%",
        axisLine: {
          lineStyle: {
            color: [[1, "#2F4A61"]],
            width: 2
          }
        },
        tooltip: {
          show: false
        },
        axisLabel: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        },
        itemStyle: {
          show: false
        },
        detail: {
          show: false
        },
        title: {
          //标题
          show: false
        }
      },
      {
        name: "内部刻度",
        type: "gauge",
        radius: "100%",
        min: 0, //最小刻度
        max: 20, //最大刻度
        splitNumber: 5, //刻度数量
        startAngle: 0,
        endAngle: 360,
        axisLine: {
          show: false,
          lineStyle: {
            width: 0,
            color: [[1, "#5D6C81"]]
          }
        },
        //仪表盘轴线
        axisLabel: {
          show: false
        },
        //刻度标签。
        axisTick: {
          show: true,
          splitNumber: 10,
          lineStyle: {
            color: "#5D6C81",
            width: 2
          },
          length: 5
        },
        //刻度样式
        splitLine: {
          show: false
        },
        //分隔线样式
        detail: {
          formatter: "类别一",
          offsetCenter: ["0", "90%"],
          textStyle: {
            fontSize: 35,
            color: "#FFFFFF"
          }
        },
        title: {
          show: true,
          offsetCenter: [0, "18%"],
          textStyle: {
            color: "#43EEB6",
            fontSize: 50
          }
        },
        pointer: {
          show: false
        }
      },
      {
        name: "",
        type: "pie",
        radius: ["72%", "76%"],
        startAngle: 210,
        label: {
          show: false
        },
        data: [
          {
            value: 30,
            name: "",
            itemStyle: {
              normal: {
                color: "#2F6A8C"
              }
            }
          },
          {
            value: 120,
            name: "",
            itemStyle: {
              normal: {
                color: "rgba(255,255,255,0)"
              }
            }
          }
        ]
      },
      {
        name: "短线一",
        type: "gauge",
        radius: "90%",
        z: 4,
        min: 0, //最小刻度
        max: 100, //最大刻度
        splitNumber: 1, //刻度数量
        startAngle: -150,
        endAngle: -150,
        axisLine: {
          show: false,
          lineStyle: {
            width: 0,
            color: [[1, "#F19527"]]
          }
        },
        //仪表盘轴线
        axisLabel: {
          show: false
        },
        //刻度标签。
        axisTick: {
          show: true,
          splitNumber: 10,
          lineStyle: {
            color: "#F19527",
            width: 1
          },
          length: 8
        },
        //刻度样式
        splitLine: {
          show: false
        },
        //分隔线样式
        detail: {
          formatter: "类别一",
          offsetCenter: ["0", "90%"],
          textStyle: {
            fontSize: 35,
            color: "#FFFFFF"
          }
        },
        title: {
          show: true,
          offsetCenter: [0, "18%"],
          textStyle: {
            color: "#43EEB6",
            fontSize: 50
          }
        },
        pointer: {
          show: false
        }
      },
      {
        name: "短线二",
        type: "gauge",
        radius: "90%",
        min: 0, //最小刻度
        max: 100, //最大刻度
        splitNumber: 1, //刻度数量
        startAngle: -223,
        endAngle: -223,
        axisLine: {
          show: false,
          lineStyle: {
            width: 0,
            color: [[1, "#F19527"]]
          }
        },
        //仪表盘轴线
        axisLabel: {
          show: false
        },
        //刻度标签。
        axisTick: {
          show: true,
          splitNumber: 10,
          lineStyle: {
            color: "#F19527",
            width: 1
          },
          length: 8
        },
        //刻度样式
        splitLine: {
          show: false
        },
        //分隔线样式
        detail: {
          formatter: "类别一",
          offsetCenter: ["0", "90%"],
          textStyle: {
            fontSize: 35,
            color: "#FFFFFF"
          }
        },
        title: {
          show: true,
          offsetCenter: [0, "18%"],
          textStyle: {
            color: "#43EEB6",
            fontSize: 50
          }
        },
        pointer: {
          show: false
        }
      },
      {
        name: "",
        type: "pie",
        radius: ["72%", "76%"],
        startAngle: 45,
        label: {
          show: false
        },

        data: [
          {
            value: 30,
            name: "",
            itemStyle: {
              normal: {
                color: "#2F6A8C"
              }
            }
          },
          {
            value: 120,
            name: "",
            itemStyle: {
              normal: {
                color: "rgba(255,255,255,0)"
              }
            }
          }
        ]
      },
      {
        name: "短线三",
        type: "gauge",
        radius: "90%",
        min: 0, //最小刻度
        max: 100, //最大刻度
        splitNumber: 1, //刻度数量
        startAngle: -28,
        endAngle: -28,
        axisLine: {
          show: false,
          lineStyle: {
            width: 0,
            color: [[1, "#F19527"]]
          }
        },
        //仪表盘轴线
        axisLabel: {
          show: false
        },
        //刻度标签。
        axisTick: {
          show: true,
          splitNumber: 10,
          lineStyle: {
            color: "#F19527",
            width: 1
          },
          length: 8
        },
        //刻度样式
        splitLine: {
          show: false
        },
        //分隔线样式
        detail: {
          formatter: "类别一",
          offsetCenter: ["0", "90%"],
          textStyle: {
            fontSize: 35,
            color: "#FFFFFF"
          }
        },
        title: {
          show: true,
          offsetCenter: [0, "18%"],
          textStyle: {
            color: "#43EEB6",
            fontSize: 50
          }
        },
        pointer: {
          show: false
        }
      },
      {
        name: "短线四",
        type: "gauge",
        radius: "90%",
        z: 4,
        min: 0, //最小刻度
        max: 100, //最大刻度
        splitNumber: 1, //刻度数量
        startAngle: 45,
        endAngle: 45,
        axisLine: {
          show: false,
          lineStyle: {
            width: 0,
            color: [[1, "#F19527"]]
          }
        },
        //仪表盘轴线
        axisLabel: {
          show: false
        },
        //刻度标签。
        axisTick: {
          show: true,
          splitNumber: 10,
          lineStyle: {
            color: "#F19527",
            width: 1
          },
          length: 8
        },
        //刻度样式
        splitLine: {
          show: false
        },
        //分隔线样式
        detail: {
          formatter: "类别一",
          offsetCenter: ["0", "90%"],
          textStyle: {
            fontSize: 35,
            color: "#FFFFFF"
          }
        },
        title: {
          show: true,
          offsetCenter: [0, "18%"],
          textStyle: {
            color: "#43EEB6",
            fontSize: 50
          }
        },
        pointer: {
          show: false
        }
      }
    ]
  }

  // }

  leftchart1.clear()
  leftchart1.setOption(option)
  window.addEventListener("resize", resizeChart)
}
// 窗口大小改变事件
function resizeChart() {
  leftchart1.resize()
}
onMounted(() => {
  getData()
  initchart() //加载左侧
})
onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeChart)
})
</script>
<style lang="scss" scoped>
.left1 {
  height: vh(656);
  margin-top: vh(15);
}
.wrapair {
  pointer-events: all;
  color: #ffffff;
  position: relative;

  background: url("/images/cb-bg.png") no-repeat center center/100% 100%;

  box-sizing: border-box;
  border: 1.2px solid;
  border-image: linear-gradient(180deg, rgba(193, 242, 224, 0.15) 3%, rgba(255, 255, 255, 0.35) 115%);
  backdrop-filter: blur(50px);

  // &::after {
  //   position: absolute;
  //   right: 0;
  //   bottom: 0;
  //   content: "";
  //   display: block;
  //   width: 0;
  //   height: 0;
  //   border-top: 10px solid transparent;
  //   border-right: 10px solid rgba(255, 255, 255, 0.35);
  //   border-bottom: 10px solid rgba(255, 255, 255, 0.35);
  //   border-left: 10px solid transparent;
  // }

  .wrap-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 41px;
    padding: 0 2px 0 12px;
    background: url("@/assets/images/title-bg.png") no-repeat center center / 100% 100%;
    // background: url("@/assets/IntelligentPatrol/wrap-header-bg.png") no-repeat;
    // background-size: 100% 100%;

    .title-content {
      display: flex;
    }

    .title-logo {
      height: 50px;
      width: 50px;
      margin-left: -20px;
    }

    .updatetime {
      font-family: Source Sans 3;
      font-size: 12px;
      height: 12px;
      font-weight: 400;
      line-height: 12px;
      text-align: left;
      text-underline-position: from-font;
      text-decoration-skip-ink: none;
      color: #ffffff;
      margin-right: 15px;
    }

    .title {
      display: flex;
      align-items: center;
      font-size: 16px;

      // &::before {
      //   content: "";
      //   display: inline-block;
      //   width: 17.2px;
      //   height: 16px;
      //   margin-right: 10px;
      //   background: url("@/assets/IntelligentPatrol/wrap-header-icon.png") no-repeat;
      //   background-size: 100% 100%;
      // }
    }

    .title-con {
      margin-right: vw(20);
    }
    .tabs {
      display: flex;

      align-items: center;
      height: 28px;
      padding: 2px;
      border-radius: 1px;
      // background: #11403b;
      border: 1px solid rgba(255, 255, 255, 0.25);
      // margin-left: vw(100);

      .tab {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 46px;
        height: 24px;
        text-align: center;
        opacity: 0.5;
        font-size: 14px;
        cursor: pointer;
        transition: all 1s ease 0s;

        &.active {
          opacity: 1;
          font-weight: 600;
          color: #fff;
          // border: 1px solid #42c9c7;

          background: linear-gradient(90deg, #59bbf2 0%, #336c8c 100%);
        }
      }
    }
  }
  .line {
    margin-top: -2px;
    height: 5px;
    background: url("@/assets/images/title-line.png") no-repeat center center / cover;
  }
  .linebottom {
    margin-top: -2px;
    height: 5px;
    background: url("@/assets/images/title-line2.png") no-repeat center center / cover;
  }

  .wrap-con {
    height: calc(100% - 41px);
    overflow: hidden;
    padding: 0 vw(10);
    position: relative;
    .row-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-evenly;
      .row1 {
        height: vh(196);

        .contain {
          position: relative;
          height: 100%;
          display: flex;
          justify-content: space-evenly;
          color: #d8ebfd;
          font-size: 0.7292vw;
          img:nth-child(1),
          img:nth-child(3) {
            width: 5.0521vw;
            height: 83px;
            align-self: center;
          }
          img:nth-child(2) {
            width: 8.125vw;
            height: 145px;
          }
          .box-bg {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 4.7917vw;
            height: 27px;
            background: url("@/assets/images/bigDataAnalysis/i22.png") no-repeat center center / 100% 100%;
          }
          .box1 {
            position: absolute;
            left: 0.7292vw;
            bottom: 1.85vh;
          }
          .box2 {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: vh(5);
          }
          .box3 {
            position: absolute;
            right: 0.7292vw;
            bottom: 1.85vh;
          }
          .box4 {
            position: absolute;
            left: 2.3438vw;
            top: 6.4vh;
            font-size: 0.9375vw;
            color: #f6941d;
          }
          .box5 {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: 4.4vh;
            font-size: 0.9375vw;
            color: #fff;
          }
          .box6 {
            position: absolute;
            right: 2.3438vw;
            top: 6.4vh;
            font-size: 0.9375vw;
            color: #ef5a23;
          }
        }
      }
      .row2 {
        display: flex;
        justify-content: center;
        align-items: center;
        height: vh(28);
        background: #283f5b;
        .gnfq {
          font-family: Microsoft YaHei;
          font-size: 14px;
          font-weight: 400;
          line-height: 14px;
          text-align: center;
          text-underline-position: from-font;
          text-decoration-skip-ink: none;
          color: #b1e1f6;
          margin: 0 20px;
        }
      }
      .row3 {
        height: vh(201);
        display: flex;
        // background: #6a6161;
        .left {
          width: vw(200);
          height: vh(200);

          margin-left: 20px;
          .chart {
            width: vw(200);
            height: vh(200);
          }
        }
        .right {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;

          .right-row1 {
            margin-left: 40px;
            display: flex;
            .text1 {
              font-family: Microsoft YaHei;
              font-size: 12px;
              font-weight: 400;
              line-height: 18px;
              text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;
              color: #d8ebfd;
              margin-right: 30px;
            }
            .text2 {
              font-family: Microsoft YaHei;
              font-size: 14px;
              font-weight: 700;
              line-height: 18px;
              text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;
              color: #d8ebfd;
            }
            .text3 {
              font-family: Microsoft YaHei;
              font-size: 10px;
              font-weight: 700;
              line-height: 18px;
              text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;
              color: #d8ebfd;
            }
          }
          .right-row2 {
            display: flex;
            margin-left: 40px;
            .text4 {
              font-family: Microsoft YaHei;
              font-size: 14px;
              font-weight: 700;
              line-height: 18px;
              text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;
              color: #34d2d8;
              margin-right: 5px;
            }
            .text5 {
              font-family: Microsoft YaHei;
              font-size: 10px;
              font-weight: 700;
              line-height: 18px;
              text-align: left;
              text-underline-position: from-font;
              text-decoration-skip-ink: none;
              color: #34d2d8;
            }
          }
          .right-1 {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            height: 43px;
            margin-left: -30px;
            background: url("/images/aiRemoteSensing/row3-4.png") no-repeat center center/100% 100%;
          }
          .right-2 {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            height: 43px;
            margin-left: -30px;
            background: url("/images/aiRemoteSensing/row3-5.png") no-repeat center center/100% 100%;
          }
          .right-3 {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            height: 43px;
            margin-left: -40px;
            background: url("/images/aiRemoteSensing/row3-6.png") no-repeat center center/100% 100%;
          }
        }
      }
      .row4 {
        height: vh(28);
        display: flex;
        justify-content: center;
        align-items: center;
        background: #283f5b;
        .jcss {
          font-family: Microsoft YaHei;
          font-size: 14px;
          font-weight: 400;
          line-height: 14px;
          text-align: center;
          text-underline-position: from-font;
          text-decoration-skip-ink: none;
          color: #b1e1f6;
          margin: 0 20px;
        }
      }
      .row5 {
        height: vh(144);
        .contain {
          height: 100%;
          display: flex;
          justify-content: space-around;
          gap: 0.2604vw;
          color: #d8ebfd;
          .box {
            display: flex;
            justify-content: space-around;
            flex-direction: column;
            align-items: center;
            img {
              width: 3.5938vw;
              height: 3.5938vw;
            }
            .jt {
              width: 7px;
              height: 7px;
              background: url("/images/aiRemoteSensing/jt.png") no-repeat center center / 100% 100%;
            }
            .value-box {
              display: flex;
              justify-content: center;
              align-items: center;
              width: 2.6042vw;
              height: 1.25vw;
              background: url("@/assets/images/bigDataAnalysis/i29.png") no-repeat center center / 100% 100%;
              font-size: 0.625vw;
              span {
                font-size: 0.9375vw;
              }
            }
            .text-box {
              font-size: 0.7292vw;
            }
          }
        }
      }
    }
  }
}

:deep(.el-input) {
  // width: 90%;
  height: 30px;
  color: #fff;

  border: 1px solid #ffffff26;
  position: relative;
  border-radius: 1px;
  outline: none;
  text-indent: 25px;
  background-color: transparent;
  font-size: 14px;
  background: rgba(13, 54, 101, 0.5);

  .el-input__wrapper {
    padding: 0px 7px;
    box-shadow: unset;
    background-color: transparent;

    .el-input__inner {
      color: #fff;
    }

    .el-input__inner::placeholder {
      font-size: 12px;
      color: rgba(217, 217, 217, 0.5);
    }

    &.is-focus {
      box-shadow: unset;
    }
  }
  // background: #0C284D;

  .el-input-group__append {
    background-color: transparent;
    color: #fff;
    box-shadow: unset;

    .el-button {
      padding: 3px 11px;
      font-weight: 550;
    }
  }
}
</style>
