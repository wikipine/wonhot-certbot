<style lang="scss" scoped></style>
<template>
    <div>
        空白首页，点击左侧菜单选择指定页面
    </div>
</template>
<script setup>
// 指定跳转到cert
const router = useRouter();
router.push({ name: 'cert' });
</script>