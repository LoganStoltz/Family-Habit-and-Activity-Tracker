<template>
  <div class="profile-main-container">
    <div v-if="profile" class="profile-content">
      <!-- Welcome Section -->
      <div class="profile-welcome">
        <div class="profile-header">
          <h1 class="welcome-heading">Hello, {{ profile.firstName }}{{ profile.lastName ? ' ' + profile.lastName : '' }}! 👋</h1>
          <div class="profile-details">
            <span class="profile-badge">{{ profile.profile_type || 'Profile' }}</span>
            <span class="profile-age" v-if="profile.dob">Born: {{ formatDate(profile.dob) }}</span>
          </div>
        </div>
        
        <p class="welcome-message">Welcome to your personal habit and activity tracker. Keep track of your daily progress and celebrate your achievements!</p>
        
        <div class="profile-actions">
          <router-link to="/activity-main" class="action-button primary">
            <span>📊</span> Track Activity
          </router-link>
          <router-link to="/profile-settings" class="action-button secondary">
            <span>⚙️</span> Settings
          </router-link>
        </div>
      </div>

      <!-- Quick Stats Section -->
      <div class="stats-section">
        <h2 class="section-title">Your Progress</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
              <p class="stat-label">Active Habits</p>
              <p class="stat-value">{{ activeHabitsCount }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <p class="stat-label">Current Streak</p>
              <p class="stat-value">{{ currentStreak }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <p class="stat-label">Completed Today</p>
              <p class="stat-value">{{ completedToday }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <p class="stat-label">Total Achievements</p>
              <p class="stat-value">{{ totalAchievements }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links Section -->
      <div class="quick-links-section">
        <h2 class="section-title">Quick Access</h2>
        <div class="quick-links-grid">
          <router-link to="/habits" class="quick-link-card">
            <div class="link-icon">📋</div>
            <h3>My Habits</h3>
            <p>View and manage your habits</p>
          </router-link>
          <router-link to="/baby-milestones" class="quick-link-card">
            <div class="link-icon">🎯</div>
            <h3>Milestones</h3>
            <p>Track your goals and achievements</p>
          </router-link>
          <router-link to="/activity-main" class="quick-link-card">
            <div class="link-icon">📈</div>
            <h3>Activity Log</h3>
            <p>Review your activity history</p>
          </router-link>
          <router-link to="/profile-select" class="quick-link-card">
            <div class="link-icon">👥</div>
            <h3>Family Profiles</h3>
            <p>View other family members</p>
          </router-link>
        </div>
      </div>

      <!-- Motivation Section -->
      <div class="motivation-section">
        <div class="motivation-card">
          <h3>💡 Tip of the Day</h3>
          <p>{{ dailyTip }}</p>
        </div>
      </div>
    </div>
    
    <div class="no-profile" v-else>
      <h2>No Profile Selected</h2>
      <p>Please select a profile to continue.</p>
      <router-link to="/profile-select" class="action-button primary">Select Profile</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Profile {
  id: number;
  firstName: string;
  lastName?: string;
  dob?: string;
  profile_type?: string;
}

const profile = ref<Profile | null>(null);
const activeHabitsCount = ref(0);
const currentStreak = ref(0);
const completedToday = ref(0);
const totalAchievements = ref(0);

const dailyTips = [
  "Consistency is key! Even small daily efforts add up to big results.",
  "Celebrate your small wins - they're important milestones on your journey.",
  "Try to complete your habits at the same time each day to build stronger routines.",
  "Remember, progress is more important than perfection. Do your best!",
  "Share your achievements with your family - their support matters!",
  "Track your habits regularly to see how far you've come.",
];

const dailyTip = ref('');

const loadProfile = () => {
  // Check if user is still logged in first
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    // If no user is logged in, clear any stored profile
    localStorage.removeItem('profile');
    profile.value = null;
    return;
  }
  
  const storedProfile = localStorage.getItem('profile');
  if (storedProfile) {
    profile.value = JSON.parse(storedProfile);
    loadMockStats();
  }
};

const loadMockStats = () => {
  // These are placeholder stats. In a real app, you'd fetch from the API
  activeHabitsCount.value = Math.floor(Math.random() * 10) + 3;
  currentStreak.value = Math.floor(Math.random() * 30) + 1;
  completedToday.value = Math.floor(Math.random() * activeHabitsCount.value) + 1;
  totalAchievements.value = Math.floor(Math.random() * 50) + 10;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  // Parse the date string manually to avoid timezone issues (date being off by one day)
  // Assumes format is YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create date object with local timezone (month is 0-indexed)
  const date = new Date(year, month - 1, day);
  
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

onMounted(() => {
  loadProfile();
  
  // Select a random daily tip
  dailyTip.value = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  const handleProfileUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      profile.value = customEvent.detail;
    } else {
      loadProfile();
    }
  };

  window.addEventListener('profileUpdated', handleProfileUpdate);

  onUnmounted(() => {
    window.removeEventListener('profileUpdated', handleProfileUpdate);
  });
});
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.profile-main-container {
  background: var(--main-background-dark);
  padding: 3rem 2rem;
  color: var(--text-primary);
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

/* Welcome Section */
.profile-welcome {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 3rem;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--transition-normal);
}

.profile-welcome:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
}

.profile-header {
  margin-bottom: 1.5rem;
}

.welcome-heading {
  font-size: 2.8rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.profile-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
  margin-top: 1rem;
}

.profile-badge {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
}

.profile-age {
  color: var(--text-secondary);
  font-size: 1rem;
  opacity: 0.9;
}

.welcome-message {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 1.5rem 0;
  line-height: 1.6;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.9rem 2rem;
  border-radius: var(--radius-medium);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.action-button.primary {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
}

.action-button.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(79, 157, 255, 0.5);
}

.action-button.secondary {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  box-shadow: 0 4px 15px rgba(255, 209, 102, 0.3);
}

.action-button.secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 209, 102, 0.5);
}

