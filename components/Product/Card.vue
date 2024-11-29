<template>
    <v-card variant="outlined" :loading="props.isLoading">
        <v-card-text>
            <v-container class="tw-flex tw-flex-col tw-space-y-8">
                <v-row>
                    <v-col cols="12" md="">
                        <v-form ref="form" @submit.prevent="onSubmit" :disabled="disableItem">
                            <div class="tw-flex tw-flex-col tw-space-y-2 tw-items-start">
                                <v-combobox :items="trackingStore.productNameSuggestions" variant="outlined"
                                    class="tw-rounded-lg tw-w-full" label="Fill or select" v-model="productDescription"
                                    hide-details="auto" />
                                <v-text-field variant="outlined" class="tw-rounded-lg tw-w-full" label="Quantity"
                                    type="number" v-model.number="productQuantity" :rules="[
        formValidators.required('quantity'),
        formValidators.int,
        formValidators.min(1)
    ]" hide-details="auto" />
                                <div class="tw-flex tw-space-x-2">
                                    <v-btn :disabled="disableItem" v-if="!props.isLoading" color="accent"
                                        @click="$emit('delete')">
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
                    <v-col cols="12" md="6">
                        <div class="tw-flex tw-space-x-4 tw-overflow-auto tw-w-full tw-h-full tw-items-center tw-justify-start"
                            v-if="!R.isEmpty(product.images || [])">
                            <div class="tw-w-[100px] tw-h-[90px]  tw-flex tw-items-center tw-justify-start tw-rounded-lg tw-drop-shadow-sm"
                                v-for="image in product.images">
                                <div @click="showImage(image)"
                                    class="tw-w-[75px] tw-h-full tw-object-contain tw-flex tw-flex-row tw-justify-end tw-aspect-auto tw-relative"
                                    :style="{ backgroundImage: `url(${productImageSrc(image)})`, backgroundPosition: 'center', backgroundSize: 'cover' }">
                                    <!-- Adjusting the position of the icon -->
                                    <v-icon color="primary"
                                        class="tw-bg-white tw-cursor-pointer tw-rounded-full tw--right-2 tw--top-2 tw-absolute tw-p-0 tw-z-30 tw-text-red"
                                        @click="deleteImage(image, $event)">
                                        mdi-close-circle
                                    </v-icon>
                                </div>
                            </div>
                        </div>
                        <div v-else class="tw-flex tw-items-center tw-justify-center tw-h-full">
                            <span class="tw-text-center">Sản phẩm chưa có ảnh...</span>
                        </div>
                        <v-dialog v-model="show" max-width="800">
                            <v-card>
                                <v-img :style="`transform: rotate(${corner}deg)`" :src="productImageSrc(selectedImage)"
                                    contain></v-img>
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
                    </v-col>
                </v-row>
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
    isLoading: boolean,
    disableItem?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false
})
const emit = defineEmits(['submit', 'delete', 'submitWithoutUpdating', 'deleteImage'])
const config = useRuntimeConfig()
const trackingStore = useTracking()
const form = ref<VForm | null>(null)
const formValidators = useValidators()

const productImageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}

const corner = ref(0)
const rotateRight = () => corner.value = corner.value + 90
const rotateLeft = () => corner.value = corner.value - 90
const productDescription = ref(props.product.description)
const productQuantity = ref(props.product.quantity)


watch(() => props.product, (newProduct, oldProduct) => {
    if (!R.equals(newProduct.id, oldProduct.id)) {
        productDescription.value = newProduct.description
        productQuantity.value = newProduct.quantity
        form.value?.resetValidation()
    }
})
const deleteImage = (fileID: string, event: any) => {
    event.stopPropagation()
    emit('deleteImage', { fileID })
}

const hasChanges = computed(() => {
    return !R.equals(productDescription.value || '', props.product.description || '') || !R.equals(productQuantity.value || 0, props.product.quantity || 0)
})

watch([() => hasChanges.value, () => productDescription.value, () => productQuantity.value], async ([updatedHasChanges, updatedProductDescription, updatedProductQuantity]) => {
    if (!updatedHasChanges) {
        return
    }

    if (form.value) {
        const { valid } = await form.value.validate()
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

const show = ref(false)
const selectedImage = ref("")

const showImage = (image: string) => {
    const imageIndex = (props.product.images as string[]).indexOf(image);
    if (imageIndex !== -1) {
        currentImageIndex.value = imageIndex;
        corner.value = 0
        selectedImage.value = props.product.images[imageIndex];
        show.value = true
    }
}

onMounted(() => {
    window.addEventListener('keyup', handleKeyup);
});

onUnmounted(() => {
    window.removeEventListener('keyup', handleKeyup);
});
const handleKeyup = (event: KeyboardEvent) => {
    if (show.value) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            goPrevImage();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            goNextImage();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            show.value = false;
        }
    }
};
const currentImageIndex = ref(0)
const goNextImage = () => {
    if (R.isNil(props.product.images)) { return }
    if (currentImageIndex.value == props.product.images.length - 1) {
        currentImageIndex.value = 0
    } else {
        currentImageIndex.value += 1
    }
    selectedImage.value = props.product.images[currentImageIndex.value]
}
const goPrevImage = () => {
    if (R.isNil(props.product.images)) { return }
    if (currentImageIndex.value == 0 ) {
        currentImageIndex.value = props.product.images.length - 1
    } else {
       currentImageIndex.value -= 1
    }
    selectedImage.value = props.product.images[currentImageIndex.value]
}

</script>
