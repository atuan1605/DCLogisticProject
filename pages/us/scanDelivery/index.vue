<template>
    <v-sheet class="tw-p-4" color="transparent">
            <VForm @submit.prevent="onSubmitForm" ref="form">
                <v-row>
                    <v-col cols="12" md="3">
                        <v-select hide-details="auto" v-model="agentCode" :items="authStore.agents" label="Đại lí"
                            persistent-hint></v-select>
                    </v-col>
                    <v-col cols="12" md="3">
                        <v-select hide-details="auto" item-value="id" item-title="name" v-model="warehouseID"
                            :items="receivedAtUSStore.warehouses" persistent-hint></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" md="4">
                        <span class="tw-text-blue">Scan mã tracking tại tại đây.
                        </span>
                        <v-text-field hide-details="auto" v-model="trackingNumber" @keyup.enter="onSubmitForm"
                            placeholder="Nhập mã tracking" variant="outlined"></v-text-field>
                    </v-col>
                    <v-col class="mt-9" cols="12" md="4" v-if="isCreating">
                        <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </v-col>
                </v-row>
            </VForm>
            <v-row>
                <v-col class="tw-text-2xl">
                    Các mã đã scan
                </v-col>
                <v-col cols="auto" v-if="selectedItemCount">
                    <v-btn @click="updateMultipleDialog = true" color="accent">Cập Nhật {{ selectedItemCount }}
                        trackings
                    </v-btn>
                </v-col>
                <v-col cols="auto" v-if="selectedItemCount">
                    <v-btn @click="updateMultipleItems" color="error">Xoá {{ selectedItemCount }}
                        trackings</v-btn>
                </v-col>
            </v-row>
            <v-table>
                <thead>
                    <tr>
                        <th class="text-left">
                            STT
                        </th>
                        <th class="text-left">
                            Chọn
                        </th>
                        <th class="text-left">
                            Mã tracking
                        </th>
                        <th class="text-left">
                            Trạng thái
                        </th>
                        <th class="text-left">
                            Đại lý
                        </th>
                        <th class="text-left">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="item in displayedQueueItems" :key="item.id">
                        <TrackingItemQueueItem :modelValue="item" @update:model-value="onUpdateQueueItem"
                            @remove="showDeleteDialog(item)" />
                    </template>
                </tbody>
            </v-table>
            <DeleteDialog :loading="isRemovingQueueItem" v-model="removeMultipleDialog" @delete="removeMultipleItems" />
            <DeleteDialog :content="`Bạn có chắc muốn xoá tracking ${targetQueueItem?.trackingNumber}?`"
                :loading="isRemovingQueueItem" v-model="removeQueueItemDialog" @delete="removeQueueItem" />
            <AgentList :is-loading="isUpdatingMultiple" :model-value="updateMultipleDialog"
                :agent-i-ds="authStore.agents" :tracking-i-ds="updatedItemIDs" @submit="updateMultipleItems" />
        <audio ref="dingPlayer" class="tw-invisible" preload="auto">
            <source src="~/assets/sounds/ding.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
        <audio ref="errorPlayer" class="tw-invisible" preload="auto">
            <source src="~/assets/sounds/error.mp3" type="audio/mpeg">
            Your browser does not support the audio element.
        </audio>
    </v-sheet>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from 'dayjs'
import { VForm } from 'vuetify/components'
import { v4 as uuidv4 } from 'uuid'
import { UpdateTrackingItemsInput } from '~~/composables/useAPIs/trackings'

interface QueueItem {
    index?: number
    id: string
    trackingItemID?: string
    trackingNumber: string
    isSuccess?: boolean
    error?: string
    timestamp: string
    agentCode?: string
    warehouseID?: string
    isSelected?: boolean
    isLoading: boolean
}

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})
const form = ref<VForm | null>(null)

const authStore = useAuth()
const receivedAtUSStore = useReceivedAtUS()

const isRemovingQueueItem = ref(false)
const removeQueueItemDialog = ref(false)
const dingPlayer = ref()
const errorPlayer = ref()
const currentSuccessIndex = computed(() => {
    return R.length(R.filter((item: QueueItem) => !!item.isSuccess,
        displayedQueueItems.value))
})

const agentCode = ref()
const warehouseID = ref()
const targetQueueItem = ref<QueueItem | undefined>(undefined)
const trackingNumber = ref()
const isCreating = ref(false)
const queue = ref<Record<string, QueueItem>>({})

const displayedQueueItems = computed(() => {
    const items = R.values(queue.value)
    return R.sortWith<QueueItem>([
        R.descend(R.prop('timestamp'))
    ], items)
})

const onUpdateQueueItem = (updated: QueueItem) => {
    const id = updated.id
    if (updated.isSuccess && R.isNil(updated.index)) {
        dingPlayer.value.play()
        queue.value = R.assoc(id, {
            ...updated,
            index: currentSuccessIndex.value
        }, queue.value)
    } else {
        errorPlayer.value.play()
        queue.value = R.assoc(id, updated, queue.value)
    }
}

