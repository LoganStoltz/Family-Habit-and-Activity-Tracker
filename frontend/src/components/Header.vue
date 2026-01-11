<template>
  <header class="header">
  <!-- Desktop Navigation -->
    <nav class="nav">
      <router-link to="/" class="btn-home">Home</router-link>
      <router-link to="/profile-select" class="btn-profile-select" v-if="user">Profile Select</router-link>
      <router-link to="/profile-main" class="btn-profile-main" v-if="profile">Profile Main</router-link>
      <router-link to="/registration" class="btn-registration" v-if="!user">Registration</router-link>
      <router-link to="/login" class="btn-login" v-if="!user">Login</router-link>
    </nav>
    <div class="user-section" v-if="user">
      <div class="user-menu-container">
        <span class="user-icon" @click="toggleDropdown">👤</span>
        <div v-if="isDropdownOpen" class="dropdown-menu">
          <div class="dropdown-item" @click="navigateTo('/profile-select')">
            <span class="dropdown-icon">👥</span>
            <span>Profile Select</span>
          </div>
          <div class="dropdown-item" @click="navigateTo('/profile-main')" v-if="profile">
            <span class="dropdown-icon">🏠</span>
            <span>Profile Main</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout-item" @click="logout">
            <span class="dropdown-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const profile = ref(null);
const router = useRouter();
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const navigateTo = (path) => {
  router.push(path);
  isDropdownOpen.value = false;
};

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
  isDropdownOpen.value = false;
  router.push('/login');
};

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu-container');
  if (userMenu && !userMenu.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  updateFromStorage();
  window.addEventListener('storage', updateFromStorage);
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('storage', updateFromStorage);
  document.removeEventListener('click', handleClickOutside);
});</script>

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
  justify-content: space-between;
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

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu-container {
  position: relative;
}

.user-icon {
  font-size: 1.5rem;
  opacity: 0.9;
  transition: var(--transition-normal);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.user-icon:hover {
  opacity: 1;
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: rgba(30, 66, 95, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-medium);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  z-index: 1001;
  overflow: hidden;
  animation: dropdownSlide 0.2s ease-out;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent-yellow);
}

.dropdown-icon {
  font-size: 1.2rem;
  opacity: 0.9;
}

.dropdown-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

.logout-item:hover {
  background: rgba(230, 57, 70, 0.2);
  color: #ff6b7a;
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
