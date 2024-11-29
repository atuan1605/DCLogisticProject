<template>
    <v-card>
        <template v-slot:loader="{ isActive }">
            <v-progress-linear :active="isActive" color="primary" height="2" indeterminate></v-progress-linear>
        </template>
        <v-card-text :class="['tw-relative', reportDataStore.isLoading ? 'card-content-height' : '']">
            <Spinner color="tw-fill-primary" :class="['tw-opacity-1', 'tw-absolute tw-inset-2/4 tw-color-primary']"
                v-if="reportDataStore.isLoading" />
            <template v-else>
                <v-table fixed-header :height="'calc(100vh - 300px)'">
                    <thead>
                        <tr class="text-left">
                            <th>
                                STT
                            </th>
                            <th>
                                Mã tracking
                            </th>
                            <th>
                                Mã khách hàng
                            </th>
                            <th>
                                Ngày repack
                            </th>
                            <th>
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="R.isEmpty(reportDataStore.repackToBoxStock?.items || []) && !reportDataStore.isLoading">
                            <td colspan="6" class="tw-py-8 tw-text-center"> No data.</td>
                        </tr>
                        <template v-else>
                            <tr v-for="(item, index) in reportDataStore.repackToBoxStock?.items">
                                <td width="50">{{ ((queryInput.page || 1) - 1) * (queryInput.per || 1) + (index + 1) }}</td>
                                <td>{{ item.trackingNumber }}</td>
                                <td width="150">{{ !R.isNil(item.customerCode) ? item.customerCode : 'Không xác định' }}
                                </td>
                                <td width="200">{{ $formatUTCToLocalTime(item.repackedAt) }}</td>
                                <td width="100">
                                    <v-btn icon size="x-small" color="accent" @click="goToDetail(item.id)">
                                        <v-icon size="small">mdi-eye</v-icon>
                                    </v-btn>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </v-table>
                <v-row class="mt-2">
                    <p class="align-self-center tw-font-bold ml-2">Tổng số bản ghi: <span
                            class="tw-text-primary tw-text-xl">{{
                                reportDataStore.repackToBoxStock?.metadata.total }}</span></p>
                    <v-spacer />
                    <v-col cols="4" class="tw-flex tw-justify-end">
                        <v-pagination v-model="queryInput.page" :length="pageLength" :total-visible="7"
                            :disabled="reportDataStore.isLoading"></v-pagination>
                    </v-col>
                    <v-col cols="1">
                        <v-select :items="perOptions" v-model="queryInput.per" hide-details />
                    </v-col>
                </v-row>
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
import { useReportData } from '~~/composables';
import { GetStockInput } from '~~/composables/useAPIs/reports';
definePageMeta({
    middleware: ['authenticated']
})

const route = useRoute()
const reportDataStore = useReportData()

const perOptions = ref([20, 50, 100, 1000])

const getPageLength = (): string => {
    var value = Math.ceil((reportDataStore.repackToBoxStock?.metadata.total || 0) / (reportDataStore.repackToBoxStock?.metadata.per || 100))
    return (value == 0 ? 1 : value).toString()
}

const pageLength = ref<string>(getPageLength())

const queryInput = ref<GetStockInput>({
    agentID: route.params.agentID as string,
    page: Number(route.query.page) || 1,
    per: Number(route.query.per) || 100,
})

useAsyncData(() => reportDataStore.getStockFromRepackToBox(queryInput.value))

watch([() => queryInput.value.page, () => queryInput.value.per], async ([newPage, newPer]) => {
    await navigateTo({
        path: route.path,
        query: { ...route.query, page: newPage, per: newPer }
    })
    await reportDataStore.getStockFromRepackToBox(queryInput.value)
})

watch(() => reportDataStore.isLoading, (newValue) => {
    if (!newValue) {
        pageLength.value = getPageLength()
    }
})

const goToDetail = (itemID: string) => {
    navigateTo({
        path: `/trackingItems/${itemID}`
    })

}

</script>