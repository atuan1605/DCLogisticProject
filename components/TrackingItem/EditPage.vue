<template>
    <!-- <PageLoader v-if="pending" />
    <PageError v-else-if="error" :errorMessage="`${error}`" :reload="refresh" /> -->
    <v-container>
        <v-row dense class="tw-items-center">
            <v-col>
                <p class="tw-text-l tw-font-bold">Thông tin tracking</p>
            </v-col>
            <v-col cols="auto">
                <v-chip size="x-large" :class="[trackingStore.trackingStatusBGClass]">{{ trackingStore.trackingStatus
                }}</v-chip>
            </v-col>
        </v-row>
        <v-card :loading="trackingStore.isUpdating" class="px-1 py-1">
            <v-row>
                <v-col :cols="isImageEnlarged ? '6' : 'auto'">
                    <img @click="isImageEnlarged = !isImageEnlarged" v-if="trackingStore.mainImage"
                        :class="[isImageEnlarged ? 'tw-h-auto tw-w-full' : 'tw-h-[450px] tw-w-auto tw-aspect-auto']"
                        :src="trackingStore.mainImagePath" />
                </v-col>
                <v-col>
                    <v-form ref="form" @submit.prevent="onUserItemSubmission">
                        <v-text-field label="Mã tracking" appendInnerIcon="mdi-pencil" disabled
                            :model-value="trackingStore.trackingItem?.trackingNumber" />
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-select v-model="agentCode" label="Mã đại lí" :rules="[
                                    validators.required('Mã đại lí')
                                ]" :items="authStore.agents" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <CustomerSearchInput v-model="customerIDs" />
                            </v-col>
                        </v-row>
                        <p class="text-sm">Thông tin sản phẩm</p>
                        <div v-if="R.isEmpty(trackingStore.products)" class="w-full h-20 flex items-center justify-center">
                            <p v-if="!isLoadingChainItems && R.isEmpty(chainItems)"
                                class="tw-text-sm tw-font-light tw-text-center tw-my-4">
                                Chưa có sản phẩm nào đc gán với tracking này</p>
                        </div>
                        <template v-else>
                            <ProductCard class="tw-mt-3" v-for="product in trackingStore.products" :key="product.id"
                                :product="product"
                                @submit="({ input, byUser }) => onUserProductSubmission(product.id!, input, byUser)"
                                :is-loading="R.has(product.id || 'na', trackingStore.isProductsLoading)"
                                @submit-without-updating="$emit('formSubmit')"
                                @delete="trackingStore.deleteProduct(product.id || '')" />
                        </template>
                        <v-btn class="tw-mt-3" v-if="trackingStore.canAddProduct" color="accent" variant="elevated"
                            prependIcon="mdi-plus" @click="trackingStore.addProduct"
                            :loading="trackingStore.isAddingProduct">
                            Thêm sản phẩm
                        </v-btn>
                        <v-textarea class="tw-mt-4" label="Note" appendInnerIcon="mdi-pencil" v-model="itemDescription" />
                        <v-btn v-show="false" type="submit" class="tw-mt-3" color="accent" variant="elevated"
                            prependIcon="mdi-content-save">
                            Lưu
                        </v-btn>
                    </v-form>
                </v-col>
            </v-row>
        </v-card>


        <div class="tw-flex tw-flex-row tw-items-center tw-space-x-2">
            <v-progress-circular class="tw-h-4 tw-w-4" indeterminate v-if="isLoadingChainItems" />
            <p class="tw-text-l tw-mt-8 tw-font-bold">Danh sách dây đi kèm ({{ R.length(chainItems) }})</p>
        </div>
        <p v-if="!isLoadingChainItems && R.isEmpty(chainItems)" class="tw-text-sm tw-font-light tw-text-center tw-my-4">
            Không có dây
            đi kèm...</p>
        <v-list density="compact" v-else>
            <v-list-item v-for="item in chainItems">
                <template #prepend>
                    <v-icon
                        :color="R.equals(item.trackingNumber, trackingStore.trackingItem?.trackingNumber) ? 'primary' : ''"
                        icon="mdi-barcode-scan"></v-icon>
                </template>
                <v-list-item-title><span
                        :class="[R.equals(item.trackingNumber, trackingStore.trackingItem?.trackingNumber) ? 'text-primary' : '']">{{
                            item.trackingNumber }}</span></v-list-item-title>
            </v-list-item>
        </v-list>
        <p class="tw-text-l tw-mt-8 tw-font-bold">Lịch sử cập nhật</p>
        <TrackingItemTimelineTable class="tw-mt-4 tw-rounded-lg" :timeline-items="trackingStore.timeline || []" />
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components'
import { debounce } from 'lodash'
import { TrackingItemOutput, UpdateProductInput, UpdateTrackingItemInput } from '~~/composables/useAPIs/trackings';
import { emit } from 'process';
import { CustomerSuggestionsInput } from '~~/composables/useAPIs/customers';

