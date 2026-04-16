//物种资源
export const speciesResourcesApi = {
    //列表查询
    getDataByPage(params:any) {
        return request({
            url: `/Backend/Getg_biologytypeByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addg_biologytype`,
            method: `post`,
            data,
        });
    },

    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updateg_biologytype`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deleteg_biologytype`,
            method: `get`,
            params
        });
    },
}
//动植物
export const animals_plantsApi = {
    //列表查询
    getDataByPage(params) {
        return request({
            url: `/Backend/Getg_animals_plantsByPage`,
            method: `get`,
            params,
        });
    },

    //添加
    add(data: any) {
        return request({
            url: `/Backend/Addg_animals_plants`,
            method: `post`,
            data,
        });
    },

    //修改
    update(data: any) {
        return request({
            url: `/Backend/Updateg_animals_plants`,
            method: `put`,
            data,
        });
    },
    //删除
    delete(params: any) {
        return request({
            url: `/Backend/Deleteg_animals_plants`,
            method: `get`,
            params
        });
    }
}