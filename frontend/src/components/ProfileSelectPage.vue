<template>
  <div>
    <div class="profile-select-overlay" v-if="showSelectProfile">
      <div class="profile-select">
        <button class="modal-exit" type="button" @click="closeModal() && (showSelectProfile = false)">&times;</button>
        <h1>Select Profile</h1>
        <div v-if="loading" class="loading-container">
          <p>Loading profiles...</p>
        </div>
        <div v-else-if="profiles.length > 0" class="profile-list">
          <div class="profile-card" v-for="profile in profiles" :key="profile.id">
            <button @click="selectProfile(profile)">{{ profile.firstName }}</button>
          </div>
          
        </div>
        <div v-else class="no-profiles-msg">
          <p>No profiles found. Please add a profile first.</p>
        </div>
        <div class="add-profile-container">
          <button class="add-profile-btn" @click="openProfileRegistration()">Add Profile</button>
        </div>
      </div>
    </div>
    <ProfileRegistration 
      v-if="showProfileRegistration"
      :has-existing-profile="hasExistingProfile"
      @profile-created="handleProfileCreated"
      @close="handleProfileRegistrationClose"/>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from 'vue-router';
import ProfileRegistration from './ProfileRegistrationPage.vue';

const profiles = ref([]);
const showProfileRegistration = ref(false);
const showSelectProfile = ref(true);
const loading = ref(false);
const router = useRouter();

const hasExistingProfile = computed(() => {
  const profile = localStorage.getItem("profile");
  return profile !== null && profile !== 'null';
});
  
const closeModal = () => {
  showSelectProfile.value = false;
  showProfileRegistration.value = false;
  router.push('/');
};

const openProfileRegistration = () => {
  showProfileRegistration.value = true;
  showSelectProfile.value = false;
};

const handleProfileRegistrationClose = () => {
  showProfileRegistration.value = false;
  if (!hasExistingProfile.value) {
    showSelectProfile.value = true;
  } else {
    router.push('/');
  }
};

const handleProfileCreated = async (profileData) => {
  console.log('Profile created, received data:', profileData);
  
  // Auto-login to the newly created profile
  const profile = {
    id: profileData.id,
    firstName: profileData.first_name,
    lastName: profileData.last_name || '',
    dob: profileData.dob,
    profile_type: profileData.profile_type
  };
  
  console.log('Formatted profile:', profile);
  
  localStorage.setItem("profile", JSON.stringify(profile));
  window.dispatchEvent(new Event('storage'));
  
  showProfileRegistration.value = false;
  showSelectProfile.value = false;
  router.push('/profile-main');
};

const fetchProfiles = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  if (!userId) {
    console.warn("No logged in user found in localStorage");
    return;
  }

  loading.value = true;
  const startTime = Date.now();
  
  try {
    const response = await fetch(`http://localhost:3000/users/${userId}/profiles`);
    if (!response.ok) throw new Error("Failed to fetch profiles");
    const data = await response.json();

    profiles.value = Array.isArray(data)
      ? data.map(profile => ({
          id: profile.id,
          firstName: profile.first_name,
          lastName: profile.last_name || '',
          dob: profile.dob,
          profile_type: profile.profile_type
        }))
      : [];
    
    // Ensure loading state lasts at least 0.5 second
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 500 - elapsed);
    await new Promise(resolve => setTimeout(resolve, remainingTime));
    
  } catch (err) {
    console.error("Error fetching profiles:", err);
    // Still wait for 0.5 second even on error
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 500 - elapsed);
    await new Promise(resolve => setTimeout(resolve, remainingTime));
  } finally {
    loading.value = false;
  }
};

const selectProfile = (profile) => {
  // Store the complete profile data in localStorage
  localStorage.setItem("profile", JSON.stringify(profile));
  // Notify other components of the change
  window.dispatchEvent(new Event('storage'));
  // Redirect to profile main page
  router.push('/profile-main');
};

onMounted(fetchProfiles);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.profile-select-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.profile-select {
  position: relative;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: max-content;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  backdrop-filter: blur(20px);
  box-shadow: 0 12px 40px rgba(30, 41, 59, 0.25);
  animation: modalSlideIn 0.3s ease-out;
  font-family: 'Inter', sans-serif;
}

h1 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.profile-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.profile-card {
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-large);
  padding: 1.5rem;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--box-shadow-hover);
  border-color: var(--accent-yellow);
}

.profile-card button {
  width: 100%;
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

.profile-card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 157, 255, 0.5);
  background: linear-gradient(135deg, #74ebd5, #4f9dff);
}

.no-profiles-msg {
  text-align: center;
  color: #f3f3f3;
  font-size: 1.2rem;
}

.loading-container {
  text-align: center;
  color: #4f9dff;
  font-size: 1.2rem;
  padding: 2rem;
}

.modal-exit {
  position: absolute;
  margin: 0;
  padding: 0;
  top: 1.5rem;
  right: 2rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #4f9dff;
  cursor: pointer;
  font-weight: bold;
  box-shadow: none;
  z-index: 10;
}

.modal-exit:hover {
  color: #ff9e4f;
}

.add-profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  padding: 2rem;
  border-radius: 12px;
}

.add-profile-btn {
  background: linear-gradient(135deg, #4f9dff, #74ebd5);
  width: 100%;
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 157, 255, 0.3);
}

@media (max-width: 768px) {
  .profile-list {
    grid-template-columns: 1fr;
    gap: rgb(255, 158, 79)
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .profile-card button {
    font-size: 1rem;
    padding: 0.8rem 1rem;
  }
}
</style>