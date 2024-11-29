<template>
    <PageLoader v-if="trackingStore.isLoading" />
    <PageError v-else-if="error" :errorMessage="`${error}`" :reload="refresh" />
    <v-container fluid v-else>
        <v-row>
            <v-col cols="12" md="12">
                <v-card>
                    <template #title>
                        <v-row><v-col>
                                <span class="tw-text-2xl tw-text-primary">CẬP NHẬT THÔNG TIN TRACKING
                                </span>
                                <v-btn :disabled="disableBackTrackingItem" @click="backTrackingItem" class="tw-w-[130px]"
                                    prepend-icon="mdi-arrow-left-circle" color="primary">Trước</v-btn>
                                <v-btn :disabled="disableForwardrackingItem" @click="forwardTrackingItem"
                                    class="ml-2 tw-w-[130px]" append-icon="mdi-arrow-right-circle"
                                    color="primary">Sau</v-btn>
                            </v-col>
                            <v-col cols="12" md="4">
                                <span class="h3 ">SỐ TRACKING CHƯA CẬP NHẬT: <span class="tw-text-2xl tw-text-primary">{{
                                    trackingStore.totalTrackingCustomerCodeInputRequired }}</span> </span>
                            </v-col>
                        </v-row>


                        <hr class="tw-my-4" />
                    </template>
                    <template #text>

                        <v-form ref="form" @submit.prevent="onSubmit">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-img v-if="trackingStore.selectedImageSrc" style="height:calc(100vh - 50px)"
                                        :style="`transform: rotate(${corner}deg)`"
                                        class="tw-cursor-pointer tw-flex tw-space-x-5 tw-items-top tw-justify-end"
                                        :src="trackingStore.selectedImageSrc" @dblclick="showImage">
                                        <v-btn v-if="isShowingProductImage" class="mt-3" size="small"
                                            @click="dismissProductImage" icon="mdi-close" color="info"></v-btn>
                                    </v-img>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row align="center">
                                        <v-col md="8">
                                        </v-col>
                                        <v-col cols="4">
                                            <v-select v-model="trackingStore.selectedAgent" label="Agent xác định"
                                                :items="authStore.agents" />
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="12" md="6">
                                            <p class="h3"><strong>Tracking Number:</strong> {{
                                                trackingStore.trackingItem?.trackingNumber }} {{
        trackingStore.trackingItem?.alternativeRef ? `
                                                (${trackingStore.trackingItem?.alternativeRef})` : '' }}
                                            </p>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <strong>Status:</strong>
                                            <div
                                                :class="['tw-rounded-full tw-mr-2 tw-w-4 tw-h-4 tw-inline-block', trackingStore.trackingStatusBGClass]">
                                            </div>
                                            {{ trackingStore.displayedTrackingStatus }}
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-select v-model="agentCode" label="Mã đại lí" :rules="[
                                                validators.required('Mã đại lí')
                                            ]" :items="authStore.agents" />
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <CustomerSearchInput v-model="customerIDs" />
                                        </v-col>

                                        <v-col cols="12"
                                            v-if="R.propOr(false, 'isWalmartTracking', trackingStore.trackingItem)">
                                            <v-text-field v-model="alternativeRef" label="Mã thay thế (Alternative Ref)">
                                                <template #append
                                                    v-if="R.propOr(false, 'isWalmartTracking', trackingStore.trackingItem)">
                                                    <img class="tw-h-[30px]"
                                                        src="~~/assets/images/Walmart-Logo-PNG-Transparent.webp" />
                                                </template>
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="12" md="12">
                                            <div class="tw-flex tw-flex-col tw-space-y-4">
                                                <v-card>
                                                    <template #title>
                                                        Danh sách sản phẩm
                                                        <v-divider class="tw-my-3 !tw-border-accent" />
                                                    </template>
                                                    <template #text>
                                                        <div v-if="R.isEmpty(trackingStore.products)"
                                                            class="tw-w-full tw-h-20 tw-flex tw-items-center tw-justify-center">
                                                            <p>Chưa có sản phẩm nào đc gán với tracking này</p>
                                                        </div>
                                                        <template v-else>
                                                            <ProductTable v-for="(product, index) in displayProducts"
                                                                @builtinImage="builtinImage" :key="product.index"
                                                                :product="product" :index="product.index"
                                                                @submit="({ input }) => editProduct(index, input)"
                                                                :is-loading="R.has(product.id || 'na', trackingStore.isProductsLoading)"
                                                                @delete="deleteProduct(product)" />
                                                        </template>
                                                        <v-btn class="tw-mt-4" v-if="trackingStore.canAddProduct"
                                                            color="accent" variant="elevated" prependIcon="mdi-plus"
                                                            @click="addProduct" :loading="trackingStore.isAddingProduct">
                                                            Thêm sản phẩm
                                                        </v-btn>
                                                    </template>
                                                </v-card>
                                            </div>
                                        </v-col>
                                        <v-col cols="12" md="12">
                                            <v-textarea v-model="itemDescription" label="Note" />
                                        </v-col>
                                    </v-row>

                                </v-col>
                                <v-dialog v-model="show" max-width="80%" @click:outside="corner = 0">
                                    <v-card>
                                        <v-img style="height:calc(100vh - 50px)" :style="`transform: rotate(${corner}deg)`"
                                            :src="trackingStore.selectedImageSrc" contain></v-img>
                                    </v-card>
                                    <v-card-actions class="tw-flex tw-items-center tw-justify-center tw-h-full">
                                        <v-btn prepend-icon="mdi-arrow-u-left-top" variant="elevated" color="default"
                                            class="tw-w-[150px]" @click="rotateLeft">Xoay trái
                                        </v-btn>
                                        <v-btn prepend-icon="mdi-arrow-u-right-top" variant="elevated" color="default"
                                            class="tw-w-[150px]" @click="rotateRight">Xoay phải
                                        </v-btn>
                                    </v-card-actions>
                                </v-dialog>
                            </v-row>
                            <v-row>
                                <v-col md="6" class="tw-flex tw-space-x-5 tw-items-center tw-justify-start mt-3">
                                </v-col>
                                <v-col md="6">
                                    <div class="tw-flex tw-space-x-5 tw-items-center tw-justify-end mt-3">
                                        <v-btn :loading="trackingStore.isUpdating" type="submit" prepend-icon="mdi-check"
                                            size="large" color="accent">Update</v-btn>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-form>
                    </template>
                </v-card>
            </v-col>
        </v-row>

    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'

import { UpdateProductInput, UpdateTrackingItemInput, ProductOutput } from '~~/composables/useAPIs/trackings';

import { VForm } from 'vuetify/components';
import { ComputedRef } from 'vue'

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})
const form = ref<VForm | null>(null)

const authStore = useAuth()

const trackingStore = useTracking()

const agentCode = ref(trackingStore.trackingItem?.agentCode)
const itemDescription = ref(trackingStore.trackingItem?.itemDescription)
const alternativeRef = ref(trackingStore.trackingItem?.alternativeRef)
const disableBackTrackingItem = computed(() => R.pathEq([-1], trackingStore.trackingItem?.id, trackingStore.historyUpdateTrackingItems))
const disableForwardrackingItem = computed(() => R.pathEq([0], trackingStore.trackingItem?.id, trackingStore.historyUpdateTrackingItems))
const customerStore = useCustomer()
const customerIDs = ref(trackingStore.trackingItem?.customers?.map(x => x.id))

const config = useRuntimeConfig()
const productImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}

const dismissProductImage = () => {
    const imageId = R.path(['files', 0], trackingStore.trackingItem)
    if (!R.isNil(imageId)) {
        const config = useRuntimeConfig()
        trackingStore.selectedImageSrc = `${config.public.apiBase}/files/dc/${trackingStore.mainImage}`
    } else {
        trackingStore.selectedImageSrc = null
    }
}

const isShowingProductImage = computed(() => {
    const imageId = R.path(['files', 0], trackingStore.trackingItem)
    if (!R.isNil(imageId)) {
        const config = useRuntimeConfig()
        if (trackingStore.selectedImageSrc !== `${config.public.apiBase}/files/dc/${trackingStore.mainImage}`)
            return true
    }
    return false
})

const corner = ref(0)
const rotateRight = () => corner.value = corner.value + 90
const rotateLeft = () => corner.value = corner.value - 90
const show = ref(false)
const builtinImage = (image: string) => {
    corner.value = 0
    trackingStore.selectedImageSrc = productImageSrc(image)
}
const showImage = (image: string) => {
    show.value = true
}

const displayProducts = ref<ProductOutput[]>([])

const addedProductID = ref([])

const addProduct = () => {
    const maxIndex = R.apply(Math.max, R.pluck('index', displayProducts.value))
    const newProduct: ProductOutput = {
        id: undefined,
        description: '',
        quantity: 1,
        index: maxIndex + 1
    }
    displayProducts.value = R.append(newProduct, displayProducts.value)
}

const editProduct = (index: number, input: UpdateProductInput) => {
    let product = R.prop(index, displayProducts.value)
    product.quantity = R.or(input.quantity, 0)
    product.description = R.or(input.description, '')
    displayProducts.value = R.update(index, product, displayProducts.value)
}

const deleteProduct = (product: ProductOutput) => {
    const temp = R.reject(R.propEq('index', product.index), displayProducts.value)
    displayProducts.value = temp
}

const saveData = () => {
    if (!R.isNil(trackingStore.trackingItem)) {
        if (customerIDs.value) {
            trackingStore.trackingItem = R.assoc('customerIDs', customerIDs.value, trackingStore.trackingItem)
        }
        if (agentCode.value) {
            trackingStore.trackingItem = R.assoc('agentCode', agentCode.value, trackingStore.trackingItem)
        }

        if (itemDescription.value) {
            trackingStore.trackingItem = R.assoc('itemDescription', itemDescription.value, trackingStore.trackingItem)
        }

        if (alternativeRef.value) {
            trackingStore.trackingItem = R.assoc('alternativeRef', itemDescription.value, trackingStore.trackingItem)
        }
    }
}

watch(() => trackingStore.trackingItem, async (newItem, oldItem) => {
    if (!R.equals(newItem?.id, oldItem?.id)) {
        customerIDs.value = newItem?.customers?.map(x => x.id)
        agentCode.value = newItem?.agentCode
        itemDescription.value = newItem?.itemDescription
        alternativeRef.value = newItem?.alternativeRef
        displayProducts.value = trackingStore.products
        form.value?.resetValidation()
    }
})

const validators = useValidators()

const onSubmit = async () => {
    let input: UpdateTrackingItemInput = {}
    if (form.value) {
        const { valid } = await form.value?.validate()
        if (valid) {
            if (customerIDs.value) {
                input = R.assoc('customerIDs', customerIDs.value, input)
            }
            if (agentCode.value) {
                input = R.assoc('agentCode', agentCode.value, input)
            }
            if (itemDescription.value) {
                input = R.assoc('itemDescription', itemDescription.value, input)
            }
            if (alternativeRef.value) {
                input = R.assoc('alternativeRef', alternativeRef.value, input)
            }
            const productInputs: UpdateProductInput[] = displayProducts.value.map(x => {
                let updateInput: UpdateProductInput = {
                    id: x.id,
                    description: x.description,
                    quantity: x.quantity
                }
                return updateInput
            })
            console.log(productInputs)
            input = R.assoc('products', productInputs, input)
        }
    }
    await trackingStore.updateTrackingCodeInputRequired(input)
    refresh()
}
useAsyncData(() => authStore.getAgents())

const backTrackingItem = async () => {
    trackingStore.isLoading = true
    const indexTrackingCurrent = R.indexOf(trackingStore.trackingItem?.id, trackingStore.historyUpdateTrackingItems)
    const { trackingItemsAPI } = useAPIs()
    trackingStore.trackingItem = await trackingItemsAPI.getTrackingItem(trackingStore.historyUpdateTrackingItems[indexTrackingCurrent + 1])
    if (R.isNil(trackingStore.trackingItem.customerCode)) {
        customerStore.suggestCustomers = []
    } else {
        if (!R.isNil(trackingStore.trackingItem.customerCode) && !R.isEmpty(trackingStore.trackingItem.customerCode)) {
            customerStore.getCustomerSuggestions({ customerCode: trackingStore.trackingItem.customerCode })
        }
    }
    dismissProductImage()
    trackingStore.isLoading = false
}
const forwardTrackingItem = async () => {
    trackingStore.isLoading = true
    const indexTrackingCurrent = R.indexOf(trackingStore.trackingItem?.id, trackingStore.historyUpdateTrackingItems)
    const { trackingItemsAPI } = useAPIs()
    trackingStore.trackingItem = await trackingItemsAPI.getTrackingItem(trackingStore.historyUpdateTrackingItems[indexTrackingCurrent - 1])
    if (R.isNil(trackingStore.trackingItem.customerCode)) {
        customerStore.suggestCustomers = []
    } else {
        if (!R.isNil(trackingStore.trackingItem.customerCode) && !R.isEmpty(trackingStore.trackingItem.customerCode)) {
            customerStore.getCustomerSuggestions({ customerCode: trackingStore.trackingItem.customerCode })
        }
    }
    dismissProductImage()
    trackingStore.isLoading = false
}

const { pending, error, refresh } = await useAsyncData('trackingItem', () => trackingStore.loadTrackingCustomerCodeInputRequired())

watch(() => trackingStore.selectedAgent, () => {
    refresh()
})
</script>