<template>
    <div class="tw-flex tw-flex-col tw-p-4">
        <v-card-item title="Tìm kiếm tracking">
            <v-row class="tw-flex tw-flex-row tw-justify-center tw-items-center">
                <v-col cols="12" md="10" class="tw-flex tw-items-center tw-mt-3">
                    <div class=" tw-bg-white tw-border-black tw-border-2 tw-min-h-12 tw-h-auto tw-w-full  tw-rounded-xl tw-flex
                            tw-items-center tw-justify-between tw-px-4 tw-gap-x-4 tw-py-2 tw-max-w-full">
                        <MagnifyingGlassIcon class="tw-w-6 tw-h-6  tw-shrink-0" />
                        <label for="searchingTrackings"
                            :class="['tw-h-full tw-flex tw-flex-wrap tw-items-center tw-grow bg-transparent  tw-gap-x-3 tw-gap-y-3', inputMaxWidth]"
                            @click.self="onClickSearchBG" :style="inputMaxWidthStyle">
                            <div v-for="(trackingNumber, index) in trackingReportStore.addedTrackingNumbers"
                                :key="index"
                                class="tw-h-8 tw-flex tw-items-center tw-justify-center tw-bg-slate-400 tw-pl-3 tw-pr-1 tw-rounded-full tw-gap-x-2 tw-max-w-full">
                                <p class="tw-max-w-full tw-overflow-hidden tw-text-ellipsis"
                                    :style="{ direction: 'rtl' }">
                                    {{
                                    trackingNumber }}</p>
                                <button @click="trackingReportStore.removeInput(trackingNumber)">
                                    <XCircleIcon class="tw-w-6 tw-h-6 tw-text-white" />
                                </button>
                            </div>
                            <input ref="searchInput"
                                class="tw-grow tw-h-8 tw-w-full tw-bg-transparent tw-text-black tw-text-center tw-font-primary"
                                placeholder="Điền mã tracking (điền nhiều mã bằng dấu cách)"
                                v-model="trackingReportStore.searchInputString"
                                @keyup.enter="trackingReportStore.applySearchInputString" />
                        </label>
                        <button class="tw-shrink-0" v-if="trackingReportStore.hasAddedTrackingNumbers"
                            @click="trackingReportStore.clearInputs">
                            <XCircleIcon class="tw-w-6 tw-h-6 tw-text-white" />
                        </button>
                    </div>
                </v-col>
                <v-col cols="12" md="2" class="tw-mt-3 tw-flex tw-items-center tw-justify-center ">

                    <v-btn variant="elevated" :disabled="!trackingReportStore.hasAddedTrackingNumbers" color="primary"
                        class="tw-w-1/2 tw-h-full tw-flex" type="submit" @click="onSearchTracking"
                        :loading="trackingReportStore.isSearching">Tìm
                        kiếm</v-btn>
                </v-col>
            </v-row>
        </v-card-item>

        <template v-if="trackingReportStore.isSearchingTracking">
            <Spinner color="tw-fill-primary" :class="['tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-m-auto']" />
        </template>
        <template v-else-if="R.isEmpty(trackingItems) || R.isNil(trackingItems)">
            <div class="tw-py-8 tw-text-center tw-w-full">
                No data.
            </div>
        </template>
        <template v-else>
            <v-container fluid class="tw-mt-5 tw-border-t-2 ">
                <template v-for=" (item, index) in trackingItems" :key=" item.id ">
                    <v-row class="tw-border-b tw-w-full">
                        <v-col cols="12" md="2" class="tw-flex tw-flex-col tw-justify-center tw-items-center">
                            <div
                                class="tw-flex tw-shrink-0 tw-w-10 tw-h-10 tw-bg-black tw-rounded-full tw-items-center tw-justify-center">
                                <p class="tw-font-primary tw-font-medium tw-text-lg tw-text-white">{{ index
                                    + 1
                                    }}
                                </p>
                            </div>
                        </v-col>
                        <v-col cols="12" md="2"
                            class="tw-flex tw-flex-col tw-text-lg tw-justify-center tw-items-center">
                            <div>{{ item.trackingNumber }} <span
                                    v-if="item.information != 'default' && !R.isNil(item.information)">
                                    ({{ item.information }})</span></div>
                        </v-col>
                        <v-col cols="12" md="2" class="tw-flex tw-flex-col tw-justify-center tw-items-center">
                            <template v-if="!R.isEmpty(item.files) && !R.isNil(item.files)">
                                <img @click="showImage(item)" style="height:100px"
                                    class="tw-cursor-pointer tw-w-full tw-h-full tw-object-contain tw-mb-2"
                                    :src="trackingImageSrc(item.files[0])" />
                            </template>
                            <template v-else>
                                <div style="height:100px" class="tw-flex tw-items-center">Không có ảnh</div>
                            </template>
                        </v-col>
                        <v-col cols="12" md="2" class="tw-flex tw-flex-col tw-justify-center tw-p-6 pa-0">
                            <div class="tw-flex tw-flex-col tw-justify-center">
                                <div class=" tw-flex tw-flex-col tw-gap-2 tw-items-center tw-justify-between tw-w-full">
                                    <template v-if="!R.isNil(item.receivedAtUSAt)">
                                        <p class="tw-font-primary tw-text-lg tw-h-6 tw-text-red-600">{{
                                            dayjs.utc(item.receivedAtUSAt).format('DD-MM-YYYY') }}</p>
                                    </template>
                                    <template v-else>
                                        <p class="tw-font-primary tw-text-lg tw-h-6"></p>
                                    </template>
                                    <div class=" tw-flex tw-flex-row tw-w-full">
                                        <div class="tw-flex tw-flex-1 "></div>
                                        <div :class="[!R.isNil(item.receivedAtUSAt) ? 'tw-bg-red-600' : 'tw-bg-gray-300']"
                                            class=" tw-w-14 tw-h-14 tw-flex tw-items-center tw-justify-center tw-rounded-full">
                                            <v-icon
                                                :color="[!R.isNil(item.receivedAtUSAt) ? 'white' : '']">mdi-package-variant</v-icon>
                                        </div>
                                        <template v-if="!R.isNil(item.flyingBackAt) && !R.isNil(item.receivedAtUSAt)">
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                                        </template>

                                    </div>
                                    <p :class="[!R.isNil(item.receivedAtUSAt) ? 'tw-text-red-600' : '']"
                                        class="tw-font-primary tw-text-lg tw-overflow-visible tw-w-full tw-text-center ">
                                        Kho US
                                    </p>
                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="2" class="tw-flex tw-flex-col tw-justify-center pa-0">
                            <div class="tw-flex tw-flex-col tw-justify-center">
                                <div class=" tw-flex tw-flex-col tw-gap-2 tw-justify-between tw-items-center tw-w-full">
                                    <template v-if="!R.isNil(item.flyingBackAt)">
                                        <p class="tw-font-primary tw-text-lg tw-h-6 tw-text-red-600">{{
                                            dayjs.utc(item.flyingBackAt).format('DD-MM-YYYY') }}</p>
                                    </template>
                                    <template v-else>
                                        <p class="tw-font-primary tw-text-lg tw-h-6"></p>
                                    </template>
                                    <div class="tw-flex tw-flex-row tw-w-full">
                                        <template v-if="!R.isNil(item.flyingBackAt) && !R.isNil(item.receivedAtUSAt)">
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                                        </template>
                                        <div :class="[!R.isNil(item.flyingBackAt) ? 'tw-bg-red-600' : 'tw-bg-gray-300']"
                                            class=" tw-w-14 tw-h-14 tw-flex tw-items-center tw-justify-center tw-rounded-full">
                                            <v-icon
                                                :color="[!R.isNil(item.flyingBackAt) ? 'white' : '']">mdi-airplane</v-icon>
                                        </div>
                                        <template v-if="!R.isNil(item.receivedAtVNAt) && !R.isNil(item.flyingBackAt)">
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                                        </template>
                                    </div>
                                    <p :class="[!R.isNil(item.flyingBackAt) ? 'tw-text-red-600' : '']"
                                        class="tw-font-primary tw-text-lg tw-overflow-visible tw-w-full tw-text-center ">
                                        On the way
                                    </p>

                                </div>
                            </div>
                        </v-col>
                        <v-col cols="12" md="2" class="tw-flex tw-flex-col tw-justify-center pa-0">
                            <div class="tw-flex tw-flex-col tw-justify-center">
                                <div class=" tw-flex tw-flex-col tw-gap-2 tw-justify-between tw-items-center tw-w-full">
                                    <template v-if="!R.isNil(item.receivedAtVNAt)">
                                        <p class="tw-font-primary tw-text-lg tw-h-6 tw-text-red-600">{{
                                            dayjs.utc(item.receivedAtVNAt).format('DD-MM-YYYY') }}</p>
                                    </template>
                                    <template v-else>
                                        <p class="tw-font-primary tw-text-lg tw-h-6"></p>
                                    </template>
                                    <div class="tw-flex tw-flex-row tw-w-full">
                                        <template v-if="!R.isNil(item.receivedAtVNAt) && !R.isNil(item.flyingBackAt)">
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-border-red-600 tw-h-1/2">
                                            </div>
                                        </template>
                                        <template v-else>
                                            <div class="tw-flex tw-flex-1 tw-border-b-2 tw-h-1/2"></div>
                                        </template>
                                        <div :class="[!R.isNil(item.receivedAtVNAt) ? 'tw-bg-red-600' : 'tw-bg-gray-300']"
                                            class=" tw-w-14 tw-h-14 tw-flex tw-items-center tw-justify-center tw-rounded-full">
                                            <v-icon
                                                :color="[!R.isNil(item.receivedAtVNAt) ? 'white' : '']">mdi-package-variant</v-icon>
                                        </div>
                                        <div class="tw-flex tw-flex-1 "></div>
                                    </div>
                                    <p :class="[!R.isNil(item.receivedAtVNAt) ? 'tw-text-red-600' : '']"
                                        class="tw-font-primary tw-text-lg tw-overflow-visible tw-w-full tw-text-center ">
                                        Kho VN
                                    </p>

                                </div>
                            </div>
                        </v-col>

                    </v-row>
                </template>
            </v-container>
            <div class="tw-flex tw-flex-row tw-items-center tw-justify-center  tw-space-x-4 tw-mt-4 tw-m-4"
                v-if="trackingReportStore.currentTrackingPage && (trackingReportStore.totalNumberOfTrackingPage || 0) >= 1">
                <div class="tw-flex tw-flex-1 tw-items-center tw-justify-center tw-gap-2">
                    <button @click="setPage(trackingReportStore.trackingPage - 1)" class="tw-bg-white tw-rounded-xl"
                        v-if="!trackingReportStore.isSearchingTracking && trackingReportStore.canGoPrevTrackingPage">
                        <v-icon>mdi-chevron-left-circle-outline</v-icon>
                    </button>

                    <div class="tw-p-2 tw-border-2 tw-border-black tw-bg-white tw-border-solid tw-rounded-lg">
                        Trang {{ trackingReportStore.trackingPage }} / {{
                        trackingReportStore.totalNumberOfTrackingPage
                        }}
                    </div>
                    <button @click="setPage(trackingReportStore.trackingPage + 1)" class="tw-bg-white tw-rounded-xl"
                        v-if="!trackingReportStore.isSearchingTracking && trackingReportStore.canGoNextTrackingPage">
                        <v-icon>mdi-chevron-right-circle-outline</v-icon>
                    </button>
                    <div class="tw-bg-white"><v-select :items="perOptions" v-model="targetPer" hide-details />
                    </div>
                </div>
            </div>
        </template>
        <v-dialog v-model="isShowImage" max-width="700">
            <v-carousel height="900" hide-delimiters show-arrows="hover" v-model="currentImageIndex">
                <v-carousel-item v-for="(image, index) in currentImages" :key="index">
                    <v-img aspect-ratio="1080/1920" :src="trackingImageSrc(image)" contain></v-img>
                </v-carousel-item>
            </v-carousel>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"
