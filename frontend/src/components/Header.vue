<template>
  <header class="header">
  <!-- Desktop Navigation -->
  <nav class="nav">
    <router-link to="/" class="btn-home">Home</router-link>
    <router-link to="/profile-select" class="btn-profile-select" v-if="user">Profile Select</router-link>
    <router-link to="/profile-main" class="btn-profile-main" v-if="profile">Profile Main</router-link>
    <router-link to="/registration" class="btn-registration" v-if="!user">Registration</router-link>
    <router-link to="/login" class="btn-login" v-if="!user">Login</router-link>
    <button v-if="user" class="btn-logout" @click="logout">Logout</button>
  </nav>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const profile = ref(null);
const router = useRouter();

const updateFromStorage = () => {
  const storedUser = localStorage.getItem('user');
  user.value = storedUser ? JSON.parse(storedUser) : null;
  const storedProfile = localStorage.getItem('profile');
  profile.value = storedProfile ? JSON.parse(storedProfile) : null;
};

onMounted(() => {
  updateFromStorage();
  window.addEventListener('storage', updateFromStorage);
});

onUnmounted(() => {
  window.removeEventListener('storage', updateFromStorage);
});

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('profile');
  user.value = null;
  profile.value = null;
  router.push('/login');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

/* MAIN HEADER SECTION */
.header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 4.5rem;
  background: rgba(30, 66, 95, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  transition: var(--transition-normal);
}

/* NAVIGATION BUTTONS (DESKTOP) */
.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav a, .nav button {
  text-decoration: none;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-medium);
  transition: var(--transition-normal);
  border: 2px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

.nav a::before, .nav button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left var(--transition-normal);
}

.nav a:hover::before, .nav button:hover::before {
  left: 100%;
}

.nav a:hover, .nav button:hover {
  background: var(--accent-yellow);
  color: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 209, 102, 0.3);
  border-color: var(--accent-yellow);
}

.nav a.router-link-active {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.btn-logout {
  background: linear-gradient(135deg, #e63946, #dc2626);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
}

.btn-logout:hover {
  background: var(--accent-yellow);
  color: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .header {
    padding: 0 1rem;
    height: 4rem;
  }
  
  .nav {
    gap: 1rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .nav::-webkit-scrollbar {
    display: none;
  }
  
  .nav a, .nav button {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .nav {
    gap: 0.5rem;
  }
  
  .nav a, .nav button {
    font-size: 0.8rem;
    padding: 0.5rem 0.8rem;
  }
}
</style>
