<style lang="scss" scoped></style>
<template>
    <div>
        <div class="custom-mb-12">
            <n-alert title="SSH Servers" type="info">
                记录SSH Servers的信息，用于内容上传到服务器。当前仅支持 username/password 形式
            </n-alert>
        </div>
        <div class="custom-mb-12">
            <n-button type="primary" @click="onCreate()">添加记录</n-button>
        </div>
        <n-data-table :loading="searchLoading" :columns="tableColumns" :data="dataList" />
        <!-- 添加 or 编辑 -->
        <ssh-add
            :key="refreshTime" 
            :visible="showEdit" 
            :formParam="formParam"
            @close="setShowEdit(false)" 
            @success="searchList()" />
    </div>
</template>
<script setup>
import { useMessage, NButton, NSpace, useDialog, NTag, NDropdown } from "naive-ui";
import to from "await-to-js";
import { 
    getSSHListApi, 
    deleteSSHRecordApi,
    connectSSHTestApi
 } from "@/api/ssh";
const message = useMessage();
const dialog = useDialog();

const refreshTime = ref(0);
const setHandleLoading = (rowIndex, type, bool) => {
    const key = type + 'Loading';
    dataList.value[rowIndex][key] = bool;
}

onMounted(() => {
    searchList();
})

// table btns
const connectBtn = (rowData, rowIndex) => {
    return h(NButton, { ghost: true, loading: rowData.connectLoading, onClick: () => onSSHConnect(rowIndex) }, { default: () => "链接测试" });
}

const moreBtn = (rowData, rowIndex) => {
    let options = [
        { key: 'edit', label: '编辑'},
        { key: 'delete', label: '删除'}
    ]
    return h(NDropdown, 
        { options, onSelect: (key) => onMoreClick(key, rowIndex)}, 
        { default: () => h(NButton, null, {default: () => '更多'})}
    );
}
const onMoreClick = (key, rowIndex) => {
    switch(key) {
        case 'delete':
            onDelete(rowIndex);
            break;
        case 'edit':
            onEdit(rowIndex);
            break;
        default:
            message.error('未定义的操作');
    }
}

const tableColumns = [
    { title: 'ID', key: 'id' },
    { title: '别名', key: 'alias' },
    { title: 'HOST', key: 'host_name' },
    { title: '用户名', key: 'user_name' },
    { title: '端口', key: 'port' },
    { title: '更新时间', key: 'updated_at' },
    { title: '操作', key: 'handle', width: 180,
        render(rowData, rowIndex) {
            return h(NSpace, null, {
                default: () => {
                    let btns = [];
                    btns.push(connectBtn(rowData, rowIndex));
                    btns.push(moreBtn(rowData, rowIndex));
                    return btns;
                }
            })
        }
    }
]

// 查询列表
const searchLoading = ref(false);
const setSearchLoading = (bool) => searchLoading.value = bool;
const dataList = ref([]);
const searchList = async () => {
    setSearchLoading(true);
    const [err, res] = await to(getSSHListApi());
    setSearchLoading(false);
    if (err || !res.success) {
        return;
    }
    dataList.value = res.data;
    dataList.value.forEach(val => {
        val['connectLoading'] = false;
    })
}

// 添加，编辑
const showEdit = ref(false);
const formParam = reactive({ 
    id: 0, 
    alias: '', 
    host_name: '', 
    port: 22, 
    user_name: '', 
});
const setShowEdit = (bool) => {
    if (bool) {
        refreshTime.value = new Date().getTime();
    }
    showEdit.value = bool;
}
const onCreate = () => {
    formParam.id = 0;
    setShowEdit(true);
}
const onEdit = (rowIndex) => {
    const { id, alias, host_name, port, user_name } = dataList.value[rowIndex];
    formParam.id = id;
    formParam.alias = alias;
    formParam.host_name = host_name;
    formParam.port = port;
    formParam.user_name = user_name;
    setShowEdit(true);
}

// 删除
const onDelete = (rowIndex) => {
    const { id, alias } = dataList.value[rowIndex];
    dialog.warning({
        title: '提示',
        content: '确认删除【' + alias + '】',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            setSearchLoading(true);
            deleteSSHRecordApi(id).then(res => {
                if (true === res.success) {
                    message.success('操作成功');
                    searchList();
                }
            })
        }
    })
}

// 链接测试
const onSSHConnect = async (rowIndex) => {
    setHandleLoading(rowIndex, 'connect', true);
    const { id } = dataList.value[rowIndex];
    const [err, res] = await to(connectSSHTestApi(id));
    setHandleLoading(rowIndex, 'connect', false);
    if(err || !res.success) {
        return;
    }
    message.success(res.data ? '链接成功' : '链接失败');
}
</script>
