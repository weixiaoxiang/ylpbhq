//科普教育

export const PopularScienceEducationApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getg_kyjcByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addg_kyjc`,
            method: `post`,
            data,
        });
    },

    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updateg_kyjc`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deleteg_kyjc`,
            method: `get`,
            params
        });
    },
    //文章类别查询
    GetArticleType: (params: any) => {
        return request({
            url: `/Backend/GetArticleType`,
            method: `get`,
            params
        });
    },

}
