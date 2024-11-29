<template>
    <div>
        <Spinner color="fill-accent" :class="['tw-absolute tw-top-0 tw-bottom-0 tw-left-0 tw-right-0 tw-m-auto']" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['authenticated']
})

onMounted(() => {
    navigateTo('/scanner')
})
</script>