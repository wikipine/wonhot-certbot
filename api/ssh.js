import request from "@/config/request"

// 获取列表
export const getSSHListApi = () => {
    return request.serverGet({
        url: '/ssh/list'
    })
}

// 保存记录
export const saveSSHRecordApi = (data) => {
    let url = '/ssh/record/add';
    if(data.id > 0) {
        url = '/ssh/record/update'
    }
    return request.serverPost({
        url: url,
        data
    })
}

// 删除记录
export const deleteSSHRecordApi = (id) => {
    return request.serverPost({
        url: '/ssh/record/delete',
        data: {
            id
        }
    })
}

// 链接测试
export const connectSSHTestApi = (id) => {
    return request.serverPost({
        url: '/ssh/connect/test',
        data: {
            id
        }
    })
}