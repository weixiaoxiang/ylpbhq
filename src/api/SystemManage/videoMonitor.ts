//视频监控
export const videoMonitorApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/GetMonitoringListByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addmo_monitoringinfo`,
            method: `post`,
            data,
        });
    },
    //修改
    update(data: any) {
        return request({
            url: `/Backend/PutMonitoringById`,
            method: `put`,
            data,
        });
    }
}
