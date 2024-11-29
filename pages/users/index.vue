<template>
    <v-card class="tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
        <v-card-item>
            <v-row>
                <v-col cols="12" md="8">
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-text-field dense placeholder="Nhập thông tin tìm kiếm" v-model="searchUsername">
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select hide-details="auto" v-model="searchAgentCode" item-value="name" item-title="name"
                                :items="authStore.agents" label="Đại lý" persistent-hint></v-select>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select hide-details="auto" v-model="searchWarehouseID" item-value="id" item-title="name"
                                :items="userStore.warehouses" label="Kho" persistent-hint></v-select>
                        </v-col>

                    </v-row>
                </v-col>
                <v-col cols="12" md="3">
                    <v-card-actions class="tw-justify-center tw-space-x-5">
                        <v-btn type="reset" class="tw-w-[120px] tw-text-secondary" @click="resetQuery" color="secondary"
                            variant="outlined">
                            Reset
                        </v-btn>

                        <v-btn prepend-icon="mdi-filter" variant="elevated" @click="onSearchTapped" color="accent"
                            class="tw-w-[150px]" type="submit">Tìm kiếm</v-btn>
                        <v-btn prepend-icon="mdi-plus" variant="elevated" color="primary" class="tw-w-[160px]"
                            type="submit" @click="showDialogCreateUser">Tạo User</v-btn>
                    </v-card-actions>
                </v-col>
            </v-row>
        </v-card-item>
    </v-card>
    <v-card>
        <v-card-text>
            <div style="text-align: center;" v-if="userStore.isLoadingUsers">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <v-data-table v-else-if="!R.isEmpty(userStore.users)" :headers="dessertHeaders" :items="userStore.users"
                class="elevation-1" item-value="id" :items-per-page="-1" fixed-header :height="'calc(100vh - 300px)'"
                :hide-default-footer="true">
                <template v-slot:item.no="{ item }">
                    {{ R.findIndex(R.propEq('id', item.id))(userStore.users || []) + 1 }}
                </template>
                <template v-slot:item.agentCodes="{ item }">
                    <v-chip color="primary" v-for="agentCode in item.agentCodes" class="ma-2" label>{{ agentCode
                        }}</v-chip>
                </template>
                <template v-slot:item.warehouses="{ item }">
                    <v-chip color="blue" v-for="warehouse in item.warehouses" class="ma-2" label>{{ warehouse
                        }}</v-chip>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-btn class="ml-2" variant="outlined" size="small" icon color="default"
                        @click="gotoDetail(item.id)">
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn class="ml-2" variant="outlined" size="small" @click="showConfirmDeleteUser(item)" icon
                        color="primary">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
                <template #bottom>
                    <v-sheet height="20" />
                </template>
            </v-data-table>
            <v-col cols="12" class="py-0">
            </v-col>
            <UserCreateDialog v-model="userStore.isShowCreateUserDialog" @createUser="userStore.createUser" />
        </v-card-text>
    </v-card>
    <ConfirmDialog :loading="userStore.isDeletingUser" v-model="showDeletedDialog" @submit="onDeleteUser"
        :content="`Bạn có chắc chắn muốn user: ${targetUsername} ngưng hoạt động`"
        @update:model-value="value => showDeletedDialog = value" />
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { UserOutput } from '~~/composables/useAPIs/system/user';
const authStore = useAuth()
definePageMeta({
    middleware: ['authenticated', 'permission-access']
})

const userStore = useUser()

const route = useRoute()

const dessertHeaders = [
    { title: 'STT', key: 'no', width: 50 },
    { title: 'Username', key: 'username' },
    { title: 'Đại lý', key: 'agentCodes' },
    { title: 'Kho', key: 'warehouses' },
    { title: 'Thao tác', key: 'action', align: 'center', width: 150 },
]
const searchUsername = ref(null)
const searchWarehouseID = ref(null)
const searchAgentCode = ref(null)

const showDialogCreateUser = () => {
    userStore.isShowCreateUserDialog = true
}

const gotoDetail = (userID: string) => {
    navigateTo({
        path: `/users/${userID}`
    })
}

const resetQuery = async () => {
    if (userStore.isSearching) {
        return
    }
    await navigateTo({
        path: route.path,
        query: {}
    })
    await refresh()
}

const onSearchTapped = async () => {
    if (userStore.isSearching) {
        return
    }
    userStore.searchUserInput = {
        username: searchUsername.value,
        warehouseID: searchWarehouseID.value,
        agentCode: searchAgentCode.value
    }
    await navigateTo({
        path: route.path,
        query: userStore.searchUserInput
    })
    await refresh()
}
const updatedUser = ref<UserOutput | null>(null)
const targetUsername = ref("")
const showDeletedDialog = ref(false)
const showConfirmDeleteUser = async (user: UserOutput) => {
    targetUsername.value = user.username
    updatedUser.value = user
    showDeletedDialog.value = true
}
const onDeleteUser = async () => {
    if (R.isNil(updatedUser.value)) { return }
    await userStore.deleteUser(updatedUser.value.id)
    showDeletedDialog.value = false
    updatedUser.value = null
}
const { pending, error, refresh } = await useAsyncData('users', () => userStore.search())
</script>
