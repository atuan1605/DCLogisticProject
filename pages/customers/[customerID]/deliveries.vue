<template>
    <v-row class="mt-3">
        <v-col cols="12" md="4">
            <v-card :loading="customerStore.isLoadingShipments">
                <v-card-text>
                    <v-table fixed-header height="500px" hover>
                        <thead v-if="R.isEmpty(customerStore.deliveries)">
                            <tr>
                                <td class="text-center">No data</td>
                            </tr>
                        </thead>
                        <template v-else>
                            <thead>
                                <tr class="text-left">
                                    <th>
                                        STT
                                    </th>
                                    <th>
                                        Ngày tạo
                                    </th>
                                    <th>
                                        Số lượng tracking
                                    </th>
                                    <th>
                                        Ngày giao
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="item, index in customerStore.deliveries" :key="item.id"
                                    @click="onNavigateTiShipmentDetails(item.id)">
                                    <td>
                                        {{ index + 1 }}
                                    </td>
                                    <td>
                                        {{ dayjs(item.createdAt).format('DD/MM/YYYY') }}
                                    </td>
                                    <td>
                                        {{ item.trackingItemsCount }}
                                    </td>
                                    <td>
                                        {{ dayjs(item.commitedAt).format('DD/MM/YYYY') }}
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-table>
                </v-card-text>
            </v-card>
        </v-col>
        <v-col cols="12" md="8">
            <NuxtPage />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import dayjs from "dayjs"

definePageMeta({
    key: route => route.fullPath + '/sgdf'
})

const route = useRoute()
const customerStore = useCustomer()
const customerID: string = route.params.customerID as string
var activeId: string | undefined = undefined

onMounted(() => {
    customerStore.getDeliveries(customerID)
})

const onNavigateTiShipmentDetails = (deliveryId: string) => {
    activeId = deliveryId
    navigateTo({
        path: `/customers/${customerID}/deliveries/${deliveryId}`
    })
}

</script>