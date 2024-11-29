<template>
    <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" width="450"
        @update:modelValue="emits('update:modelValue')">
        <v-card>
            <VForm @submit.prevent="onSubmitForm" ref="form">
                <v-card-title class="text-h5">
                    {{ props.title }}
                </v-card-title>
                <v-card-text>
                    {{ props.content }}
                </v-card-text>
                <v-card-actions class="tw-flex tw-justify-center tw-w-full tw-flex-row">
                    
                    <v-btn variant="elevated" color="primary" class="tw-w-[150px]"
                        @click="emits('update:modelValue', false)">Đã hiểu</v-btn>
                </v-card-actions>
            </VForm>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { VForm } from 'vuetify/components';

interface Props {
    content: string,
    modelValue: boolean,
    loading: boolean
    title: string
}
const props = defineProps<Props>()
const { modelValue, loading } = toRefs(props);

const emits = defineEmits(["closeDelete", "submit", "update:modelValue"])
const form = ref<VForm | null>(null)

const onSubmitForm = async () => {
    emits('submit')
}

</script>