import request from "@/config/request"

// 获取证书列表
export const getCertListApi = (params) => {
    return request.serverGet({
        url: '/cert/list',
        params
    })
}

// 添加证书记录
export const addCertRecordApi = (data) => {
    return request.serverPost({
        url: '/cert/record/add',
        data
    })
}

// 删除证书记录
export const deleteCertRecordApi = (id) => {
    return request.serverPost({
        url: '/cert/record/delete',
        data: {
            id
        }
    })
}

// 证书生成
export const handleCertCreateApi = (id) => {
    return request.serverPost({
        url: '/cert/create',
        data: {
            id
        }
    })
}

// 证书下载
export const handleCertDownloadApi = (id) => {
    return request.serverPost({
        url: '/cert/download',
        data: {
            id
        }
    })
}

// 证书上传
export const handleCertUploadApi = (data) => {
    return request.serverPost({
        url: '/cert/upload',
        data
    })
}