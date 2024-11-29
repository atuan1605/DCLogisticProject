<template>
    <v-timeline density="compact" side="end" align="start">
        <v-timeline-item v-for="(item, index) in props.timelineItems" :key="index" :dot-color="'primary'" size="small">
            <div class="d-flex">
                <strong class="mr-4">{{ $formatUTCToLocalTime(item.createdAt) }}</strong>
                <div>
                    <strong>{{ item.username }} - {{ actionType(item.action) }}</strong>
                    <div class="text-caption">
                        {{ actionContent(item.action) }}
                    </div>
                </div>
            </div>
        </v-timeline-item>
    </v-timeline>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { ActionLoggerType, UserTimeLineOutput } from '~~/composables/useAPIs/system/user';

export interface Props {
    timelineItems: UserTimeLineOutput[]
}

const props = withDefaults(defineProps<Props>(), {
    timelineItems: [] as UserTimeLineOutput[]
})

const actionType = (item: ActionLoggerType) => {
    if (R.has('assignAgents', item)) {
        return "Cập nhật đại lý"
    }
    if (R.has('assignWarehouses', item)) {
        return "Cập nhật kho"
    }
    if (R.has('updateUserScope', item)) {
        return "Cập nhật scope"
    }
    return 'N/A'
}
const userStore = useUser()
await useAsyncData('agents', () => userStore.loadWarehouses())

const actionContent = (item: ActionLoggerType) => {
    if (R.has('assignAgents', item)) {
        return `Mã các đại lý mới: ${R.join(', ', R.path(['assignAgents', 'agentIDs'], item) || [])}`
    }
    if (R.has('assignWarehouses', item)) {
        const warehousesUser = R.filter(wh => R.includes(wh.id, R.path(['assignWarehouses', 'warehouseIDs'], item) || []), userStore.warehouses)
        return `Mã các kho mới: ${R.join(', ', R.map(wh => wh.name, warehousesUser))}`
    }
    if (R.has('updateUserScope', item)) {
        return `Mã các scope mới: ${R.join(', ', R.path(['updateUserScope', 'scopes'], item) || [])}`
    }

    return 'N/A'
}


</script>