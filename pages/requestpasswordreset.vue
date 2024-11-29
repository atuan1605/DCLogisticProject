<template>
  <v-container class="tw-flex tw-items-center tw-justify-center tw-min-h-full">
    <v-card title="Yêu cầu đặt lại mật khẩu" class="tw-min-w-[400px]">
      <v-card-text>
        <v-form @submit.prevent="authStore.requestPasswordreset"
          class="tw-flex-1 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full">
          <v-text-field prepend-icon="mdi-account" class="tw-w-full" v-model="authStore.requestInput.username"
            type="email" placeholder="username" label="Username" />
          <NuxtLink v-show="true" class="tw-mb-2 tw-font-primary " to="/signin"> Đăng nhập </NuxtLink>

          <v-btn color="secondary" type="submit" :loading="authStore.isLoading">
            Xác Nhận
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>
  
<script setup lang="ts">
import * as R from 'ramda'
definePageMeta({
  layout: "signin",
  middleware: ["only-signed-out"],
});
const authStore = useAuth()
</script>