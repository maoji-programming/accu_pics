import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import App from './App.vue'
import "primevue/resources/themes/lara-light-indigo/theme.css";
import 'primeicons/primeicons.css';

import CurrentTimeTable from './components/CurrentTimeTable.vue'

const app = createApp(App)
app.use(createPinia())
app.use(PrimeVue);
app.component('current-time-table',CurrentTimeTable);

app.mount('#app')
