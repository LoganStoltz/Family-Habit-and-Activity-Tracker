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
import PdfBuilderPage from '@/components/pages/PdfBuilderPage.vue';

const APP_TITLE = 'Family Habit and Activity Tracker';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'Home', component: HomePage, meta: { title: 'Home' } },
    { path: '/login', name: 'Login', component: LoginPage, meta: { title: 'Login' } },
    { path: '/registration', name: 'Registration', component: RegistrationPage, meta: { title: 'Register' } },
    { path: '/account-recovery', name: 'AccountRecovery', component: AccountRecoveryPage, meta: { title: 'Account Recovery' } },
    { path: '/profile-select', name: 'ProfileSelect', component: ProfileSelect, meta: { title: 'Profile Select' } },
    { path: '/profile-settings', name: 'ProfileSettings', component: ProfileSettings, meta: { title: 'Profile Settings' } },
    { path: '/user-settings', name: 'UserSettings', component: UserSettings, meta: { title: 'User Settings' } },
    { path: '/habits', name: 'HabitsPage', component: HabitsPage, meta: { title: 'Habits' } },
    { path: '/activity-main', name: 'ActivityMainPage', component: ActivityMainPage, meta: { title: 'Habit Logs' } },
    { path: '/baby-milestones', name: 'BabyMilestonesPage', component: BabyMilestonesPage, meta: { title: 'Baby Milestones' } },
    { path: '/pdf-builder', name: 'PdfBuilderPage', component: PdfBuilderPage, meta: { title: 'PDF Builder' } }
  ]
});

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : '';
  document.title = pageTitle ? `${pageTitle} | ${APP_TITLE}` : APP_TITLE;
});

export default router
