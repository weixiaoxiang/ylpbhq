export const autofitfix = ({ baseEl, fitEls, resize = true }: any) => {
  // console.log("autofitfix", baseEl, fitEls, resize)
  const fixStyle = () => {
    const el = document.querySelector(baseEl)
    if (!el) return
    const baseElStyle = getComputedStyle(el)
    const transformValue = baseElStyle.transform || ""
    const matrixValues =
      transformValue
        .match(/matrix\((.*)\)/)?.[1]
        ?.split(",")
        .map((v) => parseFloat(v)) || []

    // 获取x和y方向上的缩放因子
    const scaleX = matrixValues[0] || 1
    const scaleY = matrixValues[3] || 1
    let fixStyle = document.querySelector("#autofitfix") as HTMLStyleElement
    if (!fixStyle) {
      // 创建style样式
      fixStyle = document.createElement("style")
      fixStyle.id = "autofitfix"
      document.head.appendChild(fixStyle)
    }
    // 样式内容
    let styleContent = ""
    if (Array.isArray(fitEls)) {
      fitEls.forEach((el: string) => {
        styleContent += `
					${el} {
						transform: scale(${scaleX}, ${scaleY})!important;
						// transform-origin: 0px 0px!important;
					}
				`
      })
    }
    if (typeof fitEls === "string") {
      styleContent += `
				${fitEls} {
					transform: scale(${scaleX}, ${scaleY})!important;
					transform-origin: 0px 0px!important;
				}
			`
    }
    console.log("styleContent", styleContent)

    fixStyle.innerHTML = styleContent
  }
  fixStyle()
  if (resize) {
    window.addEventListener("resize", fixStyle)
  }
}
// .el-popover
export const fitEls = []
