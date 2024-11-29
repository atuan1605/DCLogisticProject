<template>
    <v-container fluid>
        <v-tabs bg-color="black">
            <v-tab :to="{
                path: `/customers/${customerID}`
            }">Thông tin</v-tab>
            <v-tab :to="{
                path: `/customers/${customerID}/deliveries`
            }">Đã giao</v-tab>
        </v-tabs>
        <NuxtPage />
    </v-container>
</template>

<script setup lang="ts">

const route = useRoute()
const customerID: string = route.params.customerID as string

</script>