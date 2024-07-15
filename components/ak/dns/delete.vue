<template>
    <!--添加 or 编辑证书 -->
    <n-modal v-model:show="showVisible" transform-origin="center" :auto-focus="false" @mask-click="emitClose()">
        <n-card style="width: 600px" title="删除提示" :bordered="false">
            <template #header-extra>
                <n-button quaternary circle @click="emitClose()">
                    <Icon name="material-symbols:close-rounded" size="22"/>
                </n-button>
            </template>
            <div>
                确认删除当前解析记录&nbsp;<b>{{record.rr + '.' + record.domain}}</b>
            </div>
            <template #footer>
                <div style="display: flex;gap: 5px;justify-content: flex-end;">
                    <n-button 
                        type="error"
                        :loading="submitLoading" 
                        @click="onConfirm()">确认</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>
<script setup>
import to from "await-to-js";
import { deleteDNSRecordApi } from "@/api/test";
import { useMessage } from "naive-ui";
const message = useMessage();

const props = defineProps(['visible', 'record', 'akId', 'domain']);
const emit = defineEmits(['close', 'success']);
const emitClose = () => {
    setShowVisible(false);
    emit('close');
}
const emitSuccess = () => {
    emit('success');
    emitClose();
}

const showVisible = ref(false);
const setShowVisible = (bool) => showVisible.value = bool;
const submitLoading = ref(false);


onMounted(() => {
    setShowVisible(props.visible);
})

const onConfirm = async () => {
    const params = {
        akId: props.akId,
        domain: props.domain,
        recordId: props.record.recordId
    }
    submitLoading.value = true;
    const [err, res] = await to(deleteDNSRecordApi(params));
    submitLoading.value = false;
    if(err || !res.success) {
        return;
    }
    message.success('删除成功');
    emitSuccess();
}
</script>