//周务小结
//获取列表
export function Getxh_zwxjByPage(params:any) {
    return request({
        url: "/Backend/Getxh_zwxjByPage",
        method: "get",
        params,
    });
}

//采集类型
export const collectTypeApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_collect_typeByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addxh_collect_type/Addxh_collect_type`,
            method: `post`,
            data,
        });
    },
    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updatexh_collect_type/Updatexh_collect_type`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_collect_type/Deletexh_collect_type`,
            method: `get`,
            params
        });
    }
}
//采集管理
export const collectApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_collecting_informationByPage`,
            method: `get`,
            params,
        });
    },

    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_collecting_information`,
            method: `get`,
            params
        });
    }
}
//巡护记录
export const patrolApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/GetXhjlByPage`,
            method: `get`,
            params,
        });
    },
    //巡护日志下载Excel
    downloadExcel: (params:any) => {
        return request({
            url: `/Backend/XhjlDownUploadExcel`,
            method: `get`,
            params,
        })
    }
}
//巡护日志
export const patrolLogApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_journalByPage`,
            method: `get`,
            params,
        });
    },
    //巡护日志下载Excel
    downloadExcel: (params:any) => {
        return request({
            url: `/Backend/XhrzDownUploadExcel`,
            method: `get`,
            params,
        })
    }
}
//报警类型
export const alarmTypeApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `Backend/Getxh_alarm_typeByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addxh_alarm_type`,
            method: `post`,
            data,
        });
    },
    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updatexh_alarm_type`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_alarm_type`,
            method: `get`,
            params
        });
    }
}
//报警记录
export const alarmApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_alarm_informationByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addxh_alarm_information`,
            method: `post`,
            data,
        });
    },
    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updatexh_alarm_information`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_alarm_information`,
            method: `get`,
            params
        });
    }
}
//动态管理
export const dynamicApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_dynamicByPage`,
            method: `get`,
            params,
        });
    },

    //删除
    delete(params:any) {
        return request({
            url: `/Backend/Deletexh_dynamic`,
            method: `get`,
            params,
        })
    }
}
