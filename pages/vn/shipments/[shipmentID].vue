<template>
    <PageLoader v-if="pending" />
    <PageError v-else-if="error" :errorMessage="`${error}`" :reload="refresh" />
    <v-container fluid v-else>
        <v-card class="pb-4">
            <v-card-title><span class="tw-text-3xl tw-text-primary">Chuyến bay {{ shipmentStore.shipment?.shipmentCode
            }}</span></v-card-title>
            <v-card-subtitle>
                Bay về ngày: {{ dayjs(shipmentStore.shipment?.commitedAt).format('DD/MM/YYYY') }}<br />
                {{ R.length(shipmentStore?.shipment?.boxes || []) }} thùng - {{ totalItemsTracking()
                }}
                trackings
            </v-card-subtitle>
        </v-card>
        <v-row class="mt-3">
            <v-col cols="12" :md="3">
                <v-card v-if="shipmentStore.activeBox" class="tw-mb-4">
                    <v-card-title>
                        <div class="tw-flex tw-flex-row tw-items-center tw-justify-between">
                            <div>Thùng đang xử lý</div>
                            <v-btn @click="onDismissActiveBox" color="primary" size="small" icon="mdi-close">
                            </v-btn>
                        </div>

                    </v-card-title>
                    <v-card-text>
                        <v-list nav :opened="['a']">
                            <v-list-subheader>{{ dayjs(shipmentStore.activeBox.createdAt).format('DD/MM/YYYY')
                            }}</v-list-subheader>
                            <v-list-group :value="'a'">
                                <template #activator="{ props }">
                                    <v-list-item v-bind="props">
                                        <v-list-item-title>Thùng {{ shipmentStore.activeBox.name }}</v-list-item-title>
                                        <v-list-item-subtitle>{{
                                            R.has(shipmentStore.activeBox.id, shipmentStore.shipmentUnboxTotals) ?
                                            `${R.prop(shipmentStore.activeBox.id, shipmentStore.shipmentUnboxTotals)} / ` :
                                            `` }}{{ shipmentStore.activeBox.trackingCount }}
                                            trackings</v-list-item-subtitle>
                                        <template #prepend>
                                            <v-list-item-action
                                                v-if="R.has(shipmentStore.activeBox.id!, shipmentStore.isLoadingBoxItems)">
                                                <v-progress-circular indeterminate />
                                            </v-list-item-action>
                                            <v-icon v-else icon="mdi-package-variant-closed"></v-icon>
                                        </template>
                                        <template #append>
                                            <v-btn icon size="small" flat
                                                @click.stop="() => onDownloadCSV(shipmentStore.activeBox!.id!, shipmentStore.activeBox!.name)"
                                                :loading="R.has(shipmentStore.activeBox.id!, isDownloadingBox)">
                                                <v-icon size="small" icon="mdi-download" />
                                            </v-btn>
                                        </template>
                                    </v-list-item>
                                </template>
                                <v-list-item
                                    v-for="tracking in (shipmentStore.boxes[shipmentStore.activeBox!.id!]?.trackingItems || [])"
                                    :to="{
                                        path: `/vn/shipments/${shipmentStore.shipment?.id}/${tracking.trackingID}`,
                                        query: route.query
                                    }" nuxt>
                                    <template #prepend>
                                        <v-icon :color="colorForItem(tracking)" icon="mdi-barcode-scan" />
                                    </template>
                                    <v-list-item-title :class="`${textColorForItem(tracking)}`">{{
                                        `${tracking.trackingNumber} (${tracking.information})` }}</v-list-item-title>
                                </v-list-item>
                            </v-list-group>
                        </v-list>
                    </v-card-text>
                </v-card>
                <v-card minHeight="250">
                    <v-card-title>Danh sách thùng</v-card-title>
                    <v-card-text>
                        <v-list nav>
                            <template v-for="group in R.keys(shipmentStore.groupedBoxesWithoutActive)">
                                <v-list-subheader>{{ dayjs(group).format('DD/MM/YYYY') }}</v-list-subheader>
                                <v-list-item v-for="box in R.prop(group, shipmentStore.groupedBoxesWithoutActive)"
                                    @click="() => onBoxClicked(box)" :key="R.prop('id', box)">
                                    <v-list-item-title>Thùng {{ box.name }}</v-list-item-title>
                                    <v-list-item-subtitle>Đại lí: {{ R.join(', ', R.keys(box.totalAgentCode))
                                    }} - {{ R.has(box.id, shipmentStore.shipmentUnboxTotals) ? `${R.prop(box.id,
    shipmentStore.shipmentUnboxTotals)} / ` : `` }}{{ box.trackingCount }}
                                        trackings</v-list-item-subtitle>
                                    <template #prepend>
                                        <v-list-item-action v-if="R.has(box.id!, shipmentStore.isLoadingBoxItems)">
                                            <v-progress-circular indeterminate />
                                        </v-list-item-action>
                                        <v-icon v-else icon="mdi-package-variant-closed"></v-icon>
                                    </template>
                                    <template #append>
                                        <v-btn icon size="small" flat @click.stop="() => onDownloadCSV(box.id!, box.name)"
                                            :loading="R.has(box.id!, isDownloadingBox)">
                                            <v-icon size="small" icon="mdi-download" />
                                        </v-btn>
                                    </template>
                                </v-list-item>
                            </template>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="9">
                <v-card class="px-5 py-5" v-if="!R.isNil(shipmentStore.activeBox)">
                    <v-row>
                        <v-col cols="12" md="6">
                            <span class="tw-text-primary">Scan mã tracking tại tại đây.
                            </span>
                            <v-text-field hide-details="auto" v-model="trackingNumberInput" @keyup.enter="showDialog"
                                placeholder="Nhập mã tracking" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col class="mt-9" cols="12" md="4" v-if="isUnboxing">
                            <v-progress-circular indeterminate color="primary"></v-progress-circular>
                        </v-col>
                    </v-row>
                </v-card>
                <NuxtPage v-if="route.params.trackingItemID" :key="route.params.trackingItemID" />
            </v-col>
        </v-row>
        <PieceList v-model="isShowDialog" @submit="onSubmitForm" :tracking-i-d="trackingItemID"
            :tracking-number="trackingNumberInput"></PieceList>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from 'dayjs'
