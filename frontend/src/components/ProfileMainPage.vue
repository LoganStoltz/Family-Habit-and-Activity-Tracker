<template>
  <div class="profile-main-container">
    <div class="profile-welcome" v-if="profile">
      <h2>Hello {{ profile.firstName }}{{ profile.lastName ? ' ' + profile.lastName : '' }}!</h2>
      <p>Welcome to your personal habit and activity tracker.</p>
      
      <div class="profile-actions">
        <button class="action-button">View Habits</button>
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

const profile = ref<{ firstName: string; lastName?: string } | null>(null);

// Function to load profile data
const loadProfile = () => {
  const storedProfile = localStorage.getItem('profile');
  const newProfile = storedProfile ? JSON.parse(storedProfile) : null;
  profile.value = newProfile;
  console.log('ProfileMainPage loaded profile:', newProfile);
};

onMounted(() => {
  // Initial load
  loadProfile();

  // Listen for storage changes (for cross-tab updates)
  const handleStorageChange = () => {
    loadProfile();
  };

  // Listen for custom profile update events (for same-tab updates)
  const handleProfileUpdate = () => {
    loadProfile();
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('profileUpdated', handleProfileUpdate);

  // Clean up event listeners when component is unmounted
  onUnmounted(() => {
    window.removeEventListener('storage', handleStorageChange);
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