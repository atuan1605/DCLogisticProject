<template>
    <v-card>
        <v-card-item>
            <v-row>
                    <v-col cols="12" md="6">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field dense v-model="searchInput.searchString" placeholder="Nhập thông tin tìm kiếm">
                                </v-text-field>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="12" md="6">
                        <v-card-actions class="tw-justify-center tw-space-x-5">
                            <v-btn type="reset" class="tw-w-[120px] tw-text-secondary" size="large" @click="handleReset"
                                color="secondary" variant="outlined">
                                Reset
                            </v-btn>

                            <v-btn prepend-icon="mdi-filter" size="large" variant="elevated" @click="handleSearch"
                                color="accent" class="tw-w-[150px]" type="submit">Tìm kiếm</v-btn>
                            <v-btn prepend-icon="mdi-plus" size="large" variant="elevated" color="primary" class="tw-w-[160px]"
                                type="submit" @click="handleShowCreateWarehouse">Tạo Kho</v-btn>
                        </v-card-actions>
                    </v-col>
                </v-row>
        </v-card-item>
    </v-card>
</template>

<script setup lang="ts">
import { GetWarehouseQueryInput } from "~~/composables/useAPIs/warehouses";

const emits = defineEmits(["showCreateWarehouse", "reset", "search"])
interface Props {
    searchInput: GetWarehouseQueryInput
}
const props = defineProps<Props>()
const { searchInput } = toRefs(props);

const handleShowCreateWarehouse = () => {
    emits("showCreateWarehouse", true)
}

const handleReset = () => {
    emits("reset", true)
}

const handleSearch = () => {
    emits("search", true)
}
</script>