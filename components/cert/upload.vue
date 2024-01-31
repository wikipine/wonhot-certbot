<template>
    <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="证书上传" :bordered="false">
            <div class="custom-mb-12">
                <n-alert :show-icon="false" type="info">
                    正在进行证书 <b>【{{ content.id }} 】</b>的上传操作
                </n-alert>
            </div>
            
            <n-form ref="formRef" :model="formData" :rules="formRules">
                <n-form-item label="服务器ID" path="server_id">
                    <n-select
                        v-model:value="formData.server_id"
                        placeholder="选择要上传的服务器"
                        label-field="alias"
                        value-field="id"
                        :options="serverOptions"
                    >
                    <template #empty>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div>服务器未配置</div>
                            <n-button text type="primary" @click="gotoSSH()">前往设置</n-button>
                        </div>
                    </template>
                    </n-select>
                </n-form-item>
                <n-form-item label="上传目录" path="server_dir">
                    <n-input type="text" v-model:value="formData.server_dir" placeholder="输入证书上传目录，尾部不要跟 / 斜杠" />
                </n-form-item>
            </n-form>
            <template #footer>
                <div style="display: flex;gap: 5px;justify-content: flex-end;">
                    <n-button @click="emitClose()">取消</n-button>
                    <n-button type="primary" :loading="submitLoading" @click="onConfirm()">上传</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>
<script setup>
import to from "await-to-js";
import { handleCertUploadApi } from "@/api/cert";
import { getSSHListApi } from "@/api/ssh";
import { useMessage } from "naive-ui";
const message = useMessage();
const router = useRouter();

const props = defineProps(['visible', 'content']);
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
    formData.cert_id = props.content.id;
    getSSHList();
})

const showModal = ref(false);
const setShowModal = (bool) => showModal.value = bool;
const submitLoading = ref(false);
const formRef = ref();
const formData = reactive({
    cert_id: 0,
    server_id: null,
    server_dir: '',
})
const formRules = {
    server_dir: {
        required: true,
        message: '请输入证书上传目录',
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
        handleCertUploadApi(formData).then(res => {
            if (true === res.success) {
                message.success('上传成功');
                emitSuccess();
            }
        }).finally(() => {
            submitLoading.value = false;
        })
    })
}

const serverOptions = ref([]);
const getSSHList = async () => {
    const [err, res] = await to(getSSHListApi());
    if(err || !res.success) {
        return;
    }
    serverOptions.value = res.data ?? [];
}

const gotoSSH = () => {
    router.push('/setting/ssh');
}
</script>