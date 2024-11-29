<template>
  <v-row class="px-5 pt-5" v-if="shipment">
    <v-col cols="12" md="12">
      <v-card>
        <template v-slot:title>
          <v-card-title class="text-h5">
            CẬP NHẬT CHUYẾN BAY
          </v-card-title>
          <v-card-text>
            <v-row class="mt-5">
              <v-col cols="12" md="4">
                <v-text-field v-model="shipment.shipmentCode" label="Mã chuyến" placeholder="Nhập mã chuyến bay" :rules="[
                ]"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn :loading="isUpdatingShipment" prepend-icon="mdi-check" @click="updateShipment" variant="elevated"
                  color="primary" class="tw-w-[150px]" size="large">Cập nhật</v-btn>
                <v-btn v-if="!shipmentStore.isCommitShipment" :loading="isCommitShipment" prepend-icon="mdi-check" @click="commitShipment" variant="elevated"
                  color="black" class="tw-w-[300px] ml-10" size="large">Cập nhật trạng thái</v-btn>
                <v-btn v-else :loading="isCommitShipment" prepend-icon="mdi-check" variant="elevated"
                color="green" class="tw-w-[300px] ml-10" size="large" disabled>Xác nhận đã bay</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </template>
      </v-card>
    </v-col>
    <v-col cols="12" md="4">
      <v-card>
        <template v-slot:title>
          <v-data-table :headers="boxHeaders" :items="shipment.boxes" class="elevation-1 list-box" item-key="name"
            item-value="name" :items-per-page="-1" fixed-header :height="'calc(100vh - 420px)'" hide-default-footer>
            <template v-slot:top>
              <v-toolbar class="custom-toolbar">
                <span class="tw-text-2xl tw-text-primary ml-2">
                  Tổng cân {{ sumWeight }} (kg)
                </span>
                <v-spacer></v-spacer>
              </v-toolbar>
            </template>
            <template v-slot:item="{ item }">
              <tr @click="setActiveBox(item.id)">
                <td
                  :class="[selectedBoxID == item.id ? 'tw-text-white !tw-bg-primary' : 'tw-text-black tw-bg-white', 'tw-cursor-pointer']">
                  Thùng số {{ item.name }}</td>
                <td
                  :class="[selectedBoxID == item.id ? 'tw-text-white !tw-bg-primary' : 'tw-text-black tw-bg-white', 'tw-cursor-pointer']">
                  {{ item.weight }}</td>
                <td
                  :class="[selectedBoxID == item.id ? 'tw-text-white !tw-bg-primary' : 'tw-text-black tw-bg-white', 'tw-cursor-pointer']">
                  {{ item.trackingItemsCount }}</td>
              </tr>
            </template>
            <template #bottom>
              <v-sheet height="20" />
            </template>
          </v-data-table>
        </template>
      </v-card>
    </v-col>
    <v-col cols="8">
      <v-card>
        <template v-slot:title>
          <p v-if="R.isNil(selectedBox)">
            <b class="h5">CHƯA CÓ DỮ LIỆU (Bạn chưa chọn thùng hàng nào)</b>
          </p>
          <v-row v-else class="tw-p-3 tw-items-center">
            <v-col cols=" 12" md="12">
              <b class="h5">CHI TIẾT THÙNG HÀNG {{ selectedBox.name }}</b>
            </v-col>
            <hr />
            <v-col cols="12" md="4">
              <v-select hide-details="auto" v-model="selectedBox.agentCodes" :items="authStore.agents" label="Mã đại lí"
                multiple persistent-hint></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field hide-details="auto" v-model="selectedBox.weight" label="Cân nặng(kg)" type="number"
                placeholder="Cân nặng(kg)"></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-btn @click="onRequestDeleteBox(selectedBox!.id!)" size="large" prepend-icon="mdi-delete"
                variant="elevated" color="black" class="tw-w-[150px] ml-2" :loading="isDeletingBox">Xóa thùng</v-btn>
            </v-col>
          </v-row>

          <v-data-table v-if="!R.isNil(selectedBox) && !R.isEmpty(selectedBoxIndexedTrackingItems)"
            :headers="trackingHeaders" :items="selectedBoxIndexedTrackingItems" class="elevation-1" item-value="name"
            :items-per-page="-1" fixed-header :height="'calc(100vh - 570px)'" :hide-default-footer="true">
            <template v-slot:item.no="{ item }">
              {{ item.index + 1 }}
            </template>
            <template v-slot:item.totalTrackingInChain="{ item }">
              {{ item.numberOfItemsInChain }}
            </template>
            <template v-slot:item.trackingNumber="{ item }">
              <NuxtLink v-if="item.url" :to="item.url" target="_blank">{{
                item.trackingNumber
              }}</NuxtLink>
              <template v-else>
                {{
                  item.trackingNumber
                }}
              </template>
            </template>
            <template v-slot:item.productDescription="{ item }">
              {{ item.productDescription }}
            </template>
            <template v-slot:item.image="{ item }">
              <img v-for="img in item.images" style="height:100px"
                class="tw-w-full tw-h-full tw-object-contain tw-hover:bg-accent/25 tw-cursor-pointer"
                :src="trackingImageSrc(img)" @click="showImage(img)" />
            </template>
            <template #bottom>
              <v-sheet height="20" />
            </template>
          </v-data-table>
        </template>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog v-model="isShowImage" max-width="800">
    <v-card>
      <v-img :src="trackingImageSrc(selectedImage)" contain></v-img>
    </v-card>
  </v-dialog>

  <DeleteDialog :loading="isDeletingBox" v-model="deleteBoxDialog" @delete="deleteBox" />
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { TrackingItemOutput } from '~~/composables/useAPIs/trackings';
import { UpdateShipmentInput, BoxCustomItemOutput } from '~~/composables/useAPIs/shipments';
import dayjs from 'dayjs';

