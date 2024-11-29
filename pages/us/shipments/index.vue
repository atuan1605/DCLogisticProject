<template>
    <v-container fluid>
        <v-card variant="flat">
            <ShipmentSearch @showCreateShipment="showDialogCreateShipment" :searchInput="searchInput" @reset="refreshData"
                @search="getData" />
            <v-card>

                <div style="text-align: center;" v-if="loading">
                    <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
                <v-data-table v-else disable-filtering :headers="dessertHeaders" :items="shipments" item-value="id"
                    class="elevation-1" :items-per-page="searchInput.per" :page="searchInput.page" hide-default-footer>
                    <template v-slot:bottom>
                        <v-row align="center">
                            <v-spacer />
                            <v-col cols="4" class="tw-flex tw-justify-end">
                                <v-pagination :model-value="searchInput.page || 1"
                                    :length="Math.ceil(totalItem / (searchInput.per || 100)) || 0" :total-visible="7"
                                    @update:modelValue="updatePage($event || 1)"></v-pagination>
                            </v-col>
                            <v-col cols="1" class="tw-flex tw-justify-end">
                                <v-select :items="perOptions" :model-value="searchInput.per || 100"
                                    @update:model-value="updatePer($event || 100)" hide-details />
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:item.box_number="{ item }">
                        <span> {{ item.boxes.length }}</span>
                    </template>
                    <template v-slot:item.createdAt="{ item }">
                        <span> {{ $formatUTCToLocalTime(item.createdAt) }}
                        </span>
                    </template>
                    <template v-slot:item.total_weight="{ item }">
                        {{ sumWeight(item.boxes) }}
                    </template>
                    <template v-slot:item.action="{ item }">
                        <v-btn class="ml-2" variant="outlined" size="small" icon color="default"
                            @click="gotoDetail(item.id)">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn class="ml-2" variant="outlined" size="small" @click="showDeleteShipment(item.id)" icon
                            color="primary">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </template>
                </v-data-table>
                <v-col cols="12" class="py-0">
                </v-col>
                <CreateDialog v-model="isShowCreateShipmentDialog" @created="created" />
                <DeleteDialog :loading="loading" v-model="isDeleteDialog" @delete="deleteShipment" />

            </v-card>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { GetShipmentQueryInput } from '~~/composables/useAPIs/shipments';

definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

const apis = useAPIs()
const app = useApp()
const isShowCreateShipmentDialog = ref(false)
const idDeleteCurrent = ref("")
const totalItem = ref(0)
const loading = ref(false)
const isDeleteDialog = ref(false)
const route = useRoute()
const perOptions = ref([20, 50, 100, 1000])
var initialInput: GetShipmentQueryInput = {
    shipmentCode: route.params.shipmentCode as string,
    page: Number(route.query.page) || 1,
    per: Number(route.query.per) || 100

}
var searchInput = ref<GetShipmentQueryInput>({
    fromDate: route.query.fromDate as string || null,
    toDate: route.query.toDate as string || null,
    ...initialInput
})

const sumWeight = (boxes) => {
    var totalWeight = 0
    boxes.forEach((box) => {
        totalWeight = totalWeight + box.weight
    });
    return totalWeight
}

const refreshData = () => {
    searchInput.value = {
        per: 100,
        page: 1,
        agentID: ''
    }
    getData()
}

const updatePage = (currentPage) => {
    if (currentPage !== searchInput.value.page) {
        searchInput.value.page = currentPage
        getData()
    }
}

const updatePer = (currentPer : number) => {
    if (currentPer !== searchInput.value.per) {
        searchInput.value.per = currentPer
        getData()
    }
}

const dessertHeaders = [
    { title: 'Ngày tạo', key: 'createdAt', width: 200 },
    { title: 'Mã chuyến', key: 'shipmentCode' },
    { title: 'Số lượng thùng', key: 'box_number' },
    { title: 'Tổng cân(kg)', key: 'total_weight' },
    { title: 'Thao tác', key: 'action', align: 'center', width: 150 },
]

const shipments = ref([])

const getData = async () => {
    onSearchTapped()
    loading.value = true
    try {
        const { items, metadata } = await apis.shipmentsAPI.getShipmentPaginate(searchInput.value)
        shipments.value = items
        totalItem.value = metadata.total
        loading.value = false
    } catch (error) {
        app.addErrorToQueue(`${error}`)
        throw error
    }
}

const showDeleteShipment = (id: string) => {
    idDeleteCurrent.value = id
    isDeleteDialog.value = true
}
const created = () => {
    getData()
    isShowCreateShipmentDialog.value = false
    app.addSuccessToQueue('Thêm thành công')
}
const showDialogCreateShipment = () => {
    isShowCreateShipmentDialog.value = true
}

const gotoDetail = (itemID: string) => {
    navigateTo({
        path: `/us/shipments/${itemID}`
    })
}

const onSearchTapped = async () => {
    await navigateTo({
        path: route.path,
        query: searchInput.value
    })
}

const deleteShipment = async () => {
    loading.value = true
    try {
        await apis.shipmentsAPI.deleteShipment(idDeleteCurrent.value)
        getData()
        isDeleteDialog.value = false
        app.addSuccessToQueue('Xóa thành công!')
    } catch (error) {
        app.addErrorToQueue(`${error}`)
        throw error
    } finally {
        loading.value = false
    }

}

useAsyncData(() => getData())

</script>