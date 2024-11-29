<template>
    <v-card variant="outlined" :loading="props.isLoading" class="tw-mt-3">
        <v-card-text>
            <v-container class="tw-flex tw-flex-col tw-space-y-8">
                <v-row>
                    <v-col cols="12" md="">
                        <v-form ref="form" @submit.prevent="onSubmit">
                            <div class="tw-flex tw-flex-col tw-space-y-2 tw-items-start">
                                <v-combobox :items="customerStore.productNameSuggestions" variant="outlined"
                                class="tw-rounded-lg tw-w-full" label="Fill or select" v-model="productName"
                                hide-details="auto" />
                                <v-text-field variant="outlined" prefix="$" class="tw-rounded-lg tw-w-full" label="UnitPrice"
                                    type="number" v-model.number="unitPrice" :rules="[
                                        formValidators.required('unitPrice'),
                                        formValidators.number,
                                        formValidators.min(1)
                                    ]" hide-details="auto" />
                                <div class="tw-flex tw-space-x-2">
                                    <v-btn v-if="!props.isLoading" color="error" @click="$emit('delete')">
                                        <template #prepend>
                                            <v-icon>mdi-delete</v-icon>
                                        </template>
                                        Xoá
                                    </v-btn>
                                    <v-btn type="submit" v-show="false">
                                        Hidden submit button
                                    </v-btn>
                                </div>
                            </div>
                        </v-form>
                    </v-col>
                </v-row>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { CustomerPriceOutput, UpdateCustomerPriceInput } from '~~/composables/useAPIs/customers';

export interface Props {
    customerPrice: CustomerPriceOutput,
    isLoading: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false
})

const emit = defineEmits(['submit', 'delete', 'submitWithoutUpdating'])

const customerStore = useCustomer()
const form = ref<VForm | null>(null)
const formValidators = useValidators()

const unitPrice = ref(props.customerPrice.unitPrice / 100)
const productName = ref(props.customerPrice.productName)

watch(() => props.customerPrice, (newCustomerPrice, oldCustomerPrice) => {
    if (!R.equals(newCustomerPrice.id, oldCustomerPrice.id)) {
        unitPrice.value = newCustomerPrice.unitPrice
        productName.value = newCustomerPrice.productName
        form.value?.resetValidation()
    }
})

const hasChanges = computed(() => {
    return !R.equals(unitPrice.value || 0, (props.customerPrice.unitPrice || 0) / 100) || !R.equals(productName.value || '', props.customerPrice.productName || '')
})

watchEffect(async () => {
    if (!hasChanges.value) {
        return
    }

    if (form.value) {
        const { valid } = await form.value.validate()
        if (valid) {
            let input: UpdateCustomerPriceInput = {}

            if (productName.value) {
                input = R.assoc('productName', productName.value, input)
            }
            if (unitPrice.value) {
                input = R.assoc('unitPrice', unitPrice.value * 100, input)
            }

            emit('submit', { input, byUser: false })
        }
    }
})

const onSubmit = async () => {
    if (!hasChanges.value) {
        emit('submitWithoutUpdating')
        return
    }

    if (form.value) {
        const { valid } = await form.value.validate()
        if (valid) {
            let input: UpdateCustomerPriceInput = {}

            if (productName.value) {
                input = R.assoc('productName', productName.value, input)
            }
            if (unitPrice.value) {
                input = R.assoc('unitPrice', unitPrice.value, input)
            }
            emit('submit', { input, byUser: true })
        }
    }
}
</script>