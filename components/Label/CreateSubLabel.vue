<template>
    <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" width="500" max-height="500"
        @update:modelValue="emits('update:modelValue')">
        <v-card class="px-5 py-5">
            <VForm @submit.prevent="onSubmitForm" ref="form">
                <v-row class="tw-relative">
                    <v-col cols="12" md="6">
                        <p class="text-h6">Thêm mã tracking phụ (Còn lại: {{ remainingQuantity }})</p>
                    </v-col>
                    <v-col :loading="labelStore.isCreatingLabel" cols="12" md="6" class="tw-flex tw-justify-end">
                        <v-btn color="primary" icon="mdi-plus" @click="addNewLabel">
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row v-for="(input, index) in newSubLabelsInput" :key="index">
                    <v-col cols="12" md="1">
                        <p class="tw-flex tw-pt-4">{{ index + 1 }}</p>
                    </v-col>
                    <v-col cols="12" md="9" class="tw-flex tw-items-center tw-justify-center">
                        <v-text-field v-model="input.quantity" placeholder="Nhập Số lượng" :rules="[
        validator.required('Số lượng')
    ]" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col> <v-btn color="primary" icon="mdi-trash-can-outline" @click="removeItem(index)">
                        </v-btn></v-col>
                </v-row>
                <div class="tw-flex tw-flex-row tw-gap-3 tw-justify-end tw-mt-3">
                    <v-btn :loading="labelStore.isCreatingSubLabels" @click="emits('update:modelValue', false)"> Huỷ
                    </v-btn>
                    <v-btn :loading="labelStore.isCreatingSubLabels" color="primary" @click="onSubmitForm"> Xác nhận
                    </v-btn>
                </div>
            </VForm>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { CreateSubLabelInput, LabelOutput } from '~~/composables/useAPIs/labels';
import { VForm } from 'vuetify/components';

const emits = defineEmits(["createLabels"])
interface Props {
    modelValue: boolean
    label: LabelOutput | undefined
}
const validator = useValidators()
const labelStore = useLabel()
const props = defineProps<Props>()
const { modelValue } = toRefs(props)
const newSubLabelsInput = ref<CreateSubLabelInput[]>([
    {
        quantity: 0
    },
])
const addNewLabel = () => {
    newSubLabelsInput.value.push({
        quantity: 0
    })
}
const remainingQuantity = computed(() => {
    if (props.label) {
        const subLabelsQuantity = R.sum(R.pluck('quantity', props.label.subLabels || []));
        const totalQuantity = R.sum(R.pluck('quantity', newSubLabelsInput.value));
        return props.label.quantity - (totalQuantity + subLabelsQuantity)
    }
    return 0;
});

const removeItem = (index: number) => {
    newSubLabelsInput.value = R.remove(index, 1, newSubLabelsInput.value);
}

const onSubmitForm = async() => {
    newSubLabelsInput.value = newSubLabelsInput.value.map(labelInput => ({
        ...labelInput,
        quantity: parseInt(labelInput.quantity as unknown as string, 10)
    }));
    if (props.label) {
        await labelStore.createSubLabels({ subItems: newSubLabelsInput.value }, props.label.id);
        await nextTick();
        labelStore.generateBarcodes()
    }
    emits('createLabels')
    emits('update:modelValue', false)
}
</script>