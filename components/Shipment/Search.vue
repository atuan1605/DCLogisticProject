<template>
    <v-card variant="flat" class="tw-bg-white tw-rounded-t-lg tw-p-4 tw-flex tw-flex-col" title="Bộ lọc">
        <v-card-item >
            <v-row>
                <v-col cols="12" md="6">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field dense v-model="searchInput.shipmentCode" placeholder="Nhập thông tin tìm kiếm">
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
                            type="submit" @click="handleShowCreateShipment">Tạo chuyến</v-btn>
                    </v-card-actions>
                </v-col>
            </v-row>
        </v-card-item>
    </v-card>
</template>
<script setup lang="ts">
import { GetShipmentQueryInput } from '~~/composables/useAPIs/shipments';


const emits = defineEmits(["showCreateShipment", "reset", "search"])
interface Props {
    searchInput: GetShipmentQueryInput
}
const props = defineProps<Props>()
const { searchInput } = toRefs(props);

const handleShowCreateShipment = () => {
    emits("showCreateShipment", true)
}

const handleReset = () => {
    emits("reset", true)
}

const handleSearch = () => {
    emits("search", true)
}

</script>
