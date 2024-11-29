<template>
    <v-sheet class="tw-p-4" color="transparent">
        <v-row>
            <v-col cols="12" md="12">
                <v-card class="mb-5">
                    <template #title>
                        <span class="tw-text-2xl tw-text-primary">Dách sách Dây có mã khách hàng khác nhau
                        </span>
                    </template>
                </v-card>
            </v-col>
        </v-row>

        <v-progress-linear v-if="pending" indeterminate />
        <v-table class="tw-table-fixed" :height="`calc(100vh - 160px)`" fixed-header fixed-footer>
            <thead>
                <tr>
                    <th class="!tw-w-[50px]">
                        STT
                    </th>
                    <th class="text-left">
                        Tracking Number
                    </th>
                    <th class="text-left">
                        Customers
                    </th>
                    <th class="text-left">
                        Actions
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="R.isEmpty(pageData?.items || [])">
                    <td colspan="4">Không có dữ liệu</td>
                </tr>
                <template v-else>
                    <template v-for="(row, index) in pageData?.items || []" :key="row.chain">
                        <tr>
                            <td colspan="4">
                                <div class="tw-flex tw-flex-row tw-items-center tw-gap-8">
                                    <v-btn size="x-small"
                                        :icon="R.includes(row.chain, expandedChains) ? 'mdi-chevron-down' : 'mdi-chevron-right'"
                                        @click="onToggleChain(row.chain)" />
                                    <p>Dây <b>{{ index + 1 }}</b> có ({{ R.length(R.split(", ", row.customerNames)) }})
                                        khách hàng:
                                        {{
                                            row.customerNames }} =>
                                        ({{
                                            R.length(row.items || []) }}) trackings
                                    </p>
                                </div>
                            </td>
                        </tr>
                        <template v-if="R.includes(row.chain, expandedChains)">
                            <tr v-for="(trackingItem, index) in row.items || []">
                                <td class="tw-text-center">{{ index + 1 }}</td>
                                <td>{{ trackingItem.trackingNumber }}</td>
                                <td>{{ R.compose(
                                    R.join(', '),
                                    R.pluck('customerCode')
                                )(trackingItem.customers || []) }}</td>
                                <td>
                                    <v-btn @click="onGoToTrackingItem(trackingItem)" size="x-small"
                                        icon="mdi-open-in-new"></v-btn>
                                </td>
                            </tr>
                        </template>
                    </template>

                </template>
            </tbody>
            <tfoot>
                <tr class="tw-bg-white">
                    <td colspan="4">
                        <v-pagination :length="totalPage" :model-value="page"
                            @update:modelValue="onChangePage"></v-pagination>

                    </td>
                </tr>
            </tfoot>
        </v-table>
    </v-sheet>
    <v-dialog v-model="isShowImage" max-width="800">
        <v-card>
            <v-img :src="trackingImageSrc(selectedImage)" contain></v-img>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { TrackingItemOutput } from '~~/composables/useAPIs/trackings'
const expandedChains = ref<string[]>([])

const apis = useAPIs()
const route = useRoute()

const page = computed(() => R.max(parseInt((route.query.page || "1") as string), 1))
const per = computed(() => R.max(parseInt((route.query.per || "50") as string), 50))

const { data: pageData, refresh, pending } = useAsyncData(() => apis.trackingItemsAPI.getLooseChains({
    page: page.value,
    per: per.value
}))

console.log('got', pageData)
const totalPage = computed(() => {
    const totalCount = pageData.value?.metadata.total || 0
    const per = R.max(pageData.value?.metadata.per || 1, 1)

    return Math.ceil(totalCount / per)
})

const onChangePage = async (page: number) => {
    await navigateTo({
        ...route,
        query: {
            ...route.query,
            page
        }
    })
    await refresh()
}

const onToggleChain = (chain: string) => {
    if (R.includes(chain, expandedChains.value)) {
        expandedChains.value = R.without([chain], expandedChains.value)
    } else {
        expandedChains.value = R.append(chain, expandedChains.value)
    }
}

const onGoToTrackingItem = (trackingItem: TrackingItemOutput) => {
    const id = trackingItem.id
    navigateTo({
        path: `/trackingItems/${id}`
    })
}
const config = useRuntimeConfig()
const trackingImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}
const selectedImage = ref("")
const isShowImage = ref(false)
const showImage = (image: string) => {
    selectedImage.value = image
    isShowImage.value = true
}
</script>