<template>
    <v-dialog :model-value="modelValue" transition="dialog- bottom-transition" width="450"
        :persistent="props.isLoading">
        <v-card>
            <template #title>
                Danh sách đại lý
            </template>
            <template #text>
                <v-form ref="form" @submit.prevent="onSubmitForm">
                    <v-container>
                        <v-col cols="12">
                            <v-select v-model="agentID" variant="outlined" :items="agentIDs" item-value="id"
                                label="Chọn đại lý" />
                        </v-col>
                        <div class="tw-flex tw-space-x-5 tw-items-center tw-justify-end">
                            <v-btn class="tw-text-white" v-if="!props.isLoading" variant="outlined"
                                @click="$emit('update:modelValue', false)">Huỷ</v-btn>
                            <v-btn class="tw-text-white" :loading="props.isLoading" type="submit"
                                color="accent">Cập nhật</v-btn>
                        </div>
                    </v-container>
                </v-form>
            </template>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components'
import { UpdateTrackingItemsInput } from '~~/composables/useAPIs/trackings'

const authStore = useAuth()
export interface Props {
    modelValue: boolean
    trackingIDs: string[]
    isLoading: boolean
    agentIDs: string[]
}
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isLoading: false
})

const agentID = ref("")
const emits = defineEmits(["submit"])

const onSubmitForm = async () => {
    if (R.isNil(agentID.value)) return

    let input: UpdateTrackingItemsInput = {
        trackingItemIDs: props.trackingIDs,
        agentID: agentID.value
    }
    
    emits('submit', input)
    agentID.value = ""
    console.log(input)
} 

</script>