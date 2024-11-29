<template>
    <v-card class="px-10 py-5 mt-3">
        <v-row>
            <v-col cols="12" md="4">
                <v-select label="Chọn kho" hide-details="auto" item-value="id" item-title="name"
                    v-model="labelStore.warehouseIDInput" :items="receivedAtUSStore.warehouses"
                    persistent-hint></v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-select label="Chọn Đại lí" hide-details="auto" item-value="id" item-title="name"
                    v-model="labelStore.agentIDInput" :items="authStore.agents" persistent-hint></v-select>
            </v-col>
            <v-col cols="12" md="4" class="tw-flex tw-items-center tw-justify-between">
                <v-btn color="secondary" @click="onReset">
                    Reset
                </v-btn>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="createLabels">
                    Tạo
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
                    <th class="tw-py-3 ">Đã in</th>
                    <th class="tw-py-3 ">Sản phẩm</th>
                    <th class="tw-py-3 ">Số lượng</th>
                    <th class="tw-py-3 ">Tracking</th>
                    <th class="tw-py-3 ">Thao tác</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="labelStore.isUnscannedLoading">
                    <td colspan="9" class="tw-py-8 text-center">
                        <v-progress-circular class="tw-mx-auto" indeterminate />
                    </td>
                </tr>
                <tr v-else-if="R.isEmpty(labelStore.currentUnscanedPage?.items || [])">
                    <td colspan="9" class="tw-py-8 tw-text-center">
                        No data.
                    </td>
                </tr>
                <template v-else>
                    <template v-for="(item, index) in labelStore.currentUnscanedPage?.items || []" :key="item.id">
                        <tr class="tw-hover:bg-accent/25">
                            <td width="50"> {{ ((labelStore.unscannedPage || 1) - 1) * (labelStore.unscannedPer || 1) +
                                (index + 1)
                                }}
                            </td>
                            <td class="tw-py-3 tw-cursor-pointer" v-text="item.reference || ''" />
                            <td class="tw-py-3 tw-cursor-pointer" v-text="item.warehouseName" />
                            <td class="tw-py-3 tw-cursor-pointer" v-text="item.customerCode" />
                            <td class="tw-py-3 tw-cursor-pointer" @click="copyTrackingNumber(item)"
                                v-text="item.trackingNumber" />
                            <td class="tw-py-3 tw-cursor-pointer">
                                {{ R.has('printedAt')(item)
                                    ? convertToLocalTime(R.propOr('', 'printedAt', item))
                                    : '' }}
                            </td>
                            <td class="tw-py-3 tw-cursor-pointer" v-text="item.productName" />
                            <td class="tw-py-3 tw-cursor-pointer" v-text="item.quantity" />
                            <td>
                                <canvas :id="'barcode-' + item.id"></canvas>
                            </td>
                            <td>
                                <div class="tw-flex tw-gap-2">
                                    <v-btn v-if="R.isNil(item.superLabelID)" color="secondary"
                                        @click="createSubLabels(item)">Thêm</v-btn>
                                    <v-btn color="primary" @click="onPrintItem(item)">In</v-btn>
                                    <v-btn @click="showConfirmDeleteItem(item)">Xoá</v-btn>

                                </div>
                            </td>
                        </tr>
                        <template v-if="!R.isEmpty(item.subLabels) || !R.isNil(item.subLabels)">
                            <tr v-for="subLabel in item.subLabels || []" :key="subLabel.id">
                                <td></td>
                                <td class="tw-py-3 tw-cursor-pointer" v-text="subLabel.reference || ''" />
                                <td class="tw-py-3 tw-cursor-pointer" v-text="subLabel.warehouseName" />
                                <td class="tw-py-3 tw-cursor-pointer" v-text="subLabel.customerCode" />
                                <td class="tw-py-3 tw-cursor-pointer" @click="copyTrackingNumber(subLabel)"
                                    v-text="subLabel.trackingNumber" />
                                <td class="tw-py-3 tw-cursor-pointer">
                                    {{ R.has('printedAt')(item)
                                        ? convertToLocalTime(R.propOr('', 'printedAt', item))
                                        : '' }}
                                </td>
                                <td class="tw-py-3 tw-cursor-pointer" v-text="subLabel.productName" />
                                <td class="tw-py-3 tw-cursor-pointer" v-text="subLabel.quantity" />
                                <td>
                                    <canvas :id="'barcode-' + subLabel.id"></canvas>
                                </td>
                                <td>
                                    <div class="tw-flex tw-gap-2">
                                        <v-btn color="primary" @click="onPrintItem(subLabel)">In</v-btn>
                                        <v-btn @click="showConfirmDeleteItem(subLabel)">Xoá</v-btn>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </template>
                </template>
            </tbody>
        </v-table>
        <v-row class="mt-2">
            <v-spacer />
            <v-col cols="4" class="tw-flex tw-justify-end">
                <v-pagination v-model="labelStore.unscannedPage" :length="labelStore.totalNumberOfPage?.toString()"
                    :total-visible="7" :disabled="labelStore.isUnscannedLoading"></v-pagination>
            </v-col>
            <v-col cols="1">
                <v-select :items="perOptions" v-model="labelStore.unscannedPer" hide-details />
            </v-col>
        </v-row>
    </v-card>
    <LabelCreateDialog v-model="showCreateLabel" :warehouses="receivedAtUSStore.warehouses" :agents="authStore.agents"
        @create-labels="updateBarcode" />
    <LabelCreateSubLabel v-model="showCreateSubLabels" :create-labels="updateBarcode" :label="targetLabel" />
    <ConfirmDialog :loading="labelStore.isDeleting" :model-value="isDeletedItem"
        :content="`Bạn chắn chắn muốn xoá label này?`" @submit="onDeleteItem()"
        @update:modelValue="value => isDeletedItem = value" />
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { nextTick } from 'vue';
import html2canvas from 'html2canvas';
import { LabelOutput } from '~~/composables/useAPIs/labels';

