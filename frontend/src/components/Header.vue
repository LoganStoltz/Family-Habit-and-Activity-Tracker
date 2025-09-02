<template>
  <header class="header">
  <!-- Desktop Navigation -->
  <nav class="nav">
    <router-link to="/" class="btn-home">Home</router-link>
    <router-link to="/registration" class="btn-registration">Registration</router-link>
    <router-link to="/login" class="btn-login" v-if="!user">Login</router-link>
    <button v-if="user" class="btn-logout" @click="logout">Logout</button>
  </nav>
  </header>
</template>

<script lang="js">

import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Header'
  ,
  setup() {
    const user = ref(null);
    const router = useRouter();

    // Load user info from localStorage on mount
    onMounted(() => {
      const storedUser = localStorage.getItem('user');
      user.value = storedUser ? JSON.parse(storedUser) : null;
    });

    // Logout function
    const logout = () => {
      localStorage.removeItem('user');
      user.value = null;
      router.push('/login');
    };

    return { user, logout };
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

/* MAIN HEADER SECTION */
.header {
  position: static;
  top: 0;
  left: 0;
  width: 100%;
  height: 2.5rem;
  background-color: var(--background-header, #1e3a5f);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* NAVIGATION BUTTONS (DESKTOP) */
.nav {
  display: flex;
  gap: 4rem;
}

.nav a {
  text-decoration: none;
  color: #f4f4f4;
  font-size: x-large;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  transition: background-color 0.3s, color 0.3s;
}

.nav a:hover {
  background-color: #ffd166;
  color: #1e3a5f;
}

.user-info {
  color: #ffd166;
  font-size: large;
  margin-right: 1rem;
}

.btn-logout {
  background-color: #e63946;
  color: #fff;
  font-size: large;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  margin-left: 1rem;
}

.btn-logout:hover {
  background-color: #ffd166;
  color: #1e3a5f;
}
</style>
