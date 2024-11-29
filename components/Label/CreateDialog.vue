<template>
    <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" max-height="800"
        @update:modelValue="emits('update:modelValue')">
        <v-card class="px-5 py-5">
            <VForm @submit.prevent="onSubmitForm" ref="form">
                <v-row >
                    <v-col cols="12" md="6">
                        <p class="text-h5"> TẠO LABEL</p>
                    </v-col>
                    <v-col :loading="labelStore.isCreatingLabel" cols="12" md="6" class="tw-flex tw-justify-end">
                        <v-btn color="primary" icon="mdi-plus" @click="addNewLabel">
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row v-for="(input, index) in newLabelsInput" :key="index">
                    <LabelCreateInputRow :warehouses="props.warehouses" :agents="props.agents"
                        :warehouse-i-d="input.warehouseID" :agent-i-d="input.agentID" :customer-i-d="input.customerID"
                        :label-product-i-d="input.labelProductID" :label-product-name="input.labelProductName"
                        :reference="input.reference" :quantity="input.quantity"
                        @update="updateLabelInput(index, $event)" />
                </v-row>
                <div class="tw-flex tw-flex-row tw-gap-3 tw-justify-end tw-mt-3">
                    <v-btn :loading="labelStore.isCreatingLabel" @click="emits('update:modelValue', false)"> Huỷ
                    </v-btn>
                    <v-btn :loading="labelStore.isCreatingLabel" @click="removeLastLabel" color="secondary"> Xoá
                    </v-btn>
                    <v-btn :loading="labelStore.isCreatingLabel" color="primary" @click="onSubmitForm"> Xác nhận
                    </v-btn>
                </div>
            </VForm>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { WarehouseOutput } from '~~/composables/useAPIs/warehouses';
import { CreateLabelInput } from '~~/composables/useAPIs/labels';
import { VForm } from 'vuetify/components';

interface Props {
    modelValue: boolean
    warehouses: WarehouseOutput[]
    agents: string[]
}
const props = defineProps<Props>()
const { modelValue } = toRefs(props)
const newLabelsInput = ref<CreateLabelInput[]>([
    {
        warehouseID: '',
        agentID: '',
        customerID: '',
        labelProductName: '',
        labelProductID: undefined,
        reference: undefined,
        quantity: 1
    },
])
const addNewLabel = () => {
    newLabelsInput.value.push({
        warehouseID: '',
        agentID: '',
        customerID: '',
        labelProductName: '',
        labelProductID: undefined,
        reference: undefined,
        quantity: 1
    })
}
const resetForm = () => {
    newLabelsInput.value = [
        {
            warehouseID: '',
            agentID: '',
            customerID: '',
            labelProductName: '',
            labelProductID: undefined,
            reference: undefined,
            quantity: 1
        },
    ]
}

watch(modelValue, (newValue) => {
    if (!newValue) {
        resetForm()
    }
})
const labelStore = useLabel()
const emits = defineEmits(["createLabels"])

const removeLastLabel = () => {
    if (newLabelsInput.value.length > 1) {
        newLabelsInput.value.pop()
    } 
}
const onSubmitForm =  async() => {
    newLabelsInput.value = newLabelsInput.value.map(labelInput => ({
        ...labelInput,
        quantity: parseInt(labelInput.quantity as unknown as string, 10)
    }));
    labelStore.createLabelsInput.items = newLabelsInput.value
    await labelStore.createMutipleLabels()
    emits('createLabels')
    emits('update:modelValue', false)
    
}
const updateLabelInput = (index: number, updatedFields: Partial<CreateLabelInput>) => {
    Object.assign(newLabelsInput.value[index], updatedFields);
};
</script>