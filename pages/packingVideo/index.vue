<template>
    <div class="tw-flex tw-flex-col tw-p-4">
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
            <v-form @submit.prevent="onSearchTapped">
                <v-card-item>
                    <v-row>
                        <v-col cols="12" md="12">
                            <v-text-field label="Mã tracking" v-model="packingVideoStore.searchInput"
                                placeholder="Nhập mã tracking" />
                        </v-col>
                    </v-row>
                </v-card-item>
                <v-card-actions class="tw-justify-center tw-space-x-6">
                    <v-btn type="reset" @click="resetQuery" class="tw-w-[150px] tw-text-secondary" color="secondary"
                        variant="outlined" v-if="!packingVideoStore.isSearching">
                        Reset
                    </v-btn>

                    <v-btn variant="elevated" color="accent" class="tw-w-[150px]" type="submit"
                        :loading="packingVideoStore.isSearching">Lọc
                        kết
                        quả</v-btn>
                </v-card-actions>
            </v-form>

        </v-card>
        <template v-if="!R.isNil(packingVideoStore.packingVideoItem)">
            <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
                <v-table class="tw-max-h-[500px]" fixedHeader>
                    <thead>
                        <tr class="tw-border-black tw-border-solid">
                            <th class="tw-py-3">Mã Tracking</th>
                            <th class="tw-py-3">Mã Khách hàng</th>
                            <th class="tw-py-3">Kho</th>
                            <th class="tw-py-3 text-center">Ảnh</th>
                            <th class="tw-py-3 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="R.isNil(packingVideoStore.packingVideoItem)">
                            <td colspan="5" class="tw-py-8 tw-text-center">
                                No data.
                            </td>
                        </tr>
                        <template v-else>
                            <tr>
                                <td class="tw-py-3 tw-pl-4"
                                    v-text="packingVideoStore.packingVideoItem.trackingNumber" />
                                <td class="tw-py-3 tw-pl-4" v-text="packingVideoStore.packingVideoItem.customerCode" />
                                <td class="tw-py-3 tw-pl-4" v-text="packingVideoStore.packingVideoItem.warehouseName" />
                                <td class="tw-py-3 tw-pl-4 ">
                                    <img style="height:100px"
                                        class="tw-w-full tw-my-1  tw-h-full tw-object-contain tw-cursor-pointer"
                                        @click="showImage(packingVideoStore.packingVideoItem.file)"
                                        :src="imageSrc(packingVideoStore.packingVideoItem.file)" />
                                </td>
                                <td class="tw-py-3 tw-pl-4 tw-flex tw-justify-center tw-items-center tw-mt-4">
                                    <template
                                        v-if="packingVideoStore.packingVideoItem.downloadState == DownloadState.extractVideo">
                                        <v-btn variant="elevated" color="accent" class="tw-my-2 tw-w-[180px]"
                                            @click="extractVideo(packingVideoStore.packingVideoItem)">Trích
                                            Xuất
                                            Video</v-btn>
                                    </template>
                                    <template
                                        v-if="packingVideoStore.packingVideoItem.downloadState == DownloadState.extracting">
                                        <v-row align-content="center" class="fill-height" justify="center">
                                            <v-col class="text-subtitle-1 text-center" cols="12">
                                                Đang trích xuất video
                                            </v-col>
                                            <v-col cols="6">
                                                <v-progress-linear color="accent" height="6" indeterminate
                                                    rounded></v-progress-linear>
                                            </v-col>
                                        </v-row>
                                    </template>
                                    <template
                                        v-if="packingVideoStore.packingVideoItem.downloadState == DownloadState.fail">
                                        <v-btn variant="elevated" color="error" class="tw-my-2 tw-w-[180px]"
                                            @click="extractVideo(packingVideoStore.packingVideoItem)">Thử
                                            lại</v-btn>
                                    </template>
                                    <template
                                        v-if="packingVideoStore.packingVideoItem.downloadState == DownloadState.downloadVideo">
                                        <v-btn variant="elevated" color="success" class="tw-my-2 tw-w-[180px]"
                                            @click="saveVideo(packingVideoStore.packingVideoItem)"
                                            :loading="packingVideoStore.isSavingVideo">Tải
                                            Về</v-btn>
                                    </template>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </v-table>
            </v-card>
        </template>

        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4 tw-flex tw-flex-col"
            title="Danh sách tracking đang upload Video">
            <div class="tw-ml-4 tw-text-xs tw-text-red-500">Quá trình xử lý video sẽ mất từ 10 đến 15 phút</div>
            <v-card-text :class="['tw-relative', packingVideoStore.isLoadingJob ? 'card-content-height' : '']">
                <Spinner color="tw-fill-primary tw-mb-10"
                    :class="['tw-opacity-1', 'tw-inset-2/4 tw-color-primary tw-mx-auto']"
                    v-if="packingVideoStore.isLoadingJob" />
                <template v-else>
                    <v-table fixed-header :height="'calc(100vh - 500px)'">
                        <thead>
                            <tr class="tw-border-black tw-border-solid">
                                <th>STT</th>
                                <th class="tw-py-3">Mã Tracking</th>
                                <th class="tw-py-3">Mã Khách hàng</th>
                                <th class="tw-py-3">Kho</th>
                                <th class="tw-py-3 text-center">Ảnh</th>
                                <th class="tw-py-3 text-center">Thao tác</th>
                                <th class="tw-py-3">Xoá</th>
                            </tr>
                        </thead>
                        <tr v-if="R.isEmpty(packingVideoStore.currentPage?.items || [])">
                            <td colspan="5" class="tw-py-8 tw-text-center">
                                No data.
                            </td>
                        </tr>
                        <template v-else>
                            <tr v-for="(item, index) in packingVideoStore.currentPage?.items || []"
                                :key="item.trackingID">
                                <td class="tw-pl-4"> {{ ((packingVideoStore.page || 1) - 1) * (packingVideoStore.per ||
                                    1) +
                                    (index +
                                    1) }} </td>
                                <td class="tw-py-3 tw-pl-4">{{ item.trackingNumber }}</td>
                                <td class="tw-py-3 tw-pl-4">{{ item.customerCode }}</td>
                                <td class="tw-py-3 tw-pl-4">{{ item.warehouseName }}</td>
                                <td class="tw-py-3 tw-pl-4 ">
                                    <img style="height:100px"
                                        class="tw-w-full tw-my-1  tw-h-full tw-object-contain tw-cursor-pointer"
                                        @click="showImage(item.file)" :src="imageSrc(item.file)" />
                                </td>
                                <td class="tw-py-3 tw-pl-4 tw-flex tw-justify-center tw-mt-4">
                                    <template v-if="item.downloadState == DownloadState.extractVideo">
                                        <v-btn variant="elevated" color="accent" class="tw-mt-2 tw-w-[180px]"
                                            @click="extractVideo(item)">Trích Xuất
                                            Video</v-btn>
                                    </template>
                                    <template v-if="item.downloadState == DownloadState.extracting">
                                        <v-row align-content="center" class="fill-height" justify="center">
                                            <v-col class="text-subtitle-1 text-center" cols="12">
                                                Đang trích xuất video
                                            </v-col>
                                            <v-col cols="6">
                                                <v-progress-linear color="accent" height="6" indeterminate
                                                    rounded></v-progress-linear>
                                            </v-col>
                                        </v-row>
                                    </template>
                                    <template v-if="item.downloadState == DownloadState.fail">
                                        <v-btn variant="elevated" color="error" class="tw-mt-2 tw-w-[180px]"
                                            @click="extractVideo(item)">Thử
                                            lại</v-btn>
                                    </template>
                                    <template v-if="item.downloadState == DownloadState.downloadVideo">
                                        <v-btn variant="elevated" color="success" class="tw-mt-2 tw-w-[180px]"
                                            @click="saveVideo(item)" :loading="packingVideoStore.isSavingVideo">Tải
                                            Về</v-btn>
                                    </template>
                                </td>
                                <td>
                                    <v-btn class="tw-mb-6" :loading="packingVideoStore.isRemoving"
                                        :disabled="R.equals(item.downloadState, DownloadState.extracting)" color="error"
                                        @click="onDeleteVideo(item)"><v-icon>mdi-delete</v-icon></v-btn>
                                </td>
                            </tr>
                        </template>
                    </v-table>
                    <v-row class="mt-2">
                        <v-spacer />
                        <v-col cols="4" class="tw-flex tw-justify-end">
                            <v-pagination v-model="packingVideoStore.targetPage"
                                :length="packingVideoStore.totalNumberOfPage" :total-visible="7"
                                :disabled="packingVideoStore.isLoadingJob"></v-pagination>
                        </v-col>
                        <v-col cols="1">
                            <v-select :items="perOptions" v-model="packingVideoStore.targetPer" hide-details />
                        </v-col>
                    </v-row>
                </template>
            </v-card-text>
        </v-card>
        <v-dialog v-model="isShowImage" max-width="800">
            <v-card>
                <v-img :src="imageSrc(selectedImage)" contain></v-img>
            </v-card>
        </v-dialog>
        <ConfirmDialog :loading="packingVideoStore.isRemoving" :model-value="showDeleteVideo"
            :content="`Xác nhận xoá video khỏi danh sách`" @submit="submitDeleteVideo"
            @update:modelValue="value => showDeleteVideo = value" />
    </div>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { DownloadState, GetVideoDownloadingJobOutput } from '~~/composables/useAPIs/packingVideo';
