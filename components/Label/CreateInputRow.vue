<template>
    <v-row>
        <v-col cols="12" md="2">
            <v-select label="Chọn kho" hide-details="auto" item-value="id" item-title="name" v-model="localWarehouseID"
                :items="props.warehouses" persistent-hint
                @update:modelValue="emitUpdate('warehouseID', localWarehouseID)"></v-select>
        </v-col>
        <v-col cols="12" md="2">
            <v-select label="Chọn Đại lí" hide-details="auto" item-value="id" item-title="name" v-model="localAgentID"
                :items="props.agents" persistent-hint
                @update:modelValue="emitUpdate('agentID', localAgentID)"></v-select>
        </v-col>
        <v-col cols="12" md="2">
            <LabelCustomerSearchInput v-model="localCustomerID"
                @update:modelValue="emitUpdate('customerID', localCustomerID)" />
        </v-col>
        <v-col cols="12" md="2">
            <v-autocomplete label="Mã sản phẩm" v-model="localLabelProductName" :loading="isLoadingLabelProducts"
                :items="labelProducts" item-value="name" item-title="name" v-model:search="labelProductSearchString"
                clearable :error-messages="labelFilterError" :rules="[validators.required('Mã sản phẩm')]"
                @update:modelValue="handleLabelProductChange">
                <template v-slot:no-data>
                    <v-list-item @click="addNewProduct">
                        <v-list-item-content>
                            <v-list-item-title>
                                Thêm sản phẩm mới: "{{ labelProductSearchString }}"
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-autocomplete>
        </v-col>
        <v-col cols="12" md="2">
            <v-text-field v-model="localReference" label="Mã liên quan" placeholder="Nhập mã liên quan"
                @update:modelValue="emitUpdate('reference', localReference)"></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
            <v-text-field v-model="localQuantity" label="Số lượng" placeholder="Nhập số lượng"
                @update:modelValue="emitUpdate('quantity', localQuantity)"></v-text-field>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue';
import { LabelProductOutput } from '~~/composables/useAPIs/labelProducts';

interface Props {
    warehouses: any[]; 
    agents: any[];
    warehouseID: string;
    agentID: string;
    customerID: string;
    labelProductID?: string;
    labelProductName: string;
    reference?: string;
    quantity: number;
}

const props = defineProps<Props>();
const emit = defineEmits(['update']);

const localWarehouseID = ref(props.warehouseID);
const localAgentID = ref(props.agentID);
const localCustomerID = ref(props.customerID);
const localLabelProductID = ref(props.labelProductID);
const localLabelProductName = ref(props.labelProductName);
const localReference = ref(props.reference);
const localQuantity = ref(props.quantity);

const validators = useValidators();
const isLoadingLabelProducts = ref(false);
const labelProducts = ref<LabelProductOutput[]>([]);
const labelFilterError = ref<string[]>([]);
const labelProductSearchString = ref("");

const emitUpdate = (key: string, value: any) => {
    emit('update', { [key]: value });
};

const queryLabelProducts = async (term: string) => {
    isLoadingLabelProducts.value = true;

    const { labelProductAPI } = useAPIs();
    labelFilterError.value = [];
    try {
        labelProducts.value = await labelProductAPI.getLabelProductList(term);
    } catch (error) {
        labelFilterError.value = [`${error}`];
    } finally {
        isLoadingLabelProducts.value = false;
    }
};

const addNewProduct = () => {
    const newProductName = labelProductSearchString.value;
    const newProduct = {
        name: newProductName
    };

    labelProducts.value.push(newProduct);
    localLabelProductName.value = newProductName;
    handleLabelProductChange(newProductName)
};

watch(() => labelProductSearchString.value, (newValue) => queryLabelProducts(newValue), { immediate: true });

const handleLabelProductChange = (value: string) => {
    console.log('Selected value:', value);
    localLabelProductName.value = value;
    const selectedProduct = labelProducts.value.find(
        product => product.name.toLowerCase() === value.toLowerCase()
    );
    console.log(selectedProduct);
    if (selectedProduct) {
        localLabelProductID.value = selectedProduct.id;
    } else {
        localLabelProductID.value = undefined;
    }
    emitUpdate('labelProductID', localLabelProductID.value);
    emitUpdate('labelProductName', localLabelProductName.value);
};
</script>
