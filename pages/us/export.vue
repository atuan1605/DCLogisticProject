<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="6">
                <v-card>
                    <v-form ref="deliForm" @submit.prevent="onExportDeliCSV">
                        <v-card-title>
                            Xuất File Deli
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row dense>
                                    <v-col cols="12" md="6">
                                        <v-text-field v-model="deliCSVInput.fromDate" label="Từ ngày" type="date"
                                            :rules="[
                        validators.required('Ngày')
                    ]" />
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field v-model="deliCSVInput.toDate" label="Đến ngày" type="date" :rules="[
                        validators.required('Ngày')
                    ]" />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-select label="Trạng thái" :items="selectableStatuses"
                                            v-model="deliCSVInput.targetStatus" :rules="[
                        validators.required('Trạng thái')
                    ]" />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-select label="Đại lí" :items="authStore.agents"
                                            v-model="deliCSVInput.agentCode" clearable />
                                    </v-col>
                                    <v-col cols="12">
                                        <v-select label="Kho" :items="userStore.warehouses" item-title="name"
                                            item-value="id" v-model="deliCSVInput.warehouseID" clearable />
                                    </v-col>
                                </v-row>
                                <p>File sẽ xuất theo timeZone: {{ timeZone }}</p>
                                <v-btn class="tw-mt-4" :loading="isExportingDeliCSV" block type="submit"
                                    color="accent">Xuất
                                    file</v-btn>
                            </v-container>
                        </v-card-text>
                    </v-form>

                </v-card>
            </v-col>
            <v-col cols="12" md="6">
                <v-card>
                    <v-form ref="shipmentForm" @submit.prevent="onExportShipmentCSV">
                        <v-card-title>
                            Xuất File Đóng Thùng theo chuyến bay
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row dense>
                                    <v-col cols="12">
                                        <v-autocomplete label="Chuyến bay" v-model="shipmentCSVInput.shipmentIDs"
                                            :loading="isLoadingShipments" :items="shipments" item-value="id"
                                            item-title="shipmentCode" v-model:search="shipmentSearchString" multiple
                                            clearable :error-messages="shipmentFilterError" :rules="[
                        validators.required('Chuyến bay')
                    ]" />
                                    </v-col>
                                </v-row>
                                <p>File sẽ xuất theo timeZone: {{ timeZone }}</p>
                                <v-btn class="tw-mt-4" :loading="isExportingShipmentCSV" block type="submit"
                                    color="accent">Xuất
                                    file</v-btn>
                            </v-container>
                        </v-card-text>
                    </v-form>
                </v-card>
            </v-col>
            <v-col cols="12" md="6">
                <v-card>
                    <v-form ref="lotForm" @submit.prevent="onExportLotCSV">
                        <v-card-title>
                            Xuất File Đóng Thùng theo lô
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row dense>
                                    <v-col cols="12">
                                        <v-autocomplete label="Lô" v-model="lotCSVInput.lotIDs" :loading="isLoadingLots"
                                            :items="lots" item-value="id" item-title="lotIndex"
                                            v-model:search="lotSearchString" multiple clearable
                                            :error-messages="lotFilterError" :rules="[
                        validators.required('Lô')
                    ]" />
                                    </v-col>
                                </v-row>
                                <p>File sẽ xuất theo timeZone: {{ timeZone }}</p>
                                <v-btn class="tw-mt-4" :loading="isExportingLotCSV" block type="submit"
                                    color="accent">Xuất
                                    file</v-btn>
                            </v-container>
                        </v-card-text>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from 'dayjs';
import { VForm } from 'vuetify/components'
import { GetDeliCSVExportInput, GetShipmentCSVExportInput, GetLotCSVExportInput } from '~~/composables/useAPIs/trackings';
import { saveAs } from 'file-saver'
import { ShipmentOuput } from '~~/composables/useAPIs/shipments';
import { LotOuput } from '~~/composables/useAPIs/lots';

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

const timeZone = ref<string>("America/Los_Angeles")

const authStore = useAuth()
useAsyncData(() => authStore.getAgents())
const userStore = useUser()
useAsyncData(() => userStore.loadWarehouses())
// Export Deli CSV
const selectableStatuses = [{
    title: 'Deli US',
    value: 'receivedAtUSWarehouse'
}, {
    title: 'Repacked',
    value: 'repacked'
}, {
    title: 'Đang bay về',
    value: 'flyingBack'
}, {
    title: 'Deli VN',
    value: 'receivedAtVNWarehouse'
}]

const deliCSVInput = ref<GetDeliCSVExportInput>({
    fromDate: dayjs().format('YYYY-MM-DD'),
    toDate: dayjs().format('YYYY-MM-DD'),
    targetStatus: 'receivedAtUSWarehouse',
    timeZone: timeZone.value
})
const validators = useValidators()

