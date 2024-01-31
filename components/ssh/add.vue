<template>
    <!--添加 or 编辑 -->
    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="添加记录" :bordered="false">
            <n-form ref="formRef" :model="formData" :rules="formRules">
                <n-form-item label="别名" path="alias">
                    <n-input type="text" v-model:value="formData.alias" placeholder="输入别名，系统内部选择标识" />
                </n-form-item>
                <n-form-item label="HOST" path="host_name">
                    <n-input type="text" v-model:value="formData.host_name" placeholder="服务器地址" />
                </n-form-item>
                <n-form-item label="端口" path="port">
                    <n-input type="text" v-model:value="formData.port" placeholder="端口" />
                </n-form-item>
                <n-form-item label="用户名" path="user_name">
                    <n-input type="text" v-model:value="formData.user_name" placeholder="凭证用户名" />
                </n-form-item>
                <n-form-item label="密码" path="password">
                    <n-input type="text" v-model:value="formData.password" placeholder="凭证密码" />
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
import { saveSSHRecordApi } from "@/api/ssh";
import { useMessage } from "naive-ui";
const message = useMessage();

const props = defineProps(['visible', 'formParam']);
const emit = defineEmits(['close', 'success']);
const emitClose = () => {
    setShowModal(false);
    emit('close');
}
const emitSuccess = () => {
    emit('success');
    emitClose();
}

onMounted(() => {
    setShowModal(props.visible);
    const { id } = props.formParam;
    if(id > 0) {
        formData.id = 0;
        formData.alias = props.formParam.alias;
        formData.host_name = props.formParam.host_name;
        formData.port = '' + props.formParam.port;
        formData.user_name = props.formParam.user_name;
    } else {
        formData.id = 0;
        formData.alias = '';
        formData.host_name = '';
        formData.port = '22';
        formData.user_name = '';
    }
    formData.password = '';
})

const showModal = ref(false);
const setShowModal = (bool) => showModal.value = bool;
const submitLoading = ref(false);
const formRef = ref();
const formData = reactive({
    id: 0,
    alias: '',
    host_name: '',
    port: '22',
    user_name: '',
    password: '',
})
const formRules = {
    alias: {
        required: true,
        message: '请输入别名',
        trigger: ['input', 'blur']
    },
    host_name: {
        required: true,
        message: '请输入服务器地址',
        trigger: ['input', 'blur']
    },
    port: {
        required: true,
        message: '请填写端口号',
        trigger: ['input', 'blur']
    },
    user_name: {
        required: true,
        message: '请填写凭证用户名',
        trigger: ['input', 'blur']
    },
    password: {
        required: true,
        message: '请填写凭证密码',
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
        saveSSHRecordApi(formData).then(res => {
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