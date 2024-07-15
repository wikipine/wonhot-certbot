<style lang="scss" scoped></style>
<template>
    <div>
        <div class="custom-mb-12">
            <n-alert title="说明" type="info">
                采用 Let`s Encrypt --manual 手动模式创建证书，基于 Mac + NodeJS 实现自动化流程
            </n-alert>
        </div>
        <div class="custom-mb-12">
            <n-button type="primary" @click="setShowCertEdit(true)">添加记录</n-button>
        </div>
        <n-data-table 
            :loading="searchLoading" 
            :columns="tableColumns" 
            :data="dataList" 
            :remote="true"
            :pagination="pagination"
            @update:page="changePage"
        />
        <!-- 添加 or 编辑证书 -->
        <cert-add 
            :key="refreshTime" 
            :visible="showCertEdit" 
            @close="setShowCertEdit(false)" 
            @success="searchList()" />
        <!-- 指令查看 -->
        <cert-command 
            :key="refreshTime" 
            :visible="showCertCommand" 
            :content="certRecord"
            @close="setShowCertCommand(false)"/>
        <!-- 证书上传 -->
        <cert-upload 
            :key="refreshTime" 
            :visible="showCertUpload" 
            :content="certRecord"
            @close="setShowCertUpload(false)"/> 
        <!-- 证书生成 -->
        <cert-create 
            :key="showCertCreate.key" 
            :visible="showCertCreate.visible" 
            :content="certRecord"
            @close="setShowCertCreate(false)"
            @success="searchList()"/>
    </div>
</template>
<script setup>
import { useMessage, NButton, NSpace, useDialog, NTag, NDropdown } from "naive-ui";
import to from "await-to-js";
import { 
    getCertListApi, 
    deleteCertRecordApi, 
    handleCertDownloadApi
 } from "@/api/cert";
const message = useMessage();
const dialog = useDialog();

const refreshTime = ref(0);
const setHandleLoading = (rowIndex, type, bool) => {
    const key = type + 'Loading';
    dataList.value[rowIndex][key] = bool;
}
const certRecord = ref({});
const setCertRecord = (rowIndex) => {
    certRecord.value =  dataList.value[rowIndex];
}

onMounted(() => {
    searchList();
})

// table
const createBtn = (rowData, rowIndex) => {
    return h(NButton, { type: 'primary', loading: rowData.createLoading, onClick: () => onCertCreate(rowIndex) }, { default: () => "生成证书" });
}
const downloadBtn = (rowData, rowIndex) => {
    return h(NButton, { ghost: true, loading: rowData.downloadLoading, onClick: () => onCertDownload(rowIndex) }, { default: () => "下载证书" });
}
const commandBtn = (rowData, rowIndex) => {
    return h(NButton, { ghost: true, loading: rowData.downloadLoading, onClick: () => onShowCertCommand(rowIndex) }, { default: () => "查看命令" });
}
const moreBtn = (rowData, rowIndex) => {
    let options = [];
    if(rowData.dns_type != 'manual' && rowData.status == 1) {
        options.push({ key: 'upload', label: '上传证书'})
        options.push({ key: 'reload', label: '重新生成'})
    }
    options.push({ key: 'delete', label: '删除'});
    return h(NDropdown, 
        { options, onSelect: (key) => onMoreClick(key, rowIndex)}, 
        { default: () => h(NButton, null, {default: () => '更多'})}
    );
}
const onMoreClick = (key, rowIndex) => {
    switch(key) {
        case 'delete':
            onCertDelete(rowIndex);
            break;
        case 'reload':
            onCertReload(rowIndex);
            break;
        case 'upload':
            onCertUpload(rowIndex);
            break;
        default:
            message.error('未定义的操作');
    }
}

const tableColumns = [
    { title: 'ID', key: 'id' },
    { title: '域名', key: 'domain' },
    { title: '邮箱', key: 'email' },
    { title: 'DNS厂商', key: 'dns_type_label', 
        render(rowData, rowIndex) {
            let values = [];
            values.push(h('div', null, {default: () => rowData.dns_type_label }));
            if(rowData.dns_type !== 'manual') {
                values.push(h('div', null, {default: () => 'AK_ID: ' + rowData.ak_id }));
            }
            return values;
        }
    },
    { title: '到期时间', 
        render(rowData, rowIndex) {
            if(rowData.dns_type == 'manual' || rowData.status !== 1) {
                return null;
            }
            let values = [];
            values.push(h('div', null, {default: () => rowData.expired_at }));
            values.push(h('div', null, {default: () => '剩余: ' + getDaysRemaining(rowData.expired_at) + ' 天' }));
            return values;
        } 
    },
    { title: '状态',
        render(rowData, rowIndex) {
            if(rowData.dns_type == 'manual') {
                return null;
            }
            let values = [];
            if(rowData.status === 0) {
                values.push(h(NTag, { bordered: false }, { default:() => '待生成'}));
            } else {
                values.push(h(NTag, { bordered: false, type: 'success' }, { default:() => '已完成'}));
            }
            return values;
        }
    },
    { title: '操作', key: 'handle', width: 180,
        render(rowData, rowIndex) {
            return h(NSpace, null, {
                default: () => {
                    let btns = [];
                    if (rowData.status === 0) {
                        btns.push(createBtn(rowData, rowIndex));
                    }
                    if (rowData.status === 1) {
                        if(rowData.dns_type === 'manual') {
                            btns.push(commandBtn(rowData, rowIndex));
                        } else {
                            btns.push(downloadBtn(rowData, rowIndex));
                        }
                    }
                    btns.push(moreBtn(rowData, rowIndex));
                    return btns;
                }
            })
        }
    }
]

// 查询证书列表
const searchLoading = ref(false);
const pagination = reactive({page: 1, pageSize: 10, itemCount: 0});
const setSearchLoading = (bool) => searchLoading.value = bool;
const dataList = ref([]);
const searchList = async () => {
    setSearchLoading(true);
    let params = {
        page: pagination.page,
        pageSize: pagination.pageSize
    }
    const [err, res] = await to(getCertListApi(params));
    setSearchLoading(false);
    if (err || !res.success) {
        return;
    }
    let data = res.data.list;
    pagination.itemCount = res.data.total;
    data.forEach(val => {
        val['createLoading'] = false;
        val['downloadLoading'] = false;
    })
    dataList.value = data;
}
const changePage = (event) => {
    pagination.page = event;
    searchList();
}

// 添加，编辑证书
const showCertEdit = ref(false);
const setShowCertEdit = (bool) => {
    if (bool) {
        refreshTime.value = new Date().getTime();
    }
    showCertEdit.value = bool;
}

// 查看指令
const showCertCommand = ref(false);
const setShowCertCommand = (bool) => {
    if (bool) {
        refreshTime.value = new Date().getTime();
    }
    showCertCommand.value = bool;
}
const onShowCertCommand = (rowIndex) => {
    setCertRecord(rowIndex);
    setShowCertCommand(true);
}

// 证书生成
const showCertCreate = reactive({
    visible: false,
    key: 0
});
const setShowCertCreate = (bool) => {
    if (bool) {
        showCertCreate.key = new Date().getTime();
    }
    showCertCreate.visible = bool;
}
const onCertCreate = async (rowIndex) => {
    setCertRecord(rowIndex);
    setShowCertCreate(true);
}

// 证书重新生成
const onCertReload = async (rowIndex) => {
    const { domain, id } = dataList.value[rowIndex];
    dialog.warning({
        title: '提示',
        content: '确认重新生成【' + domain + '】的证书',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            onCertCreate(rowIndex);
        }
    })
}

// 证书删除
const onCertDelete = (rowIndex) => {
    const { domain, id } = dataList.value[rowIndex];
    dialog.warning({
        title: '提示',
        content: '确认删除【' + domain + '】的证书记录',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            setSearchLoading(true);
            deleteCertRecordApi(id).then(res => {
                if (true === res.success) {
                    message.success('操作成功');
                    searchList();
                }
            })
        }
    })
}

// 证书下载
const onCertDownload = async (rowIndex) => {
    setHandleLoading(rowIndex, 'download', true);
    const { id } = dataList.value[rowIndex];
    const [err, res] = await to(handleCertDownloadApi(id));
    setHandleLoading(rowIndex, 'download', false);
    if(err || !res.success) {
        return;
    }
    window.open(res.data);
}

// 证书上传
const showCertUpload = ref(false);
const setShowCertUpload = (bool) => {
    if (bool) {
        refreshTime.value = new Date().getTime();
    }
    showCertUpload.value = bool;
}
const onCertUpload = async (rowIndex) => {
    setCertRecord(rowIndex);
    setShowCertUpload(true);
}
</script>
