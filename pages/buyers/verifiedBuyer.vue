<template>
    <div class="tw-flex tw-flex-col tw-p-4">
        <v-card-text>DANH SÁCH BUYER ĐÃ ĐƯỢC KÍCH HOẠT</v-card-text>
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
            <v-form @submit.prevent="onSearchTapped">
                <v-card-item>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="Email" v-model="buyerStore.searchInput" placeholder="Nhập email" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field label="Từ ngày" v-model="buyerStore.fromDateInput" placeholder="dd/MM/yyyy"
                                type="date" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field label="Đến ngày" v-model="buyerStore.toDateInput" placeholder="dd/MM/yyyy"
                                type="date" />
                        </v-col>
                    </v-row>
                </v-card-item>

                <v-card-actions class="tw-justify-center tw-space-x-6">
                    <v-btn type="reset" @click="resetQuery" class="tw-w-[150px] tw-text-secondary" color="secondary"
                        variant="outlined" v-if="!buyerStore.isSearching">
                        Reset
                    </v-btn>

                    <v-btn variant="elevated" color="accent" class="tw-w-[150px]" type="submit"
                        :loading="buyerStore.isSearching">Lọc
                        kết
                        quả</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
            <v-table class="tw-mt-4" fixed-header :height="'calc(100vh - 300px)'">
                <thead>
                    <tr class="tw-border-b tw-border-black tw-border-solid">
                        <th class="tw-py-3 tw-text-left">STT</th>
                        <th class="tw-py-3">Username</th>
                        <th class="tw-py-3">Email</th>
                        <th class="tw-py-3">Số điện thoại</th>
                        <th class="tw-py-3">Ngày tạo</th>
                        <th class="tw-py-3">Số lượng yêu cầu đặc biệt</th>
                        <th class="tw-py-3">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="R.isEmpty(buyerStore.currentPage?.items || [])">
                        <td colspan="5" class="tw-py-8 tw-text-center">
                            No data.
                        </td>
                    </tr>
                    <template v-else>
                        <tr class="tw-hover:bg-accent/25" v-for="(buyer, index) in buyerStore.currentPage?.items || []"
                            :key="buyer.id">
                            <td width="50"> {{ ((buyerStore.page || 1) - 1) * (buyerStore.per || 1) + (index + 1) }}
                            </td>
                            <td class="tw-py-3 " v-text="buyer.username || 'Chưa có'" />
                            <td class="tw-py-3 " v-text="buyer.email || 'Chưa xác định'" />
                            <td class="tw-py-3 " v-text="buyer.phoneNumber || 'Chưa có'" />
                            <td class="tw-py-3 ">
                                {{ dayjs(buyer.createdAt).format('DD-MM-YYYY') }}
                            </td>
                            <td class="tw-py-3 tw-text-center" v-text="buyer.packingRequestLeft || 'Chưa có'" />
                            <td>
                                <v-btn color="accent" @click="onEditBuyer(buyer)">
                                    Cập nhật
                                </v-btn>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>

            <div class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-space-x-4 tw-mt-4 tw-m-4"
                v-if="buyerStore.currentPage && (buyerStore.totalNumberOfPage || 0) >= 1">
                <button @click="setPage(buyerStore.targetPage - 1)"
                    v-if="!buyerStore.isSearching && buyerStore.canGoPrevPage">
                    <v-icon>mdi-chevron-left-circle-outline</v-icon>
                </button>

                <div class="tw-p-2 tw-border-2 tw-border-black tw-border-solid tw-rounded-lg">
                    Trang {{ buyerStore.page }} / {{ buyerStore.totalNumberOfPage }}
                </div>

                <button @click="setPage(buyerStore.targetPage + 1)"
                    v-if="!buyerStore.isSearching && buyerStore.canGoNextPage">
                    <v-icon>mdi-chevron-right-circle-outline</v-icon>
                </button>
            </div>
            <BuyerUpdatePackingRequestLeft v-model="isShowingEditBuyer" :buyer="targetBuyer" @submit="onUpdateBuyer"/>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"
import { useBuyerTable } from '~~/composables/useBuyerTable'
import { useVerifiedBuyer } from '~~/composables/useStores/verifiedBuyer'
import { BuyerOutput, UpdateBuyerInput } from '~~/composables/useAPIs/buyers'

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})
const buyerStore = useVerifiedBuyer()
var targetBuyer = ref<BuyerOutput | undefined>(undefined)
const isShowingEditBuyer = ref(false)
const onEditBuyer = (buyer: BuyerOutput) => {
    targetBuyer.value = buyer
    isShowingEditBuyer.value = true
}

const onUpdateBuyer = async (input: UpdateBuyerInput) => {
    const buyerID = targetBuyer.value?.id
    if (!R.isNil(buyerID)) {
        await buyerStore.updateBuyer(input)
    }
    isShowingEditBuyer.value = false
}

const { onSearchTapped, resetQuery, setPage, setPer } = useBuyerTable(buyerStore)
</script>