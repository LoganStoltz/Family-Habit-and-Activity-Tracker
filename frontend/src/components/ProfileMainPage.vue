<template>
  <div class="profile-main-container">
    <div class="profile-welcome" v-if="profile">
      <div class="profile-header">
        <h2>Hello {{ profile.firstName }}{{ profile.lastName ? ' ' + profile.lastName : '' }}!</h2>
        <div class="profile-details">
          <p class="profile-type">{{ profile.profile_type || 'Profile' }}</p>
          <p class="profile-age" v-if="profile.dob">Born: {{ formatDate(profile.dob) }}</p>
        </div>
      </div>
      
      <p class="welcome-message">Welcome to your personal habit and activity tracker.</p>
      
      <div class="profile-actions">
        <router-link to="/habits" class="action-button">View Habits</router-link>
        <button class="action-button">Track Activity</button>
        <router-link to="/profile-settings" class="action-button secondary">Settings</router-link>
      </div>
    </div>
    
    <div class="no-profile" v-else>
      <h2>No Profile Selected</h2>
      <p>Please select a profile to continue.</p>
      <router-link to="/profile-select" class="action-button">Select Profile</router-link>
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
  }
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
  font-family: 'Inter', sans-serif;
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  padding: 2rem;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.profile-welcome {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 3rem;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  text-align: center;
  max-width: 600px;
  transition: all 0.3s ease;
}

.profile-welcome:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
}

.profile-welcome h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.profile-header {
  margin-bottom: 2rem;
}

.profile-details {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.profile-type {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}

.profile-age {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
}

.welcome-message {
  color: var(--text-secondary);
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.profile-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
  text-decoration: none;
  display: inline-block;
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(79, 157, 255, 0.5);
  background: linear-gradient(135deg, #74ebd5, #4f9dff);
}

.action-button.secondary {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  box-shadow: 0 4px 15px rgba(255, 209, 102, 0.3);
}

.action-button.secondary:hover {
  box-shadow: 0 8px 25px rgba(255, 209, 102, 0.5);
  background: linear-gradient(135deg, #ff9800, var(--accent-yellow));
}

.no-profile {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 2rem;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  text-align: center;
  max-width: 400px;
}

.no-profile p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .profile-welcome h2 {
    font-size: 2rem;
  }
  
  .profile-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .action-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>