<template>
    <tr :key="props.modelValue.id">
        <td>{{ (props.modelValue.index + 1) || "" }}</td>
        <td>
            <v-checkbox :disabled="!props.modelValue.isSuccess" :model-value="props.modelValue.isSelected"
                hide-details="auto" @update:model-value="onToggleSelected" />
        </td>
        <td @click="moveToTrackingItemDetails(props.modelValue.trackingItemID)">{{ props.modelValue.trackingNumber }}</td>
        <td>
            <v-chip v-if="isLoading">Loading...</v-chip>
            <v-chip v-else-if="props.modelValue.isDeleted" color="error">Đã xoá</v-chip>
            <v-chip v-else-if="!props.modelValue.isSuccess" color="error">Nhập thất bại</v-chip>
            <v-chip v-else color="success">Nhập thành công</v-chip>
        </td>
        <td>{{ props.modelValue.agentCode }}</td>
        <td>
            <v-btn @click="$emit('remove')" v-if="props.modelValue.trackingItemID && !props.modelValue.isDeleted"
                prepend-icon="mdi-delete" color="red" size="small">Xóa</v-btn>
        </td>
    </tr>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { CreateTrackingAtUSInput } from '~~/composables/useAPIs/trackings'
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
    isDeleted?: boolean
    isLoading: boolean
}

interface Props {
    modelValue: QueueItem
}

const props = defineProps<Props>()
const emits = defineEmits(['update:modelValue', 'remove'])
const isLoading = ref(false)
const app = useApp()
const apis = useAPIs()

onMounted(async () => {
    try {
        isLoading.value = true
        const input: CreateTrackingAtUSInput = {
            trackingNumber: props.modelValue.trackingNumber,
            agentCode: props.modelValue.agentCode,
            warehouseID: props.modelValue.warehouseID
        }
        isLoading.value = false
        const newTrackingItem = await apis.trackingItemsAPI.createTrackingAtUS(input)
        emits('update:modelValue', {
            ...props.modelValue,
            trackingItemID: newTrackingItem.id,
            isSuccess: true,
            error: undefined,
            isLoading: false
        })
        app.addSuccessToQueue(`Thêm tracking ${newTrackingItem.trackingNumber} thành công!`)
    } catch (error) {
        app.addErrorToQueue(`${error}`, 4000)
        emits('update:modelValue', {
            ...props.modelValue,
            isSuccess: false,
            error,
            isLoading: false
        })
        isLoading.value = false
    }
})

const onToggleSelected = (newValue: boolean) => {
    if (props.modelValue.isSelected && !newValue) {
        emits('update:modelValue', {
            ...props.modelValue,
            isSelected: newValue
        })
    } else if (!R.or(props.modelValue.isSelected, false) && newValue) {
        emits('update:modelValue', {
            ...props.modelValue,
            isSelected: newValue
        })
    }
}
const moveToTrackingItemDetails = (id?: string) => {
    if (!R.isNil(id)) {
        navigateTo({
            path: `/trackingItems/${id}`
        })
    }

}

</script>
