<template>
    <div class="tw-pa-4">
        <StreamBarcodeReader @loaded="onLoaded" @decode="onDecode" />

        <div class="tw-mt-4 tw-flex tw-items-center tw-justify-space-between">
            <p>Scanner result: {{ searchValue }}</p>
            <v-progress-circular class="tw-mx-auto" v-if="isSearching" />
        </div>
    </div>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { StreamBarcodeReader } from "vue-barcode-reader";

const isSearching = ref(false)
const searchValue = ref('N/A')
const onLoaded = () => {
    console.log('loaded')
}

const onDecode = (result) => {
    console.log('decoded', result)
    const app = useApp()
    searchValue.value = result
    isSearching.value = true
    const { trackingItemsAPI } = useAPIs()
    trackingItemsAPI.findPartial(result)
        .then((trackingItem) => {
            if (R.has('trackingID', trackingItem)) {
                app.addSuccessToQueue('Tìm thấy mã trên hệ thống')
                const trackingID = trackingItem.trackingID
                return navigateTo(`/trackingItems/${trackingID}`)
            } else {
                app.addErrorToQueue('Không tìm thấy mã trên hệ thống')
            }
        }).catch(error => {
            app.addErrorToQueue(`Lỗi: ${e}`)
        }).finally(() => {
            isSearching.value = false
        })
}
</script>