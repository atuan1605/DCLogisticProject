<template>
    <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col">
        <template #title>
            <span class="tw-text-2xl tw-p-4 "> BỘ LỌC
            </span>
        </template>
        <v-form @submit.prevent="onSearchTapped">
            <v-card-item>
                <v-row>
                    <v-col cols="12" md="3">
                        <v-text-field label="Từ ngày" v-model="wareHouseStore.fromDateInput" placeholder="dd/MM/yyyy"
                            type="date" />
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-text-field label="Đến ngày" v-model="wareHouseStore.toDateInput" placeholder="dd/MM/yyyy"
                            type="date" />
                    </v-col>
                    <v-col cols="12" md="4"> <v-card-actions class="tw-justify-center tw-space-x-6">
                            <v-btn type="reset" @click="resetQuery" class="tw-w-[150px] tw-text-secondary"
                                color="secondary" variant="outlined" v-if="!wareHouseStore.isSearching">
                                Reset
                            </v-btn>

                            <v-btn variant="elevated" color="accent" class="tw-w-[150px]" type="submit"
                                :loading="wareHouseStore.isSearching">Lọc
                                kết
                                quả</v-btn>
                        </v-card-actions>
                    </v-col>
                </v-row>
            </v-card-item>
        </v-form>
        <v-card-text>
            <v-table fixed-header :height="'calc(100vh - 440px)'">
                <thead>
                    <tr class="tw-border-b tw-border-black tw-border-solid">
                        <th class="tw-py-3 tw-w-60">Tên kho</th>
                        <th class="tw-py-3 tw-w-60">Số lượng tracking</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-if="wareHouseStore.isSearching">
                        <tr>
                            <td colspan="5" class="tw-py-8 text-center">
                                <v-progress-circular class="tw-mx-auto" indeterminate />
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <template v-if="!R.isNil(wareHouseStore.data)">
                            <tr v-for="warehouse in wareHouseStore.data" :key="warehouse.id">
                                <td>{{ warehouse.name }}</td>
                                <td @click="onGetTrackingItems(warehouse.id)" class="tw-cursor-pointer">{{
                                    warehouse.count
                                    }}</td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </v-table>
        </v-card-text>
        <warehouse-tracking-sheet :is-loading="wareHouseStore.isLoadingTracking" v-model="showTracking" title="Danh Sách Tracking"
            :from-date-title="wareHouseStore.fromDateInput" :to-date-title="wareHouseStore.toDateInput" />
    </v-card>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import * as R from 'ramda'
definePageMeta({
    middleware: ['authenticated']
})

import { useWareHouseTable } from '~~/composables/useWareHouseTable';

const route = useRoute()
const wareHouseStore = useTotalTrackingByWarehouse()

const agentID = route.params.agentID as string
wareHouseStore.setAgentID(agentID)

const { onSearchTapped, resetQuery } = useWareHouseTable(wareHouseStore)
const showTracking = ref(false)
const onGetTrackingItems = async(warehouseID: string) => {
    wareHouseStore.getItemsInput = {
        warehouseID: warehouseID,
        fromDate: wareHouseStore.fromDateInput,
        toDate: wareHouseStore.toDateInput,
        agentID: agentID,
        page: 1,
        per: 100
    }
    showTracking.value = true
    await wareHouseStore.getTrackingItems()
}
</script>