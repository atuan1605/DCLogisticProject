<template>
    <v-card class="px-10 py-5 mt-3">
        <v-row>
            <v-col cols="12" md="2">
                <v-text-field hide-details="auto" label="Scan mã tracking tại tại đây.
" v-model="changedWarehouseStore.searchInput" @keyup.enter="onChangeWarehouse" placeholder="Nhập mã tracking"
                    variant="outlined"></v-text-field>
            </v-col>
            <v-col cols="12" md="2">
                <v-text-field label="Từ ngày" v-model="changedWarehouseStore.sourceFromDateInput"
                    placeholder="dd/MM/yyyy" type="date" />
            </v-col>
            <v-col cols="12" md="2">
                <v-text-field label="Đến ngày" v-model="changedWarehouseStore.sourceToDateInput"
                    placeholder="dd/MM/yyyy" type="date" />
            </v-col>
            <v-col cols="12" md="2">
                <v-text-field label="Từ ngày" v-model="changedWarehouseStore.destinationFromDateInput"
                    placeholder="dd/MM/yyyy" type="date" />
            </v-col>
            <v-col cols="12" md="2">
                <v-text-field label="Đến ngày" v-model="changedWarehouseStore.destonationToDateInput"
                    placeholder="dd/MM/yyyy" type="date" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" md="6">
                <v-select label="Chọn kho đi" hide-details="auto" item-value="id" item-title="name"
                    v-model="changedWarehouseStore.sourceWarehouseIDInput" :items="sourceWarehouses"
                    persistent-hint></v-select>
                <v-table class="tw-border" fixed-header :height="'calc(100vh - 360px)'">
                    <thead>
                        <tr>
                            <th class="">STT</th>
                            <th class="">Mã tracking</th>
                            <th class="">Ngày nhập hàng</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-if="changedWarehouseStore.isLoadingTrackingItems && (changedWarehouseStore.sourceWarehousePage === 1)">
                            <td colspan="5" class="tw-py-8 text-center">
                                <v-progress-circular class="tw-mx-auto" indeterminate />
                            </td>

                        </tr>
                        <tr v-else-if="R.isEmpty(changedWarehouseStore.trackingItemsCurrentPage?.items || [])">
                            <td colspan="5" class="tw-py-8 tw-text-center">
                                No data.
                            </td>
                        </tr>
                        <template v-else>
                            <tr class="tw-hover:bg-accent/25"
                                v-for="(item, index) in changedWarehouseStore.trackingItemsCurrentPage?.items || []"
                                :key="item.id"
                                :class="item.warehouseID !== changedWarehouseStore.sourceWarehouseIDInput ? 'tw-text-red-500' : ''">
                                <td> {{ changedWarehouseStore.trackingItemsCurrentPage?.metadata.total - index }}
                                </td>
                                <td
                                    :class="item.warehouseID !== changedWarehouseStore.sourceWarehouseIDInput ? 'tw-text-red-500' : ''">
                                    {{ item.trackingNumber }}</td>
                                <td v-text="convertToLocalTime(item.receivedAtUSAt)">
                                </td>
                            </tr>
                        </template>
                        <tr
                            v-if="changedWarehouseStore.canGoNextSourcePage && !R.isEmpty(changedWarehouseStore.trackingItemsCurrentPage?.items || [])">
                            <td colspan="5" class="tw-py-8 text-center">
                                <v-progress-circular class="tw-mx-auto" v-intersect="onIntersect" indeterminate />
                            </td>

                        </tr>
                    </tbody>
                </v-table>

            </v-col>
            <v-col cols="12" md="6">
                <v-select label="Chọn kho đến" hide-details="auto" item-value="id" item-title="name"
                    v-model="changedWarehouseStore.destinationWarehouseIDInput" :items="destinationWarehouses"
                    persistent-hint></v-select>
                <v-table class="tw-border" fixed-header :height="'calc(100vh - 360px)'">
                    <thead>
                        <tr>
                            <th class="text-left">STT</th>
                            <th class="text-left">Mã tracking</th>
                            <th class="text-left">Người cập nhật</th>
                            <th class="text-left">Ngày nhập hàng</th>
                            <th class="text-left">Ngày Cập nhật</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-if="changedWarehouseStore.isLoadingUpdatedTrackingItems && (changedWarehouseStore.destinationWarehousePage === 1) ">
                            <td colspan="5" class="tw-py-8 text-center">
                                <v-progress-circular class="tw-mx-auto" indeterminate />
                            </td>

                        </tr>
                        <tr v-else-if="R.isEmpty(changedWarehouseStore.updatedTrackingItemsCurrentPage?.items || [])">
                            <td colspan="5" class="tw-py-8 tw-text-center">
                                No data.
                            </td>
                        </tr>
                        <template v-else>
                            <tr class="tw-hover:bg-accent/25"
                                v-for="(item, index) in changedWarehouseStore.updatedTrackingItemsCurrentPage?.items || []"
                                :key="item.id">
                                <td width="50"> {{ changedWarehouseStore.updatedTrackingItemsCurrentPage?.metadata.total - index }}
                                </td>
                                <td v-text="item.trackingNumber"></td>
                                <td v-text="item.updatedBy"></td>
                                <td v-text="convertToLocalTime(item.receivedAtUSAt)"></td>
                                <td v-text="convertToLocalTime(item.updatedAt)">
                                </td>
                            </tr>
                        </template>
                        <tr
                            v-if="changedWarehouseStore.canGoNextDestinationPage && !R.isEmpty(changedWarehouseStore.updatedTrackingItemsCurrentPage?.items || [])">
                            <td colspan="5" class="tw-py-8 text-center">
                                <v-progress-circular class="tw-mx-auto" v-intersect="onIntersectDestinationWarehouse"
                                    indeterminate />
                            </td>

                        </tr>
                    </tbody>
                </v-table>

            </v-col>
        </v-row>
        <audio ref="dingPlayer" class="tw-invisible" preload="auto">
            <source src="~/assets/sounds/ding.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
        <audio ref="errorPlayer" class="tw-invisible" preload="auto">
            <source src="~/assets/sounds/error.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    </v-card>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import * as R from 'ramda'

