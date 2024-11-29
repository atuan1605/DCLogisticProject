<template>
    <v-footer app
        class="!tw-bg-accent tw-px-2 tw-sm:px-6 tw-lg:px-8 tw-flex tw-flex-col tw-lg:flex-row tw-py-10 tw-items-center tw-space-x-8">
        <div class="tw-flex-1 tw-flex tw-items-center tw-justify-center">
            <img :src="logoWhiteImage" class="tw-aspect-auto tw-w-2/3 tw-md:w-1/2 tw-lg:w-1/3" />
        </div>
        <div class="tw-flex-1 tw-flex tw-lg:justify-center">
            <div class="tw-flex tw-flex-col">
                <h3 class="tw-font-primary tw-font-black tw-text-2xl tw-text-white">Dịch vụ</h3>
                <h4 class="tw-font-primary tw-font-medium tw-text-lg tw-text-white">Trackings</h4>
            </div>
        </div>
        <div class="tw-flex-1 tw-flex tw-justify-center">
            <div class="tw-flex tw-flex-col">
                <h4 class="tw-font-primary tw-font-medium tw-text-base tw-text-white tw-text-center tw-lg:text-left">2127 SE
                    94th
                    Ave, Portland, OR 97216</h4>
                <h4 class="tw-font-primary tw-font-bold tw-text-base tw-text-white tw-text-center tw-lg:text-left">+84 84
                    999 0999
                </h4>
                <h4 class="tw-font-primary tw-font-bold tw-text-base tw-text-white tw-text-center tw-lg:text-left">
                    dclogistics121221@gmail.com</h4>
            </div>
        </div>
    </v-footer>
</template>

<script setup>
import logoWhite from '~/assets/images/dclogistics_logo_white.png'
const logoWhiteImage = ref(logoWhite)
</script>