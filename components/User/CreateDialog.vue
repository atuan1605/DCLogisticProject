<template>
  <v-dialog :model-value="modelValue" transition="dialog-bottom-transition" width="550"
    @update:modelValue="emits('update:modelValue')">
    <v-card class="px-5 py-5">
      <VForm @submit.prevent="onSubmitForm" ref="form">
        <v-card-title class="text-h5">
          TẠO USER
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="userStore.createUserInput.username" placeholder="Nhập Username" :rules="[
    validator.required('Username')
  ]" variant="outlined"></v-text-field>
          <v-text-field v-model="userStore.createUserInput.password" placeholder="Nhập Mật khẩu" :rules="[
    validator.required('Mật khẩu')
  ]" variant="outlined" :append-inner-icon="!showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="() => (showPassword = !showPassword)"
            :type="showPassword ? 'text' : 'password'"></v-text-field>
          <div class="tw-flex tw-flex-row">
            <v-checkbox label="User bên ngoài" v-model="userStore.createUserInput.isExternal"></v-checkbox>
            <template v-if="userStore.createUserInput.isExternal">
              <VSelect v-model="userStore.createUserInput.agentID" label="Mã đại lí" :rules="[
    validator.required('Mã đại lí')
  ]" :items="authStore.agents" />
            </template>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn prepend-icon="mdi-cancel" variant="elevated" color="default" class="tw-w-[150px]"
            @click="emits('update:modelValue', false)">Hủy</v-btn>
          <v-btn :loading="userStore.isCreating" prepend-icon="mdi-check" variant="elevated" color="primary"
            class="tw-w-[150px]" type="submit">Xong</v-btn>

        </v-card-actions>
      </VForm>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import * as R from 'ramda'
import { VForm } from 'vuetify/components';
import { CreateUserInput } from '~~/composables/useAPIs/system/user';

interface Props {
  modelValue: boolean
}
const userStore = useUser()
const authStore = useAuth()
let agentID = ref("")
const validator = useValidators()
const form = ref<VForm | null>(null)
const props = defineProps<Props>()
const { modelValue } = toRefs(props);
const emits = defineEmits(["createUser"])
const showPassword = ref(false)
const onSubmitForm = async () => {
  if (R.isNil(userStore.createUserInput)) return
  if (!form.value) { return }
  const { valid } = await form.value.validate()
  if (!valid) { return }
  const input: CreateUserInput = {
    username: userStore.createUserInput.username,
    password: userStore.createUserInput.password,
    isExternal: userStore.createUserInput.isExternal,
    agentID: userStore.createUserInput.agentID
  };
  emits('createUser', input)
}

</script>