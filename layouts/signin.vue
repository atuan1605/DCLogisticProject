<!-- <template>
    <div class="bg-white min-h-screen flex flex-col font-primary">

        <Head>
            <Link rel="preconnect" href="https://fonts.googleapis.com" />
            <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <Link
                href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                rel="stylesheet" />
        </Head>
        <AppNavbar />
        <div class="flex-1">
            <slot />
        </div>
        <footer class="bg-accent w-full">
            <div class="container mx-auto px-2 sm:px-6 lg:px-8 flex flex-col lg:flex-row py-10 items-center gap-8">
                <div class="flex-1 flex items-center justify-center">
                    <img :src="logoWhiteImage" class="aspect-auto w-2/3 md:w-1/2 lg:w-1/3" />
                </div>
                <div class="flex-1 flex lg:justify-center">
                    <div class="flex flex-col">
                        <h3 class="font-primary font-black text-2xl text-white">Dịch vụ</h3>
                        <h4 class="font-primary font-medium text-lg text-white">Trackings</h4>
                    </div>
                </div>
                <div class="flex-1 flex justify-center">
                    <div class="flex flex-col">
                        <h4 class="font-primary font-medium text-base text-white text-center lg:text-left">2127 SE 94th
                            Ave, Portland, OR 97216</h4>
                        <h4 class="font-primary font-bold text-base text-white text-center lg:text-left">+84 84 999 0999
                        </h4>
                        <h4 class="font-primary font-bold text-base text-white text-center lg:text-left">
                            dclogistics121221@gmail.com</h4>
                    </div>
                </div>
            </div>
        </footer>
    </div>
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
    ]
})
</script> -->

<template>
    <v-layout>
        <AppNavbar />
        <v-main class="tw-bg-slate-200 tw-min-h-screen tw-font-primary">
            <slot />
        </v-main>
        <AppFooter />
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
