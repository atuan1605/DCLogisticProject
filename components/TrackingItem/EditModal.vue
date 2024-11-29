<template>
    <v-dialog v-model="modal" :fullscreen="mobile" :persistent="props.isLoading">
        <v-card>
            <template #title>
                Edit Tracking Item {{ props.trackingItem?.trackingNumber }}
            </template>
            <template #text>
                <v-form ref="form" @submit.prevent="onSubmit">
                    <v-container>
                        <v-row>
                            <v-col cols="12" v-if="R.propOr(false, 'isWalmartTracking', props.trackingItem)">
                                <v-text-field v-model="alternativeRef" variant="outlined"
                                    label="Mã thay thế (Alternative Ref)" />
                            </v-col>
                            <v-col cols="12">
                                <CustomerSearchInput v-model="customerIDs" />
                            </v-col>
                            <v-col cols="12">
                                <v-select v-model="agentCode" variant="outlined" label="Mã đại lí"
                                    :items="authStore.agents" />
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="itemDescription" variant="outlined" label="Note" />
                            </v-col>
                        </v-row>
                        <div class="tw-flex tw-space-x-5 tw-items-center tw-justify-end">
                            <v-btn v-if="!props.isLoading" variant="outlined"
                                @click="$emit('update:modelValue', false)">Cancel</v-btn>
                            <v-btn :loading="props.isLoading" type="submit" color="accent">Update</v-btn>
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
import { useDisplay } from 'vuetify/lib/framework.mjs';
import { TrackingItemOutput, UpdateTrackingItemInput } from '~~/composables/useAPIs/trackings';
import { CustomerSuggestionsInput } from '~~/composables/useAPIs/customers';

export interface Props {
    modelValue: boolean
    trackingItem?: TrackingItemOutput | null
    isLoading: boolean
}
const { mobile } = useDisplay()
const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    isLoading: false
})

const authStore = useAuth()
useAsyncData(() => authStore.getAgents())


const emit = defineEmits(['update:modelValue', 'submit'])
const form = ref<VForm | null>(null)

const modal = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})

const customerIDs = ref(props.trackingItem?.customers?.map(x => x.id))
const agentCode = ref(props.trackingItem?.agentCode)
const itemDescription = ref(props.trackingItem?.itemDescription)
const alternativeRef = ref(props.trackingItem?.alternativeRef)

watch(() => props.trackingItem, async (newItem) => {
    console.log("test")
    customerIDs.value = newItem?.customers?.map(x => x.id)
    agentCode.value = newItem?.agentCode
    itemDescription.value = newItem?.itemDescription
    alternativeRef.value = newItem?.alternativeRef
    form.value?.resetValidation()
})

const validators = useValidators()


const onSubmit = async () => {
    if (form.value) {
        const { valid } = await form.value?.validate()

        if (valid) {
            let input: UpdateTrackingItemInput = {}
            if (customerIDs.value) {
                input = R.assoc('customerIDs', customerIDs.value, input)
            }
            if (agentCode.value) {
                input = R.assoc('agentCode', agentCode.value, input)
            }
            if (itemDescription.value) {
                input = R.assoc('itemDescription', itemDescription.value, input)
            }
            if (alternativeRef.value) {
                input = R.assoc('alternativeRef', alternativeRef.value, input)
            }
            console.log('updating input', input)
            emit('submit', input)
        }
    }
}

</script>