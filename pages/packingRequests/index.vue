<template>
    <v-container fluid>
        <div class="tw-flex tw-justify-center tw-w-full tw-gap-3">
            <v-chip :color="R.equals(FilterStateInput.unprocessed, filterInput) ? 'primary' : 'secondary'"
                size="x-large" @click="toggleFilter(FilterStateInput.unprocessed)"
                :class="R.equals(FilterStateInput.unprocessed, filterInput) ? 'tw-text-bold' : 'tw-cursor-pointer'">
                Đang chờ xử lý
            </v-chip>
            <v-chip :color="R.equals(FilterStateInput.processed, filterInput) ? 'primary' : 'secondary'" size="x-large"
                @click="toggleFilter(FilterStateInput.processed)"
                :class="R.equals(FilterStateInput.processed, filterInput) ? 'tw-text-bold' : 'tw-cursor-pointer'">
                Đã xử lý
            </v-chip>

        </div>
        <div>
            <v-card variant="flat" class="tw-bg-white tw-rounded-t-lg tw-p-4 tw-flex tw-flex-col">
                <v-card-item>
                    <v-row>
                        <v-col cols="12" md="10">
                            <v-text-field label="Mã tracking" v-model="packingRequestStore.searchInput"
                                placeholder="Nhập mã tracking" />
                        </v-col>
                        <v-col cols="12" md="1" class="tw-flex tw-justify-center">
                            <v-btn type="reset" class="tw-w-[150px] tw-text-secondary" size="large" @click="refreshData"
                                color="secondary" variant="outlined">
                                Reset
                            </v-btn>
                        </v-col>
                        <v-col cols="12" md="1" class="tw-flex tw-justify-center">
                            <v-btn prepend-icon="mdi-filter" size="large" :loading="packingRequestStore.isLoading"
                                variant="elevated" @click="getItems" color="accent" class="tw-w-[150px]"
                                type="submit">Tìm kiếm</v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </div>
        <div class="tw-flex tw-flex-row tw-gap-8">
            <template v-for="agent in authStore.agents">
                <v-chip :color="R.equals(targetAgentID, agent) ? 'primary' : 'secondary' "
                    class="tw-cursor-pointer text-lg" @click="pickAgent(agent)">{{ agent }}</v-chip>
            </template>
        </div>
        <div>
            <PackingRequestTable :filter-input=" filterInput" />
        </div>
    </v-container>
</template>

<script setup lang="ts">
import { FilterStateInput, PackingRequestState } from '~~/composables/useAPIs/packingRequest';
import * as R from 'ramda'
definePageMeta({
    middleware: ['authenticated', 'permission-access']
})
const targetAgentID = ref<string | null>(null)
const packingRequestStore = usePackingRequest()
const filterInput = ref(FilterStateInput.unprocessed)
const toggleFilter = (stateInput: FilterStateInput) => {
    if (R.equals(stateInput, filterInput.value)) { return }
    packingRequestStore.targetPage = 1
    filterInput.value = stateInput
    packingRequestStore.searchInput = null
    packingRequestStore.getPackingRequestItems(filterInput.value)
}
const getItems = async () => {
    await packingRequestStore.getPackingRequestItems(filterInput.value)
}
const refreshData = async () => {
    packingRequestStore.targetPage = 1
    packingRequestStore.targetPer = 100
    packingRequestStore.searchInput = null
    await packingRequestStore.getPackingRequestItems(filterInput.value)
}
const authStore = useAuth()
onMounted(() => {
    authStore.getAgents()
})
useAsyncData(() => packingRequestStore.getPackingRequestItems(filterInput.value))
const pickAgent = async(agentID: string) => {
    if (targetAgentID.value != agentID) {
        targetAgentID.value = agentID
    } else {
        targetAgentID.value = null
    }
    packingRequestStore.agentIDInput = targetAgentID.value
    await packingRequestStore.getPackingRequestItems((filterInput.value))
}
</script>