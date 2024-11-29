<template>
    <div
        class="tw-min-h-12 tw-h-auto tw-w-full tw-mt-8 tw-rounded-xl tw-flex tw-items-center tw-justify-between tw-gap-x-4 tw-py-2 tw-max-w-full tw-border tw-px-4 tw-border-black">
        <slot name="prependIcon" />
        <label for="searchingTrackings"
            :class="['tw-h-full tw-flex tw-flex-wrap tw-items-center tw-grow tw-bg-transparent tw-gap-x-3 tw-gap-y-3']"
            :style="inputMaxWidthStyle">
            <input ref="searchInput"
                class="tw-grow tw-h-8 tw-w-full tw-bg-transparent tw-text-center tw-font-primary tw-text-sm"
                :placeholder="placeholder" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
        </label>
        <button class="tw-shrink-0" v-if="isShowingClearIcon" @click="$emit('click:clear')">
            <XCircleIcon class="tw-w-6 tw-h-6 tw-text-white" />
        </button>
    </div>
</template>

<script setup lang="ts">
export interface Props {
    isShowingClearIcon: boolean
    modelValue?: string
    placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
    isShowingClearIcon: false,
    modelValue: undefined
})

defineEmits(['click:clear', 'update:modelValue'])

const inputMaxWidthStyle = computed(() => {
    if (props.isShowingClearIcon) {
        return {
            maxWidth: 'calc(100% - 72px)'
        }
    }

    return {
        maxWidth: 'calc(100% - 48px)'
    }
})

</script>