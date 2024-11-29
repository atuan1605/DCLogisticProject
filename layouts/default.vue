<template>
    <v-layout>
        <AppNavbar />
        <AppSideBar />
        <v-main class="tw-bg-slate-300 tw-min-h-screen tw-font-primary">
            <slot />
        </v-main>
        <!-- <AppFooter /> -->
        <AppBanner />
    </v-layout>
</template>

<script setup>
import logoWhite from '~/assets/images/dclogistics_logo_white.png'
const logoWhiteImage = ref(logoWhite)

useHead({
    title: 'DC Logistics',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
    charset: 'utf-8',
    meta: [
        { name: 'description', content: 'DCLogistics - Kho dành cho nhà buôn' }
    ],
    link: [
        {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com'
        },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: true
        },
        {
            href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
            rel: 'stylesheet'
        }
    ]
})
</script>