
// 运维管理-分页获取设备厂商列表
export function getPageManufacturer(params:any) {
    return request({
        url: "/Backend/GetPageManufacturer",
        method: "get",
        params,
    });
}
// 获取设备列表 
export function getEquipments(params:any) {
    return request({
        url: "/Backend/GetEquipments",
        method: "get",
        params,
    });
}

// 根据厂商id获取权限运维id列表
export function getEquipmentIdsByManufacturerId(params:any) {
    return request({
        url: "/Backend/GetEquipmentIdsByManufacturerId",
        method: "get",
        params,
    });
}
// 更新/新增厂商数据（id为0新增 不为0修改）
export function postManufacturer(data:any) {
    return request({
        url: "/Backend/PostManufacturer",
        method: "post",
       data
    });
}
// 更新厂商启用状态
export function updateManufacturerStatus(params:any) {
    return request({
        url: "/Backend/UpdateManufacturerStatus",
        method: "put",
        params,
    });
}
// 更新厂商权限运维设备id列表
export function updateManufacturerEquipmentIds(data:any) {
    return request({
        url: "/Backend/UpdateManufacturerEquipmentIds",
        method: "put",
        data
    });
}
// 分页获取系统运维日志发送记录
export function getPageSMSLog(params:any) {
    return request({
        url: "/Backend/GetPageSMSLog",
        method: "get",
        params,
    });
}