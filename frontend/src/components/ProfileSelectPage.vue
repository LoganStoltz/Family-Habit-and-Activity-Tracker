<template>
  <div class="profile-select-container">
    <h1>Select Profile</h1>
    <div class="profile-list">
      <div class="profile-card" v-for="profile in profiles" :key="profile.id">
        <button @click="selectProfile(profile)">{{ profile.firstName }}</button>
      </div>
    </div>
    <div class="add-profile-section">
      <button class="add-profile-btn" @click="toggleComponent">Add Profile</button>
    </div>
    <div class="registration-section" v-if="showProfileRegistration">
      <ProfileRegistration @profile-created="addProfile" />
    </div>
  </div>
</template>


<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import ProfileRegistration from "./ProfileRegistrationPage.vue";

export default defineComponent({
  name: "ProfileSelect",
  components: { ProfileRegistration },

  setup() {
    const profiles = ref([]);
    const showProfileRegistration = ref(false);
    const router = useRouter();

    const fetchProfiles = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("User API response:", user);
        const userId = user?.id;
        if (!userId) {
            console.warn("No logged in user found in localStorage");
            return;
        }
        console.log("userId API response:", userId);

        try {
            const response = await fetch(`http://localhost:3000/users/${userId}/profiles`);
            console.log("Response API response:", response);
            if (!response.ok) throw new Error("Failed to fetch profiles");
            const data = await response.json();
            console.log("Profiles API response:", data);

            
            profiles.value = Array.isArray(data)
            ? data.map(profile => ({
                id: profile.id,
                firstName: profile.first_name,
                lastName: profile.last_name || '',
                dob: profile.dob,
                profile_type: profile.profile_type
                }))
            : [];

        } catch (err) {
            console.error("Error fetching profiles:", err);
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

    const addProfile = (newProfile) => {
      // Add the new profile to the profiles list for display
      profiles.value.push(newProfile);
      
      // Hide the registration form
      showProfileRegistration.value = false;
      
      // Note: Don't call selectProfile here since ProfileRegistration already handled
      // storing the profile and redirecting to /profile-main
    };

    onMounted(fetchProfiles);

    return {
      profiles,
      showProfileRegistration,
      addProfile,
      selectProfile,
      toggleComponent: () => (showProfileRegistration.value = !showProfileRegistration.value)
    };
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

.profile-select-container {
  font-family: 'Inter', sans-serif;
  background: var(--main-background-dark);
  min-height: calc(100vh - 4.5rem);
  padding: 2rem;
  color: var(--text-primary);
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

.add-profile-section {
  text-align: center;
  margin: 2rem 0;
}

.add-profile-btn {
  background: linear-gradient(135deg, var(--accent-yellow), #ff9800);
  color: #1e3a5f;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 209, 102, 0.3);
}

.add-profile-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 209, 102, 0.5);
  background: linear-gradient(135deg, #ff9800, var(--accent-yellow));
}

.registration-section {
  max-width: 500px;
  margin: 2rem auto;
  background: rgba(0, 0, 0, 0.15);
  border-radius: var(--radius-large);
  padding: 2rem;
  box-shadow: var(--box-shadow-default);
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .profile-list {
    grid-template-columns: 1fr;
    gap: 1rem;
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