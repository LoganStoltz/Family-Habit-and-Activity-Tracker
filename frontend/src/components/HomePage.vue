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

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.HomePage-main-section {
  font-family: 'Inter', sans-serif;
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem); /* Account for header height */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--text-primary);
}

.welcome-message {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
}

.welcome-message h2 {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.intro {
  text-align: center;
  max-width: 600px;
  padding: 3rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-large);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.intro:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
}

.intro h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.intro p {
  font-size: 1.2rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.btn-logout {
  background-color: #e63946;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
}

.btn-logout:hover {
  background-color: var(--accent-yellow);
  color: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
}

@media (max-width: 768px) {
  .intro h1 {
    font-size: 2rem;
  }
  
  .intro p {
    font-size: 1rem;
  }
  
  .welcome-message h2 {
    font-size: 1.5rem;
  }
}
</style>