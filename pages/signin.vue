<template>
  <v-container class="tw-flex tw-items-center tw-justify-center tw-min-h-full">
    <v-card title="Đăng nhập" class="tw-min-w-[400px]">
      <v-card-text>
        <v-form @submit.prevent="authStore.login"
          class="tw-flex-1 tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-full">
          <v-text-field prepend-icon="mdi-account" class="tw-w-full" v-model="authStore.loginInput.username" type="email"
            placeholder="Email" label="Username" />
          <v-text-field class="tw-w-full" prepend-icon="mdi-lock" v-model="authStore.loginInput.password"
            :type="isPasswordHidden ? 'password' : 'text'" placeholder="Password"
            @click:append-inner="(isPasswordHidden = !isPasswordHidden)"
            :append-inner-icon="isPasswordHidden ? 'mdi-eye' : 'mdi-eye-off'" />
          <NuxtLink v-show="true" class="tw-mb-2 tw-font-primary "
            to="/requestpasswordreset"> Quên mật khẩu? </NuxtLink>

          <v-btn color="secondary" type="submit" :loading="authStore.isLoggingIn">
            Đăng nhập
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "signin",
  middleware: ["only-signed-out"],
});

const isPasswordHidden = ref(true);

const authStore = useAuth()

onMounted(() => {
  const { $fireAnalytics } = useNuxtApp();
  $fireAnalytics.screenView("signin");
});
</script>