import { ShipmentBoxListOutput } from '~~/composables/useAPIs/shipments';
import { TrackingItemOutput } from '~~/composables/useAPIs/trackings';
import { saveAs } from 'file-saver'
import { ItemTrackingInput, TrackingItemPiecesInBoxOutput } from '~~/composables/useAPIs/lots';

definePageMeta({
    middleware: ['authenticated']
})

const shipmentStore = useShipment()
const route = useRoute()
const apis = useAPIs()
const app = useApp()
const isUnboxing = ref(false)
const trackingNumberInput = ref()
const isShowDialog = ref(false)
const trackingItemID = ref("")
const trackingStore = useTracking()


const onSubmitForm = async (input: ItemTrackingInput) => {
    isUnboxing.value = true
    try {
        let listTrackings = shipmentStore.boxes[shipmentStore.activeBox!.id!]?.trackingItems;
        const { trackingID } = await apis.trackingItemsAPI.findPartial(trackingNumberInput.value)

        if (R.isNil(trackingID)) {
            app.addErrorToQueue('Tracking không hợp lệ', 3000)
            throw new Error('Tracking không hợp lệ')
        }
        const pieceID = input.trackingItemPieceID
        if( !R.isNil(pieceID)) {
            await apis.shipmentsAPI.unBoxTrackingItemsAtVN(trackingID, pieceID)
        }

        if (R.isNil(shipmentStore.activeBox)) return
        if (!R.isNil(shipmentStore.boxes[shipmentStore.activeBox!.id!]?.trackingItems) && !R.isEmpty(shipmentStore.boxes[shipmentStore.activeBox!.id!]?.trackingItems)) {
            const newTrackingUnbox = await apis.trackingItemsAPI.getTrackingItem(trackingID)
            listTrackings = R.reject(R.propEq('trackingID', trackingID), listTrackings)
            shipmentStore.boxes[shipmentStore.activeBox.id].trackingItems = R.insert(0, newTrackingUnbox, listTrackings)
        }
        await navigateTo({
            path: `/vn/shipments/${shipmentStore.shipment?.id}/${trackingID}`,
            query: route.query
        })
        app.addSuccessToQueue(`Scan thành công!`)
        await refresh()
    } catch (e) {
        app.addErrorToQueue(`${error}`, 4000)
    } finally {
        trackingNumberInput.value = null
        isUnboxing.value = false
        isShowDialog.value = false
    }

}

const totalItemsTracking = () => {
    let totalTracking = 0
    if (R.isNil(shipmentStore.shipment)) return 0;
    if (R.isEmpty(shipmentStore.shipment.boxes)) return 0;
    const countTrackingFn = (box) => { totalTracking = totalTracking + Number(box.trackingItemsCount || 0) }
    R.forEach(countTrackingFn, shipmentStore.shipment.boxes)
    return totalTracking
}

