<template>
    <v-card variant="flat" class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
        <v-card-item>
            <v-row>
                <v-col cols="12" md="6">
                    <v-select hide-details color="white" label="Khách hàng" v-model="queryInput.customerFeedback"
                        :items="feedbackOptions" item-title="title" item-value="value" />
                </v-col>
            </v-row>
        </v-card-item>
    </v-card>
    <v-card :loading="brokenProductStore.isLoading || brokenProductStore.isUpdating">
        <v-card-text>
            <v-table fixed-header :height="'calc(100vh - 420px)'">
                <thead>
                    <tr class="text-left">
                        <th>
                            Hình ảnh
                        </th>
                        <th>
                            Mã tracking
                        </th>
                        <th>
                            Mã khách hàng
                        </th>
                        <th>
                            Thông tin lỗi
                        </th>
                        <th>
                            Ngày báo lỗi
                        </th>
                        <th>
                            Cập nhật feedback
                        </th>
                        <th>
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="R.isEmpty(brokenProductStore.data?.items || []) && !brokenProductStore.isLoading">
                        <td colspan="6" class="tw-py-8 tw-text-center"> No data.</td>
                    </tr>
                    <template v-else>
                        <tr v-for="item in brokenProductStore.data?.items">
                            <td>
                                <v-img class="tw-w-full tw-h-full tw-object-contain tw-hover:bg-accent/25 tw-cursor-pointer"
                                    :width="50" aspect-ratio="1080/1920" :src="getImagePath(item)"
                                    @click="showImage(item)" />
                            </td>
                            <td>{{ item.trackingNumber }}</td>
                            <td>{{ item.customerCode }}</td>
                            <td>{{ item.brokenProduct.description }}</td>
                            <td>{{ dayjs(item.brokenProduct.flagAt).format('DD/MM/YYYY') }}</td>
                            <td>
                                <v-select hide-details color="white" label="Phản hồi"
                                    :model-value="item.brokenProduct.customerFeedback"
                                    @update:model-value="onUpdateTrackingItem(item.id, item.brokenProduct.description, $event)"
                                    :items="feedbackOptions" item-title="title" item-value="value"></v-select>
                            </td>
                            <td>
                                <v-btn icon size="x-small" color="accent" @click="goToDetail(item.id)">
                                    <v-icon size="small">mdi-eye</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>
            <v-row class="mt-2">
                <v-spacer />
                <v-col cols="4" class="tw-flex tw-justify-end">
                    <v-pagination v-model="queryInput.page" :length="pageLength" :total-visible="7"
                        :disabled="brokenProductStore.isLoading"></v-pagination>
                </v-col>
                <v-col cols="1">
                    <v-select :items="perOptions" v-model="queryInput.per" hide-details />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
    <v-dialog v-model="isShowImage" max-width="450">
        <v-card>
            <v-img aspect-ratio="1080/1920" :src="getImagePath(selectedRow)" contain></v-img>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { CustomerFeedback, GetBrokenProductQueryInput, TrackingItemOutput } from '~~/composables/useAPIs/trackings';
import * as R from 'ramda';
import dayjs from "dayjs";

definePageMeta({
    middleware: ['authenticated']
})

const route = useRoute()
const brokenProductStore = useBrokenProduct()

const perOptions = ref([20, 50, 100, 1000])
var feedbackOptions = [
    { title: 'Chưa liên hệ', value: CustomerFeedback.none },
    { title: 'Trả hàng', value: CustomerFeedback.returnProduct },
    { title: 'Tiếp tục đóng hàng', value: CustomerFeedback.continueDelivering },
]

const getPageLength = (): string => {
    var value = Math.floor((brokenProductStore.data?.metadata.total || 0) / (brokenProductStore.data?.metadata.per || 100))
    return (value == 0 ? 1 : value).toString()
}

const selectedRow = ref<TrackingItemOutput | undefined>(undefined)
const isShowImage = ref(false)

const pageLength = ref<string>(getPageLength())

const queryInput = ref<GetBrokenProductQueryInput>({
    agentID: route.params.agentID as string,
    customerFeedback: route.query.customerFeedback as CustomerFeedback || CustomerFeedback.none,
    page: Number(route.query.page) || 1,
    per: Number(route.query.per) || 100,
})
console.log(queryInput.value)
useAsyncData(() => brokenProductStore.getBrokenProducts(queryInput.value))

watch([() => queryInput.value.page, () => queryInput.value.per], async ([newPage, newPer]) => {
    await navigateTo({
        path: route.path,
        query: { ...route.query, page: newPage, per: newPer }
    })
    await brokenProductStore.getBrokenProducts(queryInput.value)
})

watch(() => brokenProductStore.isLoading, (newValue) => {
    if (!newValue) {
        pageLength.value = getPageLength()
    }
})

watch(() => queryInput.value.customerFeedback, async (newValue) => {
    await navigateTo({
        path: route.path,
        query: R.assoc('customerFeedback', newValue, route.query)
    })
    await brokenProductStore.getBrokenProducts(queryInput.value)
})

const goToDetail = (itemID: string) => {
    navigateTo({
        path: `/trackingItems/${itemID}`
    })

}

const onUpdateTrackingItem = (trackingId: string, description: string | undefined, customerFeedback: CustomerFeedback) => {
    brokenProductStore.updateTrackingItem(trackingId, description, customerFeedback)
}

const showImage = (item: TrackingItemOutput) => {
    selectedRow.value = item
    isShowImage.value = true
}

const getImagePath = (tracking: TrackingItemOutput | undefined) => {
    let mainImage = R.path(['files', 0], tracking)
    if (R.isNil(mainImage)) {
        return undefined
    }
    const config = useRuntimeConfig()
    return `${config.public.apiBase}/files/DC/${mainImage}`
}
</script>