definePageMeta({
  middleware: ['authenticated']
})

const authStore = useAuth()
const route = useRoute()
const apis = useAPIs()
const app = useApp()
const shipmentStore = useShipment()
const selectedBox = computed(() => {
  return R.find(({ id }) => id === selectedBoxID.value, shipment.value?.boxes || [])
})
const targetBoxID = ref()
const deleteBoxDialog = ref(false)

interface BoxItem {
  index: number
  id: string
  trackingNumber: string
  url?: string
  numberOfItemsInChain?: number | undefined
  productDescription: string | undefined
  images: string[]
  onDelete: (id: string) => any
  boxedAt: string
}

const selectedBoxIndexedTrackingItems = computed(() => {
  if (R.isNil(selectedBox.value)) {
    return []
  }

  const mapTrackingItemsFn = (trackingItem: TrackingItemOutput): BoxItem => ({
    index: 0,
    id: trackingItem.id,
    url: `/trackingItems/${trackingItem.id}`,
    trackingNumber: trackingItem.trackingNumber,
    numberOfItemsInChain: R.pathOr(1, ['totalTrackingItemsInChain', trackingItem.chain || ''], selectedBox.value),
    productDescription: trackingItem.productDescription,
    images: trackingItem.files || [],
    onDelete: deleteItemTrackingBox,
    boxedAt: trackingItem.boxedAt || dayjs().toISOString(),
  })

  const mapCustomItemsFn = (customItem: BoxCustomItemOutput): BoxItem => ({
    index: 0,
    id: customItem.id,
    trackingNumber: customItem.reference,
    productDescription: customItem.details,
    images: [],
    onDelete: deleteBoxCustomItem,
    boxedAt: customItem.createdAt || dayjs().toISOString(),
  })

  const boxedTrackingItems = R.map(mapTrackingItemsFn, selectedBox.value?.trackingItems || [])
  const boxedCustomItems = R.map(mapCustomItemsFn, selectedBox.value?.customItems || [])
  const items = R.concat(boxedTrackingItems, boxedCustomItems)
  const sortedItems = R.sortWith([R.ascend(R.prop('boxedAt'))], items)

  const addIndexToList = R.addIndex<BoxItem, BoxItem>(R.map)(
    (item, index) => ({ ...item, index })
  )
  return R.reverse(addIndexToList(sortedItems))
})

const isUpdatingShipment = ref(false)
const isRemovingTrackingFromBox = ref(false)
const isDeletingBox = ref(false)
const selectedBoxID = ref(route.query.boxId)
const shipmentID: string = route.params.shipmentID as string
const { data: shipment } = useAsyncData(() => apis.shipmentsAPI.getShipment(shipmentID))

const isShowImage = ref(false)
const selectedImage = ref("")
const showImage = (image: string) => {
  selectedImage.value = image
  isShowImage.value = true
}

