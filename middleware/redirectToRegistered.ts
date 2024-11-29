import * as R from 'ramda'

export default defineNuxtRouteMiddleware((to, from) => {
    if (R.propEq('name', 'trackings')(to)) {
        return navigateTo('/trackings/registered')
    }
})