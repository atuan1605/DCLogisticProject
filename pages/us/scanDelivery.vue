<template>
    <v-container fluid>
        <v-card>
            <v-tabs color="primary" grow>
                <v-tab to="/us/scanDelivery">NHẬP HÀNG TẠI US</v-tab>
                <v-tab to="/us/scanDelivery/warehouse">CHUYỂN KHO</v-tab>
            </v-tabs>
            <NuxtPage />
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['authenticated', 'permission-access']
})
</script>