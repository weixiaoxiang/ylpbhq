// import request from "@/utils/request";
// let baseUrl = "/api";
// export function UploadFile(data) {
//   return request({
//     url: `${baseUrl}/ScienceEducationTourism/UploadPic`,
//     method: "post",
//     data,
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// }
//上传图片
export function UploadPicToFile(data:any) {
  return request({
    url: `/Img/UploadPicToFile`,
    method: "post",
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
//上传视频
export function UploadVideo(data:any) {
  return request({
    url: `/Img/UploadVideo`,
    method: "post",
    data,
    headers: { "Content-Type": "multipart/form-data" },
  });
}
