import * as R from "ramda"

export default defineNuxtPlugin(nuxtApp => {
    const authStore = useAuth()
    const loginToken = useAppCookies().getLoginTokens()

    if (R.isNil(loginToken)) {
        return
    }

    authStore.setToken(loginToken)
})