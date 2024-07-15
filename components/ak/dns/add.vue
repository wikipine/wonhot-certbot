<template>
    <!--添加 or 编辑证书 -->
    <n-modal v-model:show="showVisible" transform-origin="center" :auto-focus="false" @mask-click="emitClose()">
        <n-card style="width: 600px" title="添加解析记录" :bordered="false">
            <template #header-extra>
                <n-button quaternary circle @click="emitClose()">
                    <Icon name="material-symbols:close-rounded" size="22"/>
                </n-button>
            </template>
            <n-form ref="formRef" :model="formData" :rules="formRules">
                <n-form-item label="类型" path="type">
                    <n-radio-group v-model:value="formData.type" name="radiogroup">
                    <n-space>
                        <n-radio value="A">A</n-radio>
                        <n-radio value="TXT">TXT</n-radio>
                        <n-radio value="CNAME">CNAME</n-radio>
                    </n-space>
                </n-radio-group>
                </n-form-item>
                <n-form-item label="域名" path="rr">
                    <n-input-group>
                        <n-input type="text" v-model:value="formData.rr" placeholder="子域名" />
                        <n-input-group-label>.{{ domain }}</n-input-group-label>
                    </n-input-group>
                </n-form-item>
                <n-form-item label="解析值" path="value">
                    <n-input type="text" v-model:value="formData.value" placeholder="输入解析值" />
                </n-form-item>
            </n-form>
            <template #footer>
                <div style="display: flex;gap: 5px;justify-content: flex-end;">
                    <n-button 
                        type="primary"
                        :loading="submitLoading" 
                        @click="onConfirm()">确认</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>
<script setup>
import to from "await-to-js";
import { addDNSRecordApi } from "@/api/test";
import { useMessage } from "naive-ui";
const message = useMessage();

const props = defineProps(['visible', 'akId', 'domain']);
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
const formRef = ref();
const formData = reactive({
    rr: '',
    type: 'A',
    value: ''
})
const formRules = {
    rr: {
        required: true,
        message: '请输入域名',
        trigger: ['input', 'blur']
    },
    value: {
        required: true,
        message: '请填写解析值',
        trigger: ['input', 'blur']
    },
}

onMounted(() => {
    setShowVisible(props.visible);
})

const onConfirm = async () => {
    formRef.value?.validate((errors) => {
        if (errors) {
            return;
        }
        submitLoading.value = true;
        const params = {
            akId: props.akId,
            domain: props.domain,
            ...formData
        }
        addDNSRecordApi(params).then(res => {
            if (true === res.success) {
                message.success('添加成功');
                emitSuccess();
            }
        }).finally(() => {
            submitLoading.value = false;
        })
    })
}
</script>