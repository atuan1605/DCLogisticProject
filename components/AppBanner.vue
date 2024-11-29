<template>
    <v-snackbar :color="appStore.messageColor" :model-value="!R.isNil(appStore.activeMessage)">
        <span class="tw-text-2xl tw-my-4">{{ appStore.activeMessage?.message || 'No Message' }}</span>
    </v-snackbar>
</template>

<script setup lang="ts">
import * as R from 'ramda'
const appStore = useApp()
</script>