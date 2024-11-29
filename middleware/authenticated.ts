export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuth()
    const accentColor = computed(() => {
        return authStore.accentColor
    })
    const primaryColor = computed(() => {

        return authStore.primaryColor
    })
    const nuxtApp = useNuxtApp()
    nuxtApp.$vuetify.theme.themes.value.dcTheme.colors.primary = primaryColor
    nuxtApp.$vuetify.theme.themes.value.dcTheme.colors.accent = accentColor

    if (!authStore.isLoggedIn) {
        return navigateTo('/signin')
    }


})