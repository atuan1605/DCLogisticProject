<template>
    <PageLoader v-if="pending" />
    <PageError v-else-if="error" :errorMessage="`${error}`" :reload="refresh" />
    <v-container fluid v-else>
        <v-row>
            <v-col cols="12" md="4">
                <div class="tw-flex tw-flex-col tw-space-y-4">
                    <v-card>
                        <v-img v-if="trackingStore.mainImage" class="tw-h-auto tw-w-100%"
                            :src="trackingStore.mainImagePath" />
                        <v-card-title>
                            <div class="tw-flex tw-flex-row tw-items-center tw-justify-between">
                                <v-row class="tw-flex tw-items-center mx-0 mt-1">
                                    <span>Chi tiết mã tracking</span>
                                    <v-chip :disabled="trackingStore.trackingItem?.isDeleted" class="ma-2"
                                        :color="R.isNil(trackingStore.trackingItem?.returnRequestAt) ? 'green' : 'red'"
                                        text-color="white" @click="onShowReturnRequestModal">
                                        {{ R.isNil(trackingStore.trackingItem?.returnRequestAt) ? 'Đóng hàng' :
                                        'Hold hàng' }}
                                    </v-chip>
                                    <v-chip v-if="trackingStore.trackingItem?.isDeleted" class="ma-2" color="red"> Hết
                                        hiệu lực </v-chip>
                                </v-row>
                                <img v-if="R.propOr(false, 'isWalmartTracking', trackingStore.trackingItem)"
                                    class="tw-h-[30px]" src="~~/assets/images/Walmart-Logo-PNG-Transparent.webp" />
                            </div>
                            <v-divider class="tw-my-3" />
                        </v-card-title>
                        <v-card-text>
                            <p>
                                <strong class="tw-mr-2">Tracking Number:</strong>
                                {{ trackingStore.trackingItem?.trackingNumber }}
                                {{ trackingStore.trackingItem?.alternativeRef ? `
                                (${trackingStore.trackingItem?.alternativeRef})` : '' }}
                            </p>
                            <p class="tw-flex tw-items-center">
                                <strong class="tw-mr-2">Status:</strong>
                            <div
                                :class="['tw-rounded-full tw-mr-2 tw-w-4 tw-h-4 tw-inline-block', trackingStore.trackingStatusBGClass]">
                            </div>
                            {{ trackingStore.displayedTrackingStatus }}
                            </p>
                            <p>
                                <strong class="tw-mr-2">Mã khách hàng:</strong>
                                {{ trackingStore.trackingItem?.customerCode || 'N/A' }}
                            </p>
                            <p
                                v-if="!R.isNil(trackingStore.trackingItem?.trackingItemReferences) && !R.isEmpty(trackingStore.trackingItem?.trackingItemReferences)">
                                <strong class="tw-mr-2">Tracking cùng label:</strong>
                                {{ trackingStore.trackingItem?.trackingItemReferences }}
                            </p>
                            <p>
                                <strong class="tw-mr-2">Mã đại lí:</strong>
                                {{ trackingStore.trackingItem?.agentCode || 'N/A' }}
                            </p>
                            <p>
                                <strong class="tw-mr-2">Kho:</strong>
                                {{ trackingStore.trackingItem?.warehouse?.name || 'N/A' }}
                            </p>
                            <p>
                                <strong class="tw-mr-2">Note:</strong>
                                {{ trackingStore.trackingItem?.itemDescription || 'N/A' }}
                            </p>
                            <p>
                                <strong class="tw-mr-2">Last updated at:</strong>
                                {{ $formatUTCToLocalTime(trackingStore.trackingItem?.updatedAt) }}
                            </p>
                            <p v-if="trackingStore.trackingItem?.boxName">
                            <p v-if="R.length(trackingStore.trackingItem?.boxName) > 0">
                                Thùng: <strong v-for="boxName in trackingStore.trackingItem?.boxName" :key="boxName">{{
                                    boxName }}</strong>
                            </p>
                            </p>
                            <p v-if="trackingStore.trackingItem?.lots">
                                Lô: <strong> {{ trackingStore.trackingItem.lots }}</strong>
                            </p>
                            <p v-if="trackingStore.trackingItem?.shipmentCode">
                            <p v-if="R.length(trackingStore.trackingItem?.shipmentCode) > 0">
                                Chuyến Bay: <strong v-for="shipment in trackingStore.trackingItem?.shipmentCode"
                                    :key="shipment">{{ shipment }}</strong>
                            </p>
                            </p>
                            <v-row class="tw-pt-4">
                                <v-col cols="12" md="6" v-if="!trackingStore.isDeleting">
                                    <v-btn @click="(isShowingEditModal = !isShowingEditModal)" block color="accent"
                                        :disabled="!R.isNil(trackingStore.trackingItem?.returnRequestAt) || trackingStore.trackingItem?.isDeleted">Chỉnh
                                        sửa</v-btn>
                                </v-col>
                                <v-col v-if="trackingStore.canDeleteTrackingItem" cols="12" md="6">
                                    <v-btn block color="error" variant="outlined" @click="showDeleteConfirmation = true"
                                        :loading="trackingStore.isDeleting">Xoá</v-btn>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                    <v-card>
                        <template #title>
                            Timeline
                            <v-divider class="my-3" />
                        </template>
                        <template #text>
                            <v-timeline side="end">
                                <v-timeline-item dot-color="receivedAtUSWarehouse" fill-dot size="x-small">
                                    <template v-slot:opposite>
                                        Nhận tại kho Mỹ (Delivery)
                                    </template>
                                    {{ trackingStore.trackingItem?.receivedAtUSAt ?
                                    $formatUTCToLocalTime(trackingStore.trackingItem?.receivedAtUSAt) : 'N/A'
                                    }}
                                </v-timeline-item>

                                <v-timeline-item dot-color="repacking" fill-dot size="x-small">
                                    <template v-slot:opposite>
                                        Đang repack
                                    </template>
                                    {{ trackingStore.trackingItem?.repackingAt ?
                                    $formatUTCToLocalTime(trackingStore.trackingItem?.repackingAt) : 'N/A'
                                    }}
                                </v-timeline-item>
                                <v-timeline-item dot-color="repacked" fill-dot size="x-small">
                                    <template v-slot:opposite>
                                        Đã repack
                                    </template>
                                    {{ trackingStore.trackingItem?.repackedAt ?
                                    $formatUTCToLocalTime(trackingStore.trackingItem?.repackedAt) : 'N/A'
                                    }}
                                </v-timeline-item>
                                <v-timeline-item dot-color="boxed" fill-dot size="x-small">
                                    <template v-slot:opposite>
                                        Đã đóng thùng
                                    </template>
                                    {{ trackingStore.trackingItem?.boxedAt ?
                                    $formatUTCToLocalTime(trackingStore.trackingItem?.boxedAt) : 'N/A'
                                    }}
                                </v-timeline-item>
                                <v-timeline-item dot-color="flyingBack" fill-dot size="x-small">
                                    <template v-slot:opposite>
                                        Đang bay về
                                    </template>
                                    {{ trackingStore.trackingItem?.flyingBackAt ?
                                    $formatUTCToLocalTime(trackingStore.trackingItem?.flyingBackAt) : 'N/A'
                                    }}
                                </v-timeline-item>
                            </v-timeline>
                        </template>
                    </v-card>
                </div>
            </v-col>
            <v-col cols="12" md="8">
                <div class="tw-flex tw-flex-col tw-space-y-4">
                    <v-card>
                        <template #title>
                            Danh sách sản phẩm gán với tracking
                            <v-divider class="tw-my-3 !tw-border-accent" />
                        </template>
                        <template #text>
                            <div v-if="R.isEmpty(trackingStore.products)"
                                class="tw-w-full tw-h-20 tw-flex tw-items-center tw-justify-center">
                                <p>Chưa có sản phẩm nào đc gán với tracking này</p>
                            </div>
                            <template v-else>
                                <ProductCard v-for="product in trackingStore.products" :key="product.id"
                                    :disable-item="trackingStore.trackingItem?.isDeleted || !R.isNil(trackingStore.trackingItem?.returnRequestAt)"
                                    :product="product"
                                    @submit="({ input }) => debouncedProductSave(product.id || '', input)"
                                    :is-loading="R.has(product.id || 'na', trackingStore.isProductsLoading)"
                                    @delete="trackingStore.deleteProduct(product.id || '')" 
                                    @delete-image="({ fileID }) => removeProductImage(product, fileID)"/>
                            </template>
                            <v-btn class="tw-mt-4" v-if="trackingStore.canAddProduct" color="accent" variant="elevated"
                                prependIcon="mdi-plus" @click="trackingStore.addProduct"
                                :disabled="!R.isNil(trackingStore.trackingItem?.returnRequestAt) || trackingStore.trackingItem?.isDeleted"
                                :loading="trackingStore.isAddingProduct">
                                Thêm sản phẩm
                            </v-btn>
                        </template>
                    </v-card>
                    <v-card>
                        <template #title>
                            <v-row>
                                <v-col>Danh sách mảnh của tracking</v-col>
                                <v-col class="text-right">
                                    <v-btn v-if="trackingStore.canCreatePiece" color="accent" variant="elevated"
                                        prependIcon="mdi-plus" @click="showDialogCreatePiece"
                                        :disabled="trackingStore.trackingItem?.isDeleted || !R.isNil(trackingStore.trackingItem?.deletedAt)">
                                        Thêm mảnh
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </template>
                        <template #text>
                            <div v-if="R.length(trackingStore.pieces) == 1"
                                class="tw-w-full tw-h-20 tw-flex tw-items-center tw-justify-center tw-text-xl">
                                <p>Tracking có duy nhất 1 mảnh</p>
                            </div>
                            <template v-else>
                                <v-table>
                                    <thead>
                                        <tr>
                                            <th class="text-left">Ngày tạo</th>
                                            <th class="text-left">Thông tin</th>
                                            <th class="text-left">Thùng</th>
                                            <th class="text-left">Lô</th>
                                            <th class="text-left">Chuyến</th>
                                            <th class="text-left">Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="piece in trackingStore.pieces" :key="piece.id">
                                            <td>{{ $formatUTCToLocalTime(piece.createdAt) }}</td>
                                            <td>{{ piece.information }}</td>
                                            <td>{{ piece.boxName }}</td>
                                            <td>{{ piece.lot }}</td>
                                            <td>{{ piece.shipment }}</td>
                                            <td>
                                                <v-btn class="ml-2" variant="outlined" size="small" icon color="default"
                                                    @click="onEditPiece(piece.id)">
                                                    <v-icon>mdi-pencil</v-icon>
                                                </v-btn>
                                                <v-btn class="ml-2" variant="outlined" size="small"
                                                    @click="trackingStore.deletePiece(piece.id)" icon color="primary"
                                                    v-if="trackingStore.canDeletePiece">
                                                    <v-icon>mdi-delete</v-icon>
                                                </v-btn>
                                            </td>
                                        </tr>
                                    </tbody>
                                </v-table>
                                <PieceEditModal v-model="isShowingEditPiece" :piece="piece" @submit="onUpdatePiece" />
                            </template>
                        </template>
                    </v-card>
                    <template v-if="trackingStore.itemsByAlternativeRef.length > 0">
                        <v-card>
                            <template #title>
                                <v-row>
                                    <v-col>Danh sách tracking có cùng mã thay thế</v-col>
                                </v-row>
                            </template>
                            <template #text>
                                <v-table>
                                    <thead>
                                        <tr>
                                            <th class="text-left">Mã tracking</th>
                                            <th class="text-left">Ngày tạo</th>
                                            <th class="text-left">Thùng</th>
                                            <th class="text-left">Lô</th>
                                            <th class="text-left">Chuyến</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="walmartItem in trackingStore.itemsByAlternativeRef"
                                            :key="walmartItem.id">
                                            <th class="tw-cursor-pointer" @click="navigateToTracking(walmartItem.id)">{{
                                                walmartItem.trackingNumber }} </th>
                                            <td>{{ $formatUTCToLocalTime(walmartItem.createdAt) }}</td>
                                            <th>{{ walmartItem.boxName }} </th>
                                            <th>{{ walmartItem.lots }} </th>
                                            <th>{{ walmartItem.shipmentCode }} </th>
                                        </tr>
                                    </tbody>
                                </v-table>
                            </template>
                        </v-card>
                    </template>
                    <v-card>
                        <template #title>
                            Lịch sử thay đổi Tracking Item
                            <v-divider class="tw-my-3" />
                        </template>
                        <template #text>
                            <TrackingItemTimeline :timeline-items="trackingStore.timeline || []" />
                        </template>
                    </v-card>
                </div>
            </v-col>
        </v-row>
        <TrackingItemEditModal v-model="isShowingEditModal" :trackingItem="trackingStore.trackingItem"
            @submit="onUpdateTrackingItem" :is-loading="trackingStore.isUpdating" />
        <PieceCreateDialog v-model="trackingStore.isShowCreatePieceDialog" @createPiece="trackingStore.createPiece" />
        <ConfirmDialog :loading="trackingStore.isLoading" :model-value="showConfirmActiveModal"
            :content="`${R.isNil(trackingStore.trackingItem?.returnRequestAt) ? 'Bạn có muốn chuyển sang trạng thái hold hàng?' : 'Bạn có muốn chuyển về trạng thái đóng hàng?'}`"
            @submit="submitReturnRequest" @update:modelValue="value => showConfirmActiveModal = value" />
        <InformDialog :content="'Tracking đã được đóng thùng'" :model-value="showInformTrackingBoxedModal"
            @update:modelValue="value => showInformTrackingBoxedModal = value" />
        <DeleteDialog :loading="trackingStore.isDeleting" v-model="showDeleteConfirmation"
            @delete="trackingStore.deleteTrackingItem" />
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { debounce } from 'lodash'
import { UpdateProductInput, UpdateTrackingItemInput, UpdateTrackingItemPieceInput, GetTrackingItemPieceOutput, ProductOutput } from '~~/composables/useAPIs/trackings';

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

