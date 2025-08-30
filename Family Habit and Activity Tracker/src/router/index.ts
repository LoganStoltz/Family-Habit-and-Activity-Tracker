import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../components/LoginPage.vue';
import RegistrationPage from '../components/RegistrationPage.vue';
import HomePage from '../components/HomePage.vue';  

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Register', component: RegistrationPage },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/home', name: 'Home', component: HomePage }
  ],
})

export default router
