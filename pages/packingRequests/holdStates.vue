<template>
    <v-container fluid>
        <div class="tw-flex tw-justify-center tw-w-full tw-gap-3">
            <v-chip :color="R.isNil(filterInput) ? 'primary' : 'secondary'" size="x-large"
                @click="toggleFilter(undefined)" :class="R.isNil(filterInput) ? 'tw-text-bold' : 'tw-cursor-pointer'">
                Chờ xác nhận hold
            </v-chip>
            <v-chip :color="R.equals(HoldState.holding, filterInput) ? 'primary' : 'secondary'" size="x-large"
                @click="toggleFilter(HoldState.holding)"
                :class="R.equals(HoldState.holding, filterInput) ? 'tw-text-bold' : 'tw-cursor-pointer'">
                Đang hold
            </v-chip>
            <v-chip :color="R.equals(HoldState.returnProduct, filterInput) ? 'primary' : 'secondary'" size="x-large"
                @click="toggleFilter(HoldState.returnProduct)"
                :class="R.equals(HoldState.returnProduct, filterInput) ? 'tw-text-bold' : 'tw-cursor-pointer'">
                Return
            </v-chip>
            <v-chip :color="R.equals(HoldState.continueDelivering, filterInput) ? 'primary' : 'secondary'"
                size="x-large" @click="toggleFilter(HoldState.continueDelivering)"
                :class="R.equals(HoldState.continueDelivering, filterInput) ? 'tw-text-bold' : 'tw-cursor-pointer'">
                Cho bay về
            </v-chip>
        </div>
        <div>
            <v-card variant="flat" class="tw-bg-white tw-rounded-t-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
                <v-card-item>
                    <v-row>
                        <v-col cols="12" :md="!R.isNil(filterInput) ? 6 : 12">
                            <v-text-field label="Mã tracking" v-model="returnItemStore.searchInput"
                                placeholder="Nhập mã tracking" />
                        </v-col>
                        <template v-if="!R.isNil(filterInput)">
                            <v-col cols="12" md="2">
                                <v-text-field label="Từ ngày" v-model="returnItemStore.fromDateInput"
                                    placeholder="dd/MM/yyyy" type="date" />
                            </v-col>
                            <v-col cols="12" md="2">
                                <v-text-field label="Đến ngày" v-model="returnItemStore.toDateInput"
                                    placeholder="dd/MM/yyyy" type="date" />
                            </v-col>
                            <v-col cols="12" md="2" class="tw-flex tw-gap-6 tw-justify-center">
                                <v-select v-model="returnItemStore.statusInput" :items="filterTypes"
                                    item-title="title" item-value="value" placeholder="Trạng thái"></v-select>
                            </v-col>
                        </template>
                        <v-col cols="12" class="tw-flex tw-gap-6 tw-justify-center">
                            <v-btn type="reset" class="tw-w-[150px] tw-text-secondary" size="large" @click="refreshData"
                                color="secondary" variant="outlined">
                                Reset
                            </v-btn>
                            <v-btn prepend-icon="mdi-filter" size="large" :loading="returnItemStore.isLoading"
                                variant="elevated" @click="getItems" color="accent" class="tw-w-[150px]"
                                type="submit">Tìm kiếm</v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </div>
        <div>
            <HoldStateTable :filterInput="filterInput" />
        </div>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { HoldState, ReturnedItemStatus } from '~~/composables/useAPIs/returnedItems';
import { useReturnedItems } from '~~/composables';
definePageMeta({
    middleware: ['authenticated', 'permission-access']
})
const returnItemStore = useReturnedItems()
const filterInput = ref<HoldState | undefined>(undefined)
const toggleFilter = (holdState: HoldState | undefined) => {
    if (R.equals(holdState, filterInput.value)) { return }
    returnItemStore.targetPage = 1
    filterInput.value = holdState
    returnItemStore.searchInput = null
    returnItemStore.getReturnedItems(filterInput.value)
}
const getItems = async () => {
    await returnItemStore.getReturnedItems(filterInput.value)
}
const refreshData = async () => {
    returnItemStore.statusInput = null
    returnItemStore.fromDateInput = null
    returnItemStore.toDateInput = null
    returnItemStore.targetPage = 1
    returnItemStore.targetPer = 100
    returnItemStore.searchInput = null
    await returnItemStore.getReturnedItems(filterInput.value)
}

useAsyncData(() => returnItemStore.getReturnedItems(filterInput.value))
watch(() => filterInput.value, async (newValue) => {
    await returnItemStore.getReturnedItems(newValue)
})
const filterTypes = [
    { title: "Tất cả", value: null },
    { title: "Hold/Đóng hàng", value: ReturnedItemStatus.holded },
    { title: "Yêu cầu đặc biệt", value: ReturnedItemStatus.packingRequest }
]
</script>