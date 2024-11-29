<template>
    <v-timeline density="compact" side="end" align="start">
        <v-timeline-item v-for="(item, index) in props.timelineItems" :key="index" :dot-color="actionColor(item.action)"
            size="small">
            <div class="d-flex">
                <strong class="mr-4">{{ $formatUTCToLocalTime(item.createdAt) }}</strong>
                <div>
                    <strong>{{ item.username }} - {{ actionType(item.action) }}</strong>
                    <div class="text-caption">
                        {{ actionContent(item.action) }}
                    </div>
                </div>
            </div>
        </v-timeline-item>
    </v-timeline>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { ActionLoggerType, CustomerFeedback, TrackingItemTimeLineOutput } from '~~/composables/useAPIs/trackings';

export interface Props {
    timelineItems: TrackingItemTimeLineOutput[]
}

const props = withDefaults(defineProps<Props>(), {
    timelineItems: [] as TrackingItemTimeLineOutput[]
})

const actionType = (item: ActionLoggerType) => {
    if (R.has('assignCustomers', item)) {
        return 'Update khách hàng'
    }
    if (R.has('assignTrackingItemStatus', item)) {
        return "Update trạng thái"
    }
    if (R.has('assignTrackingItemCustomerCode', item)) {
        return "Update mã khách hàng"
    }
    if (R.has('assignTrackingItemAgentCode', item)) {
        return "Update mã đại lí"
    }
    if (R.has('assignTrackingItemDescription', item)) {
        return "Update note"
    }
    if (R.has('assignTrackingItemFiles', item)) {
        return "Update ảnh"
    }
    if (R.has('assignBox', item)) {
        return "Update thùng"
    }
    if (R.has('assignChain', item)) {
        return "Update chuỗi"
    }
    if (R.has('assignProducts', item)) {
        return "Update danh sách sản phẩm"
    }
    if (R.has('assignProductImages', item)) {
        return "Update ảnh sản phẩm"
    }
    if (R.has('assignProductQuantity', item)) {
        return "Update số lượng trên sản phẩm"
    }
    if (R.has('assignProductDescription', item)) {
        return "Update note trên sản phẩm"
    }
    if (R.has('assignTrackingNumberBrokenProductDescription', item)) {
        return "Update note sản phẩm bị hỏng"
    }
    if (R.has('assignTrackingNumberBrokenProductCustomerFeedback', item)) {
        return "Update liên hệ với khách hàng"
    }
    if (R.has('assignReturnRequest', item)) {
        return "Update trả hàng/ đóng hàng"
    }
    if (R.has('switchTrackingToAnotherWarehouse', item)) {
        return "Chuyển kho"
    }
    return '???'
}

const actionContent = (item: ActionLoggerType) => {
    if (R.has('assignCustomers', item)) {
        const customerCodes = String(R.path(['assignCustomers', 'customerCodes'], item))
        if (!R.isEmpty(customerCodes)) {
            return `Update khách hàng: ${customerCodes}`
        }
        return 'Bỏ mã khách hàng'
    }
    if (R.has('assignReturnRequest', item)) {
        const isReturn = Boolean(R.path(['assignReturnRequest', 'isReturn'], item))
        if (isReturn) {
            return "Trả hàng"
        }
        return "Đóng hàng"
    }
    if (R.has('assignTrackingItemStatus', item)) {
        return `Status mới: ${R.path(['assignTrackingItemStatus', 'status'], item)}`
    }
    if (R.has('assignTrackingItemCustomerCode', item)) {
        return `Mã khách hàng mới: ${R.path(['assignTrackingItemCustomerCode', 'customerCode'], item)}`
    }
    if (R.has('assignTrackingItemAgentCode', item)) {
        return `Mã đại lí mới: ${R.path(['assignTrackingItemAgentCode', 'agentCode'], item)}`
    }
    if (R.has('assignTrackingItemDescription', item)) {
        return `Note mới: ${R.path(['assignTrackingItemDescription', 'itemDescription'], item)}`
    }
    if (R.has('assignTrackingItemFiles', item)) {
        return `Ảnh mới: ${R.path(['assignTrackingItemFiles', 'files'], item)}`
    }
    if (R.has('assignBox', item)) {
        return `Box mới: ${R.path(['assignBox', 'boxID'], item)}`
    }
    if (R.has('assignChain', item)) {
        return `Chuỗi mới: ${R.path(['assignChain', 'chain'], item)}`
    }
    if (R.has('assignProducts', item)) {
        return `Danh sách sản phẩm: ${R.length(R.pathOr([], ['assignProducts', 'productIDs'], item))}`
    }
    if (R.has('assignProductImages', item)) {
        return `Sản phẩm: ${R.path(['assignProductImages', 'productID'], item)}, danh sách ảnh: ${R.path(['assignProductImages', 'images'], item)}`
    }
    if (R.has('assignProductQuantity', item)) {
        return `Sản phẩm: ${R.path(['assignProductQuantity', 'productID'], item)}, số lượng: ${R.path(['assignProductQuantity', 'quantity'], item)}`
    }
    if (R.has('assignProductDescription', item)) {
        return `Sản phẩm: ${R.path(['assignProductDescription', 'productID'], item)}, note: ${R.path(['assignProductDescription', 'productDescription'], item)}`
    }
    if (R.has('switchTrackingToAnotherWarehouse', item)) {
        return `Kho đi: ${R.pathOr('Unknown', ['switchTrackingToAnotherWarehouse', 'sourceWarehouseName'], item)}, Kho đến: ${R.pathOr('Unknown',['switchTrackingToAnotherWarehouse', 'destinationWarehouseName'], item)}`
    }
    if (R.has('assignTrackingNumberBrokenProductDescription', item)) {
        return `${R.path(['assignTrackingNumberBrokenProductDescription', 'brokenProductDescription'], item)}`
    }
    if (R.has('assignTrackingNumberBrokenProductCustomerFeedback', item)) {
        const value = R.path(['assignTrackingNumberBrokenProductCustomerFeedback', 'brokenProductCustomerFeedback'], item)
        const feedbackOptions = [
            { title: 'Chưa liên hệ', value: CustomerFeedback.none },
            { title: 'Trả hàng', value: CustomerFeedback.returnProduct },
            { title: 'Tiếp tục đóng hàng', value: CustomerFeedback.continueDelivering }
        ]
        const index = R.findIndex(R.propEq('value', value), feedbackOptions)
        return `Trạng thái: ${feedbackOptions[index].title}`
    }
    return '???'
}

const actionColor = (item: ActionLoggerType) => {
    if (R.has('assignTrackingItemStatus', item)) {
        return `primary`
    }

    return 'accent'
}

</script>