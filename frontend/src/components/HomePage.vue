<template>
  <section class="HomePage-main-section">
    <!-- Welcome Section -->
    <div v-if="user" class="welcome-container">
      <div class="welcome-message">
        <h1 v-if="user" class="welcome-heading">Hello, {{ (user.first_name + (user.last_name ? ', ' + user.last_name : '')) || user.user_name || user.email }}!</h1>
        <h1 v-if="!user" class="welcome-heading">Hello, Guest!</h1>
        <p class="welcome-subtitle">Welcome back to your Family Habit and Activity Tracker</p>
      </div>
    </div>
    <div v-if="user && !profile" class="welcome-container">
      <div class="welcome-message">
        <h1 class="welcome-heading">Please choose a profile</h1>
        <div>
          <router-link to="/profile-select" class="btn-primary">Select Profile</router-link>
        </div>
        <p class="welcome-subtitle">Don't have any profiles? Create one to get started!</p>
      </div>
    </div>

    <!-- Hero Section -->
    <div v-if="!user" class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Family Habit & Activity Tracker</h1>
        <p class="hero-subtitle">Build stronger family bonds through shared goals and habits</p>
        <p class="hero-description">Track daily activities, celebrate milestones, and create lasting habits together. Perfect for families of all sizes.</p>
        <router-link to="/login" class="btn-hero">Get Started</router-link>
      </div>
      <div class="hero-features">
        <div class="hero-feature-item">
          <div class="feature-dot">✓</div>
          <span>Easy habit tracking</span>
        </div>
        <div class="hero-feature-item">
          <div class="feature-dot">✓</div>
          <span>Celebrate milestones</span>
        </div>
        <div class="hero-feature-item">
          <div class="feature-dot">✓</div>
          <span>Family insights & reports</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="user" class="intro">
      <h1>Track Your Family's Growth</h1>
      <p>Build lasting habits and celebrate milestones together as a family</p>
    </div>

    <!-- Feature Cards -->
    <div class="features-grid" v-if="user && profile">
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
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const user = ref(null);
const profile = ref(null);

onMounted(() => {
  const storedUser = localStorage.getItem('user');
  user.value = storedUser ? JSON.parse(storedUser) : null;
  const storedProfile = localStorage.getItem('profile');
  profile.value = storedProfile ? JSON.parse(storedProfile) : null;
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.HomePage-main-section {
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  color: var(--text-primary);
  gap: 4rem;
}

/* Hero Section for Guests */
.hero-section {
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 3rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--box-shadow-default);
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 600;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  opacity: 0.95;
}

.btn-hero {
  display: inline-block;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 1.2rem 2.5rem;
  border: none;
  border-radius: 12px;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 20px rgba(79, 157, 255, 0.4);
  width: fit-content;
}

.btn-hero:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(79, 157, 255, 0.6);
  background: linear-gradient(135deg, #74ebd5, #4f9dff);
}

.hero-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.features-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  text-align: left;
}

.hero-feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 3px solid #74ebd5;
  transition: all var(--transition-normal);
}

.hero-feature-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.feature-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  border-radius: 50%;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.hero-feature-item span {
  font-size: 1.05rem;
  color: var(--text-primary);
  font-weight: 500;
}

/* Welcome Section */
.welcome-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  max-width: 900px;
  transition: 0.3s ease;
  width: 100%;
}

.welcome-container:hover {
  transform: translateY(-3px);
}

.welcome-message {
  flex: 1;
  padding: 2.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
}

.welcome-heading {
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
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

/* Main Intro Section */
.intro {
  text-align: center;
  max-width: 800px;
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
  display: none;
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
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 2.5rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 157, 255, 0.5);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2.5rem 2rem;
  }

  .hero-social-proof {
      gap: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  .intro h1 {
    font-size: 2.2rem;
  }

  .hero-title {
    font-size: 2.8rem;
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

  .hero-section {
    padding: 2rem 1.5rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-description {
    font-size: 0.95rem;
  }

  .hero-social-proof {
    gap: 1rem;
    padding: 1rem;
  }

  .proof-stat {
    font-size: 1.2rem;
  }

  .proof-label {
    font-size: 0.8rem;
  }

  .btn-hero {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .welcome-container {
    flex-direction: column;
    align-items: stretch;
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

  .hero-section {
    padding: 1.5rem 1rem;
  }
  
  .features-title {
    font-size: 1.1rem;
  }

  .feature-name {
    font-size: 0.9rem;
  }

  .hero-social-proof {
    flex-direction: column;
    gap: 0.8rem;
    padding: 1rem 0.8rem;
  }

  .proof-item {
    flex-direction: row;
    justify-content: center;
    gap: 0.5rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-features {
    gap: 1rem;
  }

  .hero-feature-item {
    padding: 0.8rem;
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