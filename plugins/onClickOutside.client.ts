import vClickOutside from "click-outside-vue3"

export default defineNuxtPlugin(nuxtApp => {
    const { directive } = vClickOutside
    nuxtApp.vueApp.directive('click-outside', directive)
})