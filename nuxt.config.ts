// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    ssr: false,
    css: ['~/assets/css/main.css'],
    build: {
        transpile: ['vuetify'],
    },
    modules: [
        [
            '@pinia/nuxt',
            {
                autoImports: [
                    'defineStore'
                ]
            }
        ]
        
    ],
    typescript: {
        shim: false
    },
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    runtimeConfig: {
        public: {
            apiBase: '',
            firebaseApiKey: '',
            firebaseAuthDomain: '',
            firebaseProjectId: '',
            firebaseStorageBucket: '',
            firebaseMessagingSenderId: '',
            firebaseAppId: '',
            firebaseMeasurementId: ''
        }
    },
    hooks: {
        'vite:extendConfig': (config) => {
            config.plugins?.push(vuetify({
                styles: {
                    configFile: 'assets/css/settings.scss'
                }
            }))
        }
    }
    // alias: {
    //     pinia: '/node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs',
    //   }
})
