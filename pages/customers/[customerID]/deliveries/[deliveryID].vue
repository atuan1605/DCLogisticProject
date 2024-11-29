<template>
    <v-card>
        <v-card-title>
            <span class="tw-text-2xl tw-font-bold text-primary">Lịch sử đã giao của chuyến</span>
        </v-card-title>
        <v-card-text>
            <v-container fluid>
                <v-card variant="text">
                    <v-card-text>
                        <v-row justify="center">
                            <v-col cols="6">
                                <p>Số tracking đã giao</p>
                            </v-col>
                            <v-col cols="4">
                                <p class="tw-font-bold">{{ customerStore.deliveryDetail?.trackingItemsCount + " mã tracking"
                                }}</p>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="6">
                                <p>Số cân nặng đã giao</p>
                            </v-col>
                            <v-col cols="4">
                                <p class="tw-font-bold">{{ customerStore.deliveryDetail?.totalWeight + " kg"
                                }}</p>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="6">
                                <p>Số sản phẩm đã giao</p>
                            </v-col>
                            <v-col cols="4">
                                <p class="tw-font-bold">{{ customerStore.deliveryDetail?.productsCount + " sản phẩm"
                                }}</p>
                            </v-col>
                        </v-row>
                        <v-row justify="center">
                            <v-col cols="6">
                                <p>Ngày giao</p>
                            </v-col>
                            <v-col cols="4">
                                <p class="tw-font-bold">{{
                                    dayjs(customerStore.deliveryDetail?.commitedAt).format('DD/MM/YYYY')
                                }}</p>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-container>
            <div class="tw-text-xl tw-font-bold">Sản phẩm đã giao</div>
            <v-container fluid>
                <v-card variant="text">
                    <v-card-text>
                        <v-row justify="center" v-for="item in customerStore.deliveryDetail?.products">
                            <v-col cols="6">
                                <p>{{ item.description }}</p>
                            </v-col>
                            <v-col cols="4">
                                <p class="tw-font-bold">{{ item.quantity }}</p>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-container>
            <div class="tw-text-xl tw-font-bold">Danh sách thùng</div>
            <v-list>
                <v-list-group v-for="packbox in customerStore.deliveryDetail?.packBoxes"
                    :value="`${packbox.name}` + `(${packbox.trackingItemsCount})`">
                    <template v-slot:activator="{ props }">
                        <v-list-item v-bind="props"
                            :title="`Thùng ${packbox.name} ` + `(${packbox.trackingItemsCount})`"></v-list-item>
                    </template>
                    <v-list-item v-for="trackingItem in packbox.trackingItems">
                        <v-list-item-title><span class="tw-font-medium">{{ trackingItem.trackingNumber
                        }}</span></v-list-item-title>
                    </v-list-item>
                </v-list-group>
            </v-list>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">

import dayjs from "dayjs"

const customerStore = useCustomer()
const route = useRoute()
const customerID: string = route.params.customerID as string
const deliveryID: string = route.params.deliveryID as string

useAsyncData(() => customerStore.getDeliveryDetail(customerID, deliveryID))

</script>