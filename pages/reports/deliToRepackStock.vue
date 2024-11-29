<template>
    <AgentTabs path="/reports/deliToRepackStock" title="Quá hạn repack 3 ngày">
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