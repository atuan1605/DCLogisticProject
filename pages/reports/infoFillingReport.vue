<template>
    <AgentTabs path="/reports/infoFillingReport" title="Thống kê v/v điền thông tin hàng ngày:">
        <template #n-page="{ keyParam }">
            <NuxtPage :key="keyParam" />
        </template>
    </AgentTabs>
</template>

<script setup>

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

</script>