
//影像管理
export const imageApi = {
    //影像管理 -- 分页获取影像列表
    getData(params:any) {
        return request({
            url: `/Backend/GetPageImages`,
            method: `get`,
            params,
        });
    },

    //影像管理--新增/修改信息（id>0为修改）
    add(data: any) {
        return request({
            url: `/Backend/PostImage`,
            method: `post`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/DeleteImageByImageId`,
            method: `delete`,
            params
        });
    }
}
//红外相机管理
export const infraredApi = {
    //红外相机管理 -- 分页获取红外相机列表
    getData(params:any) {
        return request({
            url: `/Backend/GetInfraredrCameraListByPage`,
            method: `get`,
            params,
        });
    },
    //修改
    update(data: any) {
        return request({
            url: `/Backend/PutInfraredrCameraById`,
            method: `put`,
            data,
        });
    },

}
//防灾减灾设备管理
export const disasterApi = {
    //防灾减灾设备管理 -- 分页获取防灾减灾设备列表
    getData(params:any) {
        return request({
            url: `/Backend/GetGeologicHazardEquipmentListByPage`,
            method: `get`,
            params,
        });
    },
    //防灾减灾设备管理--编辑
    update(data: any) {
        return request({
            url: `/Backend/PutGeologicHazardEquipmentById`,
            method: `put`,
            data,
        });
    },
}
//气象站/水质站设备管理 
export const waterWeatherApi = {
    //防灾减灾设备管理 -- 分页获取防灾减灾设备列表
    getData(params:any) {
        return request({
            url: `/Backend/GetEnvironmentalEquipmentListByPage`,
            method: `get`,
            params,
        });
    },
    //防灾减灾设备管理--编辑
    update(data: any) {
        return request({
            url: `/Backend/PutEnvironmentalEquipmentById`,
            method: `put`,
            data,
        });
    },
}
//土壤检测设备管理
export const soilApi = {
    //防灾减灾设备管理 -- 分页获取防灾减灾设备列表
    getData(params:any) {
        return request({
            url: `/Backend/GetSoilMonitorListByPage`,
            method: `get`,
            params,
        });
    },
    //防灾减灾设备管理--编辑
    update(data: any) {
        return request({
            url: `/Backend/PutSoilMonitorById`,
            method: `put`,
            data,
        });
    }
}
//虫情灯设备管理
export const pestsApi = {
    //防灾减灾设备管理 -- 分页获取防灾减灾设备列表
    getData(params:any) {
        return request({
            url: `/Backend/GetPestEquipmentListByPage`,
            method: `get`,
            params,
        });
    },
    //防灾减灾设备管理--编辑
    update(data: any) {
        return request({
            url: `/Backend/PutPestEquipmentById`,
            method: `put`,
            data,
        });
    }
}
//电子围栏设备管理
export const fenceApi = {
    getData(params:any) {
        return request({
            url: `/Backend/GetElectronicfenceEquipmentListByPage`,
            method: `get`,
            params,
        });
    },
    update(data: any) {
        return request({
            url: `/Backend/PutElectronicfenceEquipmentById`,
            method: `put`,
            data,
        });
    }
}
