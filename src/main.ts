import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import { definePreset } from '@primeuix/themes'

const app = createApp(App)

const myPreset = definePreset(Aura, {
  semantic: {
    primary: {
      default: '#e32021',
      secondary: '#90291c'
    }
  }
})

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: myPreset
  }
})


app.use(ConfirmationService)
app.use(ToastService)
app.mount('#app')
