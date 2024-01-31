
<template>
     <n-modal v-model:show="showModal">
        <n-card style="width: 600px" title="证书生成指令" :bordered="false">
            <n-input type="textarea" readonly :value="commandStr"/>
            <div style="padding-top: 5px;">复制上述指令到命令行中执行，按提示解析操作即可</div>
            <template #footer>
                <div style="display: flex;gap: 5px;justify-content: flex-end;">
                    <n-button type="primary" @click="emitClose()">确认</n-button>
                </div>
            </template>
        </n-card>
    </n-modal>
</template>
<script setup>
const props = defineProps(['visible', 'content']);
const emit = defineEmits(['close']);
const emitClose = () => {
    setShowModal(false);
    emit('close');
}

const showModal = ref(false);
const setShowModal = (bool) => showModal.value = bool;
const commandStr = ref('');

onMounted(()=>{
    setShowModal(props.visible);
    if(props.content && Object.keys(props.content).length > 0) {
        let command = ['certbot certonly'];
        if(props.content.email) {
            command.push('--email ' + props.content.email);
        }
        let domainArr = props.content.domain.split(',');
        domainArr.forEach(val=>{
            command.push('-d ' + val);
        });
        command = command.concat([
            '--manual --preferred-challenges dns',
            '--server https://acme-v02.api.letsencrypt.org/directory'
        ]);
        commandStr.value = command.join(' ');
    }
})
</script>
