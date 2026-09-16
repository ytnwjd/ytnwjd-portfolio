import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// 브라우저 자체의 스크롤 복원과 라우터의 scrollBehavior가 서로 다른 시점에 개입하면서
// 충돌하는 것을 막고, 스크롤 위치는 오직 라우터가 제어하도록 고정
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
