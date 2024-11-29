<template>
    <v-card class="px-10 py-5 mt-3">
        <v-row>
            <v-col cols="12" md="4">
                <v-select label="Chọn kho" hide-details="auto" item-value="id" item-title="name"
                    v-model="labelStore.warehouseScannedIDInput" :items="receivedAtUSStore.warehouses"
                    persistent-hint></v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-select label="Chọn Đại lí" hide-details="auto" item-value="id" item-title="name"
                    v-model="labelStore.agentScannedIDInput" :items="authStore.agents" persistent-hint></v-select>
            </v-col>
            <v-col cols="12" md="4" class="tw-flex tw-items-center tw-justify-between">
                <v-btn color="secondary" @click="onReset">
                    Reset
                </v-btn>
            </v-col>
        </v-row>
        <v-table fixed-header :height="'calc(100vh - 330px)'">
            <thead>
                <tr class="tw-border-b tw-border-black tw-border-solid">
                    <th class="tw-py-3 ">STT</th>
                    <th class="tw-py-3 ">Mã liên quan</th>
                    <th class="tw-py-3 ">Kho</th>
                    <th class="tw-py-3 ">Mã khách hàng</th>
                    <th class="tw-py-3 ">Mã tracking</th>
                    <th class="tw-py-3 ">Sản phẩm</th>
                    <th class="tw-py-3 ">Số lượng</th>
                    <th class="text-center">Thông tin</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="labelStore.isLoadingScanned">
                    <td colspan="8" class="tw-py-8 text-center">
                        <v-progress-circular class="tw-mx-auto" indeterminate />
                    </td>
                </tr>
                <tr v-else-if="R.isEmpty(labelStore.currentScannedPage?.items || [])">
                    <td colspan="8" class="tw-py-8 tw-text-center">
                        No data.
                    </td>
                </tr>
                <template v-else>
                    <tr class="tw-hover:bg-accent/25"
                        v-for="(item, index) in labelStore.currentScannedPage?.items || []" :key="item.id">
                        <td width="50"> {{ ((labelStore.scannedPage || 1) - 1) * (labelStore.scannedPer || 1) +
                            (index + 1)
                            }}
                        </td>
                        <td width="150" class="tw-py-3 tw-cursor-pointer" v-text="item.reference || 'Chưa có'" />
                        <td width="100" class="tw-py-3 tw-cursor-pointer" v-text="item.warehouseName" />
                        <td width="100" class="tw-py-3 tw-cursor-pointer" v-text="item.customerCode" />
                        <td width="250" class="tw-py-3 tw-cursor-pointer" @click="copyTrackingNumber(item)"
                            v-text="item.trackingNumber" />
                        <td width="150" class="tw-py-3 tw-cursor-pointer" v-text="item.productName" />
                        <td width="150" class="tw-py-3 tw-cursor-pointer" v-text="item.quantity" />
                        <td>
                            <LabelTrackingInfo :item="item" />
                        </td>
                    </tr>
                </template>
            </tbody>
        </v-table>
        <v-row class="mt-2">
            <v-spacer />
            <v-col cols="4" class="tw-flex tw-justify-end">
                <v-pagination v-model="labelStore.scannedPage" :length="labelStore.totalNumberOfScannedPage?.toString()"
                    :total-visible="7" :disabled="labelStore.isLoadingScanned"></v-pagination>
            </v-col>
            <v-col cols="1">
                <v-select :items="perOptions" v-model="labelStore.scannedPer" hide-details />
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { LabelOutput } from '~~/composables/useAPIs/labels';
const labelStore = useLabel()
const perOptions = ref([100, 150, 200, 250])
const receivedAtUSStore = useReceivedAtUS()
const authStore = useAuth()
await useAsyncData('agents', () => authStore.getAgents())
await useAsyncData('warehouses', () => receivedAtUSStore.loadWarehouses())

onMounted(async () => {
    await labelStore.getScannedLabels();
});

watch([() => labelStore.warehouseScannedIDInput, () => labelStore.agentScannedIDInput], async ([newAgentID, newWarehouseID]) => {
    if (newAgentID || newWarehouseID) {
        await labelStore.getScannedLabels()
    }
})

const onReset = async () => {
    labelStore.agentScannedIDInput = null
    labelStore.warehouseScannedIDInput = null
    labelStore.scannedPage = 1
    labelStore.scannedPer = 100
    await labelStore.getScannedLabels();
}
const app = useApp()
const copyTrackingNumber = (item: LabelOutput) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(item.simplifiedTrackingNumber)
            .then(() => {
                app.addSuccessToQueue("Copied")
            })
            .catch(err => {
                console.error('Failed to copy tracking number: ', err);
            });
    }
}
</script>