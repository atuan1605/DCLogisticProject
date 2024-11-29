<template>
    <v-card id="abc" minHeight="250" :loading="pending">
        <TrackingItemEditPage @formSubmit="onFormSubmit" />
    </v-card>
</template>

<script setup lang="ts">
const trackingItemStore = useTracking()
const route = useRoute()
const shipmentStore = useShipment()
const apis = useAPIs()
const app = useApp()
const trackingID: string = route.params.trackingItemID as string

const { pending, error, refresh } = await useAsyncData('trackingItem', () => trackingItemStore.loadTrackingItem(trackingID))

const onFormSubmit = async () => {
    if (trackingID) {
        const shipmentID: string = route.params.shipmentID as string
        const nextItemID = shipmentStore.getNextItemID(trackingID)

        if (nextItemID) {
            await navigateTo({
                path: `/vn/shipments/${shipmentID}/${nextItemID}`,
                query: route.query
            })
        } else {
            await app.addErrorToQueue(`Không còn mã tracking nào trong thùng đã scan và chưa có đủ thông tin.`)
        }
    }
}
</script>