import { usePackingVideo } from '~~/composables';
const packingVideoStore = usePackingVideo()
const route = useRoute()
const config = useRuntimeConfig()
const showDeleteVideo = ref(false)
const targetDeletedItem = ref<GetVideoDownloadingJobOutput | null>(null)
const submitDeleteVideo = () => {
    if (R.isNil(targetDeletedItem.value)) { return }
    packingVideoStore.deleteVideoFile(targetDeletedItem.value)
    targetDeletedItem.value = null
    showDeleteVideo.value = false
}
const onDeleteVideo = (item: GetVideoDownloadingJobOutput) => {
    if (R.isNil(item)) { return }
    targetDeletedItem.value = item
    showDeleteVideo.value = true
}
const onSearchTapped = async () => {
    if (packingVideoStore.isSearching) {
        return
    }
    await navigateTo({
        path: route.path,
        query: packingVideoStore.currentQuery
    })
    await packingVideoStore.search()
}
const resetQuery = async () => {
    if (packingVideoStore.isSearching) {
        return
    }
    await navigateTo({
        path: route.path,
        query: {}
    })
    await packingVideoStore.search()
}
const perOptions = ref([10, 50, 75, 100])
const extractVideo = async (item: GetVideoDownloadingJobOutput) => {
    if (R.isNil(item.trackingID)) { return }
    await packingVideoStore.extractVideo(item)
}

const saveVideo = (item: GetVideoDownloadingJobOutput) => {
    packingVideoStore.getVideoFile(item)
}

watch([() => packingVideoStore.targetPage, () => packingVideoStore.targetPer], async ([newPage, newPer]) => {
    packingVideoStore.targetPage = newPage
    packingVideoStore.targetPer = newPer
    await packingVideoStore.getVideoDownloadingJobs()
})

const imageSrc = (file?: string) => {
    if (R.isNil(file)) { return }
    return `${config.public.apiBase}/files/dc/${file}`
}

const isShowImage = ref(false)
const selectedImage = ref("")
const showImage = (image?: string) => {
    if (R.isNil(image)) { return }
    selectedImage.value = image
    isShowImage.value = true
}

let timeID: any = null
onMounted(() => {
    packingVideoStore.getVideoDownloadingJobs()
    timeID = setInterval(packingVideoStore.getVideoDownloadingJobs, 30000)
})

onBeforeRouteLeave(() => {
    clearInterval(timeID)
})
</script>