import { SearchType, TrackingItemPieceReportOutput } from '~~/composables/useAPIs/trackingReports';
import { MagnifyingGlassIcon, XCircleIcon } from '@heroicons/vue/24/solid'

const trackingReportStore = useTrackingReport()
const searchInput = ref(null)

const config = useRuntimeConfig()
const panel = ref([0, 1])
const perOptions = ref([25, 50, 100, 200])
const trackingImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}
const inputMaxWidth = computed(() => {
    if (trackingReportStore.hasAddedTrackingNumbers) {
        return 'max-w-[calc(100% - 72px)]'
    }

    return 'max-w-[calc(100% - 48px)]'
})
const resultDiv = ref(null)
const inputMaxWidthStyle = computed(() => {
    if (trackingReportStore.hasAddedTrackingNumbers) {
        return {
            maxWidth: 'calc(100% - 72px)'
        }
    }

    return {
        maxWidth: 'calc(100% - 48px)'
    }
})

const setPage = async (page: number) => {
    trackingReportStore.targetTrackingPage = page
    await trackingReportStore.getTracking()
}
const trackingItems = computed(() => {
    if (R.isNil(trackingReportStore.currentTrackingPage)) { return [] }
    return trackingReportStore.currentTrackingPage.items
})
const onSearchTracking = async () => {
    trackingReportStore.targetTrackingPage = 1
    trackingReportStore.targetSearchType = null
    trackingReportStore.agentIDInput = null
    trackingReportStore.warehouseIDInput = null
    trackingReportStore.targetDate = null
    await trackingReportStore.getTracking().then(() => {
        if (R.isNil(resultDiv.value)) {
            return
        }
        resultDiv.value.$el.scrollIntoView({ behavior: 'smooth' })
    })
}

const onClickSearchBG = () => {
    if (R.isNil(searchInput.value)) {
        return
    }
    searchInput.value.focus()
}
const targetPer = ref(100)
watch(() => targetPer.value, async (newValue) => {
    if (newValue) {
        trackingReportStore.targetTrackingPage = 1
        trackingReportStore.targetTrackingPer = newValue
        await trackingReportStore.getTracking()
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