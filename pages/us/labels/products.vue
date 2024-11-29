<template>
    <v-card class="px-10 py-5 mt-3">
        <v-row>
            <v-col class="tw-flex tw-items-center tw-justify-end">
                <v-btn color="primary" @click="onShowCreateAndEditLabelProduct()" prepend-icon="mdi-plus">
                    Thêm mới
                </v-btn>
            </v-col>
        </v-row>
        <v-table fixed-header :height="'calc(100vh - 330px)'">
            <thead>
                <tr class="tw-border-b tw-border-black tw-border-solid">
                    <th class="tw-py-3 ">STT</th>
                    <th class="tw-py-3 ">Code</th>
                    <th class="tw-py-3 text-center ">Sản phẩm</th>
                    <th class="text-center">Ngày sửa</th>
                    <th class="tw-py-3 tw-w-20">Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="labelProductStore.isLoading">
                    <td colspan="5" class="tw-py-8 text-center">
                        <v-progress-circular class="tw-mx-auto" indeterminate />
                    </td>
                </tr>
                <tr v-else-if="R.isEmpty(labelProductStore.items || [])">
                    <td colspan="5" class="tw-py-8 tw-text-center">
                        No data.
                    </td>
                </tr>
                <template v-else>
                    <tr class="tw-hover:bg-accent/25" v-for="(item, index) in labelProductStore.items || []"
                        :key="item.id">
                        <td> {{ (index + 1) }}
                        </td>
                        <td class="tw-py-3 tw-cursor-pointer" v-text="item.code" />
                        <td class="tw-py-3 tw-cursor-pointer tw-text-center" v-text="item.name" />
                        <td class="tw-py-3 tw-cursor-pointer tw-text-center"
                            v-text="dayjs(item.updatedAt).format('DD-MM-YYYY HH:mm:ss') || 'Chưa có'" />
                        <td>
                            <div class="tw-flex tw-gap-2">
                                <v-btn color="primary" @click="onShowCreateAndEditLabelProduct(item.id, item.name)">Sửa</v-btn>
                                <v-btn @click="showConfirmDeleteItem(item.id)">Xoá</v-btn>
                            </div>
                        </td>
                    </tr>
                </template>
            </tbody>
        </v-table>
        <v-dialog v-model="showCreateAndEditLabelProductDialog" max-width="500">
            <v-card>
                <v-card-title class="tw-h5">
                    {{ isCreateItem ? "Tạo sản phẩm" : "Sửa sản phẩm"}}
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="nameInput" placeholder="Nhập tên sản phẩm" :rules="[
                    validator.required('Tên sản phẩm')
                ]" variant="outlined"></v-text-field>
                </v-card-text>
                <div class="tw-flex tw-justify-end tw-gap-4 tw-p-4">
                    <v-btn color="secondary" @click="showCreateAndEditLabelProductDialog = false">Huỷ</v-btn>
                    <v-btn color="primary" @click="createAndEditProduct">Xác nhận</v-btn>
                </div>
            </v-card>
        </v-dialog>
    </v-card>
    <ConfirmDialog :loading="labelProductStore.isDeleting" :model-value="isDeletedItem"
        :content="`Bạn chắn chắn muốn xoá sản phẩm này?`" @submit="onDeleteItem()"
        @update:modelValue="value => isDeletedItem = value" />
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from 'dayjs';
import { LabelOutput } from '~~/composables/useAPIs/labels';

const labelProductStore = useLabelProduct()
const validator = useValidators()
useAsyncData(() => labelProductStore.getAllLabelProducts())
const showConfirmDelete = ref(false)
const showCreateAndEditLabelProductDialog = ref(false)
const targetUpdateLabelProductID = ref<string | undefined>(undefined)
const nameInput = ref("")
const isCreateItem = ref(false)
const onShowCreateAndEditLabelProduct = (id?: string, name?: string) => {
    if (!R.isNil(id) && !R.isNil(name)) {
        nameInput.value = name
        targetUpdateLabelProductID.value = id
        isCreateItem.value = false
    } else {
        nameInput.value = ""
        isCreateItem.value = true
        targetUpdateLabelProductID.value = undefined
    }
    showCreateAndEditLabelProductDialog.value = true
}
const createAndEditProduct = async() => {
    if (!R.isNil(targetUpdateLabelProductID.value)) {
        await labelProductStore.updateProductLabel(nameInput.value, targetUpdateLabelProductID.value).then(() => {
            showCreateAndEditLabelProductDialog.value = false
            nameInput.value = ""
            targetUpdateLabelProductID.value = undefined
        })
    } else {
        await labelProductStore.createProductLabel(nameInput.value).then(() => {
            showCreateAndEditLabelProductDialog.value = false
            nameInput.value = ""
        })
    }
}
const deletedItemID = ref<string | undefined>(undefined)
const isDeletedItem = ref(false)
const showConfirmDeleteItem = (id?: string) => {
    deletedItemID.value = id
    isDeletedItem.value = true
}
const onDeleteItem = async () => {
    if (R.isNil(deletedItemID.value)) { return }
    await labelProductStore.deleteLabelProduct(deletedItemID.value)
    deletedItemID.value = undefined
    isDeletedItem.value = false
}
</script>