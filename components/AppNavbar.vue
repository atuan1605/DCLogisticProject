<template>
    <v-app-bar color="primary">
        <template #prepend>
            <v-app-bar-nav-icon @click="toggleSideBar"></v-app-bar-nav-icon>
        </template>
        <v-app-bar-title>
            <div class="tw-flex tw-flex-row">
                <NuxtLink to="/">
                    <img class="tw-aspect-auto tw-h-8" :src="imageSrc(authStore.logo)" />
                </NuxtLink>
                <v-spacer />
            </div>
        </v-app-bar-title>
        <template #append v-if="authStore.isLoggedIn">
            <v-btn class="tw-text-white" @click="authStore.logout" variant="outlined"
                color="accent">Logout</v-btn>
        </template>
    </v-app-bar>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify/lib/framework.mjs';

export interface NavItem {
    path: string
    text: string
    exact: boolean
}

const app = useApp()
const { mobile } = useDisplay()

const toggleSideBar = () => {
    if (mobile.value) {
        if (app.isSideBarMini) {
            app.isSideBarMini = false
        }
        app.isShowingSideBar = !app.isShowingSideBar
    } else {
        if (!app.isShowingSideBar) {
            app.isShowingSideBar = true
        }
        app.isSideBarMini = !app.isSideBarMini
    }
}

const authStore = useAuth()
const config = useRuntimeConfig()
const imageSrc = (file: string) => {
    return `${config.public.apiBase}/files/dc/${file}`
}
</script>