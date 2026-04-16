export const getLocal = (key: string) => {
  return localStorage.getItem(key)
}
export const setLocal = (item: any, key: string) => {
  localStorage.setItem(key, item)
}
export const removeLocal = (key: string) => {
  localStorage.removeItem(key)
}