const deliForm = ref<VForm | null>(null)
const isExportingDeliCSV = ref(false)

const onExportDeliCSV = async () => {
    if (deliForm.value) {
        const { valid } = await deliForm.value.validate()

        if (!valid) {
            return
        }

        isExportingDeliCSV.value = true
        const { trackingItemsAPI } = useAPIs()
        const app = useApp()

        try {
            const csvFile = await trackingItemsAPI.getDeliCSV(deliCSVInput.value)
            const data = csvFile
            const type = 'text/csv'
            const newBlob = new Blob([data], { type })
            const fileName = `deli-${dayjs().format('YYYY-MM-DD')}.csv`
            saveAs(newBlob, fileName)
        } catch (error) {
            app.addErrorToQueue(`${error}`)
        } finally {
            isExportingDeliCSV.value = false
        }
    }
}

// Export Shipment CSV
const isLoadingShipments = ref(false)
const shipments = ref<ShipmentOuput[]>([])
const shipmentSearchString = ref("")
const shipmentFilterError = ref<string[]>([])
const shipmentForm = ref<VForm | null>(null)

const queryShipments = async (q: string) => {
    isLoadingShipments.value = true

    const { shipmentsAPI } = useAPIs()
    shipmentFilterError.value = []
    try {
        shipments.value = await shipmentsAPI.getShipmentList(q)
    } catch (error) {
        shipmentFilterError.value = [`${error}`]
    } finally {
        isLoadingShipments.value = false
    }
}

watch(() => shipmentSearchString, (newValue) => queryShipments(newValue.value), { immediate: true })
const shipmentCSVInput = ref<GetShipmentCSVExportInput>({
    shipmentIDs: [],
    timeZone: timeZone.value
})

const selectedShipments = computed(() => {
    const ids = shipmentCSVInput.value.shipmentIDs
    return R.filter(x => R.includes(x.id, ids), shipments.value)
})

const isExportingShipmentCSV = ref(false)

const onExportShipmentCSV = async () => {
    if (shipmentForm.value) {
        const { valid } = await shipmentForm.value.validate()

        if (!valid) {
            return
        }

        isExportingShipmentCSV.value = true
        const { trackingItemsAPI } = useAPIs()
        const app = useApp()

        try {
            const csvFile = await trackingItemsAPI.getShipmentCSV(shipmentCSVInput.value)
            const data = csvFile
            const type = 'text/csv'
            const newBlob = new Blob([data], { type })
            const fileName = `shipment-${R.join(', ', R.pluck('shipmentCode', selectedShipments.value))}-${dayjs().format('YYYY-MM-DD')}.csv`
            saveAs(newBlob, fileName)
        } catch (error) {
            app.addErrorToQueue(`${error}`)
        } finally {
            isExportingShipmentCSV.value = false
        }
    }
}

// Export Lot CSV
const isLoadingLots = ref(false)
const lots = ref<LotOuput[]>([])
const lotSearchString = ref("")
const lotFilterError = ref<string[]>([])
const lotForm = ref<VForm | null>(null)

const queryLots = async (q: string) => {
    isLoadingLots.value = true

    const { lotsAPI } = useAPIs()
    lotFilterError.value = []
    try {
        lots.value = await lotsAPI.getLotList(q)
    } catch (error) {
        lotFilterError.value = [`${error}`]
    } finally {
        isLoadingLots.value = false
    }
}

watch(() => lotSearchString, (newValue) => queryLots(newValue.value), { immediate: true })
const lotCSVInput = ref<GetLotCSVExportInput>({
    lotIDs: [],
    timeZone: timeZone.value
})

const selectedLots = computed(() => {
    const ids = lotCSVInput.value.lotIDs
    return R.filter(x => R.includes(x.id, ids), lots.value)
})

const isExportingLotCSV = ref(false)

const onExportLotCSV = async () => {
    if (lotForm.value) {
        const { valid } = await lotForm.value.validate()

        if (!valid) {
            return
        }

        isExportingLotCSV.value = true
        const { trackingItemsAPI } = useAPIs()
        const app = useApp()

        try {
            const csvFile = await trackingItemsAPI.getLotCSV(lotCSVInput.value)
            const data = csvFile
            const type = 'text/csv'
            const newBlob = new Blob([data], { type })
            const fileName = `lot-${R.join(', ', R.pluck('lotIndex', selectedLots.value))}-${dayjs().format('YYYY-MM-DD')}.csv`
            saveAs(newBlob, fileName)
        } catch (error) {
            app.addErrorToQueue(`${error}`)
        } finally {
            isExportingLotCSV.value = false
        }
    }
}

</script>