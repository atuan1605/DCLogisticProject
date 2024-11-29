<template>
    <AgentTabs path="/us/brokenProducts" title="Sản phẩm hỏng">
        <template #n-page="{ keyParam }">
            <NuxtPage :key="keyParam" />
        </template>
    </AgentTabs>
</template>