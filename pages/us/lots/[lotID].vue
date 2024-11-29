<template>
  <v-row class="px-5 pt-5" v-if="lot">
    <v-col cols="12" md="12">
      <v-card>
        <template v-slot:title>
          <v-card-title class="text-h5">
            CẬP NHẬT LÔ
          </v-card-title>
          <v-card-text>
            <v-row class="mt-5">

              <v-col cols="12" md="4">
                <v-text-field v-model="lot.lotIndex" label="Chỉ số lô" placeholder="Nhập chỉ số lô" :rules="[
    validator.required('Chỉ số lô')
  ]"></v-text-field>
              </v-col>

              <v-col cols="12" md="4">
                <v-btn :loading="isUpdatingLot" prepend-icon="mdi-check" @click="updateLot" variant="elevated"
                  color="primary" class="tw-w-[150px]" size="large">Cập nhật</v-btn>
              </v-col>

            </v-row>
          </v-card-text>
        </template>
      </v-card>
    </v-col>
    <v-col cols="12" md="5">
      <v-card>
        <template v-slot:title>
          <v-data-table id="mytable" show-select v-model="selectedBoxes" :headers="boxHeaders" :items="lot.boxes"
            @click:row="setActiveBox" :items-per-page="-1" class="elevation-1" item-key="name">
            <template v-slot:top>
              <v-toolbar class="custom-toolbar">
                <span class="tw-text-2xl tw-text-primary ml-2">
                  Tổng cân {{ sumWeight }} (kg)
                </span>
                <v-spacer></v-spacer>
                <v-btn density="default" v-if="R.isEmpty(selectedBoxes)" @click="addBox" :loading="isAddingBox"
                  prepend-icon="mdi-plus" variant="elevated" color="primary" class="tw-w-[210px]">Thêm
                  thùng</v-btn>
                <v-btn v-else @click="showAssignBoxToShipment = true" prepend-icon="mdi-plus" variant="elevated"
                  color="black" density="default">Thêm vào chuyến</v-btn>
              </v-toolbar>
            </template>
            <template #bottom>
              <v-sheet height="20" />
            </template>
          </v-data-table>
        </template>
      </v-card>

    </v-col>
    <v-col cols="7">
      <audio ref="dingPlayer" class="tw-invisible" preload="auto">
        <source src="~/assets/sounds/ding.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <audio ref="errorPlayer" class="tw-invisible" preload="auto">
        <source src="~/assets/sounds/error.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <audio ref="notFoundPlayer" class="tw-invisible" preload="auto">
        <source src="~/assets/sounds/notFound.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <audio ref="warningPlayer" class="tw-invisible" preload="auto">
        <source src="~/assets/sounds/warning.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <audio ref="emptyPlayer" class="tw-invisible" preload="auto">
        <source src="~/assets/sounds/empty.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
      <template v-if="!R.isNil(lotStore.returnItemsPage?.items) && R.length(lotStore.returnItemsPage?.items) > 0">
        <v-card class="tw-mb-5" style="max-height: 600px;">
          <v-card-title class="text-h5">
            Danh sách hàng bị gửi trả
          </v-card-title>
          <v-table class="tw-mt-4" fixed-header>
            <thead>
              <tr class="tw-border-b tw-border-black tw-border-solid">
                <th class="tw-py-3 tw-text-left">STT</th>
                <th class="tw-py-3">TrackingNumber</th>
                <th class="tw-py-3">Thông tin mảnh</th>
                <th class="tw-py-3">Thùng</th>
                <th class="tw-py-3">Trạng thái</th>
                <th class="tw-py-3">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr height="100" class="tw-hover:bg-accent/25 "
                v-for="(item, index) in lotStore.returnItemsPage?.items || []" :key="item.pieceID">
                <td> {{ ((lotStore.page || 1) - 1) * (lotStore.per || 1) + (index + 1) }}
                </td>
                <td class="tw-py-3" v-text="item.trackingNumber || 'Chưa có'" />
                <td class="tw-py-3" v-text="item.trackingItemPieceInfo || 'Chưa có'" />
                <td class="tw-py-3" v-text="item.boxName || 'Chưa có'" />
                <td>
                  <v-select class="tw-mt-2" v-model="item.status" variant="outlined" :items="returnStatusItems"
                    item-title="title" item-value="value" />
                </td>
                <td>
                  <v-btn color="accent" :loading="lotStore.isRemoving"
                    @click="updateReturnItems(item.pieceID, item.status, item.boxID, item.boxName)">Cập nhật</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
          <div class="tw-flex tw-flex-row tw-items-center tw-justify-center tw-space-x-4 tw-mt-4 tw-m-4"
            v-if="lotStore.returnItemsPage && (lotStore.totalNumberOfPage || 0) >= 1">
            <button @click="setPage(lotStore.targetPage - 1)"
              v-if="!lotStore.isLoadingReturnItems && lotStore.canGoPrevPage">
              <v-icon>mdi-chevron-left-circle-outline</v-icon>
            </button>

            <div class="tw-p-2 tw-border-2 tw-border-black tw-border-solid tw-rounded-lg">
              Trang {{ lotStore.page }} / {{ lotStore.totalNumberOfPage }}
            </div>

            <button @click="setPage(lotStore.targetPage + 1)"
              v-if="!lotStore.isLoadingReturnItems && lotStore.canGoNextPage">
              <v-icon>mdi-chevron-right-circle-outline</v-icon>
            </button>
          </div>
        </v-card>
      </template>

      <v-card>
        <template v-slot:title>
          <v-progress-circular v-if="isLoadingBoxDetails" indeterminate />
          <p v-else-if="R.isNil(selectedBox)">
            <b class="h5">CHƯA CÓ DỮ LIỆU (Bạn chưa chọn thùng hàng nào)</b>
          </p>
          <template v-else>
            <v-row class="tw-p-3 tw-items-center">
              <v-col cols=" 12" md="12">
                <v-text-field class="h5" v-model="selectedBox.name" label="CHI TIẾT THÙNG HÀNG"
                  placeholder="Nhập tên thùng" :rules="[
    validator.required('Tên thùng')
  ]"></v-text-field>
              </v-col>
              <hr />
              <v-col cols="12" md="3">
                <v-select hide-details="auto" v-model="selectedBox.agentCodes" :items="authStore.agents"
                  label="Mã đại lí" multiple persistent-hint />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field hide-details="auto" v-model="selectedBox.weight" label="Cân nặng(kg)" type="number"
                  placeholder="Cân nặng(kg)"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn @click="updateBox" density="default" prepend-icon="mdi-check" variant="elevated" color="primary"
                  class="tw-w-[150px]" :loading="isUpdatingBox">Cập
                  nhật</v-btn>
                <template v-if="R.length(selectedBoxes) == 0">
                  <v-btn v-if="!R.isNil(selectedBox.id)" @click="onRequestDeleteBox(selectedBox.id)" density="default"
                    prepend-icon="mdi-delete" variant="elevated" color="black" class="tw-w-[150px] ml-2"
                    :loading="isDeletingBox">Xóa thùng</v-btn>
                </template>
                <template v-else>
                  <v-btn density="default" prepend-icon="mdi-delete" variant="elevated" color="black"
                    class="tw-w-[150px] ml-2" disabled>Xóa thùng</v-btn>
                </template>
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field ref="trackingInput" hide-details="auto" v-model="trackingCode"
                  @keyup.enter="onAddTracking" placeholder="Nhập mã tracking" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="4" v-if="isAddingTrackingToBox">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-col>
              <v-col cols="12" md="4">
                <v-btn prepend-icon="mdi-plus" density="default" variant="elevated" color="primary" class="tw-w-[160px]"
                  type="submit" @click="onCreateBoxCustomItemModal">Thêm hàng</v-btn>
                <v-btn v-if="R.isEmpty(selectedTrackingItems)" prepend-icon="mdi-swap-horizontal" density="default"
                  variant="elevated" color="black" class="tw-w-[160px] ml-2" type="submit" disabled>Đổi thùng</v-btn>
                <v-btn v-else density="default" prepend-icon="mdi-swap-horizontal" variant="elevated" color="black"
                  class="tw-w-[160px] ml-2" type="submit" @click="showMoveTrackingToBox = true">Đổi thùng</v-btn>
              </v-col>
            </v-row>
            <v-data-table id="myTrackingTable" show-select v-model="selectedTrackingItems"
              v-if="!R.isNil(selectedBox) && !R.isEmpty(selectedBoxIndexedTrackingItems)" :headers="trackingHeaders"
              :items="selectedBoxIndexedTrackingItems" class="elevation-1" item-value="id" item-key="trackingNumber"
              :items-per-page="-1" fixed-header :height="'calc(100vh - 570px)'" :hide-default-footer="true">
              <template v-slot:item.no="{ item }">
                {{ item.index + 1 }}
              </template>
              <template v-slot:item.action="{ item }">
                <v-btn class="ml-2" variant="outlined" size="small" color="primary"
                  @click="onRequestRemoveItemFromBox(item)" :loading="isRemovingTrackingFromBox">
                  <v-icon>mdi-delete</v-icon> Xóa
                </v-btn>
              </template>
              <template v-slot:item.totalTrackingInChain="{ item }">
                {{ item.numberOfItemsInChain }}
              </template>
              <template v-slot:item.trackingNumber="{ item }">
                <NuxtLink v-if="item.url" :to="item.url" target="_blank">{{
                  `${item.trackingNumber} (${item.information})`
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
        </template>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog v-model="isShowImage" max-width="800">
    <v-card>
      <v-img :src="trackingImageSrc(selectedImage)" contain></v-img>
    </v-card>
  </v-dialog>
  <ConfirmDialog :loading="isDeletingBox" v-model="deleteBoxDialog" @submit="deleteBox"
    :content="`Bạn có chắc chắn muốn xoá thùng: ${selectedBox?.name}`"
    @update:model-value="value => deleteBoxDialog = value" />
  <ConfirmDialog :loading="isRemovingTrackingFromBox" v-model="removeBoxItemDialog" @submit="removeItemFromBox"
    :content="`Bạn có chắc chắn muốn xoá tracking: ${targetBoxItem?.trackingNumber} (${targetBoxItem?.information})`"
    @update:model-value="value => removeBoxItemDialog = value" />
  <v-dialog v-model="createBoxCustomItemModal" transition="dialog-bottom-transition" width="550">
    <v-card>
      <VForm @submit.prevent="createBoxCustomItem" ref="form">
        <v-card-title class="text-h5">
          Thêm hàng khách gửi
        </v-card-title>
        <v-card-text>
          <v-text-field ref="customItemInput" v-model="boxCustomItemReference" placeholder="Nhập reference" :rules="[
    validator.required('Mã tracking')
  ]" variant="outlined"></v-text-field>
          <v-text-field v-model="boxCustomItemDetails" placeholder="Nhập thông tin hàng" :rules="[
    validator.required('VD: 5 iPad')
  ]" variant="outlined"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn prepend-icon="mdi-cancel" variant="elevated" color="default" class="tw-w-[150px]"
            @click="createBoxCustomItemModal = false">Hủy</v-btn>
          <v-btn :loading="isCreatingBoxCustomItem" prepend-icon="mdi-check" variant="elevated" color="primary"
            class="tw-w-[150px]" @click="createBoxCustomItem">Xong</v-btn>

        </v-card-actions>
      </VForm>
    </v-card>
  </v-dialog>
  <v-dialog v-model="showAssignBoxToShipment" transition="dialog-bottom-transition" width="550">
    <v-card>

      <v-card-title class="text-h5">
        Thêm vào chuyến bay
      </v-card-title>
      <v-card-text>
        <v-select v-model="shipmentID" item-value="id" item-title="shipmentCode" label="Chuyến bay"
          :items="shipments" />
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn prepend-icon="mdi-cancel" variant="elevated" color="default" class="tw-w-[150px]"
          @click="showAssignBoxToShipment = false">Hủy</v-btn>
        <v-btn :loading="isAddingBoxToShipmet" prepend-icon="mdi-check" variant="elevated" color="primary"
          class="tw-w-[150px]" @click="addBoxesToShipment">Xong</v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog v-model="showMoveTrackingToBox" transition="dialog-bottom-transition" width="550">
    <v-card>
      <v-card-title class="text-h5">
        Chuyển Tracking vào Thùng khác
      </v-card-title>
      <v-card-text>
        <v-select v-if="!R.isNil(lot)" v-model="newBoxID" item-value="id" item-title="name" label="thùng"
          :items="boxesList" />
      </v-card-text>
      <v-card-actions>

        <v-btn prepend-icon="mdi-cancel" variant="elevated" color="default" class="tw-w-[150px]"
          @click="showMoveTrackingToBox = false">Hủy</v-btn>
        <v-spacer></v-spacer>
        <v-btn prepend-icon="mdi-check" variant="elevated" color="primary" class="tw-w-[150px]"
          @click="onConfirmMoveTrackingToBox">Xong</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <PieceCard :model-value="targetStep == WarningState.pieces" @submit="submitPopupPiece"
    :tracking-i-d="targetTrackingItem?.trackingID" :tracking-number="trackingCode" :piece-count="targetPiecesCount"
    @update:model-value="(value) => cancelPopupPiece(value)" />
  <ConfirmDialog :loading="isRemovingItems" v-model="showConfirmMoveTrackingToBox" @submit="addTrackingToNewBox"
    :content="`Xác nhận chuyển (${R.length(selectedTrackingItems)}) Tracking vào thùng: ${confirmBox?.name}`"
    @update:model-value="value => showConfirmMoveTrackingToBox = value" />
  <ConfirmDialog :model-value="targetStep == WarningState.noImage" @submit="submitNoImage"
    :content="`Tracking chưa có hình ảnh! Xác nhận chuyển Tracking vào thùng`"
    @update:model-value="(value) => cancelPopup(value)" />
  <ConfirmDialog :model-value="targetStep == WarningState.packingRequest" :title="`Yêu cầu đặc biệt mới`"
    @submit="submitPackingRequest" :confirm-button="`Đã xử lý`" :content="targetTrackingItem?.packingRequestDetail"
    @update:model-value="(value) => cancelPopup(value) " />
  <ConfirmError :model-value="targetStep == WarningState.returnTracking" :title="`Thông báo`" :content="`Mã tracking này đang trong trạng thái
    trả hàng`" @update:model-value="(value) => submitReturnTracking(value)" />
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { GetReturnItemOutput, GetTrackingInfoForBoxedStepOutput, GetTrackingStatusOutput, ReturnStatus, TrackingItemOutput, WarningState } from '~~/composables/useAPIs/trackings';
import { ItemTrackingInput, UpdateBoxInput, AddBoxesToShipmentInput, UpdateLotInput, CreateBoxCustomItemInput, BoxCustomItemOutput, TrackingItemPiecesInBoxOutput, AddTrackingItemsToNewBoxInput, LotBoxOutput } from '~~/composables/useAPIs/lots';
import dayjs from 'dayjs';

definePageMeta({
  middleware: ['authenticated']
})

const authStore = useAuth()
const trackingStore = useTracking()
const route = useRoute()
const form = ref<VForm | null>(null)
const validator = useValidators()
const apis = useAPIs()
const app = useApp()
const createBoxCustomItemModal = ref(false)
const isCreatingBoxCustomItem = ref(false)
const isAddingBoxToShipmet = ref(false)
const selectedBox = ref<LotBoxOutput>()
const confirmBox = computed(() => {
  return R.find(({ id }) => id === newBoxID.value, lot.value?.boxes || [])
})
const targetBox = ref<LotBoxOutput | undefined>()
const targetNewBox = ref<LotBoxOutput>()
const shipmentID = ref()
const targetBoxID = ref()
const selectedBoxes = ref([])
const deleteBoxDialog = ref(false)
const removeBoxItemDialog = ref(false)
const targetBoxItem = ref<BoxItem | null>(null)
const showAssignBoxToShipment = ref(false)
const isRemovingItems = ref(false)
const trackingInput = ref()
const customItemInput = ref()
const selectedTrackingItems = ref([])
const showMoveTrackingToBox = ref(false)
const newBoxID = ref()
const showConfirmMoveTrackingToBox = ref(false)
const returnStatusItems = [
  { title: 'Chưa xử lý', value: ReturnStatus.unprocessed },
  { title: 'Đã xử lý', value: ReturnStatus.processed }
]
const setPage = async(page: number) => {
  lotStore.targetPage = page
  await lotStore.getReturnItems(lotID)
}
let boxesList = computed(() => {
  if (R.isNil(lot.value)) return
  return R.filter(({ id }) => id !== selectedBoxID.value, lot.value?.boxes)
})

const onConfirmMoveTrackingToBox = () => {
  showMoveTrackingToBox.value = false
  showConfirmMoveTrackingToBox.value = true
}
const onCreateBoxCustomItemModal = () => {
  createBoxCustomItemModal.value = true
  nextTick(() => {
    customItemInput.value.focus()
  })
}

const shipments = await apis.shipmentsAPI.getShipmentUnCommitList()

const onRequestRemoveItemFromBox = (item: BoxItem) => {
  targetBoxItem.value = item
  removeBoxItemDialog.value = true
}

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
  information?: string
}
const addBoxesToShipment = async () => {
  isAddingBoxToShipmet.value = true
  const input: AddBoxesToShipmentInput = {
    boxIDs: selectedBoxes.value
  }
  try {
    if (R.isNil(shipmentID.value)) {
      app.addErrorToQueue(`Vui lòng chọn chuyến bay!`)
      throw new Error('Vui lòng chọn chuyến bay!')
    }
    await apis.lotsAPI.addBoxesToShipment(shipmentID.value, input)
    selectedBoxes.value = []
    showAssignBoxToShipment.value = false
    app.addSuccessToQueue(`Thêm vào chuyến bay thành công`)
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {
    isAddingBoxToShipmet.value = false
  }
}

const updateReturnItems = async (pieceID: string, status: ReturnStatus, boxID: string, boxName: string) => {
  await lotStore.removeReturnItem(lotID, pieceID, status, boxID, boxName)
  if (!R.isNil(selectedBox.value) && !R.isNil(selectedBox.value.trackingItems)) {
    selectedBox.value.trackingItems = R.reject(R.propEq('id', lotStore.returnPieceID), selectedBox.value.trackingItems)
    lotStore.returnPieceID = null
  }
}
const selectedBoxIndexedTrackingItems = computed(() => {
  if (R.isNil(selectedBox.value)) {
    return []
  }

  const mapTrackingItemsFn = (piece: TrackingItemPiecesInBoxOutput): BoxItem => ({
    index: 0,
    id: piece.id,
    url: `/trackingItems/${piece.trackingID}`,
    trackingNumber: piece.trackingNumber,
    numberOfItemsInChain: piece.totalTrackingInChain,
    productDescription: piece.productDescription,
    images: piece.files || [],
    onDelete: deleteItemTrackingBox,
    boxedAt: dayjs().toISOString(),
    information: piece.information
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

const isAddingBox = ref(false)
const isUpdatingLot = ref(false)
const isUpdatingBox = ref(false)
const isRemovingTrackingFromBox = ref(false)
const isAddingTrackingToBox = ref(false)
const isDeletingBox = ref(false)
const selectedBoxID = ref(route.query.boxId)
const lotID: string = route.params.lotID as string
const trackingCode = ref("")
const boxCustomItemDetails = ref("")
const boxCustomItemReference = ref("")
const { data: lot } = useAsyncData(() => apis.lotsAPI.getLot(lotID))
const lotStore = useLot()
useAsyncData(() => lotStore.getReturnItems(lotID))
const dingPlayer = ref()
const errorPlayer = ref()
const notFoundPlayer = ref()
const warningPlayer = ref()
const emptyPlayer = ref()
const targetPiecesCount = ref(0)

onMounted(() => {
  if (dingPlayer.value) {
    console.log('loaded ding player')
    dingPlayer.value.load()
  }

  if (errorPlayer.value) {
    console.log('loaded error player')
    errorPlayer.value.load()
  }
})

const isShowImage = ref(false)
const selectedImage = ref("")
const showImage = (image: string) => {
  selectedImage.value = image
  isShowImage.value = true
}

const onRequestDeleteBox = (boxID: string) => {
  targetBoxID.value = boxID
  deleteBoxDialog.value = true
}

const removeItemFromBox = async () => {
  if (R.isNil(targetBoxItem.value)) {
    return
  }

  try {
    await targetBoxItem.value.onDelete(targetBoxItem.value.id)
    removeBoxItemDialog.value = false
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  }
}

const sumWeight = computed(() => {
  if (R.isNil(lot.value)) {
    return 0
  }
  return R.sum(R.map(R.propOr(0, 'weight'), lot.value.boxes) as number[]).toFixed(2);
})

const addBox = async () => {
  if (R.isNil(lot.value)) {
    return
  }
  try {
    isAddingBox.value = true
    const newBox = await apis.lotsAPI.createBox(lot.value.id)
    newBox.trackingItems = []
    newBox.trackingItemsCount = 0
    newBox.weight = undefined
    const boxes = R.pathOr([], ['boxes'], lot.value)
    const newBoxes = R.insert(0, newBox, boxes)
    lot.value = R.assoc('boxes', newBoxes, lot.value)
    app.addSuccessToQueue('Thêm thùng thành công!')
  } catch (error) {
    app.addErrorToQueue(`${error}`)
    throw error
  } finally {
    isAddingBox.value = false
  }
}

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
  { title: 'Thao tác', key: 'action' }
]



const isLoadingBoxDetails = ref(false)

const getBoxDetails = async (boxID: string) => {
  isLoadingBoxDetails.value = true
  try {
    const items = await apis.lotsAPI.getLotBox(lotID, boxID)
    selectedBox.value = items
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {

    isLoadingBoxDetails.value = false
  }
  nextTick(() => {
    trackingInput.value.focus()
  })
}
const config = useRuntimeConfig()

const { refresh } = useAsyncData(() => {
  const route = useRoute()
  if (R.hasPath(['query', 'boxId'], route)) {
    const boxId = route.query.boxId as string
    return getBoxDetails(boxId).then(() => { })
  } else {
    selectedBox.value = undefined
    return Promise.resolve()
  }
})

const setActiveBox = (item: any, row: any) => {
  const tr = item.target.parentNode;
  const allChildElementsOfParentWithClass = document.querySelectorAll('td.tw-text-white')
  allChildElementsOfParentWithClass.forEach((element) => {
    element.classList.remove('!tw-bg-primary');
    element.classList.remove('tw-text-white');
  });
  for (var i = 1; i < tr.children.length; i++) {
    tr.children[i].classList.add('!tw-bg-primary')
    tr.children[i].classList.add('tw-text-white')
  }

  selectedBoxID.value = row.item.id;
  addBoxIDToQueryPath()
  getBoxDetails(row.item.id)
}
const trackingImageSrc = (file: string) => {
  return `${config.public.apiBase}/files/dc/${file}`
}

const handleResetItem = () => {
  selectedBoxID.value = null;
  removeBoxIDFromQueryPath()
  selectedBox.value = undefined
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
  selectedTrackingItems.value = []
}

const createBoxCustomItem = async () => {
  if (!form.value) { return }
  const { valid } = await form.value.validate()
  if (!valid) { return }
  const input: CreateBoxCustomItemInput = {
    reference: boxCustomItemReference.value,
    details: boxCustomItemDetails.value
  }
  if (R.isNil(lot.value)) return
  if (R.isNil(selectedBox.value)) return
  isCreatingBoxCustomItem.value = true
  try {
    let targetCustomItem = await apis.lotsAPI.createBoxCustomItem(lot.value.id, selectedBox.value.id!, input)
    dingPlayer.value.play()
    app.addSuccessToQueue('Thêm hàng thành công!')
    targetBox.value = selectedBox.value
    if (!R.isNil(targetBox.value)) {
      targetBox.value.customItems = R.append(targetCustomItem, targetBox.value.customItems)
      const index = R.findIndex(R.propEq('id', selectedBoxID.value), lot.value.boxes)
      if (index >= 0) {
        lot.value.boxes = R.update(index, targetBox.value, lot.value.boxes)
      }
    }
    nextTick(() => {
      trackingInput.value.focus()
    })
  } catch (error) {
    errorPlayer.value.play()
    app.addErrorToQueue(`${error}`, 4000)
    throw error
  } finally {
    boxCustomItemReference.value = ''
    boxCustomItemDetails.value = ''
    createBoxCustomItemModal.value = false
    isCreatingBoxCustomItem.value = false
  }
}

const deleteBoxCustomItem = async (boxCustomItemID: string) => {
  if (R.isNil(lot.value)) return
  if (R.isNil(selectedBox.value)) return
  isRemovingTrackingFromBox.value = true
  try {
    await apis.lotsAPI.deleteBoxCustomItem(lot.value.id, selectedBox.value.id!, boxCustomItemID)
    app.addSuccessToQueue('Xóa hàng thành công!')
    targetBox.value = selectedBox.value
    if (!R.isNil(targetBox.value)) {
      targetBox.value.customItems = R.reject(R.propEq('id', boxCustomItemID), selectedBox.value.customItems)
      const index = R.findIndex(R.propEq('id', selectedBoxID.value), lot.value.boxes)
      if (index >= 0) {
        lot.value.boxes = R.update(index, targetBox.value, lot.value.boxes)
      }
    }
  } catch (error) {
    app.addErrorToQueue(`${error}`, 4000)
  } finally {
    isRemovingTrackingFromBox.value = false
  }
}

const updateBox = async () => {
  if (R.isNil(lot.value)) return
  if (R.isNil(selectedBox.value)) return
  isUpdatingBox.value = true
  try {
    const input: UpdateBoxInput = {
      name: selectedBox.value.name,
      agentCodes: selectedBox.value.agentCodes,
      weight: R.or(Number(selectedBox.value.weight), undefined)
    }
    await apis.lotsAPI.updateBox(lot.value.id, selectedBox.value.id!, input)
    app.addSuccessToQueue('Cập nhật thùng thành công!')
  } catch (error) {
    app.addErrorToQueue(`${error}`, 4000)
  } finally {
    isUpdatingBox.value = false
  }
}

const deleteItemTrackingBox = async (trackingID: string) => {
  if (R.isNil(lot.value)) return
  if (R.isNil(selectedBox.value)) return
  isRemovingTrackingFromBox.value = true
  try {
    const removedItems = await apis.lotsAPI.deleteItemTrackingBoxLot(lot.value.id, selectedBox.value.id!, trackingID)
    app.addSuccessToQueue('Xóa tracking thành công!')
    if (!R.isNil(selectedBox.value)) {
      removedItems.pieceIDs.forEach((item) => {
        if (!R.isNil(selectedBox.value)) {
          selectedBox.value.trackingItems = R.reject(R.propEq('id', item), selectedBox.value.trackingItems)
        }
      })
      selectedBox.value.trackingItemsCount = removedItems.trackingCount
      const index = R.findIndex(R.propEq('id', selectedBoxID.value), lot.value.boxes)
      if (index >= 0) {
        lot.value.boxes = R.update(index, selectedBox.value, lot.value.boxes)
      }
    }

  } catch (error) {
    app.addErrorToQueue(`${error}`, 4000)
  } finally {
    isRemovingTrackingFromBox.value = false
  }
}

const deleteBox = async () => {
  if (R.isNil(lot.value)) return
  if (R.isNil(targetBoxID.value)) return
  isDeletingBox.value = true
  try {
    await apis.lotsAPI.deleteBoxLot(lot.value.id, targetBoxID.value)
    app.addSuccessToQueue('Xóa thành công!')
    lot.value.boxes = R.filter(({ id }) => id !== targetBoxID.value, lot.value.boxes)
    handleResetItem()
    deleteBoxDialog.value = false
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {
    isDeletingBox.value = false
  }
}

const updateLot = async () => {
  if (R.isNil(lot.value)) return
  isUpdatingLot.value = true
  try {
    const input: UpdateLotInput = {
      lotIndex: lot.value.lotIndex
    }
    await apis.lotsAPI.updateLot(lot.value.id, input)
    app.addSuccessToQueue('Update thành công!')
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {
    isUpdatingLot.value = false
  }
}
const targetTrackingItem = ref<GetTrackingInfoForBoxedStepOutput | null>(null)
const targetStep = ref<WarningState | null>(null)
const inputAddTrackingToBox = ref<ItemTrackingInput | null>(null)
const onAddTracking = async () => {
  if (R.isNil(lot.value)) return
  if (R.isNil(selectedBox.value)) return
  try {
    let item = await apis.trackingItemsAPI.getInfoForBoxedStep(trackingCode.value, true)
    if (R.isNil(item.trackingID)) {
      throw new Error(`Tracking chưa có trong hệ thống`)
    }
    targetTrackingItem.value = item
    targetPiecesCount.value = item.piecesWithoutBoxCount || 1
    inputAddTrackingToBox.value = {
      trackingItemID: targetTrackingItem.value.trackingID
    }
    if (targetTrackingItem.value.warningState.length == 0) {
      await handleAddItemsTrackingBox()
    } else {
      targetStep.value = targetTrackingItem.value.warningState[0]
    }
  } catch (error) {
    notFoundPlayer.value.play()
    app.addErrorToQueue(`${error}`, 4000)
  }
}

watch(targetStep, (newValue) => {
  if (newValue == WarningState.packingRequest) {
    warningPlayer.value.play()
    if (R.isNil(inputAddTrackingToBox.value)) { return }
    handleAddItemsTrackingBox()
  }
  if (newValue == WarningState.noImage) {
    emptyPlayer.value.play()
  }
  if (newValue == WarningState.returnTracking) {
    notFoundPlayer.value.play()
  }
  if (newValue == null) {
    trackingCode.value = ""
  }
})

const submitPopupPiece = (input: ItemTrackingInput) => {
  if (R.isNil(targetTrackingItem.value)) { return }
  inputAddTrackingToBox.value = {
    trackingItemID: targetTrackingItem.value.trackingID,
    trackingItemPieceID: input.trackingItemPieceID || undefined
  }
  const isLastStep = targetStep.value == targetTrackingItem.value?.warningState[targetTrackingItem.value?.warningState.length - 1]
  if (isLastStep) {
    handleAddItemsTrackingBox()
  } else {
    const indexOfCurrentStep = R.findIndex(R.equals(targetStep.value), targetTrackingItem.value.warningState)
    if (indexOfCurrentStep >= 0) {
      targetStep.value = targetTrackingItem.value.warningState[indexOfCurrentStep + 1]
    } else {
      targetStep.value = null
    }
  }
}

const cancelPopupPiece = (value: boolean) => {
  if (!value) {
    targetStep.value = null
  }
}

const submitNoImage = () => {
  if (R.isNil(inputAddTrackingToBox.value)) { return }
  if (R.isNil(targetTrackingItem.value)) { return }

  const isLastStep = targetStep.value == targetTrackingItem.value?.warningState[targetTrackingItem.value?.warningState.length - 1] //Nếu là step cuối cùng
  if (isLastStep) {
    handleAddItemsTrackingBox()
    targetStep.value = null
  } else {
    const indexOfCurrentStep = R.findIndex(R.equals(targetStep.value), targetTrackingItem.value.warningState)
    if (indexOfCurrentStep >= 0) {
      targetStep.value = targetTrackingItem.value.warningState[indexOfCurrentStep + 1]
    } else {
      targetStep.value = null
    }
  }
}
const submitPackingRequest = () => {
  if (R.isNil(targetTrackingItem.value)) { return }
  const isLastStep = targetStep.value == targetTrackingItem.value?.warningState[targetTrackingItem.value?.warningState.length - 1]
  if (isLastStep) {
    handleAddItemsTrackingBox()
    targetStep.value = null
  } else {
    const indexOfCurrentStep = R.findIndex(R.equals(targetStep.value), targetTrackingItem.value.warningState)
    if (indexOfCurrentStep >= 0) {
      targetStep.value = targetTrackingItem.value.warningState[indexOfCurrentStep + 1]
    } else {
      targetStep.value = null
    }
  }
}

const cancelPopup = (value: boolean) => {
  if (!value) {
    targetStep.value = null
  }
}

const submitReturnTracking = (value: boolean) => {
  if (!value) {
    targetStep.value = null
  }
}

const handleAddItemsTrackingBox = async () => {
  if (R.isNil(lot.value)) return
  if (R.isNil(selectedBox.value)) return
  if (R.isNil(inputAddTrackingToBox.value)) { return }
  isAddingTrackingToBox.value = true
  try {
    const targetTrackingPieces = await apis.lotsAPI.createTrackingItemsBox(lot.value.id, selectedBox.value.id!, inputAddTrackingToBox.value)
    app.addSuccessToQueue('Thêm tracking thành công!')
    if (targetPiecesCount.value > 1) {
      const pieceID = R.prop('trackingItemPieceID', inputAddTrackingToBox.value)
      let pieces = R.reject(R.propEq('id', pieceID), trackingStore.pieceList)
      trackingStore.pieceList = pieces
    }
    dingPlayer.value.play()
    targetBox.value = selectedBox.value
    let newTrackingInBox: string[] = []
    if (!R.isNil(targetBox.value) && !R.isNil(targetBox.value.trackingItems)) {
      targetBox.value.trackingItems.forEach(item => {
        newTrackingInBox = R.append(item.trackingID, newTrackingInBox)
      })
      targetTrackingPieces.forEach(item => {
        if (!R.includes(item.trackingID, newTrackingInBox) && !R.isNil(targetBox.value) && !R.isNil(targetBox.value.trackingItemsCount)) {
          targetBox.value.trackingItemsCount = Number(targetBox.value.trackingItemsCount) + 1
          newTrackingInBox = R.append(item.trackingID, newTrackingInBox)
        }
      })
      targetBox.value.trackingItems = R.concat(targetBox.value.trackingItems, targetTrackingPieces)
      const index = R.findIndex(R.propEq('id', selectedBoxID.value), lot.value.boxes)
      if (index >= 0) {
        lot.value.boxes = R.update(index, targetBox.value, lot.value.boxes)
      }
    }
  } catch (error) {
    errorPlayer.value.play()
    app.addErrorToQueue(`${error}`, 4000)
  } finally {
    isAddingTrackingToBox.value = false
    trackingCode.value = ""
  }
}

const addTrackingToNewBox = async () => {
  isRemovingItems.value = true
  const input: AddTrackingItemsToNewBoxInput = {
    trackingPieceIDs: selectedTrackingItems.value,
    boxID: newBoxID.value
  }
  try {
    if (R.isNil(newBoxID.value)) {
      app.addErrorToQueue(`Vui lòng chọn thùng!`)
      throw new Error(`Vui lòng chọn thùng!`)
    }
    const changedTrackingPieces = await apis.lotsAPI.addTrackingItemsToNewBox(lotID, route.query.boxId as string, input)
    targetBox.value = selectedBox.value
    targetNewBox.value = confirmBox.value
    changedTrackingPieces.changedItems.forEach(piece => {
      if (!R.isNil(selectedBox.value) && !R.isNil(selectedBox.value.trackingItems)) {
        selectedBox.value.trackingItems = R.reject(R.propEq('id', piece.id), selectedBox.value.trackingItems)
      }
    })
    if (!R.isNil(targetNewBox.value) && !R.isNil(targetBox.value) && !R.isNil(targetBox.value.trackingItemsCount) && !R.isNil(lot.value)) {
      targetBox.value.trackingItemsCount = changedTrackingPieces.oldBoxCount
      const index = R.findIndex(R.propEq('id', selectedBoxID.value), lot.value.boxes)
      lot.value.boxes = R.update(index, targetBox.value, lot.value.boxes)
      targetNewBox.value.trackingItemsCount = changedTrackingPieces.newBoxCount
      const newBoxIndex = R.findIndex(R.propEq('id', newBoxID.value), lot.value.boxes)
      lot.value.boxes = R.update(newBoxIndex, targetNewBox.value, lot.value.boxes)
    }

    showMoveTrackingToBox.value = false
    showConfirmMoveTrackingToBox.value = false
    selectedTrackingItems.value = []
    newBoxID.value = null
    app.addSuccessToQueue(`Chuyển Tracking sang thùng mới thành công`)
  } catch (error) {
    app.addErrorToQueue(`${error}`)
  } finally {
    isRemovingItems.value = false
  }
}

useAsyncData(() => authStore.getAgents())

</script>