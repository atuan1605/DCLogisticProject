<template>
    <VContainer fluid>
        <v-row>
            <v-col cols="10">
                <div class="tw-text-2xl tw-font-bold"> DANH SÁCH KHÁCH HÀNG </div>
            </v-col>
        </v-row>
        <AgentTabs path="/customers/list" title="">
            <template #n-page="{ keyParam }">
                <NuxtPage :key="keyParam" />
            </template>
        </AgentTabs>
    </VContainer>
</template>

<script setup lang="ts">
import * as R from 'ramda'
definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

</script>
