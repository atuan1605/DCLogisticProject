<template>
    <v-container fluid>
        <v-card>
            <v-tabs color="primary" grow>
                <v-tab to="/trackingReport">Thống kê</v-tab>
                <v-tab to="/trackingReport/details">Chi tiết tracking</v-tab>
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