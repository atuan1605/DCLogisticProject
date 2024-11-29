<template>
    <v-card variant="outlined" :loading="props.isLoading">
        <v-card-text>
            <v-container class="tw-flex tw-flex-col tw-space-y-8">
                <v-form ref="form" @submit.prevent="onSubmit">
                    <v-row>

                        <v-col cols="12" md="3">
                            <div class="tw-flex tw-flex-col tw-space-y-2 tw-items-start">
                                <v-text-field :id="index == 0 ? 'firstProduct' : ''" variant="outlined"
                                    class="tw-rounded-lg tw-w-full" label="Quantity" type="number"
                                    v-model.number="productQuantity" :rules="[
                                        formValidators.required('quantity'),
                                        formValidators.int,
                                        formValidators.min(1)
                                    ]" hide-details="auto" />
                            </div>
                        </v-col>
                        <v-col cols="12" md="4">
                            <div class="tw-flex tw-flex-col tw-space-y-2 tw-items-start">
                                <v-combobox :items="trackingStore.productNameSuggestions" variant="outlined"
                                    class="tw-rounded-lg tw-w-full" label="Fill or select" v-model="productDescription"
                                    hide-details="auto" />
                            </div>
                        </v-col>
                        <v-col cols="12" md="2">
                            <div class="tw-flex tw-space-x-1" v-if="index > 0">
                                <v-btn v-if="!props.isLoading" color="error" @click="showConfirmDelete">
                                    <template #prepend>
                                        <v-icon>mdi-delete</v-icon>
                                    </template>
                                    Xoá
                                </v-btn>
                                <v-btn type="submit" v-show="false">
                                    Hidden submit button
                                </v-btn>
                            </div>
                        </v-col>
                        <v-col cols="12" :md="12">
                            <div class="tw-flex tw-space-x-5 tw-overflow-x-scroll" v-if="!R.isEmpty(product.images || [])">
                                <div class="tw-w-auto tw-h-[100px] tw-flex tw-items-center tw-justify-center tw-bg-accent tw-rounded-lg tw-drop-shadow-sm"
                                    v-for="image in product.images">
                                    <img class="tw-min-w-[40px] tw-h-full tw-object-contain tw-hover:bg-accent/25 tw-cursor-pointer"
                                        :src="productImageSrc(image)" @click="builtinImage(image)" />
                                </div>
                            </div>
                            <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-full">
                                <span class="tw-text-center">Sản phẩm chưa có ảnh...</span>
                            </div>
                        </v-col>

                        <DeleteDialog :loading="props.isLoading" v-model="deleteBoxDialog" @delete="onDelete"
                            @close-delete="deleteBoxDialog = false" />
                    </v-row>
                </v-form>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { ProductOutput, UpdateProductInput } from '~~/composables/useAPIs/trackings';

export interface Props {
    product: ProductOutput,
    isLoading: boolean
    index: number
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false
})


const deleteBoxDialog = ref(false)

const showConfirmDelete = () => {
    deleteBoxDialog.value = true
}

const onDelete = () => {
    emit('delete')
    deleteBoxDialog.value = false
}

const emit = defineEmits(['submit', 'delete', 'submitWithoutUpdating', 'builtinImage'])
const config = useRuntimeConfig()
const trackingStore = useTracking()
const form = ref<VForm | null>(null)
const formValidators = useValidators()

const productImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}

const productDescription = ref(props.product.description)
const productQuantity = ref(props.product.quantity)

watch(() => props.product, (newProduct, oldProduct) => {
    if (!R.equals(newProduct.id, oldProduct.id)) {
        productDescription.value = newProduct.description
        productQuantity.value = newProduct.quantity
        form.value?.resetValidation()
    }
})

const hasChanges = computed(() => {
    return !R.equals(productDescription.value || '', props.product.description || '') || !R.equals(productQuantity.value || 0, props.product.quantity || 0)
})

watch([() => hasChanges.value, () => productDescription.value, () => productQuantity.value], async ([updatedHasChanges, updatedProductDescription, updatedProductQuantity]) => {
    if (!updatedHasChanges) {
        return
    }
    console.log('1.')

    if (form.value) {
        console.log('2.')
        const { valid } = await form.value.validate()
        console.log('3.', valid)
        if (valid) {
            let input: UpdateProductInput = {}

            if (updatedProductDescription) {
                input = R.assoc('description', updatedProductDescription, input)
            }
            if (updatedProductQuantity) {
                input = R.assoc('quantity', updatedProductQuantity, input)
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
            let input: UpdateProductInput = {}

            if (productDescription.value) {
                input = R.assoc('description', productDescription.value, input)
            }
            if (productQuantity.value) {
                input = R.assoc('quantity', productQuantity.value, input)
            }
            emit('submit', { input, byUser: true })
        }
    }
}


const builtinImage = (image: string) => {
    emit('builtinImage', image)
}


</script>