<style lang="scss" scoped></style>
<template>
    <div>
        <div class="custom-mb-12">
            <n-alert title="云厂商AK" type="info">
                <div>各个云厂商提供给各自用户的永久访问密钥 AccessKey（简称AK），用于通过开发工具（API、CLI、SDK、Cloud Shell、Terraform等）访问时的身份验证，不用于控制台登录。</div>
                <n-space>
                    <div>如何获取</div>
                    <n-button text tag="a"
                        href="https://help.aliyun.com/knowledge_detail/38738.html"
                        target="_blank"
                        type="primary"
                    >阿里云AK</n-button>
                    <n-button text tag="a"
                        href="https://console.cloud.tencent.com/cam/capi"
                        target="_blank"
                        type="primary"
                    >腾讯云AK</n-button>
                </n-space>
            </n-alert>
        </div>
        <div class="custom-mb-12">
            <n-button type="primary" @click="onCreate()">添加AK</n-button>
        </div>
        <n-data-table :loading="searchLoading" :columns="tableColumns" :data="dataList" />
        <!-- 添加 or 编辑 ak -->
        <ak-add 
            :key="refreshTime" 
            :visible="showEdit" 
            :formParam="formParam"
            @close="setShowEdit(false)" 
            @success="searchList()" />
    </div>
</template>
<script setup>
import { useMessage, NButton, NSpace, useDialog } from "naive-ui";
import to from "await-to-js";
import { getAkListApi, deleteAkRecordApi } from "@/api/ak";
const message = useMessage();
const dialog = useDialog();

onMounted(() => {
    searchList();
})

const refreshTime = ref(0);

// table btns
const editBtn = (rowData, rowIndex) => {
    return h(NButton, { type: 'primary', onClick: () => onEdit(rowIndex) }, { default: () => "编辑" });
}
const deleteBtn = (rowData, rowIndex) => {
    return h(NButton, { ghost: true, type: 'error', onClick: () => onDelete(rowIndex) }, { default: () => "删除" });
}

const tableColumns = [
    { title: 'ID', key: 'id' },
    { title: '别名', key: 'alias' },
    { title: 'DNS厂商', key: 'dns_type_label' },
    { title: 'Key ID', key: 'key_id' },
    { title: '最近更新', key: 'updated_at' },
    { title: '操作', key: 'handle', width: 180,
        render(rowData, rowIndex) {
            return h(NSpace, null, {
                default: () => {
                    let btns = [];
                    btns.push(editBtn(rowData, rowIndex));
                    btns.push(deleteBtn(rowData, rowIndex));
                    return btns;
                }
            })
        }
    }
]

// 查询 ak 列表
const searchLoading = ref(false);
const setSearchLoading = (bool) => searchLoading.value = bool;
const dataList = ref([]);
const searchList = async () => {
    setSearchLoading(true);
    const [err, res] = await to(getAkListApi());
    setSearchLoading(false);
    if (err || !res.success) {
        return;
    }
    dataList.value = res.data;
    dataList.value.forEach(val => {
        val['createLoading'] = false;
        val['downloadLoading'] = false;
    })
}

// 添加，编辑
const showEdit = ref(false);
const formParam = reactive({ 
    id: 0, 
    alias: '', 
    dns_type: '', 
    key_id: '', 
    key_secret: '' 
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
    const { id, alias, dns_type, key_id, key_secret } = dataList.value[rowIndex];
    formParam.id = id;
    formParam.alias = alias;
    formParam.dns_type = dns_type;
    formParam.key_id = key_id;
    formParam.key_secret = key_secret;
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
            deleteAkRecordApi(id).then(res => {
                if (true === res.success) {
                    message.success('操作成功');
                    searchList();
                }
            })
        }
    })
}
</script>
