<template>
    <v-container fluid>
        <div class="tw-rounded-lg tw-border-black tw-border-solid ">
            <v-tabs bg-color="black">
                <v-tab v-for="agent, index in authStore.agents" :value="index" :to="{
                    path: `/us/repacked/${agent}`,
                }">
                    {{ agent }}
                </v-tab>
            </v-tabs>
        </div>
        <NuxtPage :key="route.params.agentID" />
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

const authStore = useAuth()
const route = useRoute()

useAsyncData(() => authStore.getAgents())
watch(() => authStore.agents, (agents) => {
    if (R.isNil(route.params.agentID) && agents.length > 0) {
        const firstAgent = agents[0]
        navigateTo({
            path: `repacked/${firstAgent}`
        })
    }
}, {
    immediate: true
})
</script>