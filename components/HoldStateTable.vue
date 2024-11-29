<template>
    <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
        <v-table fixed-header :height="'calc(100vh - 510px)'">
            <thead>
                <tr class="tw-border-b tw-border-black tw-border-solid">
                    <th class="tw-py-3 ">STT</th>
                    <th class="tw-py-3 ">Tracking Number</th>
                    <template v-if="R.isNil(filterInput) ">
                        <th class="tw-py-3 ">Ngày yêu cầu</th>
                        <th class="tw-py-3 ">Nhân viên yêu cầu</th>
                    </template>
                    <template v-else>
                        <th class="tw-py-3 ">Ngày xử lí</th>
                    </template>
                    <th class="tw-py-3 ">Mã Khách hàng</th>
                    <th class="tw-py-3 ">Nội dung</th>
                    <template v-if="R.equals(HoldState.holding, filterInput)">
                        <th class="tw-py-3 ">Trạng thái</th>
                        <th class="tw-py-3 ">Thao tác</th>
                    </template>
                    <template v-else>
                        <th class="tw-py-3 ">Trạng thái</th>
                    </template>
                </tr>
            </thead>
            <tbody>
                <tr v-if="returnItemStore.isLoading">
                    <td colspan="5" class="tw-py-8 text-center">
                        <v-progress-circular class="tw-mx-auto" indeterminate />
                    </td>

                </tr>
                <tr v-else-if="R.isEmpty(returnItemStore.currentPage?.items || [])">
                    <td colspan="5" class="tw-py-8 tw-text-center">
                        No data.
                    </td>
                </tr>
                <template v-else>
                    <tr class="tw-hover:bg-accent/25" v-for="(item, index) in returnItemStore.currentPage?.items || []"
                        :key="item.id">
                        <td width="50"> {{ ((returnItemStore.page || 1) - 1) * (returnItemStore.per || 1) +
                            (index + 1)
                            }}
                        </td>
                        <td class="tw-py-3 tw-cursor-pointer" v-text="item.trackingNumber || 'Chưa có'" />
                        <template v-if="R.isNil(filterInput) ">
                            <td class="tw-py-3 tw-cursor-pointer"
                                v-text="dayjs.utc(item.returnRequestAt).format('DD-MM-YYYY HH:mm:ss') || 'Chưa có'" />
                            <td class="tw-py-3 tw-cursor-pointer" v-text="item.updatedBy || 'Chưa có'" />
                        </template>
                        <template v-else>
                            <td class="tw-py-3 tw-cursor-pointer"
                                v-text="dayjs.utc(item.holdStateAt).format('DD-MM-YYYY HH:mm:ss') || 'Chưa có'" />
                        </template>
                        <td class="tw-py-3 tw-cursor-pointer" v-text="item.customerCode || 'Chưa có'" />
                        <td class="tw-py-3 ">
                            <template v-if="R.isNil(item.holdRequestContent)">
                                {{ "[Hold/Đóng hàng] Khách yêu cầu hold" }}
                            </template>
                            <template v-else>
                                {{ "[YCĐB] " + item.holdRequestContent }}
                            </template>
                        </td>
                        <template v-if="R.equals(HoldState.holding, filterInput)">
                            <td v-if="!R.isNil(item.holdState)">
                                <v-select class="tw-mt-4" v-model="item.holdState" :items="holdStates"
                                    item-title="title" item-value="value" placeholder="Chuyển trạng thái"></v-select>
                            </td>
                            <td v-else>
                                Chờ xác nhận hold
                            </td>
                            <td>
                                <v-btn @click="updateReturnItems(item)" v-if="!R.isNil(item.holdState)"
                                    :loading="returnItemStore.isUpdating" color="primary">
                                    Cập nhật
                                </v-btn>
                            </td>
                        </template>
                        <template v-else>
                            <td v-if="R.isNil(item.holdState)">
                                Chờ xác nhận hold
                            </td>
                            <td v-else>
                                {{ item.holdState }}
                            </td>
                        </template>
                    </tr>
                </template>
            </tbody>
        </v-table>
        <v-row class="mt-2">
            <v-spacer />
            <v-col cols="4" class="tw-flex tw-justify-end">
                <v-pagination v-model="returnItemStore.targetPage"
                    :length="returnItemStore.totalNumberOfPage?.toString()" :total-visible="7"
                    :disabled="returnItemStore.isLoading"></v-pagination>
            </v-col>
            <v-col cols="1">
                <v-select :items="perOptions" v-model="returnItemStore.targetPer" hide-details />
            </v-col>
        </v-row>
    </v-card>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from 'dayjs';
import { HoldState, ReturnedTrackingItemOutput } from '~~/composables/useAPIs/returnedItems';

const returnItemStore = useReturnedItems()
interface Props {
    filterInput: HoldState
}

const props = withDefaults(defineProps<Props>(), {
})

const holdStates = [
    { title: "Return", value: HoldState.returnProduct },
    { title: "Cho bay về", value: HoldState.continueDelivering }
]
const perOptions = ref([100, 150, 200, 250])
watch([() => returnItemStore.targetPage, () => returnItemStore.targetPer], async ([newPage, newPer]) => {
    if (returnItemStore.targetPage != newPage) {
        returnItemStore.targetPage = newPage || 1
    }
    if (returnItemStore.targetPer != newPer) {
        returnItemStore.targetPer = newPer || 100
    }
    await returnItemStore.getReturnedItems(props.filterInput)
})
const updateReturnItems = (item: ReturnedTrackingItemOutput) => {
    if (R.isNil(item.holdState)) { return }
    returnItemStore.updateReturnedItem(item.id, item.holdState)
}
</script>