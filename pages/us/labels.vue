<template>
    <v-container fluid>
        <v-card>
            <v-tabs color="primary" grow>
                <v-tab to="/us/labels">Tạo Label</v-tab>
                <v-tab to="/us/labels/scanned">Tracking đã scan</v-tab>
                <v-tab to="/us/labels/products">Tạo danh mục sản phẩm</v-tab>
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