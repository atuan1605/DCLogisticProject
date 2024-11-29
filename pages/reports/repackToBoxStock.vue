<template>
    <AgentTabs path="/reports/repackToBoxStock" title="Quá hạn đóng thùng 3 ngày">
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