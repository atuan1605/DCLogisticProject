<template>
    <v-card>
        <template v-slot:loader="{ isActive }">
            <v-progress-linear :active="isActive" color="primary" height="2" indeterminate></v-progress-linear>
        </template>
        <v-card-text :class="['tw-relative', pending ? 'card-content-height' : '']">
            <Spinner color="tw-fill-primary" :class="['tw-opacity-1', 'tw-absolute tw-inset-2/4 tw-color-primary']"
                v-if="pending" />
            <template v-else>
                <v-table fixed-header :height="'calc(100vh - 300px)'">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th class="text-center" v-for="date in dates">{{ date }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="R.isEmpty(usersOrdered)">
                            <td colspan="6" class="tw-py-8 tw-text-center"> No data.</td>
                        </tr>
                        <template v-else>
                            <tr v-for="user in usersOrdered">
                                <td>{{ user.name }}</td>
                                <td class="text-center" v-for="date in dates">
                                    {{ R.pathOr(0, [date, user.id, 'count'], data) }}
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </v-table>
            </template>
        </v-card-text>
    </v-card>
</template>

<style scoped>
.card-content-height {
    height: calc(100vh - 190px);
}
</style>

<script setup lang="ts">
import * as R from 'ramda';
definePageMeta({
    middleware: ['authenticated']
})

const route = useRoute()
const apis = useAPIs()

const { data, pending } = useAsyncData(() => {
    const queryInput = {
        agentCode: route.params.agentID as string
    }

    return apis.reportAPI.getTrackingInfoFillingReport(queryInput)
})

const dates = computed(() => R.compose(
    R.sortWith([R.ascend(R.identity)]),
    R.keys
)(data.value))

const usersOrdered = computed(() => {
    const values = R.values(data.value)
    return R.compose(
        R.sortWith([R.descend(R.prop('total')), R.ascend(R.prop('name'))]),
        R.map(x => ({
            id: x[0].id,
            name: x[0].name,
            total: R.sum(R.pluck('count', x))
        })),
        R.values,
        R.groupBy(R.prop('id')),
        R.flatten,
        R.map(R.values)
    )(values)
})

</script>