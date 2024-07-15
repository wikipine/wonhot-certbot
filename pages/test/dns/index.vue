<template>
    <div>
        <div class="custom-mb-12">
            <n-alert title="说明" type="info">
                调试云厂商的DNS设置功能，查询&设置&删除
            </n-alert>
        </div>
        <n-form ref="searchFormRef" inline :model="searchFormData" :rules="searchFormRules">
            <n-form-item label="AK_ID" path="akId">
                <n-select 
                    style="width: 200px"
                    v-model:value="searchFormData.akId" 
                    :options="akList" 
                    label-field="alias"
                    value-field="id"
                    placeholder="请选择云厂商"
                    />
            </n-form-item>
            <n-form-item label="域名" path="domain">
                <n-input v-model:value="searchFormData.domain" placeholder="填写域名" />
            </n-form-item>
            <n-form-item>
                <n-button attr-type="button" type="primary" :loading="searchLoading" @click="handleSearchClick">
                    查询
                </n-button>
            </n-form-item>
            <n-form-item>
                <n-button 
                    attr-type="button" 
                    :disabled="!searchFormData.akId || !searchFormData.domain"
                    type="primary" 
                    @click="setShowAdd(true)">
                    添加域名
                </n-button>
            </n-form-item>
        </n-form>
        <n-data-table 
            table-layout="fixed"
            :loading="searchLoading" 
            :columns="tableColumns" 
            :data="dataList" />
        <!-- 删除操作 -->
        <ak-dns-delete
            :key="showDelete.key"
            :visible="showDelete.visible"
            :akId="searchFormData.akId"
            :domain="searchFormData.domain"
            :record="selectedRecord"
            @close="setShowDelete(false)"
            @success="searchList()"
        ></ak-dns-delete>
        <!-- 添加操作 -->
        <ak-dns-add
            :key="showAdd.key"
            :visible="showAdd.visible"
            :akId="searchFormData.akId"
            :domain="searchFormData.domain"
            @close="setShowAdd(false)"
            @success="searchList()"
        ></ak-dns-add>
    </div>
</template>
<script setup>
import { useMessage, NButton, NSpace } from "naive-ui";
import to from "await-to-js";
import { getDNSRecordListApi } from "@/api/test";
import { getAkListApi } from "@/api/ak";
const message = useMessage();

const akList = ref([]);
const searchFormRef = ref();
const searchFormData = reactive({
    ak_id: null,
    domain: ''
})
const searchFormRules = {
    domain: {
        required: true,
        message: '请输入域名',
        trigger: ['input']
    }
}
const searchLoading = ref(false);
const setSearchLoading = (bool) => {
    searchLoading.value = bool;
}
const dataList = ref([]);
const tableColumns = [
    {
        title: '记录',
        key: 'rr'
    },
    {
        title: '记录类型',
        key: 'type'
    },
    {
        title: '记录值',
        key: 'value'
    },
    {
        title: 'TTL(秒)',
        key: 'ttl'
    },
    {
        title: '状态',
        key: 'status'
    },
    {
        title: '操作',
        key: 'action',
        width: 100,
        render(rowData, rowIndex) {
            return h(NSpace, null, {
                default: () => {
                    let btns = [];
                    btns.push(deleteBtn(rowData, rowIndex));
                    return btns;
                }
            })
        }
    }
]
const deleteBtn = (rowData, rowIndex) => {
    return h(NButton, { ghost: true, type: 'error', onClick: () => onDelete(rowIndex) }, { default: () => "删除" });
}
const showDelete = reactive({ visible: false, key: 0 });
const setShowDelete = (bool) => {
    if(bool) {
        showDelete.key = new Date().getTime();
    }
    showDelete.visible = bool;
}
const selectedRecord = ref({});
const showAdd = reactive({ visible: false, key: 0 });
const setShowAdd = (bool) => {
    if(bool) {
        if(!searchFormData.akId || !searchFormData.domain) {
            message.warning('请先查询选定厂商和域名');
            return;
        }
        showAdd.key = new Date().getTime();
    }
    showAdd.visible = bool;
}

onMounted(()=>{
    searchAKList();
})

// 云厂商list查询
const searchAKList = async () => {
    const [err, res] = await to(getAkListApi());
    if(err || !res.success) {
        return;
    }
    akList.value = res.data
}

// 搜索
const handleSearchClick = () => {
    searchFormRef.value?.validate((errors) => {
        if (errors) {
            return;
        }
        searchList();
    })
}

// 查询搜索
const searchList = async () => {
    setSearchLoading(true);
    const [err, res] = await to(getDNSRecordListApi(searchFormData));
    setSearchLoading(false);
    if(err || !res.success) {
        return;
    }
    dataList.value = res.data.list;
}

// 点击删除
const onDelete = (index) => {
    selectedRecord.value = dataList.value[index];
    setShowDelete(true);
}

</script>