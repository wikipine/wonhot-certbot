<template>
    <ClientOnly>
        <n-layout has-sider>
            <n-layout-sider 
                bordered
                inverted
                collapse-mode="width"
                :collapsed-width="64"
                :width="200"
                :collapsed="collapsed"
                show-trigger
                @collapse="collapsed = true"
                @expand="collapsed = false"
                content-style="height: 100vh;">
                <n-menu
                    inverted
                    v-model:value="activeMenuKey"
                    :collapsed="collapsed"
                    :collapsed-width="64"
                    :collapsed-icon-size="22"
                    :options="menuOptions"
                    @update:value="onMenuSelect"
                />
            </n-layout-sider>
            <n-layout>
                <n-layout-content content-style="min-height: calc(100vh - 48px);padding: 12px;">
                    <slot ></slot>
                </n-layout-content>
                <n-layout-footer>
                    <div style="height: 48px;line-height: 48px;text-align: center;">
                        Copyright ©2023-present wikipine
                    </div>
                </n-layout-footer>
            </n-layout>
        </n-layout>
    </ClientOnly>
</template>
<script setup>
import { onMounted } from 'vue'
import { menuOptions } from "@/config/menu/data";
const route = useRoute();
const router = useRouter();

const collapsed = ref(false);
const activeMenuKey = ref('');

onMounted(()=>{
    activeMenuKey.value = route.name;
})

watch(()=>route.name, (newVal, oldVal) => {
    activeMenuKey.value = newVal;
})

const onMenuSelect = (event) => {
    activeMenuKey.value = event;
    router.push({name: event})
}
</script>

  