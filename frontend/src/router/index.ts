import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '@/components/pages/UserLoginPage.vue';
import RegistrationPage from '@/components/pages/UserRegistrationPage.vue';
import AccountRecoveryPage from '@/components/pages/AccountRecoveryPage.vue';
import HomePage from '@/components/pages/HomePage.vue';
import ProfileSelect from '@/components/Popups/ProfileSelectModal.vue';
import ProfileSettings from '@/components/pages/ProfileSettingsPage.vue';
import UserSettings from '@/components/pages/UserSettingsPage.vue';
import HabitsPage from '@/components/pages/HabitsPage.vue';
import ActivityMainPage from '@/components/pages/ActivityMainPage.vue';
import BabyMilestonesPage from '@/components/pages/BabyMilestonesPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomePage },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/registration', name: 'Registration', component: RegistrationPage },
    { path: '/account-recovery', name: 'AccountRecovery', component: AccountRecoveryPage },
    { path: '/profile-select', name: 'ProfileSelect', component: ProfileSelect },
    { path: '/profile-settings', name: 'ProfileSettings', component: ProfileSettings },
    { path: '/user-settings', name: 'UserSettings', component: UserSettings },
    { path: '/habits', name: 'HabitsPage', component: HabitsPage },
    { path: '/activity-main', name: 'ActivityMainPage', component: ActivityMainPage },
    { path: '/baby-milestones', name: 'BabyMilestonesPage', component: BabyMilestonesPage }
  ]
});
export default router
