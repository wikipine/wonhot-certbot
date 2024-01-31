<template>
    <!--添加 or 编辑证书 -->
    <n-modal v-model:show="showCertEdit">
        <n-card style="width: 600px" title="添加记录" :bordered="false">
            <n-form ref="formRef" :model="formData" :rules="formRules">
                <n-form-item label="邮箱" path="email">
                    <n-input type="text" v-model:value="formData.email" placeholder="输入通知的邮箱" />
                </n-form-item>
                <n-form-item label="域名" path="domain">
                    <n-input type="textarea" v-model:value="formData.domain" placeholder="输入域名，多个用英文逗号分割" />
                </n-form-item>
                <n-form-item label="DNS厂商">
                    <n-radio-group v-model:value="formData.dns_type" name="radiogroup">
                        <n-space>
                            <n-radio value="manual">手动</n-radio>
                            <n-radio value="aly">阿里云</n-radio>
                            <n-radio value="txy">腾讯云</n-radio>
                        </n-space>
                    </n-radio-group>
                </n-form-item>
                <div v-if="formData.dns_type != 'manual'">
                    <n-form-item label="AK_ID" path="ak_id">
                        <n-input type="text" v-model:value="formData.ak_id" placeholder="从云厂商AK记录中选择ID填入" />
                    </n-form-item>
                </div>
            </n-form>
            <template #footer>
                <div style="display: flex;gap: 5px;justify-content: flex-end;">
                    <n-button @click="emitClose()">取消</n-button>
                    <n-button type="primary" :loading="submitLoading" @click="onConfirm()">保存</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>
<script setup>
import { addCertRecordApi } from "@/api/cert";
import { useMessage } from "naive-ui";
const message = useMessage();

const props = defineProps(['visible']);
const emit = defineEmits(['close', 'success']);
const emitClose = () => {
    setShowCertEdit(false);
    emit('close');
}
const emitSuccess = () => {
    emit('success');
    emitClose();
}

onMounted(() => {
    setShowCertEdit(props.visible);
})

const showCertEdit = ref(false);
const setShowCertEdit = (bool) => showCertEdit.value = bool;
const submitLoading = ref(false);
const formRef = ref();
const formData = reactive({
    domain: '',
    email: '',
    dns_type: 'manual',
    ak_id: '',
})
const formRules = {
    email: {
        required: true,
        message: '请输入邮箱',
        trigger: ['input', 'blur']
    },
    domain: {
        required: true,
        message: '请输入域名',
        trigger: ['input', 'blur']
    },
    ak_id: {
        required: true,
        message: '请填写ak_id',
        trigger: ['input', 'blur']
    },
};

// 确认提交
const onConfirm = () => {
    formRef.value?.validate((errors) => {
        if (errors) {
            return;
        }
        submitLoading.value = true;
        addCertRecordApi(formData).then(res => {
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