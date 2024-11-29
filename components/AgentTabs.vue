<template>
    <v-container fluid>
        <app-header :title="title" />
        <v-card class="mt-2">
            <v-tabs color="primary" grow>
                <v-tab v-for="agent in authStore.agents" :to="{
                    path: `${props.path}/${agent}`
                }">
                    {{ agent }}
                </v-tab>
            </v-tabs>
            <slot name="n-page" :keyParam="route.params.agentID"></slot>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'

interface Props {
    path: string,
    title: string
}

const authStore = useAuth()
const route = useRoute()
const props = defineProps<Props>()

onMounted(() => {
    if (R.length(authStore.agents) === 0) {
        authStore.getAgents().then(() => {
            redirectToFirstAgent(authStore.agents)
        })
    }
    else {
        redirectToFirstAgent(authStore.agents)
    }
})

const redirectToFirstAgent = (agents: String[]) => {
    if (R.isNil(R.prop('agentID', route.params)) && R.length(agents) > 0) {
        const firstAgent = R.prop(0, agents)
        navigateTo({
            path: `${props.path}/${firstAgent}`
        })
    }
}

</script>