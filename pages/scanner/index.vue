<template>
    <v-container>
        <v-form @submit.prevent="onSearch" ref="form">
            <v-text-field v-model="trackingNumber" label="Điền tracking number" :rules="[
                formValidators.required('tracking number')
            ]" />
            <v-btn :loading="isSearching" type="submit" block color="accent">Search</v-btn>
        </v-form>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
definePageMeta({
    middleware: ['authenticated']
})

const isSearching = ref(false)
const trackingNumber = ref('')
const form = ref<VForm | null>(null)
const formValidators = useValidators()
const onSearch = async () => {
    if (isSearching.value) {
        return
    }

    if (!form.value) { return }
    const { valid } = await form.value.validate()

    if (!valid) { return }

    const app = useApp()
    try {
        isSearching.value = true
        const { trackingItemsAPI } = useAPIs()
        const trackingItem = await trackingItemsAPI.find(trackingNumber.value)

        if (R.has('trackingID', trackingItem)) {
            app.addSuccessToQueue('Tìm thấy mã trên hệ thống')
            const trackingID = trackingItem.trackingID
            await navigateTo(`/trackingItems/${trackingID}`)
        } else {
            app.addErrorToQueue('Không tìm thấy mã trên hệ thống')
        }
    } catch (e) {
        app.addErrorToQueue(`Lỗi: ${e}`)
    } finally {
        isSearching.value = false
    }

}

</script>