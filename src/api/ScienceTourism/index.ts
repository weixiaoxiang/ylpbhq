// 科普宣教
export const scienceEducationApi = {
  // //重点物种
  // Getg_animals_plantsByPage(params: any) {
  //     return request({
  //         url: `${baseUrl}/BackgroundResources/GetPageResources`,
  //         method: `get`,
  //         params,
  //     });
  // },
  //文章查询
  Getg_kyjcByPage(params: any) {
    return request({
      url: `/Ecotourism/Getg_kyjcByPage`,
      method: `get`,
      params
    })
  },
  //秘境之眼  分页查询
  GetMjzyByPage(params: any) {
    return request({
      url: `/Ecotourism/GetMjzyByPage`,
      method: `get`,
      params
    })
  },
  //秘境之眼-删除
  deleteMjzy(params: any) {
    return request({
      url: `/Ecotourism/DeleteMjzy`,
      method: `get`,
      params
    })
  },
  //秘境之眼-新增/更新 （id>0为更新）
  postMjzy(data: any) {
    return request({
      url: `/Ecotourism/PostMjzy`,
      method: `post`,
      data
    })
  }
}
