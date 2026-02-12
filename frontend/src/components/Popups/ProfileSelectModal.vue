<template>
  <div>
    <div class="modal-overlay" v-if="showSelectProfile">
      <div class="modal">
        <button class="modal-exit" type="button" @click="closeModal() && (showSelectProfile = false)">&times;</button>
        <h2>Select Profile</h2>
        <div v-if="loading" class="loading-container">
          <p>Loading profiles...</p>
        </div>
        <div v-else-if="profiles.length > 0" class="profile-list">
          <button class="profile-card" v-for="profile in profiles" :key="profile.id" @click="selectProfile(profile)">
            {{ profile.firstName }}
          </button>
        </div>
        <div v-else class="no-profiles-msg">
          <p>No profiles found. Please add a profile first.</p>
        </div>
        <div class="modal-actions">
          <button class="modal-cancel" @click="closeModal() && (showSelectProfile = false)">Cancel</button>
          <button class="modal-add" @click="openProfileRegistration()">Add Profile</button>
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
import ProfileRegistration from '../Popups/ProfileRegistrationModal.vue';

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
  router.push('/');
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
  // Redirect to home page
  router.push('/');
};

onMounted(fetchProfiles);
</script>

<style src="../../assets/modal.css"></style>

<style scoped>
.loading-container {
  text-align: center;
  padding: 2rem;
  color: #f3f3f3;
}

.profile-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
  width: 100%;
}

.profile-card {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  color: #f3f3f3;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  width: 100%;
}

.profile-card:hover {
  border-color: #4f9dff;
  background: rgba(79, 157, 255, 0.1);
  box-shadow: 0 0 15px rgba(79, 157, 255, 0.3);
  transform: translateY(-2px);
}

.no-profiles-msg {
  text-align: center;
  padding: 2rem 1rem;
  color: rgba(243, 243, 243, 0.7);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .profile-list {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>