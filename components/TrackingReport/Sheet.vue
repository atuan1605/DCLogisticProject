<template>
    <v-bottom-sheet v-model="modal">
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
            <v-card-title class="text-primary text-h5">{{ props.title }} - Ngày nhập kho:
                <span v-if="R.isNil(props.toDateTitle)">{{
                    dayjs(props.fromDateTitle).format('DD/MM/YYYY') }}</span>
                <span v-else>{{
                    dayjs(props.fromDateTitle).format('DD/MM/YYYY') }} - {{
                    dayjs(props.toDateTitle).format('DD/MM/YYYY') }} </span>
            </v-card-title>
            <v-table class="tw-mt-4" fixed-header :height="'calc(100vh - 450px)'">
                <thead>
                    <tr class="tw-border-b tw-border-black tw-border-solid">
                        <th class="tw-py-3 tw-text-left">STT</th>
                        <th class="tw-py-3">Tracking</th>
                        <th class="tw-py-3">Mã khách hàng</th>
                        <th class="tw-py-3">Ngày nhập hàng</th>
                        <th class="tw-py-3">Ngày về VN</th>
                        <th class="tw-py-3 text-center">Ảnh</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="trackingReportStore.isSearchingTracking">
                        <Spinner color="tw-fill-primary"
                            :class="['tw-opacity-1', 'tw-absolute tw-inset-2/4 tw-color-primary']" />
                    </tr>
                    <tr v-else-if="R.isEmpty(trackingItems)">
                        <td colspan="5" class="tw-py-8 tw-text-center">
                            No data.
                        </td>
                    </tr>

                    <template v-else>
                        <tr class="tw-hover:bg-accent/25" v-for="(item, index) in trackingItems || []" :key="item.id">
                            <td width="50"> {{ ((trackingReportStore.trackingPage || 1) - 1) *
                                (trackingReportStore.trackingPer || 1) + (index + 1) }}
                            </td>
                            <td class="tw-py-3"> {{ item.trackingNumber }}
                                <span v-if="item.information != 'default' && !R.isNil(item.information)">
                                    ({{ item.information }})</span>
                            </td>
                            <td class="tw-py-3"
                                v-text="item.customers || 'Không xác định'">
                            </td>
                            <td class="tw-py-3 "
                                v-text="dayjs.utc(item.receivedAtUSAt).format('DD-MM-YYYY HH:mm:ss') || 'Không xác định'">

                            </td>
                            <td class=" tw-py-3">
                                <template v-if="!R.isNil(item.flyingBackAt)">
                                    {{ dayjs.utc(item.flyingBackAt).format('DD-MM-YYYY HH:mm:ss') }}
                                </template>
                                <template v-else>
                                    Không có
                                </template>
                            </td>
                            <td class="tw-py-3 tw-text-center">
                                <template v-if="!R.isEmpty(item.files) && !R.isNil(item.files)">
                                    <img @click="showImage(item)" style="height:35px"
                                        class="tw-my-2 tw-cursor-pointer tw-w-full tw-h-full tw-object-contain"
                                        :src="trackingImageSrc(item.files[0])" />
                                </template>
                                <template v-else>
                                    Không có
                                </template>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>
            <v-row class="mt-2">
                <v-spacer />
                <v-col cols="4" class="tw-flex tw-justify-end">
                    <v-pagination v-model="trackingReportStore.targetTrackingPage"
                        :length="trackingReportStore.totalNumberOfTrackingPage?.toString()" :total-visible="7"
                        :disabled="trackingReportStore.isSearchingTracking"></v-pagination>
                </v-col>
                <v-col cols="1">
                    <v-select :items="perOptions" v-model="trackingReportStore.targetTrackingPer" hide-details />
                </v-col>
            </v-row>

        </v-card>
    </v-bottom-sheet>
    <v-dialog v-model="isShowImage" max-width="700">
        <v-carousel height="900" hide-delimiters show-arrows="hover" v-model="currentImageIndex">
            <v-carousel-item v-for="(image, index) in currentImages" :key="index">
                <v-img aspect-ratio="1080/1920" :src="trackingImageSrc(image)" contain></v-img>
            </v-carousel-item>
        </v-carousel>
    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"
import { SearchType, TrackingItemPieceReportOutput } from '~~/composables/useAPIs/trackingReports';

export interface Props {
    modelValue: boolean
    title: string
    fromDateTitle: string
    toDateTitle?: string
    searchType: SearchType
}
const trackingReportStore = useTrackingReport()

const props = withDefaults(defineProps<Props>(), {
    modelValue: false
})
const emit = defineEmits(['update:modelValue'])
const modal = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})
const perOptions = ref([10, 25, 50, 100])
const trackingItems = computed(() => {
    if (R.isNil(trackingReportStore.currentTrackingPage)) { return [] }
    return trackingReportStore.currentTrackingPage.items
})
watch([() => props.searchType, () => props.fromDateTitle], async (hasChanges) => {
    if (!hasChanges) {
        return
    }
    await trackingReportStore.getTracking(props.searchType, props.fromDateTitle, props.toDateTitle)
})
const config = useRuntimeConfig()
const trackingImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}

watch(() => trackingReportStore.targetTrackingPer, async (newValue) => {
    if (newValue) {
        trackingReportStore.targetTrackingPage = 1
        trackingReportStore.targetTrackingPer = newValue
        await trackingReportStore.getTracking(props.searchType, props.fromDateTitle, props.toDateTitle)
    }
})
watch(() => trackingReportStore.targetTrackingPage, async (newValue) => {
    if (newValue) {
        trackingReportStore.targetTrackingPage = newValue
        await trackingReportStore.getTracking(props.searchType, props.fromDateTitle, props.toDateTitle)
    }
})
const currentImageIndex = ref(0)
const currentImages = ref<string[]>([])
const isShowImage = ref(false)
const showImage = (item: TrackingItemPieceReportOutput) => {
    if (R.isNil(item.files)) { return }
    currentImages.value = item.files
    currentImageIndex.value = 0
    isShowImage.value = true;
};
</script>