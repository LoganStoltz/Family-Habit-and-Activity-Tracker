<template>
  <section class="HomePage-main-section">
    <!-- Welcome Section -->
    <div class="welcome-container">
      <div class="welcome-message">
        <h2 v-if="user" class="welcome-heading">Hello, {{ (user.first_name + (user.last_name ? ', ' + user.last_name : '')) || user.user_name || user.email }}!</h2>
        <h2 v-else class="welcome-heading">Hello, Guest!</h2>
        <p class="welcome-subtitle">Welcome back to your Family Habit and Activity Tracker</p>
      </div>
      <button v-if="user" class="btn-logout" @click="logout">Logout</button>
    </div>

    <!-- Main Content -->
    <div class="intro">
      <h1>Track Your Family's Growth</h1>
      <p>Build lasting habits and celebrate milestones together as a family</p>
    </div>

    <!-- Feature Cards -->
    <div class="features-grid" v-if="user">
      <router-link to="/habits" class="feature-card">
        <div class="feature-icon">📋</div>
        <h3>Habits & Care</h3>
        <p>Track daily habits and activities for your family members</p>
        <span class="arrow">→</span>
      </router-link>

      <router-link to="/baby-milestones" class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Milestones</h3>
        <p>Set and celebrate important goals and achievements</p>
        <span class="arrow">→</span>
      </router-link>

      <router-link to="/activity-main" class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Activity Log</h3>
        <p>View comprehensive logs of family activities</p>
        <span class="arrow">→</span>
      </router-link>

      <router-link to="/profile-select" class="feature-card">
        <div class="feature-icon">👥</div>
        <h3>Profiles</h3>
        <p>Manage family member profiles and settings</p>
        <span class="arrow">→</span>
      </router-link>
    </div>

    <!-- Call-to-Action for Guests -->
    <div v-else class="guest-cta">
      <p>Sign in to start tracking your family's habits and activities</p>
      <router-link to="/login" class="btn-primary">Sign In</router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const user = ref(null);
const router = useRouter();

onMounted(() => {
  const storedUser = localStorage.getItem('user');
  user.value = storedUser ? JSON.parse(storedUser) : null;
});

const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('profile');
  user.value = null;

  // Trigger storage event to update other components (like Header)
  window.dispatchEvent(new Event('storage'));

  router.push('/login');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.HomePage-main-section {
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  display: flex;
  flex-direction: column;
  padding: 1rem 2rem;
  color: var(--text-primary);
  gap: 3rem;
}

/* Welcome Section */
.welcome-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.welcome-message {
  flex: 1;
  min-width: 300px;
  padding: 2.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.welcome-heading {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
}

.btn-logout {
  background-color: #e63946;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(230, 57, 70, 0.3);
  align-self: flex-start;
}

.btn-logout:hover {
  background-color: var(--accent-yellow);
  color: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 209, 102, 0.4);
}

/* Main Intro Section */
.intro {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
  padding: 3rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-large);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.intro:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
}

.intro h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
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
  margin: 0;
}

/* Feature Cards Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.feature-card {
  position: relative;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--box-shadow-hover);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
}

.feature-icon {
  font-size: 3rem;
  line-height: 1;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-card p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
  flex-grow: 1;
}

.arrow {
  font-size: 1.5rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all var(--transition-normal);
}

.feature-card:hover .arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Guest CTA */
.guest-cta {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 3rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-large);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.guest-cta p {
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.btn-primary {
  display: inline-block;
  background: var(--heading-gradient);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(116, 235, 213, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(116, 235, 213, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .intro h1 {
    font-size: 2.2rem;
  }

  .welcome-heading {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .HomePage-main-section {
    padding: 2rem 1.5rem;
    gap: 2rem;
  }

  .welcome-container {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-logout {
    width: 100%;
  }

  .intro {
    padding: 2rem 1.5rem;
  }

  .intro h1 {
    font-size: 2rem;
  }

  .intro p {
    font-size: 1rem;
  }

  .welcome-heading {
    font-size: 1.5rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }

  .feature-icon {
    font-size: 2.5rem;
  }

  .feature-card h3 {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .HomePage-main-section {
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }

  .welcome-message {
    padding: 1.5rem;
  }

  .intro h1 {
    font-size: 1.5rem;
  }

  .feature-icon {
    font-size: 2rem;
  }

  .btn-primary {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }
}
</style>