const app = useApp()
const apis = useAPIs()

const onSubmitForm = async () => {
    if (!form.value) { return }

    if (R.isNil(trackingNumber.value) || trackingNumber.value == "") {
        app.addErrorToQueue(`Vui lòng scan hoặc nhập mã tracking!`)
    }

    const id = uuidv4()
    let pendingItem = R.find(R.propEq('trackingNumber', trackingNumber.value), R.values(queue.value))
    if (pendingItem?.isLoading && !R.isNil(pendingItem)) {
        app.addErrorToQueue(`Tracking đang được xử lý!`)
    } else {
        queue.value = R.assoc(id, {
            id: id,
            trackingNumber: trackingNumber.value,
            timestamp: dayjs().toISOString(),
            agentCode: agentCode.value,
            warehouseID: warehouseID.value,
            isLoading: true
        }, queue.value)
    }

    trackingNumber.value = null
}

const removeQueueItem = async () => {
    if (R.isNil(targetQueueItem.value) || R.isNil(targetQueueItem.value?.trackingItemID)) return

    isRemovingQueueItem.value = true

    try {
        await apis.trackingItemsAPI.deleteTrackingItem(targetQueueItem.value.trackingItemID)
        let queueItem = R.prop(targetQueueItem.value.id, queue.value)
        queueItem = R.dissoc('index', queueItem)
        queueItem = R.assoc('isSuccess', false, queueItem)
        queueItem = R.assoc('isDeleted', true, queueItem)
        queue.value = R.assoc(targetQueueItem.value.id, queueItem, queue.value)
        app.addSuccessToQueue('Xóa tracking thành công!')
    } catch (error) {
        app.addErrorToQueue(`${error}`, 4000)
    } finally {
        isRemovingQueueItem.value = false
        removeQueueItemDialog.value = false
    }
}
const showDeleteDialog = (item: QueueItem) => {
    targetQueueItem.value = item
    removeQueueItemDialog.value = true
}
await useAsyncData('agents', () => authStore.getAgents())
await useAsyncData('warehouses', () => receivedAtUSStore.loadWarehouses())


onMounted(() => {
    if (!R.isNil(authStore.agents) && !R.isEmpty(authStore.agents)) agentCode.value = authStore.agents[0]
    if (!R.isNil(receivedAtUSStore.warehouses) && !R.isEmpty(receivedAtUSStore.warehouses)) warehouseID.value = receivedAtUSStore.warehouses[0].id

    if (dingPlayer.value) {
        console.log('loaded ding player')
        dingPlayer.value.load()
    }

    if (errorPlayer.value) {
        console.log('loaded error player')
        errorPlayer.value.load()
    }
})

const removeMultipleDialog = ref(false)
const isUpdatingMultiple = ref(false)
const updateMultipleDialog = ref(false)
const isRemovingMultiple = ref(false)

const selectedItemIDs = computed(() => {
    const selectedItems = R.filter(
        (item: QueueItem) => !!item.isSelected,
        displayedQueueItems.value
    )

    return R.pluck('id', selectedItems)
})

const updatedItemIDs = computed(() => {
    let targetIDs: string[] = []
    for (const id of selectedItemIDs.value) {
        const item = R.prop(id, queue.value)

        if (R.isNil(item)) continue
        if (R.isNil(item.trackingItemID)) continue
        targetIDs = R.append(item.trackingItemID, targetIDs)
    }
    return targetIDs
})

const selectedItemCount = computed(() => R.length(selectedItemIDs.value))
const updateMultipleItems = async (input: UpdateTrackingItemsInput) => {
    if (selectedItemCount.value === 0) return
    isUpdatingMultiple.value = true
    try {
        await apis.trackingItemsAPI.updateTrackingItems(input)
        for (const id of selectedItemIDs.value) {
            const item = R.prop(id, queue.value)

            if (R.isNil(item)) continue
            queue.value = R.assoc(id, {
                ...item,
                isSelected: false,
                agentCode: input.agentID
            }, queue.value)
        }
        app.addSuccessToQueue('Cập nhật Tracking thành công!')
    } catch (error) {
        app.addErrorToQueue(`${error}`, 4000)
    } finally {
        updateMultipleDialog.value = false
        isUpdatingMultiple.value = false
    }
}
const removeMultipleItems = async () => {
    if (selectedItemCount.value === 0) return

    isRemovingMultiple.value = true

    try {
        for (const id of selectedItemIDs.value) {
            const item = R.prop(id, queue.value)

            if (R.isNil(item)) continue
            if (R.isNil(item.trackingItemID)) continue
            await apis.trackingItemsAPI.deleteTrackingItem(item.trackingItemID)
            queue.value = R.dissoc(id, queue.value)
        }
        app.addSuccessToQueue('Xóa tracking thành công!')
    } catch (error) {
        app.addErrorToQueue(`${error}`, 4000)
    } finally {
        isRemovingMultiple.value = false
        removeMultipleDialog.value = false
    }
}
</script>
