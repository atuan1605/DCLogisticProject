<template>
    <v-container fluid>
        <v-card>
            <AgentSearch @show-create-agent="showDialogCreateAgent"
                :searchInput="useAgentStore.searchInput" @reset="refreshData" @search="searchAgent" />
        </v-card>
        <div style="text-align: center;" v-if="useAgentStore.isLoading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>
        <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-mt-4">
            <v-table class="tw-mt-4" fixed-header :height="'calc(100vh - 200px)'">
                <thead>
                    <tr class="tw-border-b tw-border-black tw-border-solid">
                        <th width="50">STT</th>
                        <th class="">Tên đại lý</th>
                        <th class="">Ngày tạo</th>
                        <th class="">Trạng thái</th>
                        <th class="">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="R.isEmpty(useAgentStore.agents || [])">
                        <td colspan="5" class="tw-py-8 tw-text-center">
                            No data.
                        </td>
                    </tr>
                    <template v-else>
                        <tr class="tw-hover:bg-accent/25"
                            v-for="(agent, index) in useAgentStore.agents || []" :key="agent.id">
                            <td width="50"> {{ index + 1 }}
                            </td>
                            <td class="tw-py-3" v-text="agent.name || 'Chưa có'" />
                            <td class="tw-py-3">
                                {{ $formatUTCToLocalTime(agent.createdAt) }}
                            </td>
                            <td class="tw-py-3">
                                <template v-if="R.isNil(agent.inactiveAt)">
                                    <span class="tw-text-green-500">Đang hoạt động</span>
                                </template>
                                <template v-else>
                                    <span class="tw-text-red-500">Ngưng hoạt động</span>
                                </template>
                            </td>
                            <td>
                                <template v-if="R.isNil(agent.inactiveAt)">
                                    <v-btn color="primary" @click="onUpdateAgent(agent)">
                                        Đóng đại lý
                                    </v-btn>
                                </template>
                                <template v-else>
                                    <v-btn color="accent" @click="onUpdateAgent(agent)">
                                        Kích hoạt
                                    </v-btn>
                                </template>

                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>

            <AgentCreateDialog v-model="isShowCreateAgentDialog" @created="onCreate" />
            <template v-if="!R.isNil(targetAgent)">
                <ConfirmDialog :loading="useAgentStore.isUpdating" :model-value="showConfirmModal"
                    :content="`${R.isNil(targetAgent.inactiveAt) ? 'Xác nhận thay đổi trạng thái của đại lý sang ngưng hoạt động?' : 'Bạn có muốn kích hoạt đại lý không?'}`"
                    @submit="submitUpdateAgent" @update:modelValue="value => showConfirmModal = value" />
            </template>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import agents, { AgentOutput } from '~~/composables/useAPIs/agents'

definePageMeta({
    middleware: ['authenticated']
})

const useAgentStore = useAgent()
const isShowCreateAgentDialog = ref(false)
const showConfirmModal = ref(false)
const targetAgent = ref<AgentOutput | undefined>(undefined)
const showDialogCreateAgent = () => {
    isShowCreateAgentDialog.value = true
    console.log(isShowCreateAgentDialog.value)
}
const searchAgent = () => {
    useAgentStore.getAllAgents()
}
const refreshData = () => {
    useAgentStore.getAllAgents()
}
const onCreate = () => {
    isShowCreateAgentDialog.value = false
}
const onUpdateAgent = (agent: AgentOutput) => {
    targetAgent.value = agent
    showConfirmModal.value = true
}
const submitUpdateAgent = () => {
    if (R.isNil(targetAgent.value)) { return }
    useAgentStore.updateAgents(targetAgent.value.id, R.isNil(targetAgent.value.inactiveAt))
    targetAgent.value = undefined
    showConfirmModal.value = false
}
useAsyncData(() => useAgentStore.getAllAgents())
</script>