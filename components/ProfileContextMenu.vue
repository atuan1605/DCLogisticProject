<template>
    <div class="tw-bg-accent tw-rounded-lg tw-p-2 tw-shadow-lg tw-w-40">
        <!-- <button class="flex p-2 w-full rounded-md gap-4 items-center bg-white">
            <PencilIcon class="w-6 h-6 text-black shrink-0" />
            <p class="font-primary text-black grow">Edit Profile</p>
        </button> -->
        <button @click="$emit('onLogOutClicked')"
            class="tw-mt-2 tw-flex tw-p-2 tw-w-full tw-rounded-md tw-gap-4 tw-items-center tw-bg-white">
            <ArrowLeftOnRectangleIcon class="tw-w-6 tw-h-6 tw-text-accent tw-shrink-0" />
            <p class="tw-font-primary tw-text-black tw-grow">Sign Out</p>
        </button>
    </div>
</template>

<script setup lang="ts">
import { ArrowLeftOnRectangleIcon, PencilIcon } from '@heroicons/vue/24/outline'

defineEmits(['onLogOutClicked'])
</script>