const { convertToLocalTime } = useLocalTime();
const receivedAtUSStore = useReceivedAtUS()
const authStore = useAuth()
const labelStore = useLabel()
await useAsyncData('agents', () => authStore.getAgents())
await useAsyncData('warehouses', () => receivedAtUSStore.loadWarehouses())
const perOptions = ref([100, 150, 200, 250])
watch([() => labelStore.unscannedPage, () => labelStore.unscannedPer], async ([newPage, newPer]) => {
    if (labelStore.unscannedPage != newPage) {
        labelStore.unscannedPage = newPage || 1
    }
    if (labelStore.unscannedPer != newPer) {
        labelStore.unscannedPer = newPer || 100
    }
    await labelStore.getUnscannedLabel()
})
const showCreateLabel = ref(false)
const createLabels = () => {
    showCreateLabel.value = true
}
const showCreateSubLabels = ref(false)
const targetLabel = ref<LabelOutput | undefined>(undefined)
const createSubLabels = (item: LabelOutput) => {
    targetLabel.value = item
    showCreateSubLabels.value = true
}

onMounted(async () => {
    await labelStore.getUnscannedLabel();
    await nextTick();
    labelStore.generateBarcodes()
});

const updateBarcode = async () => {
    await nextTick();
    labelStore.generateBarcodes()
}

const onReset = async () => {
    labelStore.agentIDInput = null
    labelStore.warehouseIDInput = null
    labelStore.unscannedPage = 1
    labelStore.unscannedPer = 100
    await labelStore.getUnscannedLabel();
    await nextTick();
    labelStore.generateBarcodes()
}

watch([() => labelStore.agentIDInput, () => labelStore.warehouseIDInput], async ([newAgentID, newWarehouseID]) => {
    if (newAgentID || newWarehouseID) {
        await labelStore.getUnscannedLabel()
        await nextTick();
        labelStore.generateBarcodes();
    }
})

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
const deletedItem = ref<LabelOutput | undefined>(undefined)
const isDeletedItem = ref(false)
const showConfirmDeleteItem = (item: LabelOutput) => {
    deletedItem.value = item
    isDeletedItem.value = true
}

const onDeleteItem = async () => {
    if (R.isNil(deletedItem.value)) { return }
    await labelStore.deleteLabel(deletedItem.value)
    deletedItem.value = undefined
    isDeletedItem.value = false
}
const printedItemIDs = ref<string[]>([])

const onPrintItem = async (label: LabelOutput) => {
    const isSuperLabel = R.isNil(label.superLabelID)
    const id = label.id
    if (isSuperLabel) {
        const item = labelStore.currentUnscanedPage?.items.find(item => item.id === id);
        if (!item) return;
        if (!R.isEmpty(item.subLabels) && !R.isNil(item.subLabels)) {
            printedItemIDs.value = item.subLabels.map(x => x.id)
        } else {
            printedItemIDs.value = [id]
        }
    } else {
        printedItemIDs.value = [id]
    }
    await labelStore.printLabel(id)
    printBarcode()
}
const printBarcode = async () => {
    if (R.isEmpty(printedItemIDs.value)) { return }
    await nextTick();

    const printWindow = window.open('', '', 'height=500,width=800');
    if (printWindow) {
        printWindow.document.open();
        printWindow.document.write('<html><head><title>Print Barcodes</title></head><body style="display: flex; flex-direction: column; align-items: center;">');

        for (const itemId of printedItemIDs.value) {
            const canvas = document.getElementById(`barcode-${itemId}`) as HTMLCanvasElement;
            if (canvas) {
                const canvasImage = await html2canvas(canvas, { useCORS: true });
                const dataUrl = canvasImage.toDataURL('image/png');
                printWindow.document.write(`<img src="${dataUrl}" style="width: 100%;" />`);
            } else {
                console.error(`Canvas with ID barcode-${itemId} not found.`);
            }
        }
        printedItemIDs.value = []
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
};




</script>