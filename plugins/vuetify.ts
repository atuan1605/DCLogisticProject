import 'vuetify/styles'
import 'vuetify/components'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

const dcTheme = {
    dark: false,
    colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        primary: '#d70e30',
        secondary: '#000',
        error: '#e74c3c',
        info: '#2196F3',
        success: '#2ecc71',
        warning: '#FB8C00',
        accent: '#000',
        receivedAtUSWarehouse: '#797979',
        repacking: '#ee7c7c',
        repacked: '#f0872a',
        boxed: '#78e08f',
        flyingBack: '#8e44ad'
    }
}

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        ssr: false,
        theme: {
            defaultTheme: 'dcTheme',
            themes: {
                dcTheme,
            }
        },
    })
    nuxtApp.vueApp.use(vuetify)
    nuxtApp.provide("vuetify", vuetify)
})