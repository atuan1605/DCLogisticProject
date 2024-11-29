<template>
    <div v-if="modelValue"
        :class="['tw-fixed tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-w-screen tw-h-screen tw-bg-black/70 tw-flex tw-justify-center tw-items-center tw-transition-opacity tw-duration-250', modelValue ? 'tw-opacity-100' : 'tw-opacity-0']"
        @click.self="$emit('update:modelValue', false)">
        <slot />
    </div>
</template>

<script setup lang="ts">
export interface Props {
    modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

</script>