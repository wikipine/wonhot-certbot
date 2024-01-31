import request from "@/config/request"

// 获取AK记录
export const getAkListApi = () => {
    return request.serverGet({
        url: '/ak/list'
    })
}

// 保存记录
export const saveAkRecordApi = (data) => {
    let url = '/ak/record/add';
    if(data.id > 0) {
        url = '/ak/record/update'
    }
    return request.serverPost({
        url: url,
        data
    })
}

// 删除记录
export const deleteAkRecordApi = (id) => {
    return request.serverPost({
        url: '/ak/record/delete',
        data: {
            id
        }
    })
}