const isCommitShipment = ref(false)
const commitShipment = async () => {
  if (R.isNil(shipment.value)) return
  isCommitShipment.value = true
  try {
    await apis.shipmentsAPI.commitShipment(shipment.value.id)
    app.addSuccessToQueue('Commit thành công!')
    navigateTo('/us/shipments')
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {
    isCommitShipment.value = false
  }
}

const onRequestDeleteBox = (boxID: string) => {
  targetBoxID.value = boxID
  deleteBoxDialog.value = true
}

const sumWeight = computed(() => {
  if (R.isNil(shipment.value)) {
    return 0
  }
  return R.sum(R.map(R.propOr(0, 'weight'), shipment.value.boxes) as number[]).toFixed(2);
})


const boxHeaders = [
  { title: 'Tên thùng', key: 'name' },
  { title: 'Cân nặng', key: 'weight' },
  { title: 'Số tracking', key: 'trackingItemsCount' },
]

const trackingHeaders = [
  { title: 'STT', key: 'no', width: 50 },
  { title: 'Tracking Number', key: 'trackingNumber' },
  { title: 'Số tracking trong dây', key: 'totalTrackingInChain', width: 50 },
  { title: 'Sản phẩm', key: 'productDescription' },
  { title: 'Ảnh', key: 'image' },
]

const refreshData = async () => {
  shipment.value = await apis.shipmentsAPI.getShipment(shipmentID)
}

const setActiveBox = (boxID: string) => {
  selectedBoxID.value = boxID;
  addBoxIDToQueryPath()
}
const config = useRuntimeConfig()

const trackingImageSrc = (file: string) => {
  return `${config.public.apiBase}/files/dc/${file}`
}

const handleResetItem = () => {
  selectedBoxID.value = null;
  removeBoxIDFromQueryPath()
}

const removeBoxIDFromQueryPath = async () => {
  await navigateTo({
    path: route.path,
    query: {}
  })
}

const addBoxIDToQueryPath = async () => {
  await navigateTo({
    path: route.path,
    query: { boxId: selectedBoxID.value }
  })
}


const deleteBoxCustomItem = async (BoxCustomItemID: string) => {
  if (R.isNil(shipment.value)) return
  if (R.isNil(selectedBox.value)) return
  isRemovingTrackingFromBox.value = true
  try {
    await apis.shipmentsAPI.deleteBoxCustomItem(shipment.value.id, selectedBox.value.id!, BoxCustomItemID)
    app.addSuccessToQueue('Xóa hàng thành công!')
    refreshData()
  } catch (error) {
    app.addErrorToQueue(`${error}`, 4000)
  } finally {
    isRemovingTrackingFromBox.value = false
  }
}

const deleteItemTrackingBox = async (trackingID: string) => {
  if (R.isNil(shipment.value)) return
  if (R.isNil(selectedBox.value)) return
  isRemovingTrackingFromBox.value = true
  try {
    await apis.shipmentsAPI.deleteItemTrackingBoxShipment(shipment.value.id, selectedBox.value.id!, trackingID)
    app.addSuccessToQueue('Xóa tracking thành công!')
    refreshData()
  } catch (error) {
    app.addErrorToQueue(`${error}`, 4000)
  } finally {
    isRemovingTrackingFromBox.value = false
  }
}

const deleteBox = async () => {
  if (R.isNil(shipment.value)) return
  if (R.isNil(targetBoxID.value)) return
  isDeletingBox.value = true
  try {
    await apis.shipmentsAPI.deleteBoxShipment(shipment.value.id, targetBoxID.value)
    app.addSuccessToQueue('Xóa thành công!')
    shipment.value.boxes = R.filter(({ id }) => id !== targetBoxID.value, shipment.value.boxes)
    handleResetItem()
    deleteBoxDialog.value = false
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {
    isDeletingBox.value = false
  }
}

const updateShipment = async () => {
  if (R.isNil(shipment.value)) return
  isUpdatingShipment.value = true
  try {
    const input: UpdateShipmentInput = {
      shipmentCode: shipment.value.shipmentCode,
      lotIndex: shipment.value.lotIndex
    }
    await apis.shipmentsAPI.updateShipment(shipment.value.id, input)
    app.addSuccessToQueue('Update thành công!')
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {
    isUpdatingShipment.value = false
  }
}
useAsyncData(() => authStore.getAgents())

</script>