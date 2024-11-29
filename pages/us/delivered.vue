<template>
    <div class="tw-flex tw-flex-col tw-p-4">
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
            <v-form @submit.prevent="onSearchTapped">
                <v-card-item>
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="Mã tracking/khách hàng" v-model="deliveredStore.searchInput"
                                placeholder="Nhập mã tracking/khách hàng" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field label="Từ ngày" v-model="deliveredStore.fromDateInput" placeholder="dd/MM/yyyy"
                                type="date" />
                        </v-col>
                        <v-col cols="12" md="3">
                            <v-text-field label="Đến ngày" v-model="deliveredStore.toDateInput" placeholder="dd/MM/yyyy"
                                type="date" />
                        </v-col>
                    </v-row>
                </v-card-item>

                <v-card-actions class="tw-justify-center tw-space-x-6">
                    <v-btn type="reset" @click="resetQuery" class="tw-w-[150px] tw-text-secondary" color="secondary"
                        variant="outlined" v-if="!deliveredStore.isSearching">
                        Reset
                    </v-btn>

                    <v-btn variant="elevated" color="accent" class="tw-w-[150px]" type="submit"
                        :loading="deliveredStore.isSearching">Lọc
                        kết
                        quả</v-btn>
                </v-card-actions>
            </v-form>
        </v-card>
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
            <v-table class="tw-max-h-[500px]" fixedHeader>
                <thead>
                    <tr class="tw-border-b tw-border-black tw-border-solid">
                        <th class="tw-py-3 tw-text-left">Mã Tracking</th>
                        <th class="tw-py-3">Mã đại lí</th>
                        <th class="tw-py-3">Mã khách hàng</th>
                        <th class="tw-py-3">Ngày</th>
                        <th class="tw-py-3">Giờ</th>
                        <th class="tw-py-3">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="R.isEmpty(deliveredStore.currentPage?.items || [])">
                        <td colspan="5" class="tw-py-8 tw-text-center">
                            No data.
                        </td>
                    </tr>
                    <template v-else>
                        <tr @dblclick="goToItem(item)" class="tw-hover:bg-accent/25 tw-cursor-pointer"
                            v-for="item in deliveredStore.currentPage?.items || []" :key="item.id">
                            <td class="tw-py-3" v-text="item.trackingNumber" />
                            <td class="tw-py-3 tw-text-center" v-text="item.agentCode || 'Chưa xác định'" />
                            <td class="tw-py-3 tw-text-center" v-text="item.customerCode || 'Chưa xác định'" />
                            <td class="tw-py-3 tw-text-center">
                                {{ dayjs(item.receivedAtUSAt).format('DD/MM/YYYY') }}
                            </td>
                            <td class="tw-py-3 tw-text-center">
                                {{ dayjs(item.receivedAtUSAt).format('HH:mm:ss') }}
                            </td>
                            <td>
                                <v-btn icon size="x-small" color="accent" @click="goToItem(item)">
                                    <v-icon size="small">mdi-eye</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>

            <div class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-space-x-4 tw-mt-4 tw-m-4"
                v-if="deliveredStore.currentPage && (deliveredStore.totalNumberOfPage || 0) >= 1">
                <button @click="goToPrevPage" v-if="!deliveredStore.isSearching && deliveredStore.canGoPrevPage"
                    class="tw-p-2 tw-border tw-border-black tw-border-solid tw-rounded-lg">
                    <ChevronLeftIcon class="tw-w-6 tw-h-6" />
                </button>

                <div class="tw-p-2 tw-border tw-border-black tw-border-solid tw-rounded-lg">
                    Trang {{ deliveredStore.page }} / {{ deliveredStore.totalNumberOfPage }}
                </div>

                <button @click="goToNextPage" v-if="!deliveredStore.isSearching && deliveredStore.canGoNextPage"
                    class="tw-p-2 tw-border tw-border-black tw-border-solid tw-rounded-lg">
                    <ChevronRightIcon class="tw-w-6 tw-h-6" />
                </button>
            </div>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

const deliveredStore = useDelivered()

const { goToPrevPage, goToNextPage, onSearchTapped, resetQuery, goToItem } = useTrackingTable(deliveredStore)

</script>