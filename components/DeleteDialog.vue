<template>
  <ConfirmDialog :loading="props.loading" :content="props.content || 'Bạn chắc muốn xóa bản ghi này?'"
    :modelValue="props.modelValue" @submit="emits('delete')"
    @update:modelValue="(value: boolean) => emits('update:modelValue', value)" />
</template>

<script setup lang="ts">

export interface Props {
  loading: boolean,
  modelValue: boolean,
  content?: string | undefined
}

const props = defineProps<Props>()
const emits = defineEmits(["update:modelValue", "delete"])
</script>