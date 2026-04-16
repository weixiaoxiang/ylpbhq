import { tsParticles } from "@tsparticles/engine"
import { loadFull } from "tsparticles"
import { loadFireworksPreset } from "@tsparticles/preset-fireworks"
import { merge } from "lodash-es"

/**
 * 为指定元素添加星星粒子效果
 * @param elementId - 目标DOM元素的id
 * @param options - 自定义配置项，会与默认配置深度合并
 */
export async function initStarEffect(elementId: string, options?: any) {
  // 使用完整版初始化
  await loadFull(tsParticles)
  const defaultOptions = {
    fullScreen: false,
    background: {
      color: {
        value: "transparent"
      }
    },
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          area: 800
        }
      },
      color: {
        value: "random"
      },
      shape: {
        type: ["circle", "triangle", "star", "polygon", "edge", "arrow", "line"]
      },
      // // 使用字符
      // shape: {
      //   type: "character",
      //   options: {
      //     character: {
      //       value: ["s", "P"], // 可以是字符数组
      //       font: "Verdana",
      //       style: "",
      //       weight: "400"
      //     }
      //   }
      // },
      opacity: {
        value: { min: 0.3, max: 1 },
        animation: {
          enable: true,
          speed: 0.5,
          sync: false
        }
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          sync: false
        }
      },
      twinkle: {
        particles: {
          enable: true,
          frequency: 0.05,
          opacity: 1
        }
      },
      move: {
        enable: true,
        speed: 0.5,
        direction: "none",
        random: true,
        straight: false,
        outModes: {
          default: "bounce"
        }
      }
    },
    interactivity: {
      detectsOn: "canvas", // 修正 detect_on 为 detectsOn
      events: {
        onHover: {
          enable: true,
          mode: "bubble"
        }
      },
      modes: {
        bubble: {
          distance: 200,
          size: 4,
          duration: 0.3
        }
      }
    }
  }

  await tsParticles.load({
    id: elementId,
    options: merge({}, defaultOptions, options)
  })
}
/**
 * 为指定元素添加烟花粒子效果
 * @param elementId - 目标DOM元素的id
 * @param options - 自定义配置项，会与默认配置深度合并
 */
export async function initFireworks(elementId: string, options?: any) {
  await loadFireworksPreset(tsParticles)

  const defaultOptions = {
    preset: "fireworks",
    // fullScreen: false, // 是否全屏显示
    background: {
      color: {
        value: "transparent"
      }
    },
    particles: {
      number: {
        value: 0 // 初始粒子数量
      },
      colors: {
        value: "#ffffff",
        animation: {
          enable: true,
          speed: 2,
          sync: true
        }
      },
      opacity: {
        value: { min: 0, max: 1 }, // 透明度范围
        animation: {
          enable: true, // 启用透明度动画
          speed: 0.5, // 动画速度
          sync: false, // 不同步
          startValue: "max", // 从最大值开始
          destroy: "min" // 消失时达到最小值
        }
      },
      size: {
        value: { min: 2, max: 4 } // 粒子大小范围
      },
      life: {
        duration: {
          sync: true, // 同步生命周期
          value: 5 // 生命周期长度
        },
        count: 1 // 生命次数
      },
      move: {
        enable: true,
        gravity: {
          enable: true, // 启用重力
          acceleration: 1, // 重力加速度
          maxSpeed: 100 // 最大下落速度
        },
        speed: { min: 2, max: 10 }, // 运动速度范围
        decay: 0.2, // 速度衰减
        trail: {
          enable: false // 当为true时，设置options.background无效
        }
      }
    },
    emitters: {
      direction: "top", // 发射方向
      life: {
        count: 0, // 发射次数(0为无限)
        duration: 0.1, // 持续时间
        delay: 0.1 // 发射延迟
      },
      rate: {
        delay: 0.8, // 发射间隔
        quantity: 1 // 每次发射数量
      },
      size: {
        width: 100, // 发射区域宽度
        height: 0 // 发射区域高度
      },
      position: {
        y: 20, // 发射位置Y轴(底部)
        x: 50 // 发射位置X轴(中间)
      },
      startCount: 1, // 初始发射数量
      power: 0.1 // 发射力度(影响高度)
    }
  }
  await tsParticles.load({
    id: elementId,
    options: merge({}, defaultOptions, options) // 深度合并配置
  } as any)
}
