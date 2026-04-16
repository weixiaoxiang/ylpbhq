export const organizeApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/GetTreeOrganizations`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/PostOrganization`,
            method: `post`,
            data,
        });
    },
    //修改
    update(data: any) {
        return request({
            url: `/Backend/PutOrganization`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/DeleteOrganization`,
            method: `delete`,
            params
        });
    }
}