const showDialog = async () => {
    try {
        let { trackingID } = await apis.trackingItemsAPI.find(trackingNumberInput.value)

        trackingItemID.value = trackingID as string
        if (!R.isNil(shipmentStore.activeBox)) {
            await trackingStore.getPiecesAtVN(trackingItemID.value, shipmentStore.activeBox?.id)
        }

        if (R.length(trackingStore.pieceListAtVN) == 1) {
            let input: ItemTrackingInput = {
                trackingItemID: trackingItemID.value,
                trackingItemPieceID: trackingStore.pieceListAtVN[0].id
            }
            onSubmitForm(input)
        } else if (R.length(trackingStore.pieceListAtVN) > 1) {
            isShowDialog.value = true
        } else {
            return
        }
    } catch (e) {
        app.addErrorToQueue(`${error}`)
    }
    
}

const shipmentID: string = route.params.shipmentID as string

const { pending, error, refresh } = await useAsyncData('shipment', () => {
    const route = useRoute()
    if (R.has('activeBoxID', route.query)) {
        shipmentStore.setActiveBoxID(route.query.activeBoxID as string)
    } else {
        shipmentStore.setActiveBoxID(undefined)
    }
    shipmentStore.getShipment(shipmentID)
    return Promise.resolve(1)
})

const onBoxClicked = async (box: ShipmentBoxListOutput) => {
    if (R.equals(box.id, shipmentStore.activeBoxID)) {
        return
    }

    await navigateTo({
        path: `/vn/shipments/${shipmentStore.shipment?.id}`,
        query: R.assoc('activeBoxID', box.id, route.query)
    })
    shipmentStore.setActiveBoxID(box.id)
    shipmentStore.loadItemsInBox(box.id)
}

const onDismissActiveBox = async () => {
    await navigateTo({
        path: `/vn/shipments/${shipmentStore.shipment?.id}`,
        query: R.dissoc('activeBoxID', route.query)
    })
    shipmentStore.setActiveBoxID(undefined)
}

const refreshBoxes = async () => {
    const boxIDs = R.keys(shipmentStore.boxes)

    boxIDs.forEach(boxID => {
        if (boxID !== shipmentStore.activeBoxID) {
            return
        }
        shipmentStore.loadItemsInBox(boxID, true).then(() => {
            // console.log(`refreshed ${boxID}`)
        })
    })
}


const colorForItem = (item: TrackingItemPiecesInBoxOutput) => {
    const isItemReceivedAtVN = R.has('receivedAtVNAt', item)

    if (isItemReceivedAtVN) {
        const doesItemHaveInfo = R.has('agentCode', item) && R.has('customerCode', item)
        return doesItemHaveInfo ? '#66BB6A' : '#FFCA28'
    }

    return '#000'
}

const textColorForItem = (item: TrackingItemPiecesInBoxOutput) => {
    const isItemReceivedAtVN = R.has('receivedAtVNAt', item)

    if (isItemReceivedAtVN) {
        const doesItemHaveInfo = R.has('agentCode', item) && R.has('customerCode', item)
        return doesItemHaveInfo ? 'tw-text-[#66BB6A]' : 'tw-text-[#FFCA28]'
    }

    return 'text-[#000]'
}

const isDownloadingBox = ref<Record<string, boolean>>({})

const onDownloadCSV = async (boxID: string, boxName: string) => {
    if (R.isNil(shipmentStore.shipment)) {
        return
    }

    if (R.has(boxID, isDownloadingBox.value)) {
        return
    }

    isDownloadingBox.value = R.assoc(boxID, true, isDownloadingBox.value)
    try {
        const csvFile = await apis.shipmentsAPI.getBoxCSVExport(shipmentStore.shipment.id, boxID)
        const data = csvFile
        const type = 'text/csv'
        const newBlob = new Blob([data], { type })
        const fileName = `${shipmentStore.shipment.shipmentCode}-Thung ${boxName}-${dayjs().format('YYYY-MM-DD')}.csv`
        saveAs(newBlob, fileName)
    } catch (error) {
        app.addErrorToQueue(`${error}`)
    } finally {
        isDownloadingBox.value = R.dissoc(boxID, isDownloadingBox.value)
    }
}
onMounted(() => {
    let timer = setInterval(() => {
        refreshBoxes()
        shipmentStore.refreshUnboxTotals()
    }, 3000)

    return () => {
        clearInterval(timer)
    }
})

</script>