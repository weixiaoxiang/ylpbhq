export const layerApi = {
    //获取图层树
    getLayerTree(params:any) {
        return request({
            url: `/Backend/GetLayerTree`,
            method: `get`,
            params,
        });
    },

    //新增/修改图层
    add(data: any) {
        return request({
            url: `/Backend/PostLayerTree`,
            method: `post`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/DeleteLayerTree`,
            method: `delete`,
            params
        });
    },
    //根据Id获取图层树
    getDetail(params: any) {
        return request({
            url: `/Backend/GetLayerById`,
            method: `get`,
            params
        });
    },
    //修改状态
    updateStatus(data: any) {
        return request({
            url: `/Backend/PostLayerTree`,
            method: `post`,
            data
        });
    },
    //根据表名获取表字段
    getFieldsByTableName(params: any) {
        return request({
            url: `/Backend/GetFieldsByTableName`,
            method: `get`,
            params
        });
    },
    //获取图层配置列表
    getLayerStyles(params: any) {
        return request({
            url: `/Backend/GetLayerStyles`,
            method: `get`,
            params
        });
    },
    //新增/修改图层配置
    postLayerStyle(data: any) {
        return request({
            url: `/Backend/PostLayerStyle`,
            method: `post`,
            data,
        });
    },
    //根据styleId获取图层角色详情
    getLayerStyleBystyleId(params: any) {
        return request({
            url: `/Backend/GetLayerStyleBystyleId`,
            method: `get`,
            params
        });
    },
    //查图层所有可配置的模块
    GetLayerFunctionalCatalog(params: any) {
        return request({
            url: `/Backend/GetLayerFunctionalCatalog`,
            method: `get`,
            params
        });
    },
}
