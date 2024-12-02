import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Button from "primevue/button"
import InputText from 'primevue/inputtext';
import Panel from 'primevue/panel';
import Divider from 'primevue/divider';

const app= createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: false || 'none',
        }
    }
});

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Panel', Panel);
app.component('Divider', Divider);
app.mount('#app')