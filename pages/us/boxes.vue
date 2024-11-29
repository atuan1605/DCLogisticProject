<template>
    <v-container fluid>
        <v-card>
            <v-tabs bg-color="black">
                <v-tab v-for="agent in authStore.agents" :to="{
                    path: `/us/boxes/${agent}`
                }">
                    {{ agent }}
                </v-tab>
            </v-tabs>
            <NuxtPage :key="route.params.agentID" />
        </v-card>

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
        const first = agents[0]
        navigateTo({
            path: `/us/boxes/${first}`
        })
    }
})


</script>