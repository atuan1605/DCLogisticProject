<template>
    <div style="text-align: center;" v-if="userStore.isLoadingDetail">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
    <v-row class="px-5 pt-5" v-else-if="!userStore.isLoadingDetail && userStore.userDetail">
        <v-col cols="12" md="5">
            <v-card>
                <v-card-title class="text-h6 text-primary">
                    CẬP NHẬT THÔNG TIN USER
                </v-card-title>
                <v-card-text>
                    <VForm ref="form">
                        <v-row class="mt-5">
                            <v-col cols="12" md="6">
                                <v-text-field v-model="userStore.userDetail.username" label="Username" :disabled="true"
                                    placeholder="Nhập Username" :rules="[
                                        validator.required('Username')
                                    ]" variant="outlined"></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                            </v-col>
                        </v-row>
                    </VForm>
                </v-card-text>
            </v-card>
            <v-card class="mt-3">
                <v-card-title class="text-h6 text-primary">
                    QUYỀN TRUY CẬP ĐẠI LÝ
                </v-card-title>
                <v-card-text v-if="!R.isEmpty(authStore.agents)">
                    <v-select :disabled="userStore.userDetail.isExternal" hide-details="auto"
                        v-model="userStore.userDetail.agentCodes" :items="authStore.agents" label="Mã đại lí" multiple
                        persistent-hint></v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="userStore.userDetail.isExternal" :loading="userStore.isAddingAgentsUser"
                        prepend-icon="mdi-check" variant="elevated" color="primary" class="tw-w-[150px]"
                        @click="assignAgentCodes">Cập nhật</v-btn>
                </v-card-actions>
            </v-card>
            <v-card class="mt-3">
                <v-card-title class="text-h6 text-primary">
                    QUYỀN TRUY CẬP KHO
                </v-card-title>
                <v-card-text>
                    <v-select hide-details="auto" v-model="userStore.userDetail.warehouses" item-title="name"
                        :items="userStore.warehouses" label="Kho" multiple persistent-hint></v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :loading="userStore.isAddingWarehousesUser" prepend-icon="mdi-check" variant="elevated"
                        color="primary" class="tw-w-[150px]" @click="assignWarehouseCodes">Cập nhật</v-btn>
                </v-card-actions>
            </v-card>
            <v-card class="mt-3">
                <template #title>
                    Lịch sử thay đổi User
                    <v-divider class="tw-my-3" />
                </template>
                <template #text>
                    <UserTimeline :timeline-items="userStore.timeline || []" />
                </template>
            </v-card>

        </v-col>
        <v-col cols="12" md="7">
            <v-card v-if="R.length(userStore.token) > 0" class="tw-mb-5">
                <v-card-title class="text-h6 text-primary">
                    YÊU CẦU ĐỔI MẬT KHẨU
                </v-card-title>
                <v-card-text>
                    Vui lòng Copy và Truy cập vào Link sau để đổi mật khẩu:
                    <a class="tw-font-bold" :href="generateLink(userStore.token)">{{ generateLink(userStore.token)}}</a>
                </v-card-text>

            </v-card>

            <v-card>

                <v-card-title class="text-h6 text-primary">
                    THÊM SCOPE CHO USER
                </v-card-title>
                <v-card-text class="ml-10">
                    <tree v-if="userStore.scopes && !R.isNil(userStore.scopes)" :config="config"
                        :nodes="userStore.scopes">
                    </tree>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :loading="userStore.isAddingScopesUser" prepend-icon="mdi-check" variant="elevated"
                        color="primary" class="tw-w-[150px]" @click="updateScopesUser">Cập nhật</v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import * as R from 'ramda';
import { VForm } from 'vuetify/components';
import { AssignWarehouseInput, UpdateScopeUserInput, AssignAgentInput } from '~~/composables/useAPIs/system/user';
import { WarehouseOutput } from '~~/composables/useAPIs/warehouses';

import Tree from "vue3-treeview"
import "vue3-treeview/dist/style.css"

definePageMeta({
    middleware: ['authenticated']
})

const userStore = useUser()
const route = useRoute()
const authStore = useAuth()
const validator = useValidators()
const form = ref<VForm | null>(null)
const config = ref({
    roots: ["allAccess"],
    keyboardNavigation: true,
    checkboxes: true,
    checkMode: 0,
    padding: 25,
})

const userID: string = route.params.userID as string
useAsyncData(() => userStore.getUserDetail(userID))
const updateScopesUser = () => {
    let checkedScopes: string[] = []
    if (R.isNil(userStore.scopes)) return
    const filterCheckedFn = (value, key, obj) => {
        if (!R.isNil(value.state) && value.state.checked === true) {
            checkedScopes = R.append(key, checkedScopes)
        }
    };
    R.mapObjIndexed(filterCheckedFn, userStore.scopes)

    userStore.userScopes = R.uniq(userStore.userScopes)
    const input: UpdateScopeUserInput = {
        scope: checkedScopes
    }
    userStore.updateScopesUser(userID, input)
}

const agentIDs = ref()

const assignAgentCodes = () => {
    let index = 0;
    let input: AssignAgentInput = { agentIDs: {} }

    if (R.isNil(userStore.userDetail)) return
    const mapAgentCodesFn = (agentCode: string) => {
        agentIDs.value = R.assoc(agentCode, index, agentIDs.value)
        index = index + 1;
    }
    R.forEach(mapAgentCodesFn, userStore.userDetail.agentCodes || [])
    input = R.assoc('agentIDs', agentIDs.value, input)
    userStore.assignAgents(input)
}

const assignWarehouseCodes = () => {
    let index = 0;
    let input: AssignWarehouseInput[] = []
    if (R.isNil(userStore.userDetail)) return
    const mapWarehouseCodesFn = (warehouseCode: string) => {
        const warehouse: WarehouseOutput[] = R.filter(R.propEq('name', warehouseCode), userStore.warehouses)
        if (R.isEmpty(warehouse)) return
        const warehouseIDs: AssignWarehouseInput = {
            warehouseID: warehouse[0].id,
            index: index
        }
        input = R.append(warehouseIDs, input)
        index = index + 1;
    }
    R.forEach(mapWarehouseCodesFn, userStore.userDetail.warehouses || [])
    userStore.assignWarehouses(input)
}
const { origin, protocol, host, port, search, hash } = window.location;
const generateLink = (token: string) => {
   return `${origin}/resetPassword/${token}`
}
</script>
<style>
.vue-treeselect__control {
    display: none !important;
}
</style>