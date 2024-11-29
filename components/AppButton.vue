<template>
    <button :disabled="disabled || isLoading"
        :class="['tw-rounded-full tw-flex tw-items-center tw-justify-center tw-px-4 tw-transition-transform tw-active:scale-95 tw-duration-150 tw-w-full tw-h-12 tw-relative', buttonClass]">
        <Spinner
            :class="[isLoading ? 'tw-opacity-100' : 'tw-opacity-0', 'tw-absolute tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-m-auto']" />
        <div :class="['tw-flex tw-gap-2 tw-items-center', isLoading ? 'tw-opacity-0' : 'tw-opacity-100']">
            <slot name="icon" />
            <p v-if="hasTitle" class="tw-hidden tw-lg:block tw-font-primary tw-font-medium tw-uppercase" v-text="title" />
            <p v-if="R.isNil(mobileTitle) || !R.isEmpty(mobileTitle || '')"
                class="tw-block tw-lg:hidden tw-font-primary tw-font-medium tw-uppercase tw-text-sm"
                v-text="R.isNil(mobileTitle) ? title : mobileTitle" />
        </div>
    </button>
</template>

<script setup lang="ts">
import * as R from 'ramda'
export interface Props {
    isLoading?: boolean
    title?: string
    mobileTitle?: string
    buttonType?: 'primary' | 'secondary'
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
    buttonType: 'primary',
    disabled: false
})

const hasTitle = computed(() => {
    return !R.isNil(props.title) || !R.isNil(props.mobileTitle)
})

const buttonClass = computed(() => {
    if (props.buttonType === 'primary') {
        if (props.disabled) {
            return 'tw-bg-slate-200 tw-text-white'
        }
        return 'tw-hover:bg-accent-hover tw-active:bg-accent-active tw-bg-accent tw-text-white'
    } else {
        if (props.disabled) {
            return 'tw-border tw-border-slate-200 tw-text-slate-200'
        }
        return 'tw-border tw-hover:border-accent-hover tw-active:border-accent-active tw-border-accent text-accent'
    }
})

</script>