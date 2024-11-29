<template>
    <v-container>
        <v-card>
            <v-card-title>Import File</v-card-title>
            <v-card-subtitle>Some subtitle</v-card-subtitle>
            <v-card-text>
                <v-form @submit.prevent="importDataStore.importFlyingBackData">
                    <v-select label="Mã đaị lí" :items="authStore.agents" v-model="importDataStore.selectedAgent"
                        prepend-icon="mdi-face-agent" />
                    <v-file-input label="import file" accept="text/csv" v-model="importDataStore.importFile"
                        prepend-icon="mdi-file-import" />
                    <AppButton type="submit" :is-loading="importDataStore.isUploading" title="Upload" />
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
const authStore = useAuth()
useAsyncData(() => authStore.getAgents())

const importDataStore = useImportData()
</script>