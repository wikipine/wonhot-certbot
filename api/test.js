import request from "@/config/request"

// 获取DNS记录列表
export const getDNSRecordListApi = (params) => {
    return request.serverGet({
        url: '/test/dns/record/list',
        params
    })
}

// 删除DNS记录
export const deleteDNSRecordApi = (data) => {
    return request.serverPost({
        url: '/test/dns/record/delete',
        data
    })
}

// 添加DNS记录
export const addDNSRecordApi = (data) => {
    return request.serverPost({
        url: '/test/dns/record/add',
        data
    })
}

// 检查记录生效
export const checkDNSRecordApi = (data) => {
    return request.serverPost({
        url: '/test/dns/record/check',
        data
    })
}