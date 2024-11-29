<template>
    <v-card variant="flat" class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
        <v-card-item>
            <v-row>
                <v-col cols="12" md="12">
                    <v-form @submit.prevent="onSearch" @keyup.enter="onSearch" ref="form">
                        <CustomerSearchInput v-model="customerIDs" />
                        <v-btn :loading="customerStore.isLoading" type="submit" block color="accent">Search</v-btn>
                    </v-form>
                </v-col>
            </v-row>
        </v-card-item>
    </v-card>
    <v-card :loading="customerStore.isLoading">
        <v-card-text>
            <v-table fixed-header :height="'calc(100vh - 450px)'">
                <thead>
                    <tr class="text-left">
                        <th>
                            STT
                        </th>
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
                            Trạng thái
                        </th>
                        <th>
                            Ngày tạo
                        </th>
                        <th>
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="R.isEmpty(customerStore.trackingItemsByCustomer?.items || []) && !customerStore.isLoading">
                        <td colspan="6" class="tw-py-8 tw-text-center"> No data.</td>
                    </tr>
                    <template v-else>
                        <tr v-for="(item, index) in customerStore.trackingItemsByCustomer?.items">
                            <td width="50">{{ ((queryInput.page || 1) - 1) * (queryInput.per || 1) + (index + 1) }}</td>

                            <td>
                                <v-img class="tw-w-full tw-h-full tw-object-contain tw-hover:bg-accent/25 tw-cursor-pointer"
                                    :width="50" aspect-ratio="1080/1920" :src="getImagePath(item)"
                                    @click="showImage(item)" />
                            </td>
                            <td>{{ item.trackingNumber }}</td>
                            <td>{{
                                R.compose(
                                    R.join(', '),
                                    R.pluck('customerCode')
                                )(item.customers || []) }}</td>
                            <td>{{ item.status }}</td>
                            <td>{{ $formatUTCToLocalTime(item.receivedAtUSAt) }}</td>
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
                        :disabled="customerStore.isLoading"></v-pagination>
                </v-col>
                <v-col cols="1">
                    <v-select :items="perOptions" v-model="queryInput.per" hide-details />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
    <v-dialog v-model="isShowImage" max-width="700">
        <v-carousel height="900" hide-delimiters show-arrows="hover" v-model="currentImageIndex">
            <v-carousel-item v-for="(image, index) in currentImages" :key="index">
                <v-img aspect-ratio="1080/1920" :src="image" contain></v-img>
            </v-carousel-item>
        </v-carousel>
    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { GetTrackingItemsByCustomerQueryInput } from '~~/composables/useAPIs/customers';
import { TrackingItemOutput } from '~~/composables/useAPIs/trackings';

definePageMeta({
    middleware: ['authenticated']
})

const route = useRoute()
const customerStore = useCustomer()
const perOptions = ref([10, 20, 50, 100])

const getPageLength = (): string => {
    var value = Math.ceil((customerStore.trackingItemsByCustomer?.metadata.total || 0) / (customerStore.trackingItemsByCustomer?.metadata.per || 100))

    return (value == 0 ? 1 : value).toString()
}

const pageLength = ref<string>(getPageLength())
const customerID: string = route.query.customerID as string
const customerIDs = ref<string[]>(!R.isNil(customerID) ? [customerID] : [])
const queryInput = ref<GetTrackingItemsByCustomerQueryInput>({
    agentID: route.params.agentID as string,
    customerID: route.query.customerID as string,
    page: Number(route.query.page) || 1,
    per: Number(route.query.per) || 10,
})
const onSearch = async () => {
    await navigateTo({
        path: route.path,
        query: { customerID: customerIDs.value[0] }
    })
    await customerStore.getTrackingItemsByCustomers(queryInput.value, customerIDs.value[0])
}
console.log(customerID)
useAsyncData(() => customerStore.getTrackingItemsByCustomers(queryInput.value, customerID))

watch([() => queryInput.value.page, () => queryInput.value.per], async ([newPage, newPer]) => {
    await navigateTo({
        path: route.path,
        query: { ...route.query, page: newPage, per: newPer }
    })
    await customerStore.getTrackingItemsByCustomers(queryInput.value, R.or(R.prop(0, customerIDs.value), undefined))
})

watch(() => customerStore.isLoading, (newValue) => {
    if (!newValue) {
        pageLength.value = getPageLength()
    }
})
const currentImageIndex = ref(0)
const currentImages = computed(() => {
    const config = useRuntimeConfig();
    let items = customerStore.trackingItemsByCustomer?.items as TrackingItemOutput[];
    return items.flatMap(tracking => {
        return tracking.files?.map(file => {
            return `${config.public.apiBase}/files/DC/${file}`;
        })
    });
})

const goToDetail = (itemID: string) => {
    navigateTo({
        path: `/trackingItems/${itemID}`
    })

}
const isShowImage = ref(false)
const showImage = (item: TrackingItemOutput) => {
    console.log(customerStore.trackingItemsByCustomer?.items)
    console.log(currentImages.value)
    currentImageIndex.value = currentImages.value.findIndex(image => image === getImagePath(item))
    isShowImage.value = true;
};

const getImagePath = (tracking: TrackingItemOutput | undefined) => {
    let mainImage = R.path(['files', 0], tracking);
    if (R.isNil(mainImage)) {
        return undefined;
    }

    const config = useRuntimeConfig();
    return `${config.public.apiBase}/files/DC/${mainImage}`;
};
</script>