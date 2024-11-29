<template>
    <v-container>
        <div class="tw-font-bold tw-text-2xl tw-my-4 tw-underline">Các chuyến đang chờ xử lý</div>
        <v-row>
            <v-col v-if="shipmentStore.isLoadingProcesingShipments">
                <div class="tw-bg-transparent tw-h-[200px] tw-flex tw-items-center tw-justify-center">
                    <v-progress-circular indeterminate class="tw-h-8 tw-w-8" />
                </div>
            </v-col>
            <v-col v-else-if="R.isEmpty(shipmentStore.processingShipments)">
                <p>Không có chuyến nào chưa được xử lý</p>
            </v-col>
            <template v-else>
                <v-col v-for="shipment in shipmentStore.processingShipments" :id="shipment.id" sm="4" md="auto">
                    <v-card elevation="5" rounded="lg" class="tw-cursor-pointer pa-3"
                        @click="onNavigateToShipmentDetails(shipment.id)">
                        <v-card-title>
                            <h1 class="tw-font-bold tw-text-4xl">{{ shipment.shipmentCode }}</h1>
                        </v-card-title>
                        <v-card-subtitle>
                            Bay về ngày: {{ dayjs(shipment.commitedAt).format('DD/MM/YYYY') }}
                        </v-card-subtitle>
                        <v-card-text>
                            <div class="tw-flex tw-flex-row tw-items-center tw-justify-between">
                                <div class="tw-font-light tw-text-base">{{ shipment.boxesCount + " thùng" }}</div>
                                <div class="tw-font-light tw-text-base">{{ shipment.trackingitemsCount + " tracking" }}
                                </div>
                            </div>

                        </v-card-text>
                    </v-card>
                </v-col>
            </template>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"
definePageMeta({
    middleware: ['authenticated', 'permission-access']
})
const shipmentStore = useShipment()

onMounted(() => {
    shipmentStore.getProcessingShipments()
    shipmentStore.getDoneShipments()
})

const onNavigateToShipmentDetails = (shipmentID: string) => {
    navigateTo(`/vn/shipments/${shipmentID}`)
}

</script>
