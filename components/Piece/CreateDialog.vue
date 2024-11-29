<template>
    <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" width="450"
        @update:model-value="emits('update:modelValue')">
        <v-card>
            <VForm @submit.prevent="onSubmitForm" ref="form">
                <v-card-title class="tw-font-bold">
                    TẠO MẢNH
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="information" placeholder="Nhập thông tin sản phẩm" variant="outlined" :rules="[
                        formValidators.required('VD: 5 iPad')
                    ]">
                    </v-text-field>
                </v-card-text>
                <v-card-action>
                    <v-row class="tw-pb-4 tw-px-4">
                        <v-col cols="auto" class="me-auto">
                            <v-btn prepend-icon="mdi-cancel" variant="elevated" color="default" class="tw-w-[150px]"
                                @click="emits('update:modelValue', false)">Hủy</v-btn>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn :loading="isCreating" prepend-icon="mdi-check" variant="elevated" color="primary"
                                class="tw-w-[150px]" type="submit" @click="emits('update:modelValue', false)">Xong</v-btn>
                        </v-col>
                    </v-row>
                </v-card-action>
            </VForm>
        </v-card>

    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { CreateTrackingItemPieceInput } from '~~/composables/useAPIs/trackings';

interface Props {
    modelValue: boolean
}
const trackingStore = useTracking()
const form = ref<VForm | null>(null)
const formValidators = useValidators()
const props = defineProps<Props>()
const { modelValue } = toRefs(props)
const emits = defineEmits(["createPiece"])
const information = ref("")
const isCreating = ref(false)
const onSubmitForm = async () => {
    isCreating.value = true
    if (!form.value) { return }

    const input: CreateTrackingItemPieceInput = {
        information: information.value
    };
    try {
        await trackingStore.createPiece(input)
    } catch (error) {
        throw (error)
    } finally {
        information.value = ''
        isCreating.value = false
    }
}

</script>