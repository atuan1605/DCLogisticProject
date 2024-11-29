<template>
    <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" width="450"
        @update:modelValue="emits('update:modelValue')">
        <v-card>
            <VForm @submit.prevent="onSubmitForm" ref="form">
                <v-card-title class="text-h5">
                    TẠO KHO
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="agentName" placeholder="Nhập tên đại lý" :rules="[
        validator.required('Tên đại lý')
    ]" variant="outlined"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn prepend-icon="mdi-cancel" variant="elevated" color="default" class="tw-w-[150px]"
                        @click="emits('update:modelValue', false)">Hủy</v-btn>
                    <v-btn :loading="agentStore.isCreating" prepend-icon="mdi-check" variant="elevated" color="primary"
                        class="tw-w-[150px]" type="submit">Xong</v-btn>

                </v-card-actions>
            </VForm>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { VForm } from 'vuetify/components';
import { CreateAgentInput } from '~~/composables/useAPIs/agents';

interface Props {
    modelValue: boolean
}
const validator = useValidators()
const agentStore = useAgent()
const props = defineProps<Props>()
const { modelValue } = toRefs(props);
const emits = defineEmits(["closeModal", "created"])
const form = ref<VForm | null>(null)
const agentName = ref("")
const agentAddress = ref("")
const isCreating = ref(false)

const onSubmitForm = async () => {
    isCreating.value = true
    if (!form.value) { return }
    const { valid } = await form.value.validate()
    if (!valid) { return }

    const input: CreateAgentInput = {
        name: agentName.value
    };
    agentStore.createAgent(input).then(() => { emits('created') })
}
</script>
