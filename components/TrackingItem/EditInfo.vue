
<template>
    <v-card>
        <template #title>
            THÔNG TIN TRACKING
            <hr />
        </template>
        <template #text>
            <v-form ref="form" @submit.prevent="onSubmit">
                <v-container>
                    <v-row>
                        <v-col cols="12" md="6">
                            <p><strong class="tw-mr-2">Tracking Number:</strong> {{ props.trackingItem?.trackingNumber }}
                            </p>

                            <strong class="tw-mr-2">Status:</strong>
                            <div
                                :class="['tw-rounded-full tw-mr-2 tw-w-4 tw-h-4 tw-inline-block', trackingStore.trackingStatusBGClass]">
                            </div>
                            {{ trackingStore.displayedTrackingStatus }}
                        </v-col>
                        <v-col cols="12" md="6" style="max-height: 200px;">
                            <v-img v-if="trackingStore.mainImage" class="tw-h-auto tw-w-50"
                                :src="trackingStore.mainImagePath" />
                        </v-col>
                        <v-col cols="12" v-if="!R.isNil(customerStore.customers)">
                            <CustomerSearchInput v-model="customerIDs" />
                        </v-col>
                        <v-col cols="12">
                            <v-select v-model="agentCode" variant="outlined" label="Mã đại lí" :rules="[
                                validators.required('Mã đại lí')
                            ]" :items="authStore.agents" />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea v-model="itemDescription" variant="outlined" label="Note" />
                        </v-col>
                    </v-row>
                    <div class="tw-flex tw-space-x-5 tw-items-center tw-justify-end">
                        <v-btn :loading="props.isLoading" prepend-icon="mdi-check" type="submit" size="large"
                            color="accent">Update</v-btn>
                    </div>
                </v-container>
            </v-form>
        </template>
    </v-card>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components'
import { TrackingItemOutput, UpdateTrackingItemInput } from '~~/composables/useAPIs/trackings';
import { CustomerSuggestionsInput } from '~~/composables/useAPIs/customers';

export interface Props {
    trackingItem?: TrackingItemOutput | null
    isLoading: boolean
}
const customerStore = useCustomer()
const trackingStore = useTracking()
const props = withDefaults(defineProps<Props>(), {
    isLoading: false
})

const authStore = useAuth()
useAsyncData(() => authStore.getAgents())



const emit = defineEmits(['update:modelValue', 'submit'])
const form = ref<VForm | null>(null)


const customerIDs = ref(props.trackingItem?.customers?.map(x => x.id))
const agentCode = ref(props.trackingItem?.agentCode)
const itemDescription = ref(props.trackingItem?.itemDescription)

watch(() => props.trackingItem, async (newItem) => {
    customerIDs.value = newItem?.customers?.map(x => x.id)
    agentCode.value = newItem?.agentCode
    itemDescription.value = newItem?.itemDescription
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
            emit('submit', input)
        }
    }
}

</script>