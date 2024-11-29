<template>
    <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" width="450"
        @update:modelValue="emits('update:modelValue')">
        <v-card>
            <VForm ref="form">
                <v-card-title class="text-h5">
                    Thông báo
                </v-card-title>
                <v-card-text>
                    {{ props.content }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn prepend-icon="mdi-check" variant="elevated" color="primary" class="tw-w-[150px]"
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
}
const props = defineProps<Props>()
const { modelValue } = toRefs(props);

const emits = defineEmits(["closeDelete", "submit", "update:modelValue"])
const form = ref<VForm | null>(null)
</script>