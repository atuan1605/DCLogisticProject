<template>
    <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" width="450"
        @update:modelValue="emits('update:modelValue')">
        <v-card>
            <VForm @submit.prevent="onSubmitForm" ref="form">
                <v-card-title class="text-h5">
                    {{ R.or(props.title, "Xác nhận") }}
                </v-card-title>
                <v-card-text>
                    {{ props.content }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn prepend-icon="mdi-cancel" variant="elevated" color="default"
                        class="tw-w-[150px] tw-text-white" @click="emits('update:modelValue', false)">Hủy</v-btn>
                    <v-btn :loading="loading" prepend-icon="mdi-check" variant="elevated" color="primary"
                        class="tw-w-[150px] tw-text-white" type="submit">{{ R.or(props.confirmButton, "Xác nhận")
                        }}</v-btn>
                </v-card-actions>
            </VForm>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { VForm } from 'vuetify/components';
import * as R from 'ramda'

interface Props {
    content: string,
    modelValue: boolean,
    loading: boolean,
    title?: string,
    confirmButton?: string
}
const props = defineProps<Props>()
const { modelValue, loading } = toRefs(props);

const emits = defineEmits(["closeDelete", "submit", "update:modelValue"])
const form = ref<VForm | null>(null)

const onSubmitForm = async () => {
    emits('submit')
}

</script>