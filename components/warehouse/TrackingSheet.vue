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
            <v-data-table-server :height="'calc(100vh - 450px)'" :loading="props.isLoading" :headers="headers"
                :items="targetTrackingItems" item-value="id" class="elevation-1" v-model:items-per-page="targetPer"
                v-model:page="targetPage" :items-length="wareHouseStore.trackingItems?.metadata.total"
                @update:options="handleColumnClick">
                <template v-slot:item.no="{ item }">
                    {{ addIndex(item) }}
                </template>
                <template v-slot:item.receivedAtUSAt="{ item }">
                    {{ dayjs(item.receivedAtUSAt).format('DD/MM/YYYY HH:mm:ss') }}
                </template>
                <template v-slot:item.files="{ item }">
                    <template v-if="!R.isEmpty(item.files) && !R.isNil(item.files)">
                        <img @click="showImage(item)" style="height:35px"
                            class="tw-my-2 tw-cursor-pointer tw-w-full tw-h-full tw-object-contain"
                            :src="trackingImageSrc(item.files[0])" />
                    </template>
                    <template v-else>
                        Không có
                    </template>
                </template>
            </v-data-table-server>
        </v-card>
    </v-bottom-sheet>
    <v-dialog v-model="isShowImage" max-width="700">
        <v-card>
            <v-card-title class="text-primary tw-text-sm">STT: {{ currentIndexItem }} - Mã tracking: {{
                truncatedTrackingNumber }} - Tên sản phẩm: {{
                    currentProductName }} </v-card-title>
            <v-carousel height="900" hide-delimiters show-arrows="hover" v-model="currentImageIndex"
                class="image-container">
                <v-carousel-item v-for="(image, index) in currentImages" :key="index">
                    <v-img :lazy-src="defaultThumbnail" aspect-ratio="1080/1920" :src="trackingImageSrc(image)" contain>
                        <template v-slot:placeholder>
                            <div class="d-flex align-center justify-center fill-height">
                                <v-progress-circular color="grey-lighten-4" indeterminate></v-progress-circular>
                            </div>
                        </template></v-img>
                </v-carousel-item>
            </v-carousel>
        </v-card>

    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"
import defaultThumbnail from '~/assets/images/default-image.jpg'
import warehouses, { OrderType, SortedType, TrackingItemByWarehouseOutput } from '~~/composables/useAPIs/warehouses'
export interface Props {
    modelValue: boolean
    title: string
    fromDateTitle: string
    toDateTitle?: string
    isLoading: boolean
}
interface TrackingItem {
    index: number
    id: string
    trackingNumber: string
    customerCode: string
    receivedAtUSAt: string
    productName: string
    files: string[]
}
const wareHouseStore = useTotalTrackingByWarehouse()

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isLoading: false
})
const targetPage = ref(1)
const emit = defineEmits(['update:modelValue'])
const modal = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

const headers = [
    { title: 'STT', key: 'no' },
    { title: 'Tracking Number', key: 'trackingNumber' },
    { title: 'Ngày nhập kho', key: 'receivedAtUSAt' },
    { title: 'Mã khách hàng', key: 'customerCode' },
    { title: 'Sản phẩm', key: 'productName' },
    { title: 'Ảnh', key: 'files' }
]

const targetTrackingItems = computed(() => {
    const mapTrackingItems = (item: TrackingItemByWarehouseOutput): TrackingItem => ({
    index: 0,
    id: item.id,
    trackingNumber: item.trackingNumber,
    customerCode: item.customers || "Chưa xác định",
    productName: item.productName || "Chưa xác định",
    files: item.files || [],
    receivedAtUSAt: item.receivedAtUSAt || "Chưa xác định"
    })
    return R.map(mapTrackingItems, wareHouseStore.trackingItems?.items || [])
})
const currentImageIndex = ref(0)
const currentImages = computed(() => {
    return R.pipe(
        R.map(R.prop('files')),
        R.reject(R.isNil),
        R.flatten)(wareHouseStore.trackingItems?.items) as string[]
})
const isShowImage = ref(false)
const currentIndexItem = ref(1)
const showImage = (item: TrackingItemByWarehouseOutput) => {
    if (R.isNil(item.files)) { return }
    const index = currentImages.value.indexOf(item.files[0])
    currentImageIndex.value = index
    isShowImage.value = true;
};
const config = useRuntimeConfig()
const trackingImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}
const currentTrackingNumber = ref('')
const currentProductName = ref('')
const imageTrackingMap = computed(() => {
    const map = new Map<string, { index: number, trackingNumber: string, productName: string }>()
    wareHouseStore.trackingItems?.items.forEach(item => {
        if (item.files) {
            item.files.forEach(file => {
                map.set(file, { index: addIndex(item), trackingNumber: item.trackingNumber, productName: item.productName || 'Chưa xác định' })
            })
        }
    })
    return map
})
watch(currentImageIndex, (newIndex) => {
    const currentFile = currentImages.value[newIndex]
    const trackingInfo = imageTrackingMap.value.get(currentFile)
    if (trackingInfo) {
        currentTrackingNumber.value = trackingInfo.trackingNumber
        currentProductName.value = trackingInfo.productName
        currentIndexItem.value = trackingInfo.index
    }
})
const truncatedTrackingNumber = computed(() => {
    const trackingNumber = currentTrackingNumber.value
    if (trackingNumber.length > 10) {
        return '...' + trackingNumber.slice(-10)
    }
    return trackingNumber
})
const targetPer = ref(100)
const sortedType = ref<SortedType | undefined>(undefined)
const oderType = ref<OrderType | undefined>(undefined)
const handleColumnClick = async ({ sortBy }) => {
    if (sortBy[0].key === 'trackingNumber') {
        sortedType.value = SortedType.trackingNumber
    } else if (sortBy[0].key === 'receivedAtUSAt') {
        sortedType.value = SortedType.date
    } else if (sortBy[0].key === 'productName') {
        sortedType.value = SortedType.productName
    } else if (sortBy[0].key === 'customerCode') {
        sortedType.value = SortedType.customerCode
    } else {
        sortedType.value = undefined
    }

    if (sortBy[0].order === 'asc') {
        oderType.value = OrderType.asc
    } else if (sortBy[0].order === 'desc') {
        oderType.value = OrderType.desc
    } else {
        oderType.value = undefined
    }
    wareHouseStore.getItemsInput.sortedType = sortedType.value
    wareHouseStore.getItemsInput.orderType = oderType.value
    await wareHouseStore.getTrackingItems()
}
watch(() => targetPer.value, async (newPer) => {
    if (!R.isNil(newPer)) {
        wareHouseStore.getItemsInput.per = newPer
        await wareHouseStore.getTrackingItems()
    }
})
watch(() => targetPage.value, async (newPage) => {
    if (!R.isNil(newPage)) {
        wareHouseStore.getItemsInput.page = newPage
        await wareHouseStore.getTrackingItems()
    }
})

const addIndex = (item: TrackingItemByWarehouseOutput) => {
    const index = R.findIndex(R.propEq('id', item.id))(targetTrackingItems.value || [])
    if (index >= 0) {
        return ((targetPage.value || 1) - 1) * (targetPer.value || 1) +
            (index + 1)
    }
    return 0
}
</script>

<style scoped>
.image-container {
    overflow: auto;
}
</style>