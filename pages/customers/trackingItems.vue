<template>
    <AgentTabs path="/customers/trackingItems" title="Danh sách tracking theo mã khách hàng">
        <template #n-page="{ keyParam }">
            <NuxtPage :key="keyParam" />
        </template>
    </AgentTabs>
</template>