<template>
    <v-container fluid>
        <!-- <div v-if="customerStore.isLoadingDetail || pending"
            class="tw-bg-transparent tw-h-[200px] tw-flex tw-items-center tw-justify-center">
            <v-progress-circular indeterminate class="tw-h-8 tw-w-8" />
        </div> -->
        <v-card class="mb-4">
            <v-card-title>
                <span class="tw-text-3xl tw-text-primary">{{ customerInput.customerCode }}</span>
            </v-card-title>
        </v-card>
        <v-card class="pl-4 pr-4">
            <v-row class="mt-3">
                <v-col cols="12" md="8">
                    <v-form ref="form">
                        <v-text-field label="Tên khách hàng" appendInnerIcon="mdi-pencil"
                            v-model="customerInput.customerName" />
                        <v-row>
                            <v-col cols="6">
                                <v-select v-model="customerInput.agentID" label="Mã đại lí" :rules="[
                                    validator.required('Mã đại lí không được để trống')
                                ]" :items="authStore.agents" />
                            </v-col>
                            <v-col cols="6">
                                <v-text-field label="Mã khách hàng" appendInnerIcon="mdi-pencil"
                                    v-model="customerInput.customerCode" disabled :rules="[
                                        validator.required('Mã khách hàng không được để trống')
                                    ]" />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="8">
                                <v-text-field label="Số điện thoại" appendInnerIcon="mdi-pencil"
                                    v-model="customerInput.phoneNumber" />
                            </v-col>
                            <v-col cols="4">
                                <v-checkbox label="Tỉnh" v-model="customerInput.isProvince" />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-card width="100%" class="tw-ml-4 tw-mr-4 tw-mb-8" variant="outlined">
                                <v-card-title>
                                    <p>Mạng xã hội</p>
                                </v-card-title>
                                <v-card-text>
                                    <v-text-field label="Facebook" appendInnerIcon="mdi-pencil"
                                        v-model="customerInput.facebook" />
                                    <v-text-field label="Zalo" appendInnerIcon="mdi-pencil" v-model="customerInput.zalo" />
                                    <v-text-field label="Telegram" appendInnerIcon="mdi-pencil"
                                        v-model="customerInput.telegram" />
                                    <v-text-field label="Google sheet link" appendInnerIcon="mdi-pencil"
                                        v-model="customerInput.googleLink" />
                                </v-card-text>
                            </v-card>
                        </v-row>
                        <v-text-field label="Email" appendInnerIcon="mdi-pencil" v-model="customerInput.email" />
                        <v-text-field label="Địa chỉ" appendInnerIcon="mdi-pencil" v-model="customerInput.address" />
                        <v-textarea label="Ghi chú giá thành" appendInnerIcon="mdi-pencil"
                            v-model="customerInput.priceNote" />
                        <v-textarea label="Ghi chú" appendInnerIcon="mdi-pencil" v-model="customerInput.note" />
                    </v-form>
                </v-col>
                <v-col cols="12" md="4">
                    <v-row>
                        <v-col cols="6">
                            <v-card color="blue-lighten-5">
                                <v-card-title>
                                    <p class="tw-text-center tw-text-primary">Tổng số tracking</p>
                                </v-card-title>
                                <v-card-text>
                                    <p class="tw-text-3xl tw-text-center tw-font-bold">{{
                                        customerStore.customer?.ordersCount }}</p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="6">
                            <v-card color="blue-lighten-5">
                                <v-card-title>
                                    <p class="tw-text-center tw-text-primary">Tracking đã giao</p>
                                </v-card-title>
                                <v-card-text>
                                    <p class="tw-text-3xl tw-text-center tw-font-bold">{{
                                        customerStore.customer?.receiptsCount }}</p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-card color="blue-lighten-5">
                                <v-card-title>
                                    <p class="tw-text-center tw-text-primary">Tracking US</p>
                                </v-card-title>
                                <v-card-text>
                                    <p class="tw-text-3xl tw-text-center tw-font-bold">{{
                                        customerStore.customer?.usCount }}</p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="6">
                            <v-card color="blue-lighten-5">
                                <v-card-title>
                                    <p class="tw-text-center tw-text-primary">Tracking VN</p>
                                </v-card-title>
                                <v-card-text>
                                    <p class="tw-text-3xl tw-text-center tw-font-bold">{{
                                        customerStore.customer?.vnCount }}</p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="6">
                            <v-card color="blue-lighten-5">
                                <v-card-title>
                                    <p class="tw-text-center tw-text-primary">Tổng cân nặng</p>
                                </v-card-title>
                                <v-card-text>
                                    <p class="tw-text-3xl tw-text-center tw-font-bold">{{
                                        customerStore.customer?.weight }}</p>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12">
                            <div class="tw-flex tw-flex-col tw-space-y-4">
                                <v-card>
                                    <template #title>
                                        Giá sản phẩm gán với Khách hàng
                                        <v-divider class="tw-my-3 !tw-border-accent" />
                                    </template>
                                    <template #text>
                                        <div v-if="R.isEmpty(customerStore.customerPrices)"
                                            class="tw-w-full tw-h-20 tw-flex tw-items-center tw-justify-center">
                                            <p>Chưa có sản phẩm nào đc gán với tracking này</p>
                                        </div>
                                        <template v-else>
                                            <CustomerPriceCard v-for="customerPrice in customerStore.customerPrices" :key="customerPrice.id" :customerPrice="customerPrice"
                                                @submit="({ input }) => debouncedPriceSave(customerPrice.id || '', input)"
                                                :is-loading="R.has(customerPrice.id || 'na', customerStore.isCustomerPriceLoading)"
                                                @delete="customerStore.deleteCustomerPrice(customerPrice.id || '')"
                                            />                            
                                        </template>
                                        <v-btn class="tw-mt-4" v-if="customerStore.canAddCustomerPrice" color="accent" variant="elevated"
                                                prepend-icon="mdi-plus" @click="customerStore.addCustomerPrice"
                                                :loading="customerStore.isAddingCustomerPrice">
                                                Thêm sản phẩm
                                            </v-btn>
                                    </template>
                                </v-card>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { debounce, fromPairs } from 'lodash'
import { UpdateCustomerInput, UpdateCustomerPriceInput } from '~~/composables/useAPIs/customers';

definePageMeta({
    middleware: ['authenticated']
})

const route = useRoute()
const customerID: string = route.params.customerID as string
const customerStore = useCustomer()
const authStore = useAuth()
useAsyncData(() => authStore.getAgents())
const { pending } = await useAsyncData(() => customerStore.getCustomerDetail(customerID))

const validator = useValidators()
const customerInput = ref<UpdateCustomerInput>({
    customerName: customerStore.customer?.info.customerName,
    customerCode: customerStore.customer?.info.customerCode,
    phoneNumber: customerStore.customer?.info.phoneNumber,
    email: customerStore.customer?.info.email,
    address: customerStore.customer?.info.address,
    note: customerStore.customer?.info.note,
    facebook: customerStore.customer?.info.socialLinks.facebook,
    zalo: customerStore.customer?.info.socialLinks.zalo,
    telegram: customerStore.customer?.info.socialLinks.telegram,
    agentID: customerStore.customer?.info.agentCode || undefined,
    priceNote: customerStore.customer?.info.priceNote,
    isProvince: customerStore.customer?.info.isProvince,
    googleLink: customerStore.customer?.info.googleLink
})

const form = ref<VForm | null>(null)

const onUpdateCustomer = async (input: UpdateCustomerInput) => {
    if (form.value) {
        const { valid } = await form.value?.validate()
        if (valid) {
            await customerStore.updateCustomer(customerID, input)
        }
    }

}

const debouncedSave = debounce(onUpdateCustomer, 500)

const onUpdatePrice = async (customerPriceID: string, input: UpdateCustomerPriceInput) => {
    await customerStore.updateCustomerPrice(customerPriceID, input)
}

const debouncedPriceSave = debounce(onUpdatePrice, 500)

onMounted(() => {
    return () => {
        debouncedSave.cancel()
        debouncedPriceSave.cancel()
    }
    
})

watchEffect(async () => {
    const input: UpdateCustomerInput = {
        customerName: customerInput.value.customerName,
        customerCode: customerInput.value.customerCode,
        phoneNumber: customerInput.value.phoneNumber,
        email: customerInput.value.email,
        address: customerInput.value.address,
        note: customerInput.value.note,
        facebook: customerInput.value.facebook,
        zalo: customerInput.value.zalo,
        telegram: customerInput.value.telegram,
        agentID: customerInput.value.agentID,
        priceNote: customerInput.value.priceNote,
        isProvince: customerInput.value.isProvince,
        googleLink: customerInput.value.googleLink
    }
    debouncedSave(input)
})

</script>