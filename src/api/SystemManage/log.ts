
// 登录日志-登录日志分页查询
export function loginLogs(params:any) {
    return request({
        url: "/Backend/Getsys_loginByPage",
        method: "get",
        params,
    });
}
// 操作日志-操作日志分页查询
export function operateLog(params:any) {
    return request({
        url: "/Backend/Getsys_operationlogByPage",
        method: "get",
        params,
    });
}

// 意见反馈分页查询
export function getxh_ideabackByPage(params:any) {
    return request({
        url: "/Backend/Getxh_ideabackByPage",
        method: "get",
        params,
    });
}