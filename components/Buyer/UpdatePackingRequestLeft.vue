<template>
    <v-dialog v-model="modal" :fullscreen="mobile" :persistent="props.isLoading" transition="dialog-bottom-transition"
        width="450">
        <v-card>
            <template #title>
                CHỈNH SỬA SỐ LƯỢNG YÊU CẦU ĐẶC BIỆT
            </template>
             <template #titlt>
                    Email: {{ email }}
            </template>
            <template #text>
                <v-form ref="form" @submit.prevent="onSubmit">
                    <v-container>
                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-model="packingRequestLeft" type="number" variant="outlined" label="Note" :rules="[
                                    formValidators.required('VD: 5')
                                ]"></v-text-field>
                            </v-col>
                        </v-row>
                        <div class="tw-flex tw-space-x-5 tw-items-center tw-justify-end">
                            <v-col cols="auto" class="me-auto">
                                <v-btn v-if="!props.isLoading" variant="outlined"
                                    @click="$emit('update:modelValue', false)">Huỷ</v-btn>
                            </v-col>
                            <v-col cols="auto">
                                <v-btn :loading="props.isLoading" type="submit" color="accent">Cập nhật</v-btn>
                            </v-col>
                        </div>
                    </v-container>
                </v-form>
            </template>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { BuyerOutput, UpdateBuyerInput } from '~~/composables/useAPIs/buyers';

export interface Props {
    modelValue: boolean
    buyer?: BuyerOutput | null
    isLoading: boolean
}



const formValidators = useValidators()
const { mobile } = useDisplay()

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isLoading: false
})
const emit = defineEmits(['update:modelValue', 'submit'])
const form = ref<VForm | null>(null)

const modal = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

const email = ref(props.buyer?.email)
const packingRequestLeft =ref(props.buyer?.packingRequestLeft) 

watch(() => props.buyer, async (newItem) => {
    packingRequestLeft.value = newItem?.packingRequestLeft
})

const onSubmit = async () => {
    if (form.value) {
        const { valid } = await form.value?.validate()

        if (valid) {
            let input: UpdateBuyerInput = { id: props.buyer?.id}
            if (packingRequestLeft.value) {
                input = R.assoc('packingRequest', Number(packingRequestLeft.value), input)
            }
            emit('submit', input)
        }
    }
}

</script>