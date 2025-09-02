<template>
  <section class="HomePage-main-section">
    <div class="welcome-message">
      <h2 v-if="user">Hello {{ (user.first_name + (user.last_name ? ', ' + user.last_name : '')) || user.user_name || user.email }}!</h2>
      <h2 v-else>Hello Guest!</h2>
      <button v-if="user" class="btn-logout" @click="logout">Logout</button>
    </div>
    <div class="intro">
      <h1>Welcome to your Family Habit and Activity Tracker!</h1>
      <p>Track your family's habits and activities all in one place.</p>
    </div>
  </section>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const user = ref(null);
    const router = useRouter();

    onMounted(() => {
      const storedUser = localStorage.getItem('user');
      user.value = storedUser ? JSON.parse(storedUser) : null;
    });

    const logout = () => {
      localStorage.removeItem('user');
      user.value = null;
      router.push('/login');
    };

    return { user, logout };
  }
}
</script>

<style>
/* Add some basic styling for the logout button */
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