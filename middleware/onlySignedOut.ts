export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuth()
    if (authStore.isLoggedIn) {
        return navigateTo('/')
    }
})