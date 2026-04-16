
export const noticeAnnouncementApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/System/Getxh_noticeByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/AddRole`,
            method: `post`,
            data,
        });
    },

    //修改
    update(data: any) {
        return request({
            url: `/Backend/UpdateRole`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/DeleteRoleByRoleId`,
            method: `delete`,
            params
        });
    },
    //详情
    getDetail(params: any) {
        return request({
            url: `/Backend/GetRoleById`,
            method: `get`,
            params
        });
    }

}
