/**
 * 注释：
 * author: 魏晓翔
 * 使用css变量
 * 使用vueuse的useCssVar也可以实现，但这里使用原生js实现
 */
export function useCssVariables() {
  function setVariable(name: string, value: string) {
    document.documentElement.style.setProperty(`--${name}`, value)
  }

  function getVariable(name: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
  }

  function removeVariable(name: string) {
    document.documentElement.style.removeProperty(`--${name}`)
  }

  return {
    /**
     * 设置css变量
     */
    setVariable,
    /**
     * 获取css变量
     */
    getVariable,
    /**
     * 删除css变量
     */
    removeVariable
  }
}
