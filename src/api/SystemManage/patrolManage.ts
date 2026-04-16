//考勤管理
export const attendanceManageApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_electronicfenceByPage`,
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
            url: `/SysBackend/${params}`,
            method: `delete`,
        });
    },
    //详情
    getDetail(params: any) {
        return request({
            url: `/Backend/GetRoleById`,
            method: `get`,
            params
        });
    },
    //添加考勤范围
    ReturnRangeByLonLatDistance: (params: any) => {
        return request({
            url: `/Backend/ReturnRangeByLonLatDistance`,
            method: `post`,
            params
        });
    },

}
//考勤记录
export const attendanceRecodeApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_clockinByPage2`,
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
            url: `/SysBackend/${params}`,
            method: `delete`,
        });
    },
    //详情
    getDetail(params: any) {
        return request({
            url: `/Backend/GetRoleById`,
            method: `get`,
            params
        });
    },
    //添加考勤范围
    ReturnRangeByLonLatDistance: (params: any) => {
        return request({
            url: `/Backend/ReturnRangeByLonLatDistance`,
            method: `post`,
            params
        });
    },

}
// 任务管理
export const taskManageApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Patrol/Getxh_taskinfoByPage`,
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
            url: `/SysBackend/${params}`,
            method: `delete`,
        });
    },
    //详情
    getDetail(params: any) {
        return request({
            url: `/Backend/GetRoleById`,
            method: `get`,
            params
        });
    },
}

//任务路线
export const taskRouteApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Patrol/GetTaskRouteByPage`,
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
            url: `/SysBackend/${params}`,
            method: `delete`,
        });
    },
    //详情
    getDetail(params: any) {
        return request({
            url: `/Backend/GetRoleById`,
            method: `get`,
            params
        });
    },
    //获取打卡点
    getDKD(params:any) {
        return request({
            url: `/Patrol/Getxh_taskclockinByPage`,
            method: `get`,
            params,
        });
    },
}

// 报警类型
export const alarmTypeApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_alarm_typeByPage`,
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
// 报警记录
export const alarmRecodeApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_alarm_informationByPage`,
            method: `get`,
            params,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_alarm_information`,
            method: `get`,
            params,
        });
    }
}
// 周务小结
export const weekSummaryApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getxh_zwxjByPage`,
            method: `get`,
            params,
        });
    }
}
// 巡护记录
export const patrolApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/GetXhjlByPage`,
            method: `get`,
            params,
        });
    }
}
// 巡护日志
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
            responseType: "blob",
        });
    },
    //巡护概况-根据xhid查询巡护记录
    getDetail(params: any) {
        return request({
            url: `/Backend/GetXhgk_Xhjl`,
            method: `get`,
            params
        });
    },
}
// 动态管理
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
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_dynamic`,
            method: `delete`,
            params
        });
    },
}
// 采集管理
export const collectionApi = {
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
    },
    //获取采集图片
    getDetail(params: any) {
        return request({
            url: `/xh_file`,
            method: `get`,
            params
        });
    },
}
// 采集类型管理
export const collectionTypeApi = {
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
            url: `/Backend/Addxh_collect_type`,
            method: `post`,
            data,
        });
    },

    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updatexh_collect_type`,
            method: `put`,
            data,
        });
    },

    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deletexh_collect_type`,
            method: `get`,
            params
        });
    }
}