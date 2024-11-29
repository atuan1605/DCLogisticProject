<template>
    <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
        <v-table fixed-header :height="'calc(100vh - 450px)'">
            <thead>
                <tr class="tw-border-b tw-border-black tw-border-solid">
                    <th class="tw-py-3 ">STT</th>
                    <th class="tw-py-3 ">Ngày tạo</th>
                    <th class="tw-py-3 ">Mã khách hàng</th>
                    <th class="tw-py-3 ">Tracking Number</th>
                    <th class="tw-py-3 ">Ảnh</th>
                    <th class="tw-py-3 ">Yêu cầu đặc biệt</th>
                    <th class="tw-py-3 ">Trạng thái</th>
                    <th v-if="R.equals(FilterStateInput.unprocessed, filterInput)" class="tw-py-3 ">Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="packingRequestStore.isLoading">
                    <td colspan="5" class="tw-py-8 text-center">
                        <v-progress-circular class="tw-mx-auto" indeterminate />
                    </td>

                </tr>
                <tr v-else-if="R.isEmpty(packingRequestStore.currentPage?.items || [])">
                    <td colspan="5" class="tw-py-8 tw-text-center">
                        No data.
                    </td>
                </tr>
                <template v-else>
                    <tr class="tw-hover:bg-accent/25"
                        v-for="(item, index) in packingRequestStore.currentPage?.items || []" :key="item.id">
                        <td width="50"> {{ ((packingRequestStore.page || 1) - 1) * (packingRequestStore.per || 1) +
                            (index + 1)
                            }}
                        </td>
                        <td>{{ dayjs(item.createdAt).format('DD/MM/YYYY') }}</td>
                        <td class="tw-py-3 tw-cursor-pointer" v-text="item.customerCodes || 'Chưa có'" />
                        <td class="tw-py-3 tw-cursor-pointer" v-text="item.trackingNumber || 'Chưa có'" />
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
                        <td class="tw-py-3 " v-text="item.packingRequest || 'Chưa xác định'" />
                        <template v-if="R.equals(FilterStateInput.unprocessed, filterInput)">
                            <td width="300">
                                <v-select class="tw-mt-4" v-model="item.packingRequestState" :items="states"
                                    item-title="title" item-value="value" placeholder="Chuyển trạng thái"></v-select>
                            </td>
                            <td>
                                <v-btn @click="updatePackingRequestSate(item)" :loading="packingRequestStore.isUpdating"
                                    color="primary">
                                    Cập nhật
                                </v-btn>
                            </td>
                        </template>
                        <template v-else>
                            <td class="tw-py-3 tw-font-bold tw-text-green-500">ĐÃ XỬ LÝ</td>
                        </template>
                    </tr>
                </template>

            </tbody>
        </v-table>
        <v-row class="mt-2">
            <v-spacer />
            <v-col cols="4" class="tw-flex tw-justify-end">
                <v-pagination v-model="packingRequestStore.targetPage"
                    :length="packingRequestStore.totalNumberOfPage?.toString()" :total-visible="7"
                    :disabled="packingRequestStore.isLoading"></v-pagination>
            </v-col>
            <v-col cols="1">
                <v-select :items="perOptions" v-model="packingRequestStore.targetPer" hide-details />
            </v-col>
        </v-row>
    </v-card>
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
import dayjs from 'dayjs';
import { FilterStateInput, GetPackingRequestOutput, PackingRequestState } from '~~/composables/useAPIs/packingRequest';

const packingRequestStore = usePackingRequest()

interface Props {
    filterInput: FilterStateInput
}
const props = withDefaults(defineProps<Props>(), {
})
const config = useRuntimeConfig()
const trackingImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}

const states = [
    { title: "Hold hàng", value: PackingRequestState.hold },
    { title: "Đã xử lý", value: PackingRequestState.processed }
]
const updatePackingRequestSate = (item: GetPackingRequestOutput) => {
    if (R.isNil(item.packingRequestState)) { return }
    packingRequestStore.updatePackingRequestState(item.id, item.packingRequestState)
}
const currentImageIndex = ref(0)
const currentImages = ref<string[]>([])
const isShowImage = ref(false)
const showImage = (item: GetPackingRequestOutput) => {
    if (R.isNil(item.files)) { return }
    currentImages.value = item.files
    currentImageIndex.value = 0
    isShowImage.value = true;
};
const perOptions = ref([100, 150, 200, 250])

watch([() => packingRequestStore.targetPage, () => packingRequestStore.targetPer], async ([newPage, newPer]) => {
    if (packingRequestStore.targetPage != newPage) {
        packingRequestStore.targetPage = newPage || 1
    }
    if (packingRequestStore.targetPer != newPer) {
        packingRequestStore.targetPer = newPer || 100
    }
    await packingRequestStore.getPackingRequestItems(props.filterInput)
})
</script>