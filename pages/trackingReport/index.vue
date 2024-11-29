<template>
    <v-container fluid>
        <div class="tw-flex tw-flex-col">
            <v-row>
                <v-col cols=" 12">
                    <v-form ref="form" @submit.prevent="onSearchTapped">
                        <v-card-item>
                            <v-row>
                                <v-col cols="12" md="2">
                                    <v-text-field label="Từ ngày" v-model="trackingReportStore.fromDateInput"
                                        placeholder="dd/MM/yyyy" type="date"
                                        :rules="[validators.required('Từ ngày')]" />
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-text-field label="Đến ngày" v-model="trackingReportStore.toDateInput"
                                        placeholder="dd/MM/yyyy" type="date"
                                        :rules="[validators.required('Đến ngày')]" />
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select multiple hide-details="auto" v-model="trackingReportStore.agentIDsInput"
                                        :items="authStore.agents" label="Đại lí" persistent-hint></v-select>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <v-select multiple hide-details="auto" item-value="id" item-title="name"
                                        v-model="trackingReportStore.warehouseIDsInput" label="Kho"
                                        :items="warehouseStore.warehouses" persistent-hint></v-select>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-card-actions class="tw-justify-center tw-space-x-6">
                                        <v-btn type="reset" @click="resetQuery" class="tw-w-[150px] tw-text-secondary"
                                            color="secondary" variant="outlined"
                                            v-if="!trackingReportStore.isSearching">
                                            Reset
                                        </v-btn>

                                        <v-btn variant="elevated" color="primary" class="tw-w-[150px]" type="submit"
                                            :loading="trackingReportStore.isSearching">Lọc
                                            kết
                                            quả</v-btn>
                                    </v-card-actions>
                                </v-col>
                            </v-row>
                        </v-card-item>
                    </v-form>
                    <v-table class="tw-mt-4 tw-border-2" fixed-header :height="'calc(100vh - 360px)'">
                        <thead>
                            <tr class="tw-border-b tw-border-black tw-border-solid">
                                <th class="tw-py-3 tw-text-left">Ngày Nhập kho</th>
                                <th class="tw-py-3">
                                    <div class="tw-flex tw-flex-row tw-items-center"> Tổng số lượng
                                        <template v-if="trackingReportStore.isLoadingTrackingCount">
                                            <Spinner color="tw-fill-primary"
                                                :class="['tw-opacity-1', 'tw-inset-2/4 tw-color-primary', 'tw-ml-1']" />
                                        </template>
                                        <template v-else>
                                            <v-chip
                                                @click="onGetTracking(SearchType.total, trackingReportStore.fromDateInput, trackingReportStore.toDateInput)"
                                                class="tw-ml-1 tw-cursor-pointer" color="primary">{{
                                                    trackingReportStore.trackingCountByDate?.total }}</v-chip>
                                        </template>
                                    </div>

                                </th>
                                <th class="tw-py-3">
                                    <div class="tw-flex tw-flex-row tw-items-center">Có ảnh
                                        <template v-if="trackingReportStore.isLoadingTrackingCount">
                                            <Spinner color="tw-fill-primary"
                                                :class="['tw-opacity-1', 'tw-inset-2/4 tw-color-primary', 'tw-ml-1']" />
                                        </template>
                                        <template v-else>
                                            <v-chip
                                                @click="onGetTracking(SearchType.files, trackingReportStore.fromDateInput, trackingReportStore.toDateInput)"
                                                class="tw-ml-1 tw-cursor-pointer" color="primary">{{
                                                    trackingReportStore.trackingCountByDate?.files }}</v-chip>
                                        </template>
                                    </div>
                                </th>
                                <th class="tw-py-3">
                                    <div class="tw-flex tw-flex-row tw-items-center">Bay về VN
                                        <template v-if="trackingReportStore.isLoadingTrackingCount">
                                            <Spinner color="tw-fill-primary"
                                                :class="['tw-opacity-1', 'tw-inset-2/4 tw-color-primary', 'tw-ml-1']" />
                                        </template>
                                        <template v-else>
                                            <v-chip
                                                @click="onGetTracking(SearchType.flyingBack, trackingReportStore.fromDateInput, trackingReportStore.toDateInput)"
                                                class="tw-ml-1 tw-cursor-pointer" color="primary">{{
                                                    trackingReportStore.trackingCountByDate?.flyingBack }}</v-chip>
                                        </template>
                                    </div>

                                </th>
                                <th class="tw-py-3">
                                    <div class="tw-flex tw-flex-row tw-items-center">
                                        Chưa về VN
                                        <template v-if="trackingReportStore.isLoadingTrackingCount">
                                            <Spinner color="tw-fill-primary"
                                                :class="['tw-opacity-1', 'tw-inset-2/4 tw-color-primary', 'tw-ml-1']" />
                                        </template>
                                        <template v-else>
                                            <v-chip
                                                @click="onGetTracking(SearchType.unflyingBack, trackingReportStore.fromDateInput, trackingReportStore.toDateInput)"
                                                class="tw-ml-1 tw-cursor-pointer" color="primary">{{
                                                    trackingReportStore.trackingCountByDate?.unflyingBack }}</v-chip>
                                        </template>
                                    </div>
                                </th>

                            </tr>
                        </thead>
                        <tbody>

                            <tr v-if="R.isEmpty(trackingReportStore.currentTotalPage?.items || [])">
                                <td colspan="5" class="tw-py-8 tw-text-center">
                                    No data.
                                </td>
                            </tr>
                            <tr v-else-if="trackingReportStore.isSearching">
                                <Spinner color="tw-fill-primary"
                                    :class="['tw-opacity-1', 'tw-absolute tw-inset-2/4 tw-color-primary']" />
                            </tr>
                            <template v-else>
                                <tr class="tw-hover:bg-accent/25"
                                    v-for="item in trackingReportStore.currentTotalPage?.items || []">
                                    <td class="tw-py-3 ">
                                        {{ dayjs(item.receivedAtUSAt).format('DD-MM-YYYY') }}
                                    </td>
                                    <td class="tw-py-3 tw-cursor-pointer" v-text="item.allItems || 0"
                                        @click="onGetTracking(SearchType.total, dayjs(item.receivedAtUSAt).format('YYYY-MM-DD'))" />
                                    <td class="tw-py-3 tw-cursor-pointer" v-text="item.itemWithFiles || 0"
                                        @click="onGetTracking(SearchType.files, dayjs(item.receivedAtUSAt).format('YYYY-MM-DD'))" />
                                    <td class="tw-py-3 tw-cursor-pointer" v-text="item.flyingBackItems || 0"
                                        @click="onGetTracking(SearchType.flyingBack, dayjs(item.receivedAtUSAt).format('YYYY-MM-DD'))" />
                                    <td class="tw-py-3 tw-cursor-pointer" v-text="item.unflyingBackItems || 0"
                                        @click="onGetTracking(SearchType.unflyingBack, dayjs(item.receivedAtUSAt).format('YYYY-MM-DD'))" />
                                </tr>

                            </template>
                        </tbody>
                    </v-table>

                </v-col>
            </v-row>
            <v-row class="mt-2">
                <v-spacer />
                <v-col cols="4" class="tw-flex tw-justify-end">
                    <v-pagination v-model="trackingReportStore.targetTotalPage"
                        :length="trackingReportStore.totalNumberOfPage?.toString()" :total-visible="7"
                        :disabled="trackingReportStore.isSearching"></v-pagination>
                </v-col>
                <v-col cols="1">
                    <v-select :items="trackingItemsPerOptions" v-model="trackingReportStore.targetTotalPer"
                        hide-details />
                </v-col>
            </v-row>
            <TrackingReportSheet v-model="showBottomSheet" :title="targetTitle"
                :from-date-title="targetTrackingFromDate" :to-date-title="targetTrackingToDate"
                :searchType="targetSearchType" />
        </div>
    </v-container>

