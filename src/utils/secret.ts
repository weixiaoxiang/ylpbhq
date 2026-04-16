// @ts-nocheck
import CryptoJS from "crypto-js"

let publicKey = "XjjkaLnlzAFbR399IP4kdQ=="
publicKey = CryptoJS.enc.Utf8.parse(publicKey)
const iv = CryptoJS.enc.Utf8.parse("1234567890123456")
const signKey = "QGZUanpSaSy9DEPQFVULJQ=="

// MD5 加密
export function md5(str) {
  return CryptoJS.MD5(str).toString().toUpperCase()
}
// 加密生成签名
export function encrypt(str) {
  // 使用 encryptJSON 方法对传入的字符串进行加密
  const encryptedData = encryptJSON(str)
  // 获取当前时间的时间戳
  const timestamp = new Date().getTime()
  // 生成签名，使用 SHA1 算法对加密数据、时间戳和签名密钥进行哈希
  const sign = CryptoJS.SHA1(encryptedData + timestamp + signKey).toString()
  // 返回一个包含加密数据、签名和时间戳的对象
  return {
    encryptedData,
    sign,
    timestamp
  }
}
// 加密JSON
export function encryptJSON(str) {
  str = JSON.stringify(str)
  return encryptText(str)
}
// 加密
export function encryptText(str) {
  const encryptedData = CryptoJS.AES.encrypt(str, publicKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    length: 128
  }).toString()
  return encryptedData
}
// 解密
export function decrypt(str) {
  let data = decryptText(str)
  try {
    data = JSON.parse(data)
  } catch (error) {
    console.error("JSON解析错误")
  }
  return data
}
// 解密
export function decryptText(str) {
  let data = CryptoJS.AES.decrypt(str, publicKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
    length: 128
  })
  data = data.toString(CryptoJS.enc.Utf8)
  return data
}
