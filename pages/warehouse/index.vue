<template>
    <v-container fluid>
        <v-card>
            <WarehouseSearch @show-create-warehouse="showDialogCreateWarehouse"
                :searchInput="useWarehouseStore.searchInput" @reset="refreshData" @search="searchWarehouse" />
        </v-card>
        <div style="text-align: center;" v-if="useWarehouseStore.isLoading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
            <v-table class="tw-mt-4" fixed-header :height="'calc(100vh - 200px)'">
                <thead>
                    <tr class="tw-border-b tw-border-black tw-border-solid">
                        <th width="50">STT</th>
                        <th class="">Tên kho</th>
                        <th class="">Địa chỉ</th>
                        <th class="">Ngày tạo</th>
                        <th class="">Trạng thái</th>
                        <th class="">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="R.isEmpty(useWarehouseStore.warehouses || [])">
                        <td colspan="5" class="tw-py-8 tw-text-center">
                            No data.
                        </td>
                    </tr>
                    <template v-else>
                        <tr class="tw-hover:bg-accent/25"
                            v-for="(warehouse, index) in useWarehouseStore.warehouses || []" :key="warehouse.id">
                            <td width="50"> {{ index + 1 }}
                            </td>
                            <td class="tw-py-3" v-text="warehouse.name || 'Chưa có'" />
                            <td class="tw-py-3" v-text="warehouse.address || 'Chưa xác định'" />
                            <td class="tw-py-3">
                                {{ $formatUTCToLocalTime(warehouse.createdAt) }}
                            </td>
                            <td class="tw-py-3">
                                <template v-if="R.isNil(warehouse.inactiveAt)">
                                    <span class="tw-text-green-500">Đang hoạt động</span>
                                </template>
                                <template v-else>
                                    <span class="tw-text-red-500">Ngưng hoạt động</span>
                                </template>
                            </td>
                            <td>
                                <template v-if="R.isNil(warehouse.inactiveAt)">
                                    <v-btn color="primary" @click="onUpdateWarehouse(warehouse)">
                                        Đóng kho
                                    </v-btn>
                                </template>
                                <template v-else>
                                    <v-btn color="accent" @click="onUpdateWarehouse(warehouse)">
                                        Kích hoạt
                                    </v-btn>
                                </template>

                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>

            <WarehouseCreateDialog v-model="isShowCreateWarehouseDialog" @created="onCreate" />
            <template v-if="!R.isNil(targetWarehouse)">
                <ConfirmDialog :loading="useWarehouseStore.isUpdating" :model-value="showConfirmModal"
                    :content="`${R.isNil(targetWarehouse.inactiveAt) ? 'Xác nhận thay đổi trạng thái của kho sang ngưng hoạt động?' : 'Bạn có muốn kích hoạt kho không?'}`"
                    @submit="submitUpdateWarehouse" @update:modelValue="value => showConfirmModal = value" />
            </template>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import warehouses, { WarehouseOutput } from '~~/composables/useAPIs/warehouses'

definePageMeta({
    middleware: ['authenticated']
})

const useWarehouseStore = useWarehouse()
const isShowCreateWarehouseDialog = ref(false)
const showConfirmModal = ref(false)
const targetWarehouse = ref<WarehouseOutput | undefined>(undefined)
const showDialogCreateWarehouse = () => {
    isShowCreateWarehouseDialog.value = true
    console.log(isShowCreateWarehouseDialog.value)
}
const searchWarehouse = () => {
    useWarehouseStore.getAllWarehouses()
}
const refreshData = () => {
    useWarehouseStore.getAllWarehouses()
}
const onCreate = () => {
    isShowCreateWarehouseDialog.value = false
}
const onUpdateWarehouse = (warehouse: WarehouseOutput) => {
    targetWarehouse.value = warehouse
    showConfirmModal.value = true
}
const submitUpdateWarehouse = () => {
    if (R.isNil(targetWarehouse.value)) { return }
    useWarehouseStore.updateWarehouses(targetWarehouse.value.id, R.isNil(targetWarehouse.value.inactiveAt))
    targetWarehouse.value = undefined
    showConfirmModal.value = false
}
useAsyncData(() => useWarehouseStore.getAllWarehouses())
</script>