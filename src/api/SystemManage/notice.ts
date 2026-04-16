//通知公告
export const noticeApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_noticeByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addxh_notice`,
            method: `post`,
            data,
        });
    },
    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updatexh_notice`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_notice`,
            method: `get`,
            params
        });
    }
}