const trackingStore = useTracking()
const apis = useAPIs()
const app = useApp()

const emits = defineEmits(['formSubmit'])

const authStore = useAuth()
useAsyncData(() => authStore.getAgents())

const validators = useValidators()

const isImageEnlarged = ref(false)
const customerIDs = ref(trackingStore.trackingItem?.customers?.map(x => x.id))
const agentCode = ref(trackingStore.trackingItem?.agentCode)
const itemDescription = ref(trackingStore.trackingItem?.itemDescription)

const form = ref<VForm | null>(null)

watch(() => trackingStore.trackingItem, async (newItem, oldItem) => {
    if (!R.equals(newItem?.id, oldItem?.id)) {
        isImageEnlarged.value = false
        customerIDs.value = newItem?.customers?.map(x => x.id)
        agentCode.value = newItem?.agentCode
        itemDescription.value = newItem?.itemDescription
        form.value?.resetValidation()
    }
})

const onUpdateTrackingItem = async (input: UpdateTrackingItemInput) => {
    if (form.value) {
        const { valid } = await form.value?.validate()
        if (valid) {
            console.log('calling update with input', input)
            await trackingStore.updateTrackingItem(input)
        }
    }
}
const debouncedTrackingItemSave = debounce(onUpdateTrackingItem, 500);

const onUpdateProduct = async (productID: string, input: UpdateProductInput) => {
    console.log('updating...', productID, input)
    await trackingStore.updateProduct(productID, input)
}
const debouncedProductSave = debounce(onUpdateProduct, 500);

onMounted(() => {
    return () => {
        debouncedTrackingItemSave.cancel()
        debouncedProductSave.cancel()
    }
})

watchEffect(async () => {
    const input: UpdateTrackingItemInput = {
        customerIDs: customerIDs.value,
        agentCode: agentCode.value,
        itemDescription: itemDescription.value
    }
    debouncedTrackingItemSave(input)
})

const onUserItemSubmission = async () => {
    const input: UpdateTrackingItemInput = {
        customerIDs: customerIDs.value,
        agentCode: agentCode.value,
        itemDescription: itemDescription.value
    }
    await onUpdateTrackingItem(input)
    emits('formSubmit')
}

const isLoadingChainItems = ref(false)
const chainItems = ref<TrackingItemOutput[]>([])
watch(() => trackingStore.trackingItem?.id, async (trackingItemID) => {
    if (R.isNil(trackingItemID)) {
        return
    }

    isLoadingChainItems.value = true
    try {
        chainItems.value = await apis.trackingItemsAPI.getItemChain(trackingItemID)
    } catch (e) {
        chainItems.value = []
        app.addErrorToQueue(`${e}`)
    } finally {
        isLoadingChainItems.value = false
    }
}, { immediate: true })

const onUserProductSubmission = async (productID: string, input: UpdateProductInput, byUser: boolean) => {
    if (byUser) {
        await onUpdateProduct(productID, input)
        emits('formSubmit')
    } else {
        await debouncedProductSave(productID, input)
    }
}
</script>