const common = useCommon()
const trackingStore = useTracking()
const route = useRoute()
const trackingItemID: string = route.params.trackingItemID as string
var piece = ref<GetTrackingItemPieceOutput | undefined>(undefined)
const { pending, error, refresh } = await useAsyncData('trackingItem', () => trackingStore.loadTrackingItem(trackingItemID))

const isShowingEditModal = ref(false)
const showConfirmActiveModal = ref(false)
const showInformTrackingBoxedModal = ref(false)
const showDeleteConfirmation = ref(false)

const onUpdateTrackingItem = async (input: UpdateTrackingItemInput) => {
    await trackingStore.updateTrackingItem(input)
    isShowingEditModal.value = false
}

const onShowReturnRequestModal = () => {
    showConfirmActiveModal.value = true
}

const onUpdateProduct = async (productID: string, input: UpdateProductInput) => {
    await trackingStore.updateProduct(productID, input)
}

const debouncedProductSave = debounce(onUpdateProduct, 500);

onMounted(() => {
    trackingStore.getItemsByAlternativeRef(trackingItemID)
    return () => {
        debouncedProductSave.cancel()
    }

})

const removeProductImage = async (product: ProductOutput, targetFile: string) => {
    if (R.isNil(product.id)) { return } 
    const imagesInput = R.filter((file: string) => file !== targetFile, product.images as string[])
    await trackingStore.updateProduct(product.id, {images: imagesInput})

}
const showDialogCreatePiece = () => {
    trackingStore.isShowCreatePieceDialog = true
}
const isShowingEditPiece = ref(false)
const onEditPiece = (id: string) => {
    piece.value = R.find(R.propEq('id', id))(trackingStore.pieces) as (GetTrackingItemPieceOutput | undefined)
    console.log(piece.value)
    isShowingEditPiece.value = true
}

const onUpdatePiece = async (input: UpdateTrackingItemPieceInput) => {
    const pieceID = piece.value?.id
    if (!R.isNil(pieceID)) {
        await trackingStore.updatePiece(pieceID, input)
    }
    isShowingEditPiece.value = false
}

const submitReturnRequest = () => {
    onUpdateTrackingItem({ isReturnRequest: R.isNil(trackingStore.trackingItem?.returnRequestAt) })
    showConfirmActiveModal.value = false
}

const navigateToTracking = async (id: string) => {
    await navigateTo(`/trackingItems/${id}`)
}

</script>