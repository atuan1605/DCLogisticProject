<template>
    <div class="tw-w-full tw-min-h-full tw-flex tw-flex-col tw-items-center tw-justify-center">
        <h6 class="tw-text-2xl tw-font-bold tw-text-tw-error">Error</h6>
        <p class="tw-text-base">{{ props.errorMessage }}</p>
    </div>
</template>

<script setup lang="ts">
export interface Props {
    errorMessage: string,
    reload?: () => void
}

const props = withDefaults(defineProps<Props>(), {
    errorMessage: '',
})

</script>