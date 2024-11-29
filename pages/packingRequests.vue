<template>
    <v-container fluid>
        <v-card>
            <v-tabs color="primary" grow>
                <v-tab to="/packingRequests">Yêu cầu đặc biệt</v-tab>
                <v-tab to="/packingRequests/holdStates">Hold/ Return/ Cho bay về</v-tab>
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