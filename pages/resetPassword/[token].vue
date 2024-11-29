<template>
    <v-container class="tw-flex tw-items-center tw-justify-center tw-min-h-full">
        <v-card title="Đặt lại mật khẩu" class="tw-min-w-[400px]">
            <v-form @submit.prevent="authStore.resetPassword(token)"
                class="tw-p-2 tw-flex-1 tw-flex tw-flex-col tw-justify-center tw-items-center ">
                <v-text-field style="display: none" prepend-icon="mdi-account" class="tw-w-full"
                    v-model="token" :value="token" type="email" 
                    label="Token"  />
                <v-text-field class="tw-w-full" prepend-icon="mdi-lock" v-model="authStore.resetPasswordInput.password"
                    :type="isPasswordHidden ? 'password' : 'text'" placeholder="Password"
                    @click:append-inner="(isPasswordHidden = !isPasswordHidden)"
                    :append-inner-icon="isPasswordHidden ? 'mdi-eye' : 'mdi-eye-off'" />
                <v-text-field class="tw-w-full" prepend-icon="mdi-lock"
                    v-model="authStore.resetPasswordInput.confirmPassword" :type="isConfirmPasswordHidden ? 'password' : 'text'"
                    placeholder="Confirm Password" @click:append-inner="(isConfirmPasswordHidden = !isConfirmPasswordHidden)"
                    :append-inner-icon="isConfirmPasswordHidden ? 'mdi-eye' : 'mdi-eye-off'" />
                <v-btn @click="redirectToSignIn" color="secondary" type="submit" :loading="authStore.isLoading">
                    Xác Nhận
                </v-btn>
            </v-form>
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
const route = useRoute()
const token = route.params.token as string
const isPasswordHidden = ref(true);
const isConfirmPasswordHidden = ref(true)

const redirectToSignIn = () => {
    navigateTo('/signin')
}

</script>