import { GetTrackingByWarehousesOutput } from "~~/composables/useAPIs/changedWarehouse"
import { WarehouseOutput } from '~~/composables/useAPIs/warehouses';
const receivedAtUSStore = useReceivedAtUS()
const dingPlayer = ref()
const errorPlayer = ref()
const changedWarehouseStore = useChangedWarehouse()
const { convertToLocalTime } = useLocalTime();

await useAsyncData('warehouses', () => receivedAtUSStore.loadWarehouses())
const destinationWarehouses = ref<WarehouseOutput[] | []>(receivedAtUSStore.warehouses)
const sourceWarehouses = ref<WarehouseOutput[] | []>(receivedAtUSStore.warehouses)

watch([() => changedWarehouseStore.sourceWarehouseIDInput, () => changedWarehouseStore.destinationWarehouseIDInput], async ([newSourceID, newDestinationID]) => {

    if (newSourceID !== undefined) {
        destinationWarehouses.value = receivedAtUSStore.warehouses.filter(warehouse => warehouse.id !== newSourceID);
    }
    if (newDestinationID !== undefined) {
        sourceWarehouses.value = receivedAtUSStore.warehouses.filter(warehouse => warehouse.id !== newDestinationID);
    }
    if (!R.isNil(newSourceID) && !R.isNil(newDestinationID) && newSourceID !== newDestinationID) {
        changedWarehouseStore.sourceWarehousePage = 1
        changedWarehouseStore.destinationWarehousePage = 1
        changedWarehouseStore.trackingItemsCurrentPage = undefined
        changedWarehouseStore.updatedTrackingItemsCurrentPage = undefined
        await changedWarehouseStore.getSourceTrackingItems()
        await changedWarehouseStore.getDestinationTrackingItems()
    }
    if (newSourceID === changedWarehouseStore.destinationWarehouseIDInput) {
        changedWarehouseStore.destinationWarehouseIDInput = undefined
    }
})
const app = useApp()
watch([() => changedWarehouseStore.sourceFromDateInput, () => changedWarehouseStore.sourceToDateInput], async ([newFromSourceDate, newToSourceDate]) => {
    if (R.isNil(changedWarehouseStore.sourceWarehouseIDInput)
        || R.isNil(changedWarehouseStore.destinationWarehouseIDInput)) {
        return
    }
    if (!R.isNil(newFromSourceDate) && !R.isNil(newToSourceDate) && dayjs(newFromSourceDate).isAfter(dayjs(newToSourceDate))) {
        app.addErrorToQueue("Invalid Input")
        return
    }
    changedWarehouseStore.sourceWarehousePage = 1
    changedWarehouseStore.trackingItemsCurrentPage = undefined
    await changedWarehouseStore.getSourceTrackingItems()
})
watch([() => changedWarehouseStore.destinationFromDateInput, () => changedWarehouseStore.destonationToDateInput], async ([newFromDate, newToDate]) => {
    if (R.isNil(changedWarehouseStore.sourceWarehouseIDInput)
        || R.isNil(changedWarehouseStore.destinationWarehouseIDInput)) {
        return
    }
    if (!R.isNil(newFromDate) && !R.isNil(newToDate) && dayjs(newFromDate).isAfter(dayjs(newToDate))) {
        app.addErrorToQueue("Invalid Input")
        return
    }
    changedWarehouseStore.destinationWarehousePage = 1
    changedWarehouseStore.updatedTrackingItemsCurrentPage = undefined
    await changedWarehouseStore.getDestinationTrackingItems()
})

const onChangeWarehouse = async () => {
    try {
        await changedWarehouseStore.updateTrackingWarehouse();
        dingPlayer.value.play();
    } catch (error) {
        errorPlayer.value.play();
    }
    changedWarehouseStore.searchInput = null
}

const onIntersect = async (entries: any) => {
    const isIntersecting = entries;
    if (!isIntersecting) return;
    if (changedWarehouseStore.isLoadingTrackingItems || !changedWarehouseStore.canGoNextSourcePage || R.isNil(changedWarehouseStore.trackingItemsCurrentPage)) return;

    try {
        changedWarehouseStore.sourceWarehousePage += 1;
        await changedWarehouseStore.getSourceTrackingItems();
    } catch (error) {
        console.error("Failed to load the next page", error);
    }
}
const onIntersectDestinationWarehouse = async (entries: any) => {
    const isIntersecting = entries;
    console.log(changedWarehouseStore.canGoNextDestinationPage)
    if (!isIntersecting) return;
    if (changedWarehouseStore.isLoadingUpdatedTrackingItems || !changedWarehouseStore.canGoNextDestinationPage || R.isNil(changedWarehouseStore.updatedTrackingItemsCurrentPage)) return;

    try {
        changedWarehouseStore.destinationWarehousePage += 1;
        await changedWarehouseStore.getDestinationTrackingItems();
    } catch (error) {
        console.error("Failed to load the next page", error);
    }
}
</script>