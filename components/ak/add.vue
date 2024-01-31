<template>
    <!--添加 or 编辑证书 -->
    <n-modal v-model:show="showCertEdit">
        <n-card style="width: 600px" title="添加记录" :bordered="false">
            <n-form ref="formRef" :model="formData" :rules="formRules">
                <n-form-item label="DNS厂商">
                    <n-radio-group v-model:value="formData.dns_type" name="radiogroup">
                        <n-space>
                            <n-radio value="aly">阿里云</n-radio>
                            <n-radio value="txy">腾讯云</n-radio>
                        </n-space>
                    </n-radio-group>
                </n-form-item>
                <n-form-item label="别名" path="alias">
                    <n-input type="text" v-model:value="formData.alias" placeholder="输入别名，系统内部选择标识" />
                </n-form-item>
                <n-form-item label="KEY ID" path="key_id">
                    <n-input type="text" v-model:value="formData.key_id" placeholder="AccessKey ID" />
                </n-form-item>
                <n-form-item label="KEY SECRET" path="key_secret">
                    <n-input type="text" v-model:value="formData.key_secret" placeholder="AccessKey Secret" />
                </n-form-item>
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
import { saveAkRecordApi } from "@/api/ak";
import { useMessage } from "naive-ui";
const message = useMessage();

const props = defineProps(['visible', 'formParam']);
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
    const { id } = props.formParam;
    if(id > 0) {
        for(let i in formData) {
            formData[i] = props.formParam[i];
        }
    } else {
        formData.id = 0;
        formData.dns_type = 'aly';
        formData.alias = '';
        formData.key_id = '';
    }
    formData.key_secret = '';
})

const showCertEdit = ref(false);
const setShowCertEdit = (bool) => showCertEdit.value = bool;
const submitLoading = ref(false);
const formRef = ref();
const formData = reactive({
    id: 0,
    dns_type: 'aly',
    alias: '',
    key_id: '',
    key_secret: '',
})
const formRules = {
    alias: {
        required: true,
        message: '请输入别名',
        trigger: ['input', 'blur']
    },
    key_id: {
        required: true,
        message: '请输入accesskey id',
        trigger: ['input', 'blur']
    },
    key_secret: {
        required: true,
        message: '请填写accesskey secret',
        trigger: ['input', 'blur']
    }
};

// 确认提交
const onConfirm = () => {
    formRef.value?.validate((errors) => {
        if (errors) {
            return;
        }
        submitLoading.value = true;
        saveAkRecordApi(formData).then(res => {
            if (true === res.success) {
                message.success(formData.id > 0 ? '修改成功': '添加成功');
                emitSuccess();
            }
        }).finally(() => {
            submitLoading.value = false;
        })
    })
}
</script>