<template>
    <!--添加 or 编辑证书 -->
    <n-modal v-model:show="showCertEdit" transform-origin="center" :auto-focus="false" :mask-closable="false">
        <n-card style="width: 600px" title="证书生成" :bordered="false">
            <template #header-extra>
                <n-button quaternary circle :focusable="false" @click="emitClose()">
                    <Icon name="material-symbols:close-rounded" size="22" />
                </n-button>
            </template>
            <div>
                <n-steps vertical :current="step.current" :status="step.status">
                    <n-step v-for="(item, index) in stepMessage" :title="item.title" :key="index">
                        <div v-if="item.message === 'success'">
                            <n-flex>
                                <div>证书生成成功</div>
                                <n-button text type="primary" @click="emitSuccess()">确认返回</n-button>
                            </n-flex>
                        </div>
                        <div v-else>
                            {{ item.message }}
                        </div>
                    </n-step>
                </n-steps>
            </div>
            <template #footer>
                <div style="display: flex;gap: 5px;justify-content: flex-end;">
                    <!--占位-->
                </div>
            </template>
        </n-card>
    </n-modal>
</template>
<script setup>
import to from "await-to-js";
import { handleCertCreateApi } from "@/api/cert";
import { useMessage } from "naive-ui";
const message = useMessage();

const props = defineProps(['visible', 'content']);
const emit = defineEmits(['close', 'success']);
const emitClose = () => {
    setShowCertEdit(false);
    emit('close');
}
const emitSuccess = () => {
    emit('success');
    emitClose();
}

const showCertEdit = ref(false);
const setShowCertEdit = (bool) => showCertEdit.value = bool;
const step = reactive({
    current: 1,
    status: 'process'
})
const serverPort = ref(0);
const dnsCode = ref("");
const setStepCurrent = (num, status = 'process') => {
    step.current = num;
    step.status = status;
}
const stepMessage = ref([
    {title: '创建服务', message: '待处理'},
    {title: '证书CODE生成', message: '待处理'},
    {title: 'DNS设置', message: '待处理'},
    {title: 'DNS校验', message: '待处理'},
    {title: '生成证书', message: '待处理'},
])
const setStepMessage = (current, content, status = 'process') => {
    // 为 0 表示使用当前
    if(current === 0) {
        current = step.current;
    }
    stepMessage.value[current - 1].message = content;
    setStepCurrent(current, status);
}

onMounted(() => {
    setShowCertEdit(props.visible);
    if(props.visible) {
        createCertServer();
    }
})

// 1 创建服务
const createCertServer = async () => {
    setStepCurrent(1);
    const { id } = props.content;
    const [err, res] = await to(handleCertCreateApi(id));
    if(err || !res.success) {
        setStepMessage(1, '创建服务失败', 'error');
        return;
    }
    createWebSocketClient(res.data.port);
}
// 创建socket链接
const createWebSocketClient = (port) => {
    // 创建 WebSocket 连接
    const socket = new WebSocket('ws://localhost:' + port);
    // 连接打开时触发
    socket.addEventListener('open', (event) => {
      console.log('WebSocket is open now.');
      socket.send('Hello Server!');
    });
    // 接收到消息时触发
    socket.addEventListener('message', (event) => {
      const res = JSON.parse(event.data);
      const status = res.success ? 'process' : 'error';
      setStepMessage(res.step, res.message, status);
      // 非成功或为最终step，关闭链接
      if(!res.success || res.step === 5) {
        socket.close();
        return;
      }
    });
    // 连接关闭时触发
    socket.addEventListener('close', (event) => {
      console.log('WebSocket is closed now.');
    });
    // 连接出错时触发
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });
    // 设置port
    serverPort.value = port;
    setStepMessage(1, '服务创建成功，当前端口号为:' + port);
    setStepMessage(2, '证书CODE生成中');
}


</script>