/* Section Title */
.section-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 2rem 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Stats Section */
.stats-section {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Quick Links Section */
.quick-links-section {
  width: 100%;
}

.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.quick-link-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.quick-link-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--box-shadow-hover);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
}

.link-icon {
  font-size: 3rem;
  line-height: 1;
}

.quick-link-card h3 {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-link-card p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Motivation Section */
.motivation-section {
  width: 100%;
}

.motivation-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 2.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
}

.motivation-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
  border-color: rgba(255, 255, 255, 0.2);
}

.motivation-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.motivation-card p {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* No Profile State */
.no-profile {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 3rem 2rem;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  text-align: center;
  max-width: 500px;
  margin: 3rem auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.no-profile h2 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.no-profile p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .profile-content {
    gap: 2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-links-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .welcome-heading {
    font-size: 2.2rem;
  }

  .section-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 768px) {
  .profile-main-container {
    padding: 2rem 1.5rem;
  }

  .profile-content {
    gap: 1.5rem;
  }

  .profile-welcome {
    padding: 2rem 1.5rem;
  }

  .welcome-heading {
    font-size: 2rem;
  }

  .welcome-message {
    font-size: 1rem;
  }

  .profile-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-links-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .quick-link-card {
    padding: 1.5rem;
  }

  .link-icon {
    font-size: 2.5rem;
  }

  .section-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 480px) {
  .profile-main-container {
    padding: 1.5rem 1rem;
  }

  .profile-welcome {
    padding: 1.5rem 1rem;
  }

  .welcome-heading {
    font-size: 1.5rem;
  }

  .profile-details {
    flex-direction: column;
    align-items: flex-start;
  }

  .stat-value {
    font-size: 1.8rem;
  }

  .motivation-card {
    padding: 1.5rem;
  }

  .motivation-card h3 {
    font-size: 1.3rem;
  }
}
</style>