<template>
    <v-dialog :model-value="modelValue" transition="dialog- bottom-transition" width="450"
        :persistent="props.isLoading">
        <v-card>
            <template #title>
                DANH SÁCH MẢNH {{ trackingNumber }}
            </template>
            <template #text>
                <v-form ref="form" @submit.prevent="onSubmitForm">
                    <v-container>
                        <v-col cols="12">
                            <v-select v-model="pieceID" variant="outlined" :items="trackingStore.pieceList"
                                item-title="information" item-value="id" label="Chọn Mảnh" />
                        </v-col>
                        <div class="tw-flex tw-space-x-5 tw-items-center tw-justify-end">
                            <v-btn prepend-icon="mdi-cancel" variant="outlined"
                                @click="$emit('update:modelValue', false)">Huỷ</v-btn>
                            <v-btn :loading="props.isLoading" prepend-icon="mdi-check" color="primary" type="submit"
                                >Cập
                                nhật</v-btn>
                        </div>
                    </v-container>
                </v-form>
            </template>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import Input from 'postcss/lib/input';
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { ItemTrackingInput } from '~~/composables/useAPIs/lots';
import { TrackingItemOutput } from '~~/composables/useAPIs/trackings';


export interface Props {
    modelValue: boolean
    trackingID: string
    isLoading: boolean
    trackingNumber: string
    pieceCount: number
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isLoading: false
})

const form = ref<VForm | null>(null)
const emits = defineEmits(["submit"])
const pieceID = ref("")
const isAddingPiece = ref(false)
const trackingStore = useTracking()

watch(() => props.trackingID, async (newTrackingID) => {
    if (R.isNil(newTrackingID) || R.isEmpty(newTrackingID)) {
        return
    }
    isAddingPiece.value = true
    if (props.pieceCount > 1) {
        await trackingStore.getPieces(newTrackingID)
    }
})

const onSubmitForm = async () => {
    isAddingPiece.value = true
    if (!form.value) { return }

    let input: ItemTrackingInput = {
        trackingItemID: props.trackingID
    }
    if (pieceID.value) {
        input = R.assoc('trackingItemPieceID', pieceID.value, input)
    }
    emits('submit', input)
    pieceID.value = ""
}

</script>