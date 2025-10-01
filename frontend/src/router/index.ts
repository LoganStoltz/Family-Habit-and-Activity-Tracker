import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/LoginPage.vue';
import RegistrationPage from '@/components/RegistrationPage.vue';
import HomePage from '@/components/HomePage.vue';
import ProfileSelect from '@/components/ProfileSelect.vue';
import ProfileMainPage from '@/components/ProfileMainPage.vue';
import ProfileSettings from '@/components/ProfileSettings.vue';
import HabitsPage from '@/components/HabitsPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/registration', name: 'Registration', component: RegistrationPage },
    { path: '/profile-select', name: 'ProfileSelect', component: ProfileSelect },
    { path: '/profile-main', name: 'ProfileMain', component: ProfileMainPage },
    { path: '/profile-settings', name: 'ProfileSettings', component: ProfileSettings },
    { path: '/habits', name: 'HabitPage', component: HabitsPage }
  ]
});
export default router
