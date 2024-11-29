<template>
    <v-container>
        <v-card>
            <v-card-title>
                Đăng ký mã tracking
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="onSearch" ref="form">
                    <v-text-field v-model="trackingNumber" label="Điền tracking number" :rules="[
                        formValidators.required('tracking number')
                    ]" />
                    <v-btn :loading="isSearching" type="submit" block color="accent">Search</v-btn>
                </v-form>
            </v-card-text>
        </v-card>
        <ConfirmDialog :loading="isSearching" :model-value="showConfirmModal"
            :content="'Chưa tồn tại mã tracking này trong hệ thống. Bạn có muốn đăng ký mã tracking này không?'"
            @submit="onRegisterTracking" @update:model-value="value => showConfirmModal = value" />
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
const showConfirmModal = ref(false)
const app = useApp()
const { trackingItemsAPI } = useAPIs()

const onSearch = async () => {
    if (isSearching.value) {
        return
    }

    if (!form.value) { return }
    const { valid } = await form.value.validate()

    if (!valid) { return }

    try {
        isSearching.value = true
        const trackingItem = await trackingItemsAPI.find(trackingNumber.value)

        if (R.has('trackingID', trackingItem)) {
            app.addSuccessToQueue('Tìm thấy mã trên hệ thống')
            const trackingID = trackingItem.trackingID
            await navigateTo(`/trackingItems/${trackingID}`)
        } else {
            showConfirmModal.value = true
        }
    } catch (e) {
        app.addErrorToQueue(`Lỗi: ${e}`)
    } finally {
        isSearching.value = false
    }

}

const onRegisterTracking = async () => {
    const tracking = await trackingItemsAPI.registerTrackingItem({ trackingNumber: trackingNumber.value })
    app.addSuccessToQueue('Đăng ký thành công')
    showConfirmModal.value = false
    const trackingID = tracking.id
    await navigateTo(`/trackingItems/${trackingID}`)
}
</script>