</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"
import { SearchType } from '~~/composables/useAPIs/trackingReports'
import { VForm } from 'vuetify/lib/components/index.mjs';

definePageMeta({
    middleware: ['authenticated']
})
const authStore = useAuth()
const trackingReportStore = useTrackingReport()
const warehouseStore = useWarehouse()
const trackingItemsPerOptions = ref([10, 20, 50, 100])

const validators = useValidators()

const form = ref<VForm | null>(null)

const targetPer = ref(25)
const showBottomSheet = ref(false)
const onSearchTapped = async () => {
    if (form.value) {
        const { valid } = await form.value?.validate()
        if (valid) {
            trackingReportStore.targetTotalPage = 1
            await trackingReportStore.getTotal()
            await trackingReportStore.getTrackingItemCountByDate()
            targetTotalItems.value = trackingReportStore.currentTotalPage?.items
        }
    }
}

const { pending, error, refresh } = await useAsyncData("total", () =>
    trackingReportStore.getTotal()
);
const targetTitle = ref("")
onMounted(() => {
    authStore.getAgents()
    warehouseStore.getAllWarehouses()
    trackingReportStore.getTrackingItemCountByDate()
})

let targetTotalItems = ref(trackingReportStore.currentTotalPage?.items)

const resetQuery = async () => {
    trackingReportStore.fromDateInput = dayjs().subtract(7, 'day').format("YYYY-MM-DD")
    trackingReportStore.toDateInput = dayjs().format("YYYY-MM-DD")
    trackingReportStore.agentIDsInput = null
    trackingReportStore.warehouseIDsInput = null
    trackingReportStore.targetTrackingPage = 1
    await trackingReportStore.getTotal()
    await trackingReportStore.getTrackingItemCountByDate()
    targetTotalItems.value = trackingReportStore.currentTotalPage?.items
}
const targetTrackingFromDate = ref("")
const targetTrackingToDate = ref<string | undefined>(undefined)
const targetSearchType = ref(SearchType.total)

const onGetTracking = async (searchType: SearchType, targetFromDate?: string, targetToDate?: string) => {
    trackingReportStore.addedTrackingNumbers = []
    trackingReportStore.targetTrackingPage = 1
    if (!R.isNil(targetFromDate)) {
        targetTrackingFromDate.value = targetFromDate
    }
    targetTrackingToDate.value = targetToDate

    showTrackingList.value = true
    targetSearchType.value = searchType
    switch (searchType) {
        case SearchType.total:
            targetTitle.value = "Danh sách toàn bộ tracking"
            break;
        case SearchType.unflyingBack:
            targetTitle.value = "Danh sách tracking chưa về VN"
            break;
        case SearchType.flyingBack:
            targetTitle.value = "Danh sách tracking đã về VN"
            break;
        case SearchType.files:
            targetTitle.value = "Danh sách tracking có ảnh"
            break;
        default:
            break;
    }
    showBottomSheet.value = true
}

const showTrackingList = ref(false)

watch(() => targetPer.value, async (newValue) => {
    if (newValue) {
        trackingReportStore.targetTrackingPage = 1
        trackingReportStore.targetTrackingPer = newValue
        await trackingReportStore.getTracking(targetSearchType.value, targetTrackingFromDate.value)
    }
})

watch([() => trackingReportStore.targetTotalPage, () => trackingReportStore.targetTotalPer], async ([newPage, newPer]) => {
    trackingReportStore.targetTotalPage = newPage || 1
    trackingReportStore.targetTotalPer = newPer || 25

    await trackingReportStore.getTotal()
})
onBeforeRouteLeave(() => {
    trackingReportStore.$reset()
})
</script>