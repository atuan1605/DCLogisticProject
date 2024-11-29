<template>
    <AgentTabs path="/reports/deliToReceiveAtVN" title="Quá hạn bay về Việt Nam 10 ngày">
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