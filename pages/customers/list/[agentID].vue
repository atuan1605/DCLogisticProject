<template>
    <v-card :loading="customerStore.isLoadingCustomers">
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
            <v-form @submit.prevent="onSearchTapped">
                <v-card-item>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="Email và Mã khách hàng" v-model="queryInput.searchString"
                                placeholder="Nhập email hoặc mã khách hàng" />
                        </v-col>

                        <v-col cols="12" md="2">
                            <v-card-actions class=" tw-space-x-6 tw-justify-start">
                                <v-btn variant="elevated" color="accent" class="tw-w-[150px]" type="submit"
                                    :loading="customerStore.isLoadingCustomers">Lọc
                                    kết
                                    quả</v-btn>
                            </v-card-actions>
                        </v-col>
                    </v-row>
                </v-card-item>


            </v-form>
        </v-card>
        <v-card-text>
            <t-row>
                <v-table class="tw-mt-4" fixed-header :height="'calc(100vh - 300px)'">
                    <template v-slot:top>
                        <div class="tw-w-full ">
                            <div class="tw-w-2/12 tw-float-right tw-flex tw-justify-end ">
                                <v-btn color="primary" variant="elevated" @click="onShowCreatingDialog">
                                    Tạo khách hàng
                                </v-btn>
                            </div>

                        </div>

                    </template>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã khách hàng</th>
                            <th>Số lượng tracking</th>
                            <th>Email</th>
                            <th>Note</th>
                            <th>Số kg</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="R.isEmpty(customerStore.customers?.items || []) && !customerStore.isLoadingCustomers">
                            <td colspan="5" class="tw-py-8 tw-text-center"> No data.</td>
                        </tr>
                        <template v-else>
                            <tr v-for="(customer, index) in customerStore.customers?.items"
                                class="tw-hover:bg-accent/25 tw-cursor-pointer">
                                <td width="50"> {{ ((queryInput.page || 1) - 1) * (queryInput.per || 1) + (index + 1) }}
                                </td>
                                <td class="tw-py-3" v-text="customer.customerCode"></td>
                                <td class="tw-py-3" v-text="customer.trackingItemsCount"></td>
                                <td class="tw-py-3" v-text="customer.email"></td>
                                <td class="tw-py-3" v-text="customer.note"></td>
                                <td class="tw-py-3" v-text="customer.totalWeight"></td>
                                <td width="110">
                                    <div class="tw-flex tw-justify-between">
                                        <v-btn icon size="x-small" color="accent" variant="outlined"
                                            @click="onNavigateToCustomerDetail(customer.id)">
                                            <v-icon size="small">mdi-eye</v-icon>
                                        </v-btn>
                                        <v-btn icon size="x-small" variant="outlined" color="red"
                                            @click="showConfirmDelete(customer.id)">
                                            <v-icon size="small">mdi-delete</v-icon>
                                        </v-btn>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </v-table>
                <v-row class="mt-2">
                    <v-col cols="11" class="tw-flex tw-justify-end">
                        <v-pagination v-model="queryInput.page" :length="pageLength" :total-visible="7"
                            :disabled="customerStore.isLoadingCustomers"></v-pagination>
                    </v-col>
                    <v-col cols="1">
                        <v-select :items="perOptions" v-model="queryInput.per" hide-details />
                    </v-col>
                </v-row>
            </t-row>
            <DeleteDialog :loading="customerStore.isUpdating" v-model="deleteBoxDialog" @delete="deleteCustomer()" />
        </v-card-text>
    </v-card>
    <v-dialog v-model="createCustomerDialog" width="auto">
        <VCard width="700">
            <VCardTitle class="tw-text-center tw-mt-8">
                <span class="tw-text-3xl tw-font-bold">Tạo khách hàng</span>
            </VCardTitle>
            <v-row class="tw-mt-3 tw-px-2">
                <v-col cols="12">
                    <VForm @submit.prevent="onSubmitForm" ref="form">
                        <VTextField label="Tên khách hàng" appendInnerIcon="mdi-pencil" v-model="customerName" />
                        <v-row>
                            <v-col cols="6">
                                <VSelect v-model="agentID" label="Mã đại lí" :rules="[
                                    validator.required('Mã đại lí')
                                ]" :items="authStore.agents" />
                            </v-col>
                            <v-col cols="6">
                                <VTextField label="Mã khách hàng" appendInnerIcon="mdi-pencil" v-model="customerCode"
                                    :rules="[
                                        validator.required('Mã khách hàng')
                                    ]" />
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="8">
                                <VTextField label="Số điện thoại" appendInnerIcon="mdi-pencil" v-model="phoneNumber" />
                            </v-col>
                            <v-col cols="4">
                                <v-checkbox label="Tỉnh" v-model="isProvince"></v-checkbox>
                            </v-col>
                        </v-row>

                        <v-row>
                            <VCard width="100%" class="ml-4 mr-4 mb-8" variant="outlined">
                                <VCardTitle>
                                    <p>Mạng xã hội</p>
                                </VCardTitle>
                                <VCardText>
                                    <VTextField label="Facebook" appendInnerIcon="mdi-pencil" v-model="facebook" />
                                    <VTextField label="Zalo" appendInnerIcon="mdi-pencil" v-model="zalo" />
                                    <VTextField label="Telegram" appendInnerIcon="mdi-pencil" v-model="telegram" />
                                    <VTextField label="Google sheet Link" appendInnerIcon="mdi-pencil"
                                        v-model="googleLink" />
                                </VCardText>
                            </VCard>
                        </v-row>
                        <VTextField label="Email" appendInnerIcon="mdi-pencil" v-model="email" />
                        <VTextField label="Địa chỉ" appendInnerIcon="mdi-pencil" v-model="address" />
                        <v-textarea label="Ghi chú giá thành" append-inner-icon="mdi-pencil" v-model="priceNote" />
                        <VTextarea label="Ghi chú" appendInnerIcon="mdi-pencil" v-model="note" />
                        <VCardActions>
                            <v-btn variant="flat" color="black" block :loading="isCreating" type="submit">Xong</v-btn>
                        </VCardActions>
                    </VForm>
                </v-col>
            </v-row>

        </VCard>
    </v-dialog>

</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { CreateCustomerInput } from '~~/composables/useAPIs/customers';

import { GetCustomerQueryInput } from '~~/composables/useAPIs/customers';
definePageMeta({
    middleware: ['authenticated']
})

const validator = useValidators()
const route = useRoute()
const customerStore = useCustomer()
const selectedCustomerID = ref<string | null>(null)
const deleteBoxDialog = ref(false)
const perOptions = ref([20, 50, 100, 1000])
const getPageLength = (): string => {
    var value = Math.ceil((customerStore.customers?.metadata.total || 0) / (customerStore.customers?.metadata.per || 100))

    return (value == 0 ? 1 : value).toString()
}
const pageLength = ref<string>(getPageLength())
const onNavigateToCustomerDetail = (customerID: string) => {
    navigateTo({
        path: `/customers/${customerID}`
    })
}
const queryInput = ref<GetCustomerQueryInput>({
    agentID: route.params.agentID as string || "DC",
    page: Number(route.query.page) || 1,
    per: Number(route.query.per) || 20,
})

useAsyncData(() => customerStore.getCustomersListOutput(queryInput.value))

watch([() => queryInput.value.page, () => queryInput.value.per], async ([newPage, newPer]) => {
    await navigateTo({
        path: route.path,
        query: { ...route.query, page: newPage, per: newPer }
    })
    await customerStore.getCustomersListOutput(queryInput.value)
})

watch(() => customerStore.isLoadingCustomers, (newValue) => {
    if (!newValue) {
        pageLength.value = getPageLength()
    }
})
const showConfirmDelete = (customerID: string) => {
    selectedCustomerID.value = customerID
    deleteBoxDialog.value = true
}

const deleteCustomer = () => {
    if (!R.isNil(selectedCustomerID.value)) {
        customerStore.deleteCustomer(selectedCustomerID.value)
            .then(() => {
                selectedCustomerID.value = null
                deleteBoxDialog.value = false
            })
    }
}

const onSearchTapped = async () => {
    await customerStore.getCustomersListOutput(queryInput.value)
    queryInput.value.searchString = undefined
}
const authStore = useAuth()
const isEmptyQuery = R.isEmpty(route.query)
let createCustomerDialog = ref(false)

const onShowCreatingDialog = () => {
    createCustomerDialog.value = true
}
const agentID = ref<string>(queryInput.value.agentID)
const isCreating = ref(false)
const customerCode = ref("")
const phoneNumber = ref("")
const facebook = ref("")
const zalo = ref("")
const telegram = ref("")
const email = ref("")
const address = ref("")
const note = ref("")
const priceNote = ref("")
const isProvince = ref(false)
const googleLink = ref("")
const form = ref<VForm | null>(null)
const customerName = ref("")

const onSubmitForm = async () => {
    if (isCreating.value) {
        return
    }

    if (!form.value) { return }
    const { valid } = await form.value.validate()

    if (!valid) { return }

    const input: CreateCustomerInput = {
        customerName: customerName.value,
        customerCode: customerCode.value,
        phoneNumber: phoneNumber.value,
        email: email.value,
        address: address.value,
        note: note.value,
        agentID: agentID.value ,
        socialLinks: {
            facebook: facebook.value,
            zalo: zalo.value,
            telegram: telegram.value,
        },
        priceNote: priceNote.value,
        isProvince: isProvince.value,
        googleLink: googleLink.value
    };
    const newCustomer = await customerStore.createCustomer(route.params.agentID as string, input)
    if (input.agentID !== queryInput.value.agentID) {
        queryInput.value.agentID = agentID.value
        queryInput.value.searchString = undefined
        customerStore.getCustomersListOutput(queryInput.value)
    }
    createCustomerDialog